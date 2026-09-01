import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { bankFee, bankByCode } from "./banks";
import { isThaiMobile, maskPhone } from "./format";
import { buildSeed, SEED_PIN } from "./seed";
import { tmnConfigured } from "@/lib/tmnone/creds";
import { mapHistory, parseBalance } from "@/lib/tmnone/parse";
import type {
  Account,
  Contact,
  Envelope,
  Notice,
  Settings,
  TmnCredentials,
  TmnMode,
  Transaction,
  TransferMethod,
  WalletFeeChannel,
} from "./types";
import {
  tmnInvoke,
  type FeeInfo,
  type PaymentCodeOut,
  type QrSlip,
  type RecipientInfo,
} from "@/lib/tmn/client";

const SETTLE_AFTER = 2_400;
const MIN_TX = 1;
const MAX_TX = 50_000;

type SendInput = {
  method: Exclude<TransferMethod, "gift">;
  amount: number;
  counterpart: string;
  counterpartMeta: string;
  note: string;
  bankCode?: string;
  draftId?: string;
  payee?: string;
};

export type ConnectInput = {
  nickname: string;
  msisdn: string;
  tmn_key_id: string;
  login_token: string;
  tmn_id: string;
  device_id: string;
  pin?: string;
};

type RazenState = {
  hydrated: boolean;
  accounts: Account[];
  activeAccountId: string;
  contacts: Contact[];
  txs: Transaction[];
  envelopes: Envelope[];
  notices: Notice[];
  pin: string;
  settings: Settings;
  seq: number;
  lastReceiptId: string | null;
  pinOpen: boolean;
  pinError: boolean;
  faceOpen: boolean;
  faceSeconds: number;
  paymentCode: PaymentCodeOut | null;
  lastQr: QrSlip | null;
  lastFees: FeeInfo[];
  lastProbe: Record<string, unknown> | null;
  sessionToken: string | null;
  setHydrated: (v: boolean) => void;
  markHydrated: () => void;
  balance: (accountId?: string) => number;
  stats: (accountId?: string) => { incoming: number; outgoing: number; pending: number };
  dailySpent: () => number;
  chartSeries: () => { day: number; label: string; inn: number; out: number }[];
  askPin: () => Promise<boolean>;
  submitPin: (digits: string) => void;
  cancelPin: () => void;
  askFace: () => Promise<boolean>;
  resolveFace: (ok: boolean) => void;
  send: (input: SendInput) => { ok: true; tx: Transaction } | { ok: false; error: string };
  transferViaApi: (
    input: SendInput,
  ) => Promise<{ ok: true; tx: Transaction } | { ok: false; error: string }>;
  lookupRecipient: (msisdn: string) => Promise<{ ok: true; data: RecipientInfo } | { ok: false; error: string }>;
  createEnvelope: (input: {
    amount: number;
    message: string;
    fromName: string;
    count?: number;
  }) => Promise<{ ok: true; envelope: Envelope } | { ok: false; error: string }>;
  claimEnvelope: (
    code: string,
  ) => { ok: true; envelope: Envelope } | { ok: false; error: string };
  simulateError: () => void;
  setActiveAccount: (id: string) => void;
  addAccount: (input: ConnectInput) => Promise<Account | { error: string }>;
  renameAccount: (id: string, nickname: string) => void;
  toggleAccount: (id: string) => void;
  addContact: (name: string, phone: string) => Contact | { error: string };
  changePin: (next: string) => void;
  tickPending: () => void;
  markNoticesRead: () => void;
  setSettings: (patch: Partial<Settings>) => void;
  setMode: (mode: TmnMode) => void;
  resetDemo: () => void;
  setLastReceipt: (id: string | null) => void;
  inspectQr: (raw: string) => Promise<{ ok: true; data: QrSlip } | { ok: false; error: string }>;
  makePaymentCode: () => Promise<{ ok: true; data: PaymentCodeOut } | { ok: false; error: string }>;
  loadFees: () => Promise<void>;
  testLogin: () => Promise<{ ok: true } | { ok: false; error: string }>;
  updateCreds: (id: string, patch: Partial<TmnCredentials>) => void;
  pullHistory: (
    start: string,
    end: string,
  ) => Promise<{ ok: true; count: number } | { ok: false; error: string }>;
  refreshBalance: () => Promise<{ ok: true; balance: number } | { ok: false; error: string }>;
  syncWallet: () => Promise<void>;
};

