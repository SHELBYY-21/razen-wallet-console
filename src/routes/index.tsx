import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Clock3,
  Gift,
  Smartphone,
  Users,
} from "lucide-react";
import { FlowChart } from "@/components/razen/flow-chart";
import { TxRow } from "@/components/razen/tx-row";
import { accountAgeDays, baht } from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const accounts = useRazen((s) => s.accounts);
  const activeId = useRazen((s) => s.activeAccountId);
  const getBalance = useRazen((s) => s.balance);
  const getStats = useRazen((s) => s.stats);
  const getSeries = useRazen((s) => s.chartSeries);
  const txs = useRazen((s) => s.txs);
  const setReceipt = useRazen((s) => s.setLastReceipt);
  const balance = getBalance();
  const stats = getStats();
  const series = getSeries();
  const acc = accounts.find((a) => a.id === activeId) ?? accounts[0];
  const recent = txs.filter((t) => t.accountId === activeId).slice(0, 5);
  const idx = accounts.findIndex((a) => a.id === activeId) + 1;
  const synced = acc?.walletBalance != null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium tracking-wide text-cyan">แดชบอร์ด</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">ภาพรวมบัญชีเงิน</h1>
      </header>

      <Link
        to={synced ? "/accounts" : "/tools"}
        className="glass-hero block rounded-2xl p-5 text-brand-fg transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.98] md:p-6"
      >
        <p className="text-sm opacity-80">{synced ? "ยอดเงินคงเหลือ · getBalance" : "ยอดเงินคงเหลือ"}</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
          {synced ? baht(balance) : "—"}
        </p>
        <p className="mt-3 text-xs opacity-80">
          {synced
            ? `บัญชีที่ ${idx} · ${acc?.masked} · ${acc ? accountAgeDays(acc.openedAt) : 0} วัน · LIVE`
            : "เชื่อมกระเป๋า TrueMoney ที่เครื่องมือ แล้วรัน setData → loginWithPin6 → getBalance"}
        </p>
      </Link>

      <section className="grid grid-cols-3 gap-2 md:gap-3">
        <Stat
          icon={<ArrowDownLeft className="size-4" />}
          label="เงินเข้า"
          value={baht(stats.incoming)}
          tone="in"
        />
        <Stat
          icon={<ArrowUpRight className="size-4" />}
          label="เงินออก"
          value={baht(stats.outgoing)}
          tone="out"
        />
        <Stat
          icon={<Clock3 className="size-4" />}
          label="รอดำเนินการ"
          value={String(stats.pending)}
          tone="muted"
        />
      </section>

      <section className="glass rounded-2xl p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">กราฟเงินเข้า / ออก</h2>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <i className="size-2 rounded-full bg-in" /> เงินเข้า
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-2 rounded-full bg-brand" /> เงินออก
            </span>
          </div>
        </div>
        <FlowChart data={series} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">ทำรายการด่วน</h2>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          <Quick to="/transfer" search={{ method: "p2p" }} icon={Users} label="P2P" tone="brand" />
          <Quick
            to="/transfer"
            search={{ method: "promptpay" }}
            icon={Smartphone}
            label="พร้อมเพย์"
            tone="info"
          />
          <Quick to="/transfer" search={{ method: "bank" }} icon={Building2} label="ธนาคาร" tone="in" />
          <Quick to="/gifts" icon={Gift} label="ซอง" tone="danger" />
        </div>
      </section>

      <section className="glass rounded-2xl p-3 md:p-4">
        <div className="mb-1 flex items-center justify-between px-2">
          <h2 className="text-sm font-medium">รายการล่าสุด</h2>
          <Link to="/history" className="text-xs text-brand hover:underline">
            ดูทั้งหมด
          </Link>
        </div>
        <div>
          {recent.length ? (
            recent.map((tx) => <TxRow key={tx.id} tx={tx} onClick={() => setReceipt(tx.id)} />)
          ) : (
            <p className="px-2 py-6 text-sm text-muted">ยังไม่มีรายการจากกระเป๋า — ซิงก์ประวัติหลังเชื่อมบัญชี</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "in" | "out" | "muted";
}) {
  const color =
    tone === "in" ? "text-in" : tone === "out" ? "text-brand" : "text-muted";
  return (
    <div className="glass rounded-xl p-3 md:p-4">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className="text-[11px] text-muted">{label}</p>
      <p className={`mt-1 text-sm font-semibold tabular-nums md:text-base ${color}`}>{value}</p>
    </div>
  );
}

function Quick({
  to,
  search,
  icon: Icon,
  label,
  tone,
}: {
  to: "/transfer" | "/gifts";
  search?: { method: "p2p" | "promptpay" | "bank" };
  icon: typeof Users;
  label: string;
  tone: "brand" | "info" | "in" | "danger";
}) {
  const map = {
    brand: "bg-brand/15 text-brand",
    info: "bg-info/15 text-info",
    in: "bg-in/15 text-in",
    danger: "bg-danger/15 text-danger",
  };
  return (
    <Link
      to={to}
      search={search}
      className="glass flex flex-col items-center gap-2 rounded-xl px-1 py-4 transition-[transform] duration-150 ease-out active:scale-[0.96]"
    >
      <span className={`flex size-11 items-center justify-center rounded-lg ${map[tone]}`}>
        <Icon className="size-5" />
      </span>
      <span className="text-xs text-muted">{label}</span>
    </Link>
  );
}
