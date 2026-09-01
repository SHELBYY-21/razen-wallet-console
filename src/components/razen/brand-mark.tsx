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
  return (
    <img
      src={`/brands/${id}.svg`}
      alt={alt}
      className={cn("size-7 object-contain", className)}
    />
  );
}
