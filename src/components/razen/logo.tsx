import { cn } from "@/lib/utils";

export function RazenMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="rz-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d9a4" />
          <stop offset="1" stopColor="#d8b56e" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="6" fill="url(#rz-mark)" />
      <path
        d="M8 20.5 10.2 12l2.8 4.4L16 9.5l3 6.9 2.8-4.4 2.2 8.5H8Z"
        fill="#12100a"
      />
      <path d="M9 22.2h14v1.6H9z" fill="#12100a" />
    </svg>
  );
}

export function RazenWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <RazenMark />
      <div className="min-w-0 leading-tight">
        <div className="font-display text-[11px] font-semibold tracking-[0.22em] text-fg">RAZEN</div>
        {!compact && <div className="text-xs text-subtle">Crown Tether</div>}
      </div>
    </div>
  );
}
