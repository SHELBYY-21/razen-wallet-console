import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { FlowChart } from "@/components/razen/flow-chart";
import { BrandMark } from "@/components/razen/brand-mark";
import { TxTable } from "@/components/razen/tx-table";
import { baht } from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";

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
  const usedPct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const flowTotal = stats.incoming + stats.outgoing;
  const inPct = flowTotal > 0 ? Math.round((stats.incoming / flowTotal) * 100) : 0;

  const recent = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return txs.filter((t) => {
      if (t.accountId !== activeId) return false;
      if (!needle) return true;
      return (
        t.counterpart.toLowerCase().includes(needle) ||
        t.ref.toLowerCase().includes(needle) ||
        t.counterpartMeta.toLowerCase().includes(needle)
      );
    });
  }, [txs, activeId, q]);

  const pieFlow = [
    { name: "เข้า", value: stats.incoming || 0, fill: "var(--color-in)" },
    { name: "ออก", value: stats.outgoing || 0, fill: "var(--color-brand)" },
  ];
  const pieQuota = [
    { name: "ใช้แล้ว", value: spent, fill: "var(--color-cyan)" },
    { name: "เหลือ", value: Math.max(0, limit - spent), fill: "var(--color-elevated)" },
  ];

  const hour = new Date().getHours();
  const hello = hour < 12 ? "สวัสดีตอนเช้า" : hour < 18 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">{hello}</p>
          <p className="font-display text-2xl">
            {synced ? `พร้อมโอน ${baht(balance)}` : "เชื่อมกระเป๋าก่อนโอน"}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 sm:w-80">
          <BrandMark id="truemoney" alt="" className="size-5" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาเบอร์ ชื่อ หรือเลขอ้างอิง"
            className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="ยอดพร้อมใช้" value={synced ? baht(balance) : "—"} gold hint="จาก getBalance" />
        <Kpi label="รับเข้า" value={baht(stats.incoming)} tone="pos" hint="รายการสำเร็จ" />
        <Kpi label="จ่ายออก" value={baht(stats.outgoing)} tone="neg" hint="รวมค่าธรรมเนียมในประวัติ" />
        <Kpi label="ค้างส่ง" value={String(stats.pending)} hint="รอผลจากวอลเล็ต" />
        <Kpi label="โควต้าวันนี้" value={`${usedPct}%`} hint={`${baht(spent)} จาก ${baht(limit)}`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/transfer" search={{ method: "p2p" }} className="rounded-xl bg-brand px-4 py-2 text-sm text-brand-fg">
          โอน P2P
        </Link>
        <Link to="/transfer" search={{ method: "promptpay" }} className="rounded-xl border border-line px-4 py-2 text-sm">
          สแกนพร้อมเพย์
        </Link>
        <Link to="/transfer" search={{ method: "bank" }} className="rounded-xl border border-line px-4 py-2 text-sm">
          โอนธนาคาร
        </Link>
        <Link to="/tools" className="rounded-xl border border-line px-4 py-2 text-sm">
          {synced ? "ซิงก์ยอด" : "เชื่อมกระเป๋า"}
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base">กระแส 7 วัน</h2>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1 text-cyan">
                <i className="inline-block size-2 rounded-full bg-cyan" />
                เข้า {baht(stats.incoming)}
              </span>
              <span className="inline-flex items-center gap-1 text-brand">
                <i className="inline-block size-2 rounded-full bg-brand" />
                ออก {baht(stats.outgoing)}
              </span>
            </div>
          </div>
          <FlowChart data={series} />
        </section>
        <MonthGrid />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Donut title={sumFlow(inPct)} data={pieFlow} caption="สัดส่วนเข้าต่อออก" />
        <Donut title={`${usedPct}%`} data={pieQuota} caption="โควต้าวันนี้" />
      </div>

      <section className="rounded-2xl border border-line bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-base">รายการล่าสุด</h2>
          <Link to="/history" className="text-xs text-cyan">
            ดูทั้งหมด
          </Link>
        </div>
        <TxTable rows={recent} onOpen={setReceipt} />
      </section>
    </div>
  );
}

function sumFlow(inPct: number) {
  return inPct ? `เข้า ${inPct}%` : "—";
}

function Kpi({
  label,
  value,
  gold,
  tone,
  hint,
}: {
  label: string;
  value: string;
  gold?: boolean;
  tone?: "pos" | "neg";
  hint?: string;
}) {
  return (
    <div className={gold ? "rounded-2xl bg-brand p-4 text-brand-fg" : "rounded-2xl border border-line bg-surface p-4"}>
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
    <section className="rounded-2xl border border-line bg-surface p-3">
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
    <section className="rounded-2xl border border-line bg-surface p-3">
      <h2 className="mb-2 text-sm font-medium">
        {now.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
      </h2>
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-subtle">
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
