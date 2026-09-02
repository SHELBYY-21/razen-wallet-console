import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Glyph } from "@/components/razen/glyph";
import { baht, formatPhone } from "@/lib/razen/format";
import { useRazen, type ConnectInput } from "@/lib/razen/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accounts")({ component: AccountsPage });

const EMPTY: ConnectInput = {
  nickname: "",
  msisdn: "",
  tmn_key_id: "",
  login_token: "",
  tmn_id: "",
  device_id: "",
  pin: "",
};

function AccountsPage() {
  const accounts = useRazen((s) => s.accounts);
  const active = useRazen((s) => s.activeAccountId);
  const setActive = useRazen((s) => s.setActiveAccount);
  const addAccount = useRazen((s) => s.addAccount);
  const toggle = useRazen((s) => s.toggleAccount);
  const getBalance = useRazen((s) => s.balance);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await addAccount(form);
    setBusy(false);
    if ("error" in res) {
      setErr(res.error);
      return;
    }
    setForm(EMPTY);
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-cyan">บัญชี</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">จัดการบัญชี Wallet</h1>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" strokeWidth={1.75} /> เพิ่มบัญชี
        </Button>
      </header>

      <div className="space-y-2">
        {accounts.map((a, i) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setActive(a.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl bg-surface p-4 text-left panel-glow",
              active === a.id && "shadow-[0_0_0_1px_var(--color-cyan)]",
            )}
          >
            <Glyph icon={Wallet} tone={active === a.id ? "teal" : "muted"} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{a.nickname}</span>
              <span className="block text-xs text-muted">
                {a.masked} · TMN {a.creds.tmn_id || "—"}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-semibold tabular-nums">{baht(getBalance(a.id))}</span>
              <span
                className={cn(
                  "text-[11px]",
                  a.status === "active" ? "text-in" : "text-subtle",
                )}
              >
                {a.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน"}
              </span>
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                toggle(a.id);
              }}
              onKeyDown={(e) => e.stopPropagation()}
              className="rounded-md border border-line px-2 py-1 text-[10px] text-muted"
            >
              {a.status === "active" ? "พัก" : "เปิด"}
            </span>
            <span className="sr-only">บัญชีที่ {i + 1}</span>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/55 sm:items-center">
          <form
            onSubmit={(e) => void submit(e)}
            className="glass-frost max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" />
            <h2 className="text-lg font-semibold">เพิ่มบัญชีใหม่</h2>
            <p className="mb-4 text-xs text-muted">
              ฟิลด์ตาม TMNOne.setData + loginWithPin6
            </p>
            <div className="space-y-3">
              <F label="ชื่อบัญชี">
                <Input
                  value={form.nickname}
                  placeholder="เช่น บัญชีหลัก"
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  required
                />
              </F>
              <F label="เบอร์ Wallet">
                <Input
                  inputMode="tel"
                  maxLength={10}
                  placeholder="08XXXXXXXX"
                  value={form.msisdn}
                  onChange={(e) => setForm({ ...form, msisdn: e.target.value })}
                  required
                />
              </F>
              <F label="TMN Key ID">
                <Input
                  placeholder="tmnone_keyid"
                  value={form.tmn_key_id}
                  onChange={(e) => setForm({ ...form, tmn_key_id: e.target.value })}
                />
              </F>
              <F label="Login Token">
                <Input
                  placeholder="L-xxxxxxxx-…"
                  value={form.login_token}
                  onChange={(e) => setForm({ ...form, login_token: e.target.value })}
                />
              </F>
              <F label="PIN 6 หลัก">
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="******"
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value })}
                />
              </F>
              <F label="TMN ID">
                <Input
                  placeholder="tmn.10000000000"
                  value={form.tmn_id}
                  onChange={(e) => setForm({ ...form, tmn_id: e.target.value })}
                />
              </F>
              <F label="Device ID">
                <Input
                  placeholder="01234567890abcdef"
                  value={form.device_id}
                  onChange={(e) => setForm({ ...form, device_id: e.target.value })}
                />
              </F>
            </div>
            {err && <p className="mt-3 text-sm text-danger">{err}</p>}
            <div className="mt-5 flex gap-2">
              <Button type="submit" className="flex-1" disabled={busy}>
                {busy ? "กำลังเชื่อม…" : "เชื่อมบัญชี"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                ปิด
              </Button>
            </div>
            <p className="mt-3 text-[11px] text-subtle">
              ฟิลด์ตาม TMNOne.setData(keyid, msisdn, login_token, tmn_id, device_id) — LIVE
              เรียกคลาสจากเอกสาร tmn.one ไม่ต้องใส่ URL
            </p>
            <p className="mt-1 font-mono text-[10px] text-subtle">{formatPhone(form.msisdn)}</p>
          </form>
        </div>
      )}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted">{label}</Label>
      {children}
    </div>
  );
}
