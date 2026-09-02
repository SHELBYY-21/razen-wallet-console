import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Glyph } from "@/components/razen/glyph";
import { baht } from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gifts")({ component: GiftsPage });

function GiftsPage() {
  const create = useRazen((s) => s.createEnvelope);
  const claim = useRazen((s) => s.claimEnvelope);
  const envelopes = useRazen((s) => s.envelopes);
  const getBalance = useRazen((s) => s.balance);
  const [total, setTotal] = useState("");
  const [count, setCount] = useState("1");
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function make() {
    setErr("");
    setBusy(true);
    const res = await create({
      amount: Number(total),
      message: msg,
      fromName: "RAZEN",
      count: Number(count) || 1,
    });
    setBusy(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setTotal("");
    setCount("1");
    setMsg("");
  }

  function open() {
    setErr("");
    const res = claim(code);
    if ("error" in res) setErr(res.error);
    else setCode("");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header className="flex items-start gap-3">
        <Glyph icon={Gift} tone="danger" size="lg" />
        <div>
        <p className="text-xs font-medium tracking-wide text-cyan">ซองอั่งเปา</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">สร้างซองอั่งเปาแจกเงิน</h1>
        <p className="mt-1 text-sm text-muted">generateVoucher · ยอดใช้ได้ {baht(getBalance())}</p>
        </div>
      </header>

      <div className="rounded-2xl bg-surface p-5 panel-glow">
        <div className="relative mx-auto mb-5 h-36 w-full max-w-[220px] overflow-hidden rounded-xl bg-gradient-to-b from-danger/80 to-brand">
          <div className="absolute inset-x-6 top-0 h-10 rounded-b-[40%] bg-danger/90" />
          <div className="absolute inset-0 flex items-center justify-center text-fg">
            <Gift className="size-12 opacity-90" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted">จำนวนเงินรวม (฿)</Label>
            <Input
              inputMode="decimal"
              placeholder="0.00"
              className="h-14 text-2xl font-semibold tabular-nums"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">จำนวนซอง</Label>
            <Input
              inputMode="numeric"
              min={1}
              placeholder="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">รายละเอียดซอง</Label>
            <Input
              placeholder="ข้อความในซอง"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
          </div>
          {err && <p className="text-sm text-danger">{err}</p>}
          <Button className="w-full bg-danger hover:opacity-90" disabled={busy} onClick={() => void make()}>
            สร้างซอง
          </Button>
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-5 panel-glow">
        <h2 className="mb-3 text-sm font-medium">เปิดซองด้วยรหัส</h2>
        <div className="flex gap-2">
          <Input
            placeholder="รหัสซอง"
            className="uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button variant="secondary" onClick={open}>
            เปิด
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">fetchVoucherHistory</h2>
        {envelopes.length === 0 && <p className="text-sm text-muted">ยังไม่มีซอง</p>}
        {envelopes.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 panel-glow">
            <div>
              <p className="font-mono text-sm tracking-widest">{e.code}</p>
              <p className="text-xs text-muted">{e.message || "—"}</p>
            </div>
            <div className="text-right">
              <p className="tabular-nums">{baht(e.amount)}</p>
              <p className={cn("text-[11px]", e.status === "open" ? "text-in" : "text-subtle")}>
                {e.status === "open" ? "รอเปิด" : "เปิดแล้ว"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