let pinDeferred: { resolve: (v: boolean) => void } | null = null;
let faceDeferred: { resolve: (v: boolean) => void } | null = null;

function nextRef(seq: number) {
  const d = new Date();
  const y = String(d.getFullYear()).slice(2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `RZ${y}${m}${day}${String(seq).padStart(4, "0")}`;
}

function envelopeCode(seq: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let n = (Date.now() + seq) >>> 0;
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) ^ (seq * (i + 3));
  }
  return out;
}

function applySeed() {
  const seed = buildSeed();
  return {
    ...seed,
    lastReceiptId: null as string | null,
    pinOpen: false,
    pinError: false,
    faceOpen: false,
    faceSeconds: 0,
    paymentCode: null as PaymentCodeOut | null,
    lastQr: null as QrSlip | null,
    lastFees: [] as FeeInfo[],
    lastProbe: null as Record<string, unknown> | null,
    sessionToken: null as string | null,
  };
}

function ctxOf(s: RazenState) {
  const acc = s.accounts.find((a) => a.id === s.activeAccountId) ?? s.accounts[0];
  const creds: TmnCredentials = acc?.creds ?? {
    tmn_key_id: "",
    msisdn: acc?.number ?? "",
    login_token: "",
    tmn_id: "",
    device_id: "",
  };
  return {
    mode: s.settings.mode,
    apiBase: s.settings.apiBase,
    apiToken: s.settings.apiToken,
    credentials: creds,
    pin: s.pin,
    balance: s.balance(),
    settings: s.settings,
  };
}

