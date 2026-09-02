import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type GlyphTone = "gold" | "teal" | "in" | "danger" | "warn" | "muted";

const TONE: Record<GlyphTone, string> = {
  gold: "bg-brand/18 text-brand",
  teal: "bg-cyan/18 text-cyan",
  in: "bg-in/18 text-in",
  danger: "bg-danger/18 text-danger",
  warn: "bg-warn/18 text-warn",
  muted: "bg-white/8 text-muted",
};

const SIZE = {
  sm: "size-8 rounded-lg [&_svg]:size-3.5",
  md: "size-9 rounded-xl [&_svg]:size-4",
  lg: "size-11 rounded-2xl [&_svg]:size-5",
};

export function Glyph({
  icon: Icon,
  tone = "muted",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: GlyphTone;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        TONE[tone],
        SIZE[size],
        className,
      )}
      aria-hidden
    >
      <Icon strokeWidth={1.75} />
    </span>
  );
}
