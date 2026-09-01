import { cn } from "@/lib/utils";

export function RazenMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="rz-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4c37a" />
          <stop offset="1" stopColor="#c6a15b" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#rz-mark)" />
      <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="7.4" fill="none" stroke="white" strokeOpacity="0.35" />
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fill="#140c02"
        fontSize="18"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        W
      </text>
    </svg>
  );
}

export function RazenWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <RazenMark />
      <div className="min-w-0 leading-tight">
        <div className="font-semibold tracking-[0.22em] text-fg">RAZEN</div>
        {!compact && (
          <div className="text-xs text-subtle">Transfer Console</div>
        )}
      </div>
    </div>
  );
}
