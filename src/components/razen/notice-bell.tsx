import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Bell, ScanFace, TriangleAlert } from "lucide-react";
import { KIND_LABEL, KIND_TONE } from "@/lib/razen/notice";
import { relativeTime } from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";
import type { NoticeKind } from "@/lib/razen/types";
import { cn } from "@/lib/utils";

const KIND_ICON = {
  in: ArrowDownLeft,
  out: ArrowUpRight,
  fail: TriangleAlert,
  face: ScanFace,
  quota: TriangleAlert,
  info: Bell,
} as const;

export function NoticeBell() {
  const notices = useRazen((s) => s.notices);
  const markRead = useRazen((s) => s.markNoticesRead);
  const markOne = useRazen((s) => s.markNoticeRead);
  const openReceipt = useRazen((s) => s.setLastReceipt);
  const unread = notices.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors duration-200 hover:bg-elevated hover:text-fg"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute top-2 right-2 min-w-4 rounded-full bg-brand px-1 text-[10px] leading-4 font-semibold text-brand-fg">
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
          <div className="flex items-center justify-between px-4 py-3 shadow-[var(--shadow-border)]">
            <p className="text-sm font-semibold">แจ้งเตือน</p>
            {unread > 0 && (
              <button type="button" className="text-xs text-brand" onClick={() => markRead()}>
                อ่านแล้ว
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-auto">
            {notices.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-muted">ยังไม่มีการแจ้งเตือน</li>
            ) : (
              notices.slice(0, 20).map((n) => {
                const kind = (n.kind ?? "info") as NoticeKind;
                const Icon = KIND_ICON[kind];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-elevated",
                        !n.read && "bg-brand/8",
                      )}
                      onClick={() => {
                        markOne(n.id);
                        if (n.txId) openReceipt(n.txId);
                        else if (n.href) void navigate({ to: n.href });
                        setOpen(false);
                      }}
                    >
                      <Icon className={cn("mt-0.5 size-4 shrink-0", KIND_TONE[kind])} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium">{n.title}</span>
                          <span className="text-[10px] tracking-wide text-subtle">{KIND_LABEL[kind]}</span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">{n.body}</span>
                        <span className="mt-1 block text-[10px] text-subtle">{relativeTime(n.at)}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
