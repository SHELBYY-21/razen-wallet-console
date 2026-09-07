import { cn } from "@/lib/utils";

export function RazenMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/ce/mark-64.png"
      alt=""
      width={32}
      height={32}
      className={cn("size-8 rounded-lg", className)}
    />
  );
}

export function RazenWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <RazenMark />
      <div className="min-w-0 leading-tight">
        <div className="font-display text-[11px] font-semibold tracking-[0.22em] text-fg">CE EMPIRE</div>
        {!compact && <div className="text-xs text-subtle">RAZEN · TrueMoney</div>}
      </div>
    </div>
  );
}
