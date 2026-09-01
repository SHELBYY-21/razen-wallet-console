import { BANKS } from "../razen/banks.ts";
import { isThaiMobile, maskPhone } from "../razen/format.ts";
import type { TmnCredentials, WalletFeeChannel } from "../razen/types.ts";

export type TmnOk<T> = { ok: true; data: T };
export type TmnErr = { ok: false; error: string };
export type TmnResult<T> = TmnOk<T> | TmnErr;

export type RecipientInfo = {
  payee_wallet_id: string;
  full_name_th: string;
  full_name_en: string;
  status: "ปกติ" | "ระงับ";
  masked: string;
};

export type FeeInfo = {
  channel: WalletFeeChannel;
  fee: number;
  free_remaining: number;
  note: string;
};

export type PaymentCodeOut = {
  payment_code: string;
  expire_at: number;
};

export type QrSlip = {
  transRef: string;
  amount: number;
  sender: string;
  receiver: string;
  bank: string;
  at: string;
  raw: string;
};

const DIRECTORY: Record<string, { th: string; en: string; status: RecipientInfo["status"] }> = {
  "0812345678": { th: "นาย สมชาย ใจดี", en: "Somchai Jaidee", status: "ปกติ" },
  "0891112233": { th: "นางสาว วิภาดา ศรีสุข", en: "Wipada Srisuk", status: "ปกติ" },
  "0925550101": { th: "นาง มาลี ใจดี", en: "Malee Jaidee", status: "ปกติ" },
  "0867704490": { th: "นางสาว นภัสสร จันทร์เพ็ญ", en: "Napatsorn Chanpen", status: "ปกติ" },
  "0981234567": { th: "นาย ธนพล วงศ์สกุล", en: "Thanapon Wongsakul", status: "ปกติ" },
  "0650000890": { th: "บัญชีทดสอบ", en: "Test Wallet", status: "ระงับ" },
};

