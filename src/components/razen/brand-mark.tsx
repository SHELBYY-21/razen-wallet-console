import { cn } from "@/lib/utils";

/** Files from https://github.com/casperstack/thai-banks-logo */
export function BrandMark({
  id,
  alt,
  className,
}: {
  id: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={`/brands/${id}.png`}
      alt={alt}
      className={cn("size-7 object-contain", className)}
    />
  );
}
