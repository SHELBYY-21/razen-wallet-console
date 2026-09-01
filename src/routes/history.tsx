import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { TxTable } from "@/components/razen/tx-table";
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
    const res = await pullHistory(start, end);
    if (!res.ok) toast.error(res.error);
    else if (res.count) toast.success(`${res.count} rows`);
    setApplied({ start, end, q });
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <div className="dense-toolbar">
        <label className="dense-cell" style={{ flex: "1 1 120px" }}>
          <span className="k">ตั้งแต่</span>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="v bg-transparent outline-none"
          />
        </label>
        <label className="dense-cell" style={{ flex: "1 1 120px" }}>
          <span className="k">ถึง</span>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="v bg-transparent outline-none"
          />
        </label>
        <label className="dense-cell" style={{ flex: "2 1 160px" }}>
          <span className="k">ค้นหา</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ชื่อ / เบอร์ / อ้างอิง"
            className="v bg-transparent outline-none"
          />
        </label>
        <div className="dense-cell" style={{ flex: "0 0 auto" }}>
          <button type="button" className="dense-btn" disabled={busy} onClick={() => void search()}>
            {busy ? "กำลังดึง…" : mode === "live" ? "ดึงประวัติ" : "กรอง"}
          </button>
        </div>
      </div>
      <TxTable rows={rows} onOpen={setReceipt} />
    </div>
  );
}