export function recipientFromPhone(payee: string): RecipientInfo {
  const d = payee.replace(/\D/g, "");
  const hit = DIRECTORY[d];
  if (hit) {
    return {
      payee_wallet_id: d,
      full_name_th: hit.th,
      full_name_en: hit.en,
      status: hit.status,
      masked: maskPhone(d),
    };
  }
  const n = Number(d.slice(-4) || "1288");
  const names = [
    ["นาย สมชาย ใจดี", "Somchai Jaidee"],
    ["นางสาว พิมพ์ชนก แก้วมณี", "Pimchanok Kaewmanee"],
    ["นาย กิตติพงศ์ อรุณ", "Kittipong Arun"],
    ["นางสาว ศิริพร บุญมี", "Siriporn Boonmee"],
  ];
  const pick = names[n % names.length];
  return {
    payee_wallet_id: d,
    full_name_th: pick[0],
    full_name_en: pick[1],
    status: "ปกติ",
    masked: maskPhone(d || payee),
  };
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function simInvoke<T>(
  method: string,
  params: unknown[],
  ctx: { credentials: TmnCredentials; pin?: string; balance?: number },
): Promise<TmnResult<T>> {
  await wait(process.env.NODE_TEST_CONTEXT ? 0 : 40 + Math.random() * 80);

  switch (method) {
    case "loginWithPin6": {
      const pin = String(params[0] ?? "");
      if (!/^\d{6}$/.test(pin)) return { ok: false, error: "PIN ต้องเป็น 6 หลัก" };
      if (ctx.pin && pin !== ctx.pin) return { ok: false, error: "PIN ไม่ถูกต้อง" };
      return { ok: true, data: { access_token: `AT-SIM-${Date.now().toString(36)}` } as T };
    }
    case "getBalance":
      return { ok: true, data: { current_balance: ctx.balance ?? 0 } as T };
    case "getRecipientInfo": {
      const payee = String(params[0] ?? "");
      const d = payee.replace(/\D/g, "");
      if (!isThaiMobile(d) && d.length < 9) {
        return { ok: false, error: "ไม่พบเบอร์ Wallet นี้" };
      }
      const rec = recipientFromPhone(d);
      if (rec.status === "ระงับ") return { ok: false, error: "บัญชีผู้รับถูกระงับ" };
      return { ok: true, data: rec as T };
    }
    case "transferP2P": {
      const payee = String(params[0] ?? "");
      const amount = Number(params[1]);
      const rec = recipientFromPhone(payee);
      if (rec.status === "ระงับ") return { ok: false, error: "บัญชีผู้รับถูกระงับ" };
      if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "ยอดไม่ถูกต้อง" };
      return {
        ok: true,
        data: {
          draft_transaction_id: `DFT${Date.now().toString(36).toUpperCase()}`,
          amount,
          payee: rec.full_name_th,
        } as T,
      };
    }
    case "getTransferP2PStatus": {
      const id = String(params[0] ?? "");
      return {
        ok: true,
        data: {
          draft_transaction_id: id,
          status: "SUCCESS",
          report_id: `umk${Date.now().toString().slice(-10)}`,
        } as T,
      };
    }
    case "transferQRPromptpay": {
      const proxy = String(params[0] ?? "");
      const amount = Number(params[1]);
      if (!proxy) return { ok: false, error: "กรุณาระบุหมายเลขพร้อมเพย์" };
      if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "ยอดไม่ถูกต้อง" };
      return {
        ok: true,
        data: {
          draft_transaction_id: `PP${Date.now().toString(36).toUpperCase()}`,
          amount,
          payee: proxy,
        } as T,
      };
    }
    case "transferBankAC": {
      const bank = String(params[0] ?? "").toUpperCase();
      const ac = String(params[1] ?? "").replace(/\D/g, "");
      const amount = Number(params[2]);
      const pin = String(params[3] ?? "");
      if (!BANKS.some((b) => b.abbr === bank || b.code === bank)) {
        return { ok: false, error: "รหัสธนาคารไม่รองรับ" };
      }
      if (ac.length < 10) return { ok: false, error: "เลขบัญชีไม่ถูกต้อง" };
      if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "ยอดไม่ถูกต้อง" };
      if (ctx.pin && pin && pin !== ctx.pin) return { ok: false, error: "PIN ไม่ถูกต้อง" };
      return {
        ok: true,
        data: {
          draft_transaction_id: `BK${Date.now().toString(36).toUpperCase()}`,
          amount,
          payee: ac,
        } as T,
      };
    }
    case "generateVoucher": {
      const amount = Number(params[0]);
      const detail = String(params[1] ?? "");
      if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "ยอดซองไม่ถูกต้อง" };
      const id = `VC${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      return {
        ok: true,
        data: {
          voucher_id: id,
          link: `https://gift.truemoney.com/campaign/?v=${id}`,
          amount,
          detail,
        } as T,
      };
    }
    case "fetchVoucherHistory":
      return { ok: true, data: [] as T };
    case "getWalletFee": {
      const channel = String(params[0] ?? "p2p") as WalletFeeChannel;
      const table: Record<WalletFeeChannel, FeeInfo> = {
        refill: { channel, fee: 0, free_remaining: 8, note: "เติมเงินผ่านช่องทางต่าง ๆ" },
        p2p: { channel, fee: 0, free_remaining: 12, note: "รับโอน P2P — ฟรี 15 ครั้ง/เดือน" },
        "promptpay-in": { channel, fee: 0, free_remaining: 9, note: "รับพร้อมเพย์" },
        "promptpay-out": { channel, fee: 0, free_remaining: 6, note: "โอนออกพร้อมเพย์" },
        datasender_api: {
          channel,
          fee: 0,
          free_remaining: 0,
          note: "URL จัดการ Webhook / Inquiry — ต้องรับเงินครบ 100 ครั้ง",
        },
      };
      return { ok: true, data: (table[channel] ?? table.p2p) as T };
    }
    case "getPaymentCode": {
      const code = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join("");
      return {
        ok: true,
        data: { payment_code: code, expire_at: Date.now() + 15 * 60_000 } as T,
      };
    }
    case "fetchQRDetail": {
      const raw = String(params[0] ?? "").trim();
      if (raw.length < 8) return { ok: false, error: "ข้อมูล QR ไม่ครบ" };
      const amtMatch = raw.match(/(\d+\.\d{2})/);
      return {
        ok: true,
        data: {
          transRef: `SLIP${Date.now().toString().slice(-8)}`,
          amount: amtMatch ? Number(amtMatch[1]) : 500,
          sender: "081****234",
          receiver: maskPhone(ctx.credentials.msisdn || "0924488708"),
          bank: "KBANK",
          at: new Date().toISOString(),
          raw,
        } as T,
      };
    }
    case "fetchTransactionHistory":
    case "fetchTransactionInfo":
      return { ok: true, data: { source: "sim" } as T };
    case "getAmityToken":
      return { ok: true, data: { token: `amity-sim-${Date.now().toString(36)}` } as T };
    case "getWithdrawalStatus":
      return { ok: true, data: { status: "NONE" } as T };
    default:
      return { ok: false, error: `ไม่รู้จักเมธอด ${method}` };
  }
}
