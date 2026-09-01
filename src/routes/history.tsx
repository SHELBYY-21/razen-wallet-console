import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TxRow } from "@/components/razen/tx-row";
import { useRazen } from "@/lib/razen/store";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function HistoryPage() {
  const txs = useRazen((s) => s.txs);
  const active = useRazen((s) => s.activeAccountId);
  const setReceipt = useRazen((s) => s.setLastReceipt);
  const pullHistory = useRazen((s) => s.pullHistory);
  const mode = useRazen((s) => s.settings.mode);
  const today = new Date();
  const week = new Date(today.getTime() - 7 * 86400000);
  const [start, setStart] = useState(iso(week));
  const [end, setEnd] = useState(iso(today));
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState({ start, end, q: "" });

  const rows = useMemo(() => {
    const from = new Date(applied.start).setHours(0, 0, 0, 0);
    const to = new Date(applied.end).setHours(23, 59, 59, 999);
    const needle = applied.q.trim().toLowerCase();
    return txs.filter((t) => {
      if (t.accountId !== active) return false;
      if (t.createdAt < from || t.createdAt > to) return false;
      if (!needle) return true;
      return (
        t.counterpart.toLowerCase().includes(needle) ||
        t.ref.toLowerCase().includes(needle) ||
        t.note.toLowerCase().includes(needle)
      );
    });
  }, [txs, active, applied]);

  async function search() {
    setBusy(true);
    if (mode === "live") {
      const res = await pullHistory(start, end);
      if (!res.ok) toast.error(res.error);
      else if (res.count) toast.success(`ดึง ${res.count} รายการจาก Wallet`);
    }
    setApplied({ start, end, q });
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium tracking-wide text-cyan">ประวัติรายการ</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">ค้นหาและดูรายการย้อนหลัง</h1>
        <p className="mt-1 text-sm text-muted">fetchTransactionHistory(start, end)</p>
      </header>

      <div className="rounded-2xl bg-surface p-4 panel-glow">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted">เริ่มต้น</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted">สิ้นสุด</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <Label className="text-xs text-muted">ค้นหา</Label>
          <Input placeholder="ชื่อ / เลขอ้างอิง" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button className="mt-4 w-full" onClick={() => void search()} disabled={busy}>
          {busy ? "กำลังค้นหา…" : mode === "live" ? "ดึงประวัติจาก Wallet" : "ค้นหา"}
        </Button>
      </div>

      <div className="rounded-2xl bg-surface p-3 panel-glow">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">ไม่พบรายการ</p>
        ) : (
          rows.map((tx) => <TxRow key={tx.id} tx={tx} onClick={() => setReceipt(tx.id)} />)
        )}
      </div>
    </div>
  );
}
