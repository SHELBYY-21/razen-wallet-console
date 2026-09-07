import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { TxRow } from "@/components/razen/tx-row";
import { dayLabel } from "@/lib/razen/format";
import { ymd } from "@/lib/tmnone/bootstrap";
import { useRazen } from "@/lib/razen/store";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  const txs = useRazen((s) => s.txs);
  const active = useRazen((s) => s.activeAccountId);
  const setReceipt = useRazen((s) => s.setLastReceipt);
  const pullHistory = useRazen((s) => s.pullHistory);
  const mode = useRazen((s) => s.settings.mode);
  const accounts = useRazen((s) => s.accounts);
  const linked = accounts.find((a) => a.id === active)?.walletBalance != null;
  const [start, setStart] = useState(ymd(-7));
  const [end, setEnd] = useState(ymd(0));
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

  const groups = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const t of rows) {
      const k = dayLabel(t.createdAt);
      const list = map.get(k) ?? [];
      list.push(t);
      map.set(k, list);
    }
    return [...map.entries()];
  }, [rows]);

  async function search() {
    setBusy(true);
    const res = await pullHistory(start, end);
    if (!res.ok) toast.error(res.error);
    else if (res.count) toast.success(`${res.count} rows`);
    setApplied({ start, end, q });
    setBusy(false);
  }

  return (
    <div className="stack-dense mx-auto max-w-6xl">
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
          <span className="k inline-flex items-center gap-1">
            <Search className="size-3" /> ค้นหา
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ชื่อ / เบอร์ / อ้างอิง"
            className="v bg-transparent outline-none"
          />
        </label>
        <div className="dense-cell" style={{ flex: "0 0 auto" }}>
          <button type="button" className="dense-btn inline-flex items-center gap-2" disabled={busy} onClick={() => void search()}>
            <RefreshCw className={busy ? "size-3.5 animate-spin" : "size-3.5"} />
            {busy ? "กำลังดึง…" : mode === "live" ? "ดึงประวัติ" : "กรอง"}
          </button>
        </div>
      </div>
      <div className="space-y-5">
        {groups.length === 0 ? (
          <p className="panel px-4 py-8 text-center text-sm text-muted">
            {linked ? "ยังไม่มีรายการ" : "ยังไม่เชื่อมกระเป๋า"}
          </p>
        ) : (
          groups.map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-2 px-1 text-xs font-medium tracking-wide text-subtle">{day}</h2>
              <div className="panel divide-y divide-line/60 px-1 py-1">
                {list.map((tx) => (
                  <TxRow key={tx.id} tx={tx} onClick={() => setReceipt(tx.id)} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
