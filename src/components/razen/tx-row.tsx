import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Gift,
  Smartphone,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { baht, relativeTime } from "@/lib/razen/format";
import type { Transaction } from "@/lib/razen/types";
import { cn } from "@/lib/utils";

const METHOD_ICON = {
  p2p: Users,
  promptpay: Smartphone,
  bank: Building2,
  gift: Gift,
};

const STATUS: Record<string, { label: string; variant: "in" | "out" | "danger" | "info" | "default" }> = {
  pending: { label: "รอดำเนินการ", variant: "out" },
  processing: { label: "กำลังโอน", variant: "info" },
  completed: { label: "สำเร็จ", variant: "in" },
  failed: { label: "ไม่สำเร็จ", variant: "danger" },
};

export function TxRow({
  tx,
  onClick,
}: {
  tx: Transaction;
  onClick?: () => void;
}) {
  const Icon = METHOD_ICON[tx.method];
  const st = STATUS[tx.status];
  const inflow = tx.direction === "in";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-elevated"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          inflow ? "bg-in/12 text-in" : "bg-brand/12 text-brand",
        )}
      >
        {inflow ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-fg">{tx.counterpart}</span>
          <Icon className="size-3 shrink-0 text-subtle" />
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          <span>{relativeTime(tx.createdAt)}</span>
          {tx.note && <span className="truncate">· {tx.note}</span>}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span
          className={cn(
            "block font-medium tabular-nums",
            inflow ? "text-in" : "text-fg",
          )}
        >
          {inflow ? "+" : "−"}
          {baht(tx.amount)}
        </span>
        <Badge variant={st.variant} className="mt-1">
          {st.label}
        </Badge>
      </span>
    </button>
  );
}
