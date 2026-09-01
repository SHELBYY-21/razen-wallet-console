import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";
import { TMN_METHODS } from "@/lib/tmn/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools")({ component: ToolsPage });

export function ToolsPage() {
  const settings = useRazen((s) => s.settings);
  const setSettings = useRazen((s) => s.setSettings);
  const setMode = useRazen((s) => s.setMode);
  const changePin = useRazen((s) => s.changePin);
  const resetDemo = useRazen((s) => s.resetDemo);
  const simulateError = useRazen((s) => s.simulateError);
  const txs = useRazen((s) => s.txs);
  const notices = useRazen((s) => s.notices);
  const markRead = useRazen((s) => s.markNoticesRead);
  const testLogin = useRazen((s) => s.testLogin);
  const loadFees = useRazen((s) => s.loadFees);
  const lastFees = useRazen((s) => s.lastFees);
  const makePaymentCode = useRazen((s) => s.makePaymentCode);
  const paymentCode = useRazen((s) => s.paymentCode);
  const inspectQr = useRazen((s) => s.inspectQr);
  const lastQr = useRazen((s) => s.lastQr);
  const session = useRazen((s) => s.sessionToken);
  const lastProbe = useRazen((s) => s.lastProbe);
  const accounts = useRazen((s) => s.accounts);
  const activeId = useRazen((s) => s.activeAccountId);
  const updateCreds = useRazen((s) => s.updateCreds);
  const unread = notices.filter((n) => !n.read).length;
  const active = accounts.find((a) => a.id === activeId) ?? accounts[0];

  const [apiBase, setApiBase] = useState(settings.apiBase);
  const [apiToken, setApiToken] = useState(settings.apiToken);
  const [pin, setPin] = useState("");
  const [webhook, setWebhook] = useState(settings.faceauth_webhook_url);
  const [timeoutSec, setTimeoutSec] = useState(String(settings.faceauth_wait_timeout));
  const [qrRaw, setQrRaw] = useState("");
  const [testing, setTesting] = useState(false);
  const [keyId, setKeyId] = useState(active?.creds.tmn_key_id ?? "");
  const [msisdn, setMsisdn] = useState(active?.creds.msisdn ?? "");
  const [loginToken, setLoginToken] = useState(active?.creds.login_token ?? "");
  const [tmnId, setTmnId] = useState(active?.creds.tmn_id ?? "");
  const [deviceId, setDeviceId] = useState(active?.creds.device_id ?? "");

  useEffect(() => {
    if (!active) return;
    setKeyId(active.creds.tmn_key_id);
    setMsisdn(active.creds.msisdn);
    setLoginToken(active.creds.login_token);
    setTmnId(active.creds.tmn_id);
    setDeviceId(active.creds.device_id);
  }, [active?.id]);

  function saveApi() {
    if (active) {
      updateCreds(active.id, {
        tmn_key_id: keyId.trim(),
        msisdn: msisdn.trim(),
        login_token: loginToken.trim(),
        tmn_id: tmnId.trim(),
        device_id: deviceId.trim(),
      });
    }
    setSettings({
      apiBase: apiBase.trim(),
      apiToken: apiToken.trim(),
      faceauth_webhook_url: webhook.trim(),
      faceauth_wait_timeout: Number(timeoutSec) || 180,
    });
  }

  async function testApi() {
    setTesting(true);
    const res = await testLogin();
    setTesting(false);
    if (!res.ok) toast.error(res.error);
  }

  async function exportCsv() {
    const csv =
      "\ufeffวันที่,รายการ,จำนวน,สถานะ,อ้างอิง\n" +
      txs
        .map(
          (t) =>
            `${formatDateTime(t.createdAt)},${t.counterpart},${t.direction === "in" ? t.amount : -t.amount},${t.status},${t.ref}`,
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "razen_transactions.csv";
    a.click();
    toast.success("Export CSV แล้ว");
  }

  function onChangePin() {
    if (!/^\d{6}$/.test(pin)) {
      toast.error("PIN ต้องเป็น 6 หลัก");
      return;
    }
    changePin(pin);
    setPin("");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <p className="text-xs font-medium tracking-wide text-cyan">เครื่องมือ</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">ตั้งค่า API และเครื่องมือระบบ</h1>
        <p className="mt-1 text-sm text-muted">
          ตามเอกสาร{" "}
          <a
            className="text-brand underline"
            href="https://www.tmn.one/apidoc.html"
            target="_blank"
            rel="noreferrer"
          >
            tmn.one/apidoc
          </a>{" "}
          — setData + loginWithPin6
        </p>
      </header>

      <section className="rounded-2xl bg-surface p-5 panel-glow">
        <h2 className="mb-3 text-sm font-medium">โหมดเชื่อมต่อ</h2>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("sim")}
            className={cn(
              "h-11 rounded-md border font-mono text-xs tracking-widest uppercase",
              settings.mode === "sim" ? "border-cyan text-cyan" : "border-line text-muted",
            )}
          >
            SIM
          </button>
          <button
            type="button"
            onClick={() => setMode("live")}
            className={cn(
              "h-11 rounded-md border font-mono text-xs tracking-widest uppercase",
              settings.mode === "live" ? "border-in text-in" : "border-line text-muted",
            )}
          >
            LIVE
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-muted">
            บัญชีที่เลือก: {active?.nickname ?? "—"} · LIVE ใช้ SDK TMNOne.js (ไม่ต้องใส่ URL)
          </p>
          <div className="space-y-1">
            <Label className="text-xs text-muted">$_TMN['tmn_key_id']</Label>
            <Input value={keyId} onChange={(e) => setKeyId(e.target.value)} placeholder="x1234" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">$_TMN['mobile_number']</Label>
            <Input
              inputMode="tel"
              value={msisdn}
              onChange={(e) => setMsisdn(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="0800000000"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">$_TMN['login_token']</Label>
            <Input
              value={loginToken}
              onChange={(e) => setLoginToken(e.target.value)}
              placeholder="L-00000000-0000-0000-0000-00000000"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">$_TMN['tmn_id']</Label>
            <Input
              value={tmnId}
              onChange={(e) => setTmnId(e.target.value)}
              placeholder="tmn.12345678"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">$_TMN['device_id'] (เว้นว่างได้)</Label>
            <Input
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="เว้นว่างให้ SDK hash จากเบอร์"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">API Base URL (ไม่บังคับ — proxy สำรอง)</Label>
            <Input
              placeholder="เว้นว่าง = ใช้ TMNOne.js ตามเอกสาร"
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">API Token (ใช้กับ proxy)</Label>
            <Input
              type="password"
              placeholder="Bearer token…"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">faceauth_webhook_url</Label>
            <Input
              placeholder="https://webhook.app/api"
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">faceauth_wait_timeout (วินาที)</Label>
            <Input
              inputMode="numeric"
              value={timeoutSec}
              onChange={(e) => setTimeoutSec(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={saveApi}>
              บันทึก
            </Button>
            <Button variant="secondary" className="flex-1" disabled={testing} onClick={() => void testApi()}>
              รันตัวอย่าง PHP (login → balance → history)
            </Button>
          </div>
          {session && (
            <p className="font-mono text-[11px] text-in">session {session.slice(0, 18)}…</p>
          )}
          {lastProbe && (
            <pre className="max-h-56 overflow-auto rounded-md bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-cyan">
              {JSON.stringify(lastProbe, null, 2)}
            </pre>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-5 panel-glow">
        <h2 className="mb-1 text-sm font-medium">getWalletFee</h2>
        <p className="mb-3 text-xs text-muted">ค่าธรรมเนียมรายช่องทาง</p>
        <Button variant="secondary" className="mb-3" onClick={() => void loadFees()}>
          ดึงค่าธรรมเนียม
        </Button>
        <div className="space-y-2">
          {lastFees.map((f) => (
            <div key={f.channel} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-mono text-xs text-cyan">{f.channel}</p>
                <p className="text-xs text-muted">{f.note}</p>
              </div>
              <p className="tabular-nums text-muted">ฟรีอีก {f.free_remaining}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-5 panel-glow">
        <h2 className="mb-1 text-sm font-medium">getPaymentCode</h2>
        <p className="mb-3 text-xs text-muted">QR จ่ายที่เซเว่น / ร้านค้า</p>
        <Button variant="secondary" onClick={() => void makePaymentCode()}>
          สร้างรหัสจ่าย
        </Button>
        {paymentCode && (
          <div className="mt-4 rounded-xl bg-elevated p-4 text-center">
            <p className="font-mono text-lg tracking-[0.2em]">{paymentCode.payment_code}</p>
            <p className="mt-1 text-[11px] text-muted">
              หมดอายุ {formatDateTime(paymentCode.expire_at)}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-surface p-5 panel-glow">
        <h2 className="mb-1 text-sm font-medium">fetchQRDetail</h2>
        <p className="mb-3 text-xs text-muted">วาง raw data จาก QR บนสลิป</p>
        <Textarea
          placeholder="000201010212..."
          value={qrRaw}
          onChange={(e) => setQrRaw(e.target.value)}
        />
        <Button
          className="mt-3"
          variant="secondary"
          onClick={async () => {
            const r = await inspectQr(qrRaw);
            if (!r.ok) toast.error(r.error);
            else toast.success("อ่านสลิปแล้ว");
          }}
        >
          ถอดสลิป
        </Button>
        {lastQr && (
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">transRef</dt>
              <dd className="font-mono">{lastQr.transRef}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">ยอด</dt>
              <dd className="tabular-nums">{lastQr.amount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">จาก / ถึง</dt>
              <dd>
                {lastQr.sender} → {lastQr.receiver}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section className="rounded-2xl bg-surface p-5 panel-glow">
        <h2 className="mb-1 text-sm font-medium">ข้อมูล & การจำลอง</h2>
        <p className="mb-3 text-xs text-muted">
          ส่งออกรายการหรือจำลองสถานการณ์ · PIN กระเป๋าใช้ตอน LIVE อัตโนมัติ (ไม่ถามตอนโอน)
        </p>
        <div className="space-y-2">
          <Button variant="secondary" className="w-full" onClick={() => void exportCsv()}>
            Export CSV
          </Button>
          <Button variant="danger" className="w-full" onClick={simulateError}>
            จำลอง Error
          </Button>
          <Button variant="secondary" className="w-full" onClick={resetDemo}>
            รีเซ็ตเดโม
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="PIN กระเป๋า 6 หลัก (LIVE)"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <Button variant="secondary" onClick={onChangePin}>
            บันทึก PIN LIVE
          </Button>
        </div>
        <button type="button" className="mt-3 text-xs text-muted" onClick={markRead}>
          แจ้งเตือน {unread} ยังไม่อ่าน — ทำเครื่องหมายว่าอ่านแล้ว
        </button>
      </section>

      <section className="rounded-2xl bg-surface p-5 panel-glow">
        <h2 className="mb-2 font-mono text-xs tracking-widest text-cyan uppercase">Public functions</h2>
        <ul className="grid grid-cols-1 gap-1 font-mono text-[11px] text-muted sm:grid-cols-2">
          {TMN_METHODS.map((m) => (
            <li key={m}>{m}()</li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-subtle">
          LIVE เรียกคลาส TMNOne ตาม PHP บน tmn.one/apidoc:
          setData(key, mobile, login_token, tmn_id, device_id) → loginWithPin6(pin)
          → getBalance() → fetchTransactionHistory(เมื่อวาน, พรุ่งนี้)
          PIN ใช้ตอน login เท่านั้น ไม่ถามตอนโอน
        </p>
      </section>
    </div>
  );
}
