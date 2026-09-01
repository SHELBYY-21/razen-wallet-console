import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  Gauge,
  Search,
  Wallet,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
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
  completed: { label: "สำเร็จ", cls: "bg-in/15 text-in" },
  pending: { label: "รอส่ง", cls: "bg-warn/15 text-warn" },
  processing: { label: "กำลังส่ง", cls: "bg-cyan/15 text-cyan" },
  failed: { label: "ไม่ผ่าน", cls: "bg-danger/15 text-danger" },
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
  const flowTotal = stats.incoming + stats.outgoing;
  const inPct = flowTotal > 0 ? Math.round((stats.incoming / flowTotal) * 100) : 0;

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

  const pieFlow = [
    { name: "เข้า", value: stats.incoming || 0, fill: "var(--color-in)" },
    { name: "ออก", value: stats.outgoing || 0, fill: "var(--color-brand)" },
  ];

  const hour = new Date().getHours();
  const hello = hour < 12 ? "สวัสดีตอนเช้า" : hour < 18 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted">{hello}</p>
          <p className="font-display text-2xl sm:text-3xl">
            {synced ? `พร้อมโอน ${baht(balance)}` : "เชื่อมกระเป๋า แล้วโอนได้ทันที"}
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 lg:w-96">
          <Search className="size-4 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาเบอร์ ชื่อ หรือเลขอ้างอิง"
            className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <Kpi icon={Wallet} label="ยอดวอลเล็ต" value={synced ? baht(balance) : "—"} gold hint="ซิงก์จาก TrueMoney" />
        <Kpi icon={ArrowDownLeft} label="รับเข้า" value={baht(stats.incoming)} tone="pos" hint="รายการสำเร็จ" />
        <Kpi icon={ArrowUpRight} label="จ่ายออก" value={baht(stats.outgoing)} tone="neg" hint="ไม่รวมรายการที่ล้ม" />
        <Kpi icon={Clock3} label="ค้างส่ง" value={String(stats.pending)} hint={stats.pending ? "ยังรอผลจากวอลเล็ต" : "ไม่มีคิวค้าง"} />
        <Kpi icon={Gauge} label="โควต้าวันนี้" value={`${usedPct}%`} hint={`เหลือ ${baht(remain)}`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/transfer" search={{ method: "p2p" }} className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-fg">
          โอนเลย
        </Link>
        <Link to="/transfer" search={{ method: "promptpay" }} className="rounded-full border border-line px-5 py-2.5 text-sm">
          สแกน QR
        </Link>
        <Link to="/transfer" search={{ method: "bank" }} className="rounded-full border border-line px-5 py-2.5 text-sm">
          บัญชีธนาคาร
        </Link>
        <Link to="/tools" className="rounded-full border border-line px-5 py-2.5 text-sm">
          {synced ? "ซิงก์ยอด" : "เชื่อมกระเป๋า"}
        </Link>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.9fr)]">
        <section className="rounded-3xl border border-line bg-surface p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg">กระแส 7 วัน</h2>
            <p className="text-xs text-muted">เข้า {baht(stats.incoming)} · ออก {baht(stats.outgoing)}</p>
          </div>
          <FlowChart data={series} />
        </section>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <MonthGrid />
          <Donut title={inPct ? `เข้า ${inPct}%` : "—"} data={pieFlow} caption="เข้าต่อออก" />
        </div>
      </div>

      <section className="rounded-3xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg">รายการล่าสุด</h2>
          <Link to="/history" className="text-sm text-cyan">
            ดูทั้งหมด
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {recent.length === 0 ? (
            <li className="py-8 text-center text-sm text-muted">ยังไม่มีรายการในกระเป๋านี้</li>
          ) : (
            recent.map((tx) => <TxRow key={tx.id} tx={tx} onOpen={() => setReceipt(tx.id)} />)
          )}
        </ul>
      </section>
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
    <li>
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 py-3 text-left">
        <BrandMark id={mark} alt="" className="size-9 rounded-lg bg-white/95 p-0.5" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{tx.counterpart}</p>
          <p className="text-[11px] text-muted">
            {METHOD[tx.method]} · {formatDateTime(tx.createdAt)}
          </p>
        </div>
        <span className={cn("hidden rounded-full px-2 py-0.5 text-[11px] sm:inline", st.cls)}>{st.label}</span>
        <p className={cn("font-display text-base tabular-nums", inn ? "text-in" : "text-brand")}>
          {inn ? "+" : "−"}
          {baht(inn ? tx.amount : tx.amount + tx.fee)}
        </p>
      </button>
    </li>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  gold,
  tone,
  hint,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  gold?: boolean;
  tone?: "pos" | "neg";
  hint?: string;
}) {
  return (
    <div className={cn("rounded-3xl p-4", gold ? "bg-brand text-brand-fg" : "border border-line bg-surface")}>
      <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-black/15">
        <Icon className="size-4" />
      </div>
      <p className="text-[11px] tracking-wide opacity-80">{label}</p>
      <p className={`mt-1 font-display text-2xl tabular-nums ${tone === "pos" ? "text-in" : tone === "neg" ? "text-brand" : ""}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-[10px] opacity-70">{hint}</p> : null}
    </div>
  );
}

function Donut({
  title,
  data,
  caption,
}: {
  title: string;
  data: { name: string; value: number; fill: string }[];
  caption: string;
}) {
  const sum = data.reduce((n, d) => n + d.value, 0);
  return (
    <section className="rounded-3xl border border-line bg-surface p-4">
      <p className="text-xs text-muted">{caption}</p>
      <div className="relative mx-auto h-36 w-36">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={42} outerRadius={58} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl tabular-nums">{sum ? title : "—"}</span>
        </div>
      </div>
    </section>
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
    <section className="rounded-3xl border border-line bg-surface p-4">
      <h2 className="mb-2 font-display text-base">
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
              className={`rounded-md py-1 ${today ? "bg-brand text-brand-fg" : mark ? "text-cyan" : "text-muted"}`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </section>
  );
}
