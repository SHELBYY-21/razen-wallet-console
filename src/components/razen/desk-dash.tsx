import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { FlowChart } from "@/components/razen/flow-chart";
import { BrandMark } from "@/components/razen/brand-mark";
import { baht, formatDateTime } from "@/lib/razen/format";
import { bankByCode } from "@/lib/razen/banks";
import { useRazen } from "@/lib/razen/store";
import type { Transaction } from "@/lib/razen/types";
import { cn } from "@/lib/utils";

const METHOD: Record<Transaction["method"], string> = {
  p2p: "วอลเล็ต",
  promptpay: "พร้อมเพย์",
  bank: "ธนาคาร",
  gift: "ซอง",
};

const STATUS: Record<Transaction["status"], { label: string; cls: string }> = {
  completed: { label: "สำเร็จ", cls: "text-in" },
  pending: { label: "รอส่ง", cls: "text-warn" },
  processing: { label: "กำลังส่ง", cls: "text-cyan" },
  failed: { label: "ไม่ผ่าน", cls: "text-danger" },
};

export function DeskDash() {
  const accounts = useRazen((s) => s.accounts);
  const activeId = useRazen((s) => s.activeAccountId);
  const getBalance = useRazen((s) => s.balance);
  const getStats = useRazen((s) => s.stats);
  const getSeries = useRazen((s) => s.chartSeries);
  const dailySpent = useRazen((s) => s.dailySpent);
  const limit = useRazen((s) => s.settings.dailyLimit);
  const txs = useRazen((s) => s.txs);
  const setReceipt = useRazen((s) => s.setLastReceipt);
  const [q, setQ] = useState("");

  const balance = getBalance();
  const stats = getStats();
  const series = getSeries();
  const acc = accounts.find((a) => a.id === activeId) ?? accounts[0];
  const synced = acc?.walletBalance != null;
  const spent = dailySpent();
  const remain = Math.max(0, limit - spent);
  const usedPct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

  const recent = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return txs
      .filter((t) => {
        if (t.accountId !== activeId) return false;
        if (!needle) return true;
        return (
          t.counterpart.toLowerCase().includes(needle) ||
          t.ref.toLowerCase().includes(needle) ||
          t.counterpartMeta.toLowerCase().includes(needle)
        );
      })
      .slice(0, 8);
  }, [txs, activeId, q]);

  const hour = new Date().getHours();
  const hello = hour < 12 ? "สวัสดีตอนเช้า" : hour < 18 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="panel-hero px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="kicker">{hello}</p>
            <p className="mt-3 text-sm text-muted">ยอดพร้อมโอน</p>
            <p className="mt-1 font-display text-5xl leading-none tabular-nums text-brand sm:text-6xl">
              {synced ? baht(balance) : "—"}
            </p>
            <p className="mt-3 text-xs text-subtle">
              {synced ? "ซิงก์จาก TrueMoney · getBalance" : "เชื่อมกระเป๋าก่อนโอน"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/transfer"
              search={{ method: "p2p" }}
              className="inline-flex min-h-11 items-center rounded-md bg-brand px-5 text-sm font-medium text-brand-fg transition-opacity duration-200 hover:opacity-90"
            >
              โอนเลย
            </Link>
            <Link
              to="/transfer"
              search={{ method: "promptpay" }}
              className="inline-flex min-h-11 items-center rounded-md px-5 text-sm text-fg shadow-[var(--shadow-border)] transition-[box-shadow] duration-200 hover:shadow-[var(--shadow-border-hover)]"
            >
              สแกน QR
            </Link>
            <Link
              to="/transfer"
              search={{ method: "bank" }}
              className="inline-flex min-h-11 items-center rounded-md px-5 text-sm text-fg shadow-[var(--shadow-border)] transition-[box-shadow] duration-200 hover:shadow-[var(--shadow-border-hover)]"
            >
              บัญชีธนาคาร
            </Link>
            <Link
              to="/tools"
              className="inline-flex min-h-11 items-center rounded-md px-5 text-sm text-muted"
            >
              {synced ? "ซิงก์ยอด" : "เชื่อมกระเป๋า"}
            </Link>
          </div>
        </div>
      </section>

      <div className="stat-strip">
        <Stat k="รับเข้า" v={baht(stats.incoming)} tone="pos" />
        <Stat k="จ่ายออก" v={baht(stats.outgoing)} />
        <Stat k="ค้างส่ง" v={String(stats.pending)} />
        <Stat k="โควต้าวันนี้" v={`${usedPct}%`} hint={`เหลือ ${baht(remain)}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(15rem,0.8fr)]">
        <section className="panel p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="kicker">Flow</p>
              <h2 className="mt-1 text-lg font-semibold">กระแส 7 วัน</h2>
            </div>
            <p className="text-xs text-muted">
              เข้า {baht(stats.incoming)} · ออก {baht(stats.outgoing)}
            </p>
          </div>
          <FlowChart data={series} />
        </section>
        <MonthGrid />
      </div>

      <section className="panel p-5">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="kicker">Ledger</p>
            <h2 className="mt-1 text-lg font-semibold">รายการล่าสุด</h2>
          </div>
          <label className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 shadow-[var(--shadow-border)] sm:w-80">
            <Search className="size-4 text-subtle" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาเบอร์ ชื่อ หรือเลขอ้างอิง"
              aria-label="ค้นหารายการ"
              className="h-8 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-subtle md:text-sm"
            />
          </label>
        </div>
        <ul>
          {recent.length === 0 ? (
            <li className="py-10 text-center text-sm text-muted">ยังไม่มีรายการในกระเป๋านี้</li>
          ) : (
            recent.map((tx) => <TxRow key={tx.id} tx={tx} onOpen={() => setReceipt(tx.id)} />)
          )}
        </ul>
        <div className="mt-3 text-right">
          <Link to="/history" className="text-sm text-cyan">
            ดูทั้งหมด
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ k, v, tone, hint }: { k: string; v: string; tone?: "pos"; hint?: string }) {
  return (
    <div className="stat-cell">
      <p className="text-[11px] tracking-wide text-subtle">{k}</p>
      <p className={cn("mt-1 font-display text-2xl tabular-nums", tone === "pos" && "text-in")}>{v}</p>
      {hint ? <p className="mt-1 text-[10px] text-subtle">{hint}</p> : null}
    </div>
  );
}

function TxRow({ tx, onOpen }: { tx: Transaction; onOpen: () => void }) {
  const st = STATUS[tx.status];
  const bank = bankByCode(tx.bankCode);
  const mark =
    tx.method === "promptpay" ? "promptpay" : tx.method === "p2p" || tx.method === "gift" ? "truemoney" : bank?.abbr ?? "KBANK";
  const inn = tx.direction === "in";
  return (
    <li className="border-t border-line/70">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-11 w-full cursor-pointer items-center gap-3 py-3.5 text-left transition-colors duration-200 hover:bg-elevated/40"
      >
        <BrandMark id={mark} alt="" className="size-9 rounded-md bg-white p-0.5" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{tx.counterpart}</p>
          <p className="text-[11px] text-subtle">
            {METHOD[tx.method]} · {formatDateTime(tx.createdAt)}
          </p>
        </div>
        <span className={cn("hidden text-[11px] sm:inline", st.cls)}>{st.label}</span>
        <p className={cn("font-display text-lg tabular-nums", inn ? "text-in" : "text-brand")}>
          {inn ? "+" : "−"}
          {baht(inn ? tx.amount : tx.amount + tx.fee)}
        </p>
      </button>
    </li>
  );
}

function MonthGrid() {
  const txs = useRazen((s) => s.txs);
  const activeId = useRazen((s) => s.activeAccountId);
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const pad = new Date(y, m, 1).getDay();
  const hits = new Set(
    txs
      .filter((t) => t.accountId === activeId)
      .map((t) => new Date(t.createdAt).toDateString()),
  );
  const cells = [...Array(pad).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const names = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  return (
    <section className="panel p-5">
      <p className="kicker">Calendar</p>
      <h2 className="mt-1 mb-3 text-lg font-semibold">
        {now.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
      </h2>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-subtle">
        {names.map((n) => (
          <div key={n}>{n}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const mark = hits.has(new Date(y, m, d).toDateString());
          const today = d === now.getDate();
          return (
            <div
              key={d}
              className={`rounded py-1 ${today ? "bg-brand text-brand-fg" : mark ? "text-cyan" : "text-muted"}`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </section>
  );
}
