import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Clock3, Gift, Landmark, QrCode, Search, Send } from "lucide-react";
import { FlowChart } from "@/components/razen/flow-chart";
import { BrandMark } from "@/components/razen/brand-mark";
import { Glyph } from "@/components/razen/glyph";
import { fadeUp, stagger, enterEase } from "@/components/razen/motion";
import { baht } from "@/lib/razen/format";
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
      .slice(0, 6);
  }, [txs, activeId, q]);

  const hour = new Date().getHours();
  const hello = hour < 12 ? "สวัสดีตอนเช้า" : hour < 18 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="mx-auto max-w-6xl space-y-4"
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={stagger}
    >
      <motion.section className="tmn-card px-5 py-6 sm:px-7 sm:py-7" variants={fadeUp}>
        <div className="flex items-center gap-3">
          <BrandMark id="truemoney" alt="TrueMoney" className="size-10 rounded-full bg-white p-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs tracking-[0.16em] uppercase text-white/70">TrueMoney Wallet</p>
            <p className="truncate text-sm font-medium">{acc?.nickname || "ยังไม่เชื่อม"}</p>
          </div>
          <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-medium">
            {synced ? "ซิงก์แล้ว" : "รอเชื่อม"}
          </span>
        </div>
        <p className="mt-6 text-sm text-white/75">{hello} · ยอดพร้อมโอน</p>
        <p className="mt-1 font-display text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-5xl">
          {synced ? baht(balance) : "—"}
        </p>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>โควต้าวันนี้</span>
            <span className="tabular-nums">
              เหลือ {baht(remain)} · {usedPct}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${usedPct}%` }}
              transition={enterEase}
            />
          </div>
        </div>
      </motion.section>

      <motion.div className="grid grid-cols-4 gap-2" variants={fadeUp}>
        <DashAction to="/transfer" search={{ method: "p2p" }} icon={Send} label="โอน" primary />
        <DashAction to="/transfer" search={{ method: "promptpay" }} icon={QrCode} label="สแกน" />
        <DashAction to="/transfer" search={{ method: "bank" }} icon={Landmark} label="ธนาคาร" />
        <DashAction to="/gifts" icon={Gift} label="ซอง" />
      </motion.div>

      <motion.div className="grid gap-3 sm:grid-cols-3" variants={fadeUp}>
        <Stat k="รับเข้า" v={baht(stats.incoming)} tone="pos" />
        <Stat k="จ่ายออก" v={baht(stats.outgoing)} />
        <Stat k="ค้างส่ง" v={String(stats.pending)} pending />
      </motion.div>

      <motion.div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,1fr)]" variants={fadeUp}>
        <section className="panel p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Glyph icon={ArrowDownLeft} tone="teal" size="sm" />
              <h2 className="text-base font-semibold">กระแส 7 วัน</h2>
            </div>
            <p className="text-xs text-muted">
              เข้า {baht(stats.incoming)} · ออก {baht(stats.outgoing)}
            </p>
          </div>
          <FlowChart data={series} />
        </section>

        <section className="panel flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Glyph icon={Clock3} tone="gold" size="sm" />
              <h2 className="text-base font-semibold">ล่าสุด</h2>
            </div>
            <Link to="/history" className="text-xs text-cyan">
              ทั้งหมด
            </Link>
          </div>
          <label className="mb-2 flex min-h-11 items-center gap-2 rounded-md px-3 shadow-[var(--shadow-border)]">
            <Search className="size-4 text-subtle" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหา"
              aria-label="ค้นหารายการ"
              className="h-8 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-subtle md:text-sm"
            />
          </label>
          <ul className="min-h-0 flex-1">
            <AnimatePresence initial={false}>
              {recent.length === 0 ? (
                <li className="py-10 text-center text-sm text-muted">ยังไม่มีรายการในกระเป๋านี้</li>
              ) : (
                recent.map((tx) => <TxRow key={tx.id} tx={tx} onOpen={() => setReceipt(tx.id)} />)
              )}
            </AnimatePresence>
          </ul>
        </section>
      </motion.div>
    </motion.div>
  );
}

function DashAction({
  to,
  search,
  icon: Icon,
  label,
  primary,
}: {
  to: "/transfer" | "/gifts" | "/tools";
  search?: { method: "p2p" | "promptpay" | "bank" };
  icon: typeof Send;
  label: string;
  primary?: boolean;
}) {
  return (
    <motion.div variants={fadeUp} whileTap={{ scale: 0.96 }}>
      <Link
        to={to}
        search={search}
        className={cn(
          "flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-opacity duration-150 hover:opacity-90",
          primary ? "bg-brand text-brand-fg" : "panel text-muted",
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
        {label}
      </Link>
    </motion.div>
  );
}

function Stat({ k, v, tone, pending }: { k: string; v: string; tone?: "pos"; pending?: boolean }) {
  const icon = tone === "pos" ? ArrowDownLeft : pending ? Clock3 : ArrowUpRight;
  const gTone = tone === "pos" ? "in" : pending ? "warn" : "gold";
  return (
    <div className="panel flex items-center gap-3 px-4 py-4">
      <Glyph icon={icon} tone={gTone} />
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide text-subtle">{k}</p>
        <p className={cn("mt-0.5 font-display text-xl font-semibold tabular-nums", tone === "pos" && "text-in")}>{v}</p>
      </div>
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
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="border-t border-white/10 first:border-t-0"
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-11 w-full cursor-pointer items-center gap-3 py-3 text-left transition-colors duration-200 hover:bg-white/5"
      >
        <BrandMark id={mark} alt="" className="size-8 rounded-md bg-white p-0.5" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{tx.counterpart}</p>
          <p className="text-[11px] text-subtle">{METHOD[tx.method]}</p>
        </div>
        <span className={cn("hidden text-[11px] lg:inline", st.cls)}>{st.label}</span>
        <p className={cn("text-sm font-semibold tabular-nums", inn ? "text-in" : "text-brand")}>
          {inn ? "+" : "−"}
          {baht(inn ? tx.amount : tx.amount + tx.fee)}
        </p>
      </button>
    </motion.li>
  );
}
