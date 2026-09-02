import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { FlowChart } from "@/components/razen/flow-chart";
import { BrandMark } from "@/components/razen/brand-mark";
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

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <section className="panel-hero px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="kicker">{hello}</p>
            <p className="mt-4 text-sm text-muted">ยอดพร้อมโอน</p>
            <p className="mt-1 font-display text-4xl font-semibold leading-none tracking-tight tabular-nums text-brand sm:text-[3.25rem]">
              {synced ? baht(balance) : "—"}
            </p>
            <p className="mt-3 text-xs text-subtle">
              {synced ? "ซิงก์จาก TrueMoney · getBalance" : "เชื่อมกระเป๋าก่อนโอน"}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-52">
            <Link
              to="/transfer"
              search={{ method: "p2p" }}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan px-5 text-sm font-semibold text-bg transition-opacity duration-200 hover:opacity-90"
            >
              โอนเลย
            </Link>
            <Link
              to="/transfer"
              search={{ method: "promptpay" }}
              className="inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm text-fg shadow-[var(--shadow-border)] transition-[box-shadow] duration-200 hover:shadow-[var(--shadow-border-hover)]"
            >
              สแกน QR
            </Link>
            {!synced ? (
              <Link to="/tools" className="inline-flex min-h-11 items-center justify-center text-sm text-muted">
                เชื่อมกระเป๋า
              </Link>
            ) : (
              <Link
                to="/transfer"
                search={{ method: "bank" }}
                className="inline-flex min-h-11 items-center justify-center text-sm text-muted"
              >
                โอนบัญชีธนาคาร
              </Link>
            )}
          </div>
        </div>
        <div className="mt-7">
          <div className="flex items-center justify-between text-xs text-subtle">
            <span>โควต้าวันนี้</span>
            <span className="tabular-nums">
              เหลือ {baht(remain)} · {usedPct}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
            <div className="h-full rounded-full bg-cyan" style={{ width: `${usedPct}%` }} />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat k="รับเข้า" v={baht(stats.incoming)} tone="pos" />
        <Stat k="จ่ายออก" v={baht(stats.outgoing)} />
        <Stat k="ค้างส่ง" v={String(stats.pending)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,1fr)]">
        <section className="panel p-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-base font-semibold">กระแส 7 วัน</h2>
            <p className="text-xs text-muted">
              เข้า {baht(stats.incoming)} · ออก {baht(stats.outgoing)}
            </p>
          </div>
          <FlowChart data={series} />
        </section>

        <section className="panel flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">ล่าสุด</h2>
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
            {recent.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted">ยังไม่มีรายการในกระเป๋านี้</li>
            ) : (
              recent.map((tx) => <TxRow key={tx.id} tx={tx} onOpen={() => setReceipt(tx.id)} />)
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone?: "pos" }) {
  return (
    <div className="panel px-4 py-4">
      <p className="text-[11px] tracking-wide text-subtle">{k}</p>
      <p className={cn("mt-1 font-display text-xl font-semibold tabular-nums", tone === "pos" && "text-in")}>{v}</p>
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
    <li className="border-t border-white/10 first:border-t-0">
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
    </li>
  );
}