export const useRazen = create<RazenState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...applySeed(),

      setHydrated: (v) => set({ hydrated: v }),
      markHydrated: () => set({ hydrated: true }),

      balance: (accountId) => {
        const s = get();
        const id = accountId ?? s.activeAccountId;
        const acc = s.accounts.find((a) => a.id === id);
        const snap = acc?.walletBalance;
        if (snap == null) return 0;
        let hold = 0;
        for (const t of s.txs) {
          if (t.accountId !== id) continue;
          if (t.status !== "pending" && t.status !== "processing") continue;
          if (t.direction === "out") hold += t.amount + t.fee;
        }
        return Math.round((snap - hold) * 100) / 100;
      },

      stats: (accountId) => {
        const s = get();
        const id = accountId ?? s.activeAccountId;
        const txs = s.txs.filter((t) => t.accountId === id);
        let incoming = 0;
        let outgoing = 0;
        let pending = 0;
        for (const t of txs) {
          if (t.status === "pending" || t.status === "processing") pending += 1;
          if (t.status !== "completed") continue;
          if (t.direction === "in") incoming += t.amount;
          else outgoing += t.amount;
        }
        return { incoming, outgoing, pending };
      },

      dailySpent: () => {
        const s = get();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const from = start.getTime();
        return s.txs
          .filter(
            (t) =>
              t.accountId === s.activeAccountId &&
              t.direction === "out" &&
              t.status !== "failed" &&
              t.createdAt >= from,
          )
          .reduce((n, t) => n + t.amount + t.fee, 0);
      },

      chartSeries: () => {
        const s = get();
        const id = s.activeAccountId;
        const days = 7;
        const out = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = days - 1; i >= 0; i--) {
          const day = today.getTime() - i * 86_400_000;
          const next = day + 86_400_000;
          let inn = 0;
          let outAmt = 0;
          for (const t of s.txs) {
            if (t.accountId !== id) continue;
            if (t.status === "failed") continue;
            if (t.createdAt < day || t.createdAt >= next) continue;
            if (t.direction === "in" && t.status === "completed") inn += t.amount;
            if (t.direction === "out") outAmt += t.amount;
          }
          out.push({
            day,
            label: new Date(day).toLocaleDateString("th-TH", { weekday: "short", day: "numeric" }),
            inn,
            out: outAmt,
          });
        }
        return out;
      },

      askPin: () =>
        new Promise<boolean>((resolve) => {
          pinDeferred?.resolve(false);
          pinDeferred = { resolve };
          set({ pinOpen: true, pinError: false });
        }),

      submitPin: (digits) => {
        const s = get();
        if (digits !== s.pin) {
          set({ pinError: true });
          return;
        }
        pinDeferred?.resolve(true);
        pinDeferred = null;
        set({ pinOpen: false, pinError: false });
      },

      cancelPin: () => {
        pinDeferred?.resolve(false);
        pinDeferred = null;
        set({ pinOpen: false, pinError: false });
      },

      askFace: () =>
        new Promise<boolean>((resolve) => {
          faceDeferred?.resolve(false);
          faceDeferred = { resolve };
          set({ faceOpen: true, faceSeconds: get().settings.faceauth_wait_timeout || 180 });
        }),

      resolveFace: (ok) => {
        faceDeferred?.resolve(ok);
        faceDeferred = null;
        set({ faceOpen: false, faceSeconds: 0 });
      },

      send: (input) => {
        const s = get();
        const amount = Math.round(input.amount * 100) / 100;
        if (!Number.isFinite(amount) || amount < MIN_TX) {
          return { ok: false, error: `ยอดขั้นต่ำ ${MIN_TX.toLocaleString("th-TH")} บาท` };
        }
        if (amount > MAX_TX) {
          return { ok: false, error: `โอนได้สูงสุด ${MAX_TX.toLocaleString("th-TH")} บาท ต่อรายการ` };
        }
        const fee = input.method === "bank" ? bankFee(input.bankCode) : 0;
        const spent = s.dailySpent();
        if (spent + amount + fee > s.settings.dailyLimit) {
          return { ok: false, error: "เกินวงเงินรายวัน กรุณาลองใหม่พรุ่งนี้" };
        }
        const bal = s.balance();
        if (amount + fee > bal) {
          return { ok: false, error: "ยอดเงินในบัญชีไม่พอ" };
        }
        if (!input.counterpart.trim()) {
          return { ok: false, error: "กรุณาระบุผู้รับ" };
        }
        const seq = s.seq + 1;
        const tx: Transaction = {
          id: `t-${seq}`,
          ref: nextRef(seq),
          method: input.method,
          direction: "out",
          status: "pending",
          amount,
          fee,
          counterpart: input.counterpart.trim(),
          counterpartMeta: input.counterpartMeta,
          note: input.note.trim(),
          accountId: s.activeAccountId,
          createdAt: Date.now(),
          bankCode: input.bankCode,
          draftId: input.draftId,
        };
        const notices: Notice[] = [
          {
            id: `n-${seq}`,
            title: "ส่งคำสั่งโอนแล้ว",
            body: `กำลังโอน ${amount.toLocaleString("th-TH")} บาท ไปยัง ${tx.counterpart}`,
            at: Date.now(),
            read: false,
          },
          ...s.notices,
        ].slice(0, 40);
        set({
          txs: [tx, ...s.txs],
          seq,
          lastReceiptId: tx.id,
          notices,
        });
        toast.message("ส่งคำสั่งแล้ว", { description: "ระบบกำลังตรวจสอบรายการ" });
        return { ok: true, tx };
      },

      transferViaApi: async (input) => {
        const s = get();
        const amount = Math.round(input.amount * 100) / 100;
        const ctx = ctxOf(s);
        let method = "transferP2P";
        let params: unknown[] = [];
        if (input.method === "p2p") {
          method = "transferP2P";
          params = [input.payee || input.counterpartMeta.replace(/\D/g, ""), amount, input.note];
        } else if (input.method === "promptpay") {
          method = "transferQRPromptpay";
          params = [input.payee || input.counterpartMeta.replace(/\D/g, ""), amount, input.note];
        } else {
          method = "transferBankAC";
          const bank = bankByCode(input.bankCode);
          params = [
            bank?.abbr ?? input.bankCode,
            input.payee || input.counterpartMeta.replace(/\D/g, ""),
            amount,
            s.pin,
          ];
        }
        const res = await tmnInvoke<{ draft_transaction_id?: string }>(method, params, ctx);
        if (!res.ok) return { ok: false, error: res.error };
        return get().send({ ...input, draftId: res.data.draft_transaction_id });
      },

      lookupRecipient: async (msisdn) => {
        const res = await tmnInvoke<RecipientInfo>("getRecipientInfo", [msisdn], ctxOf(get()));
        return res;
      },

      createEnvelope: async ({ amount, message, fromName, count = 1 }) => {
        const s = get();
        const total = Math.round(amount * 100) / 100;
        const packs = Math.max(1, Math.floor(count));
        if (!Number.isFinite(total) || total < MIN_TX) {
          return { ok: false, error: "ยอดซองไม่ถูกต้อง" };
        }
        if (packs > 50) return { ok: false, error: "สร้างได้สูงสุด 50 ซอง" };
        if (total < packs) return { ok: false, error: "ยอดรวมต้องไม่ต่ำกว่าจำนวนซอง" };
        if (total > s.balance()) return { ok: false, error: "ยอดเงินในบัญชีไม่พอ" };

        const api = await tmnInvoke<{ voucher_id: string; link: string }>(
          "generateVoucher",
          [total, message],
          ctxOf(get()),
        );
        if (!api.ok) return { ok: false, error: api.error };

        const satang = Math.round(total * 100);
        const base = Math.floor(satang / packs);
        const slices = Array.from({ length: packs }, (_, i) =>
          (i < satang - base * packs ? base + 1 : base) / 100,
        );

        let seq = s.seq;
        const now = Date.now();
        const packId = `pack-${seq + 1}`;
        const newTxs: Transaction[] = [];
        const newEnvs: Envelope[] = [];
        for (const slice of slices) {
          seq += 1;
          const code = packs === 1 ? api.data.voucher_id.slice(-6).toUpperCase() : envelopeCode(seq);
          const tx: Transaction = {
            id: `t-${seq}`,
            ref: nextRef(seq),
            method: "gift",
            direction: "out",
            status: "completed",
            amount: slice,
            fee: 0,
            counterpart: `ซองอั่งเปา ${code}`,
            counterpartMeta: `รหัส ${code}`,
            note: message.trim(),
            accountId: s.activeAccountId,
            createdAt: now,
            settledAt: now,
          };
          newTxs.push(tx);
          newEnvs.push({
            id: `e-${seq}`,
            code,
            amount: slice,
            message: message.trim(),
            fromName: fromName.trim() || "RAZEN",
            createdAt: now,
            txId: tx.id,
            status: "open",
            packId,
            voucherLink: api.data.link,
          });
        }
        set({
          txs: [...newTxs, ...s.txs],
          envelopes: [...newEnvs, ...s.envelopes],
          seq,
          lastReceiptId: newTxs[0]?.id ?? null,
        });
        toast.success("สร้างซองแล้ว", {
          description: packs === 1 ? `รหัส ${newEnvs[0].code}` : `${packs} ซอง · รวม ${total.toLocaleString("th-TH")} บาท`,
        });
        return { ok: true, envelope: newEnvs[0] };
      },

      claimEnvelope: (code) => {
        const s = get();
        const c = code.trim().toUpperCase();
        const env = s.envelopes.find((e) => e.code === c);
        if (!env) return { ok: false, error: "ไม่พบรหัสซองนี้" };
        if (env.status === "claimed") return { ok: false, error: "ซองนี้ถูกเปิดไปแล้ว" };
        const seq = s.seq + 1;
        const tx: Transaction = {
          id: `t-${seq}`,
          ref: nextRef(seq),
          method: "gift",
          direction: "in",
          status: "completed",
          amount: env.amount,
          fee: 0,
          counterpart: env.fromName,
          counterpartMeta: `รหัส ${env.code}`,
          note: env.message,
          accountId: s.activeAccountId,
          createdAt: Date.now(),
          settledAt: Date.now(),
        };
        const claimed: Envelope = {
          ...env,
          status: "claimed",
          claimedAt: Date.now(),
          claimedBy: s.activeAccountId,
        };
        set({
          txs: [tx, ...s.txs],
          envelopes: s.envelopes.map((e) => (e.id === env.id ? claimed : e)),
          seq,
          lastReceiptId: tx.id,
        });
        toast.success("เปิดซองสำเร็จ", {
          description: `รับ ${env.amount.toLocaleString("th-TH")} บาท`,
        });
        return { ok: true, envelope: claimed };
      },

      setActiveAccount: (id) => {
        if (get().accounts.some((a) => a.id === id)) set({ activeAccountId: id });
      },

      addAccount: async (input) => {
        const d = input.msisdn.replace(/\D/g, "");
        if (!isThaiMobile(d) && d.length < 9) return { error: "เบอร์ Wallet ไม่ถูกต้อง" };
        const s = get();
        const seq = s.seq + 1;
        const acc: Account = {
          id: `acc-${seq}`,
          nickname: input.nickname.trim() || `บัญชีที่ ${s.accounts.length + 1}`,
          number: d,
          masked: maskPhone(d),
          openedAt: Date.now(),
          color: s.accounts.length % 2 === 0 ? "in" : "info",
          status: "active",
          creds: {
            tmn_key_id: input.tmn_key_id.trim(),
            msisdn: d,
            login_token: input.login_token.trim(),
            tmn_id: input.tmn_id.trim() || `tmn.${d}`,
            device_id: input.device_id.trim() || `dev${seq}`,
          },
          walletBalance: null,
        };
        set({ accounts: [...s.accounts, acc], seq, activeAccountId: acc.id });
        const login = await tmnInvoke("loginWithPin6", [input.pin || s.pin], ctxOf(get()));
        if (!login.ok) {
          toast.message("เชื่อมบัญชีแล้ว — ล็อกอิน PIN ยังไม่ผ่าน", { description: login.error });
        } else {
          toast.success("เชื่อมบัญชีแล้ว");
          void get().syncWallet();
        }
        return acc;
      },

      renameAccount: (id, nickname) => {
        set({
          accounts: get().accounts.map((a) =>
            a.id === id ? { ...a, nickname: nickname.trim() || a.nickname } : a,
          ),
        });
      },

      toggleAccount: (id) => {
        set({
          accounts: get().accounts.map((a) =>
            a.id === id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a,
          ),
        });
      },

      addContact: (name, phone) => {
        const d = phone.replace(/\D/g, "");
        if (!name.trim()) return { error: "กรุณาใส่ชื่อ" };
        if (!isThaiMobile(d) && d.length < 9) return { error: "เบอร์ไม่ถูกต้อง" };
        const c: Contact = {
          id: `c-${get().seq + 1}`,
          name: name.trim(),
          phone: d,
        };
        set({ contacts: [...get().contacts, c], seq: get().seq + 1 });
        return c;
      },

      changePin: (next) => {
        if (!/^\d{6}$/.test(next)) return;
        set({ pin: next });
        toast.success("เปลี่ยนรหัส PIN แล้ว");
      },

      tickPending: () => {
        const s = get();
        const now = Date.now();
        let changed = false;
        const txs = s.txs.map((t) => {
          if (t.status !== "pending" && t.status !== "processing") return t;
          if (now - t.createdAt < SETTLE_AFTER) {
            if (t.status === "pending" && now - t.createdAt > 4_000) {
              changed = true;
              return { ...t, status: "processing" as const };
            }
            return t;
          }
          changed = true;
          return {
            ...t,
            status: "completed" as const,
            settledAt: now,
            reportId: t.reportId ?? `umk${String(now).slice(-10)}`,
          };
        });
        if (s.faceOpen && s.faceSeconds > 0) {
          const next = s.faceSeconds - 3;
          if (next <= 0) {
            faceDeferred?.resolve(false);
            faceDeferred = null;
            set({ faceOpen: false, faceSeconds: 0, txs });
            toast.error("หมดเวลายืนยันใบหน้า");
            return;
          }
          set({ faceSeconds: next, txs: changed ? txs : s.txs });
          return;
        }
        if (!changed) return;
        const justDone = txs.filter(
          (t, i) => t.status === "completed" && s.txs[i]?.status !== "completed",
        );
        const notices = [...s.notices];
        for (const t of justDone) {
          notices.unshift({
            id: `n-done-${t.id}`,
            title: t.direction === "out" ? "โอนสำเร็จ" : "รับเงินแล้ว",
            body: `${t.counterpart} · ${t.amount.toLocaleString("th-TH")} บาท`,
            at: now,
            read: false,
          });
          toast.success(t.direction === "out" ? "โอนสำเร็จ" : "รับเงินแล้ว", {
            description: t.ref,
          });
        }
        set({ txs, notices: notices.slice(0, 40) });
        void get().refreshBalance();
      },

      markNoticesRead: () => {
        set({ notices: get().notices.map((n) => ({ ...n, read: true })) });
      },

      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      setMode: (mode) => {
        set({ settings: { ...get().settings, mode } });
        toast.message(mode === "live" ? "โหมด LIVE — ใช้คลาส TMNOne ตามเอกสาร" : "โหมดจำลอง TMNOne");
      },

      simulateError: () => {
        const s = get();
        const seq = s.seq + 1;
        const tx: Transaction = {
          id: `t-${seq}`,
          ref: nextRef(seq),
          method: "p2p",
          direction: "out",
          status: "failed",
          amount: 1,
          fee: 0,
          counterpart: "จำลองข้อผิดพลาด",
          counterpartMeta: "TOOLS",
          note: "simulateError",
          accountId: s.activeAccountId,
          createdAt: Date.now(),
        };
        set({
          txs: [tx, ...s.txs],
          seq,
          notices: [
            {
              id: `n-err-${seq}`,
              title: "เกิดข้อผิดพลาด",
              body: "จำลองรายการล้มเหลว — ยอดเงินไม่ถูกตัด",
              at: Date.now(),
              read: false,
            },
            ...s.notices,
          ].slice(0, 40),
        });
        toast.error("เกิดข้อผิดพลาด", { description: "รายการไม่สำเร็จ ยอดเงินไม่ถูกตัด" });
      },

      resetDemo: () => {
        pinDeferred?.resolve(false);
        pinDeferred = null;
        faceDeferred?.resolve(false);
        faceDeferred = null;
        set({ ...applySeed(), hydrated: true, pin: SEED_PIN });
        toast.message("รีเซ็ตโต๊ะปฏิบัติการแล้ว");
      },

      setLastReceipt: (id) => set({ lastReceiptId: id }),

      inspectQr: async (raw) => {
        const res = await tmnInvoke<QrSlip>("fetchQRDetail", [raw], ctxOf(get()));
        if (res.ok) set({ lastQr: res.data });
        return res;
      },

      makePaymentCode: async () => {
        const res = await tmnInvoke<PaymentCodeOut>("getPaymentCode", [], ctxOf(get()));
        if (res.ok) set({ paymentCode: res.data });
        return res;
      },

      loadFees: async () => {
        const channels: WalletFeeChannel[] = [
          "p2p",
          "promptpay-in",
          "promptpay-out",
          "refill",
          "datasender_api",
        ];
        const out: FeeInfo[] = [];
        for (const ch of channels) {
          const res = await tmnInvoke<FeeInfo>("getWalletFee", [ch], ctxOf(get()));
          if (res.ok) out.push(res.data);
        }
        set({ lastFees: out });
      },

      testLogin: async () => {
        const s = get();
        const ctx = ctxOf(s);
        const start = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
        const end = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
        const res = await tmnInvoke<{
          login?: { access_token?: string };
          balance?: unknown;
          transactions?: unknown;
          transaction?: unknown;
          start?: string;
          end?: string;
          reportId?: string;
        }>("bootstrap", [start, end], ctx);
        if (!res.ok) return res;
        const n = parseBalance(res.data.balance);
        set({
          sessionToken: res.data.login?.access_token ?? "ok",
          lastProbe: {
            setData: {
              tmn_key_id: ctx.credentials.tmn_key_id,
              mobile_number: ctx.credentials.msisdn,
              tmn_id: ctx.credentials.tmn_id,
              device_id: ctx.credentials.device_id,
            },
            loginWithPin6: res.data.login,
            getBalance: res.data.balance,
            fetchTransactionHistory: res.data.transactions,
            fetchTransactionInfo: res.data.transaction,
            window: { start: res.data.start, end: res.data.end, reportId: res.data.reportId },
          },
          accounts: get().accounts.map((a) =>
            a.id === s.activeAccountId && n != null ? { ...a, walletBalance: n } : a,
          ),
        });
        if (res.data.transactions) {
          const mapped = mapHistory(res.data.transactions, s.activeAccountId);
          set({ txs: mapped });
        }
        toast.success("ซิงก์ยอดจาก getBalance แล้ว");
        return { ok: true };
      },

      updateCreds: (id, patch) => {
        set({
          accounts: get().accounts.map((a) => {
            if (a.id !== id) return a;
            const creds = { ...a.creds, ...patch };
            const msisdn = (creds.msisdn || a.number).replace(/\D/g, "");
            return {
              ...a,
              number: msisdn || a.number,
              masked: msisdn ? maskPhone(msisdn) : a.masked,
              creds: { ...creds, msisdn: msisdn || creds.msisdn },
            };
          }),
        });
        toast.success("บันทึก setData แล้ว");
        void get().syncWallet();
      },

      refreshBalance: async () => {
        const s = get();
        const res = await tmnInvoke("getBalance", [], ctxOf(s));
        if (!res.ok) return res;
        const n = parseBalance(res.data);
        if (n == null) return { ok: false as const, error: "อ่านยอดจาก getBalance ไม่ได้" };
        set({
          accounts: get().accounts.map((a) =>
            a.id === s.activeAccountId ? { ...a, walletBalance: n } : a,
          ),
        });
        return { ok: true as const, balance: n };
      },

      syncWallet: async () => {
        const s = get();
        const acc = s.accounts.find((a) => a.id === s.activeAccountId);
        if (!acc || !tmnConfigured(acc.creds)) return;
        const bal = await get().refreshBalance();
        if (!bal.ok) {
          toast.error("ซิงก์ยอดไม่สำเร็จ", { description: bal.error });
          return;
        }
        const start = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
        const end = new Date().toISOString().slice(0, 10);
        await get().pullHistory(start, end);
      },

      pullHistory: async (start, end) => {
        const s = get();
        const endEx = new Date(end);
        endEx.setDate(endEx.getDate() + 1);
        const res = await tmnInvoke<unknown>(
          "fetchTransactionHistory",
          [start, endEx.toISOString().slice(0, 10), 50, 1],
          ctxOf(s),
        );
        if (!res.ok) return res;
        const mapped = mapHistory(res.data, s.activeAccountId);
        const local = s.txs.filter(
          (t) =>
            t.accountId === s.activeAccountId &&
            (t.status === "pending" || t.status === "processing") &&
            !t.id.startsWith("w-"),
        );
        const other = s.txs.filter((t) => t.accountId !== s.activeAccountId);
        set({ txs: [...local, ...mapped, ...other] });
        return { ok: true, count: mapped.length };
      },
    }),
    {
      name: "razen-console-v5",
      skipHydration: true,
      partialize: (s) => ({
        accounts: s.accounts,
        activeAccountId: s.activeAccountId,
        contacts: s.contacts,
        txs: s.txs,
        envelopes: s.envelopes,
        notices: s.notices,
        pin: s.pin,
        settings: s.settings,
        seq: s.seq,
      }),
    },
  ),
);

export { SEED_PIN, bankByCode, maskPhone };
