import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { KIND_TONE } from "@/lib/razen/notice";
import { formatDateTime } from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";
import type { NoticeKind } from "@/lib/razen/types";
import { cn } from "@/lib/utils";

export function NoticeBell() {
  const notices = useRazen((s) => s.notices);
  const markRead = useRazen((s) => s.markNoticesRead);
  const unread = notices.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label={unread ? `แจ้งเตือน ${unread} ยังไม่อ่าน` : "แจ้งเตือน"}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="relative inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors duration-200 hover:bg-elevated hover:text-fg"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute top-2 right-2 min-w-4 rounded-full bg-danger px-1 text-[10px] leading-4 font-semibold text-fg">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          className="glass-frost absolute right-0 z-[var(--z-overlay)] mt-1 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl"
          role="dialog"
          aria-label="กล่องแจ้งเตือน"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold">แจ้งเตือน</p>
            {unread > 0 && (
              <button type="button" className="text-xs text-cyan" onClick={() => markRead()}>
                อ่านทั้งหมด
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-auto">
            {notices.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-muted">ยังไม่มีการแจ้งเตือน</li>
            ) : (
              notices.slice(0, 20).map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "border-t border-white/10 px-4 py-3 first:border-t-0",
                    !n.read && "bg-white/4",
                  )}
                >
                  <p className={cn("text-sm font-medium", KIND_TONE[(n.kind ?? "info") as NoticeKind])}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                  <p className="mt-1 text-[10px] text-subtle">{formatDateTime(n.at)}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
