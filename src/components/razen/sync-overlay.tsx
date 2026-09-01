import { useEffect, useState } from "react";
import { useRazen } from "@/lib/razen/store";
import { cn } from "@/lib/utils";

const EXIT_MS = 220;
const REDUCED_MS = 1000;

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SyncOverlay() {
  const mascotUntil = useRazen((s) => s.mascotUntil);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!mascotUntil) return;
    const remain = mascotUntil - Date.now();
    if (remain <= 0) return;

    const reduced = prefersReducedMotion();
    const hold = reduced ? Math.min(remain, REDUCED_MS) : remain;
    const exit = reduced ? 0 : EXIT_MS;

    setExiting(false);
    setVisible(true);

    const tExit = window.setTimeout(() => {
      if (reduced) {
        setVisible(false);
        setExiting(false);
      } else {
        setExiting(true);
      }
    }, hold);
    const tHide = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, hold + exit);

    return () => {
      window.clearTimeout(tExit);
      window.clearTimeout(tHide);
    };
  }, [mascotUntil]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-2 z-40 bottom-20 md:right-6 md:bottom-6",
        exiting ? "razen-exit" : "razen-enter",
      )}
      aria-hidden
    >
      <img
        src="/mascot/sync.png"
        alt=""
        role="presentation"
        draggable={false}
        className="h-24 w-auto select-none md:h-40"
      />
    </div>
  );
}
