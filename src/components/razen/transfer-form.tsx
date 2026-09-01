import { useMemo, useState } from "react";
import { BANKS, HOME_BANK, bankByCode, bankFee } from "@/lib/razen/banks";
import {
  baht,
  formatPhone,
  isBankAccount,
  isThaiMobile,
  isThaiNationalId,
  maskPhone,
} from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";
import { tmnConfigured } from "@/lib/tmnone/creds";
import type { TransferMethod } from "@/lib/razen/types";
import type { RecipientInfo } from "@/lib/tmn/client";
import { BrandMark } from "@/components/razen/brand-mark";
import { PromptPayScan } from "@/components/razen/promptpay-scan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function TransferForm({ method }: { method: Exclude<TransferMethod, "gift"> }) {
  const contacts = useRazen((s) => s.contacts);
  const getBalance = useRazen((s) => s.balance);
  const getDaily = useRazen((s) => s.dailySpent);
  const balance = getBalance();
  const daily = getDaily();
  const limit = useRazen((s) => s.settings.dailyLimit);
  const lookup = useRazen((s) => s.lookupRecipient);
  const transfer = useRazen((s) => s.transferViaApi);
  const accounts = useRazen((s) => s.accounts);
  const activeId = useRazen((s) => s.activeAccountId);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [ppValue, setPpValue] = useState("");
  const [bankCode, setBankCode] = useState(HOME_BANK);
  const [accNo, setAccNo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState<RecipientInfo | null>(null);

  const n = Number(amount.replace(/,/g, ""));
  const fee = method === "bank" ? bankFee(bankCode) : 0;
  const total = (Number.isFinite(n) ? n : 0) + fee;
  const remain = Math.max(0, limit - daily);

  const preview = useMemo(() => {
    if (method === "p2p") {
      const c = contacts.find((x) => x.phone === phone.replace(/\D/g, ""));
      return {
        counterpart: rec?.full_name_th || c?.name || (phone ? formatPhone(phone) : ""),
        meta: phone ? maskPhone(phone) : "",
      };
    }
    if (method === "promptpay") {
      return {
        counterpart: rec?.full_name_th || (ppValue ? `พร้อมเพย์ ${ppValue}` : ""),
        meta: ppValue.replace(/\D/g, ""),
      };
    }
    const bank = bankByCode(bankCode);
    return {
      counterpart: rec?.full_name_th || (accNo ? `บัญชี ***${accNo.slice(-4)}` : ""),
      meta: accNo.replace(/\D/g, ""),
    };
  }, [method, contacts, phone, ppValue, bankCode, accNo, rec]);

  function validate(): string | null {
    const acc = accounts.find((a) => a.id === activeId);
    if (!acc || !tmnConfigured(acc.creds)) return "เชื่อมกระเป๋าที่เครื่องมือก่อนโอน";
    if (acc.walletBalance == null) return "ซิงก์ยอด getBalance ก่อนโอน";
    if (!Number.isFinite(n) || n <= 0) return "กรุณาใส่จำนวนเงิน";
    if (method === "p2p" && !isThaiMobile(phone)) return "เบอร์มือถือไม่ถูกต้อง";
    if (method === "promptpay") {
      const d = ppValue.replace(/\D/g, "");
      if (!(isThaiMobile(d) || isThaiNationalId(d))) return "หมายเลขพร้อมเพย์ไม่ถูกต้อง";
    }
    if (method === "bank" && !isBankAccount(accNo)) return "เลขบัญชีไม่ถูกต้อง";
    return null;
  }

  async function onSubmit() {
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setBusy(true);
    try {
      if (method === "p2p" || method === "promptpay") {
        const target = method === "p2p" ? phone : ppValue;
        const info = await lookup(target);
        if (!info.ok) {
          setError(info.error);
          return;
        }
        setRec(info.data);
      } else {
        setRec({
          payee_wallet_id: accNo,
          full_name_th: `บัญชี ${bankByCode(bankCode)?.short ?? bankCode}`,
          full_name_en: bankByCode(bankCode)?.abbr ?? bankCode,
          status: "ปกติ",
          masked: `***${accNo.replace(/\D/g, "").slice(-4)}`,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    setError("");
    const res = await transfer({
      method,
      amount: n,
      counterpart: preview.counterpart,
      counterpartMeta: preview.meta,
      note,
      bankCode: method === "bank" ? bankCode : undefined,
      payee:
        method === "p2p"
          ? phone.replace(/\D/g, "")
          : method === "promptpay"
            ? ppValue.replace(/\D/g, "")
            : accNo.replace(/\D/g, ""),
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setAmount("");
    setNote("");
    setPhone("");
    setPpValue("");
    setAccNo("");
    setRec(null);
  }

  const heading =
    method === "p2p" ? "ยืนยันโอน P2P" : method === "promptpay" ? "ยืนยันโอนพร้อมเพย์" : "ยืนยันโอนธนาคาร";

  return (
    <div className="space-y-4">
      {method === "p2p" && (
        <>
          <Field label="เบอร์ปลายทาง">
            <Input
              inputMode="tel"
              maxLength={10}
              placeholder="08XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          {contacts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contacts.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPhone(c.phone)}
                  className="min-h-11 rounded-full border border-line px-3 text-xs text-muted transition-colors duration-200 hover:border-cyan/40 hover:text-fg"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {method === "promptpay" && (
        <Field label="หมายเลขพร้อมเพย์">
          <div className="flex items-center gap-2">
            <BrandMark id="promptpay" alt="PromptPay" className="size-8" />
            <Input
              inputMode="tel"
              placeholder="เบอร์มือถือ / เลขบัตรประชาชน"
              value={ppValue}
              onChange={(e) => setPpValue(e.target.value)}
              className="flex-1"
            />
            <PromptPayScan onHit={(v) => setPpValue(v)} />
          </div>
        </Field>
      )}

      {method === "bank" && (
        <>
          <Field label="เลือกธนาคาร">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {BANKS.map((b) => (
                <button
                  key={b.abbr}
                  type="button"
                  title={b.name}
                  aria-pressed={bankCode === b.abbr}
                  aria-label={b.name}
                  onClick={() => setBankCode(b.abbr)}
                  className={cn(
                    "flex min-h-11 cursor-pointer flex-col items-center gap-1 rounded-md border px-1 py-2 text-[10px] font-medium transition-colors duration-200",
                    bankCode === b.abbr
                      ? "border-cyan text-fg"
                      : "border-line text-muted hover:border-cyan/30",
                  )}
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-white/95 p-0.5">
                    <BrandMark id={b.abbr} alt={b.name} className="size-7" />
                  </span>
                  {b.abbr}
                </button>
              ))}
            </div>
          </Field>
          <Field label="เลขบัญชี">
            <Input
              inputMode="numeric"
              placeholder="XXX-X-XXXXX-X"
              value={accNo}
              onChange={(e) => setAccNo(e.target.value)}
            />
          </Field>
        </>
      )}

      <Field label="จำนวน (฿)">
        <Input
          inputMode="decimal"
          placeholder="0.00"
          className="h-14 text-2xl font-semibold tabular-nums"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>

      {method === "p2p" && (
        <Field label="ข้อความ">
          <Input
            placeholder="ข้อความถึงผู้รับ (ไม่บังคับ)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      )}

      <div className="flex justify-between font-mono text-[11px] text-subtle">
        <span>ใช้ได้ {baht(balance)}</span>
        <span>
          คงเหลือโควต้าวันนี้ {baht(remain)}
          {fee > 0 ? ` · ค่าธรรมเนียม ${baht(fee)}` : ""}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <Button
        className={cn(
          "w-full",
          method === "promptpay" && "bg-cyan text-bg hover:opacity-90",
          method === "bank" && "bg-in text-bg hover:opacity-90",
        )}
        disabled={busy}
        aria-busy={busy}
        onClick={() => void onSubmit()}
      >
        {busy ? "กำลังตรวจสอบผู้รับ…" : "โอนเงิน"}
      </Button>

      {rec && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/55 p-3 backdrop-blur-sm sm:items-center">
          <div
            className="glass-frost w-full max-w-md rounded-2xl p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line" />
            <p id="confirm-title" className="text-center font-mono text-xs tracking-[0.2em] text-cyan uppercase">
              {heading}
            </p>
            <div className="mt-4 text-center">
              <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-elevated text-lg text-muted">
                {rec.full_name_th.slice(0, 1)}
              </div>
              <p className="text-lg font-semibold">{rec.full_name_th}</p>
              <p className="text-xs text-muted">{rec.full_name_en}</p>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="เบอร์ผู้รับ" v={rec.masked} />
              <Row k="จำนวน" v={baht(total)} strong />
              <Row k="สถานะผู้รับ" v={rec.status} ok={rec.status === "ปกติ"} />
            </dl>
            <div className="mt-5 flex flex-col gap-2">
              <Button disabled={busy} onClick={() => void confirm()}>
                โอนเงิน
              </Button>
              <Button variant="secondary" onClick={() => setRec(null)}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted">{label}</Label>
      {children}
    </div>
  );
}

function Row({ k, v, strong, ok }: { k: string; v: string; strong?: boolean; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-subtle">{k}</dt>
      <dd className={cn("tabular-nums", strong && "text-brand", ok && "text-in")}>{v}</dd>
    </div>
  );
}
