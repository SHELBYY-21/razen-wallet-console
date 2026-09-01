import { bankLogo } from "@/lib/razen/thai-banks-logo";
import { cn } from "@/lib/utils";

export function BrandMark({
  id,
  alt,
  className,
}: {
  id: string;
  alt: string;
  className?: string;
}) {
  const mark = bankLogo(id);
  return (
    <img
      src={mark?.icon ?? `/brands/${id}.png`}
      alt={alt || mark?.name || id}
      className={cn("size-7 object-contain", className)}
    />
  );
}
