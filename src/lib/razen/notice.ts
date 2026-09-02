import type { Notice, NoticeKind } from "./types";

export function makeNotice(
  title: string,
  body: string,
  kind: NoticeKind = "info",
  at = Date.now(),
): Notice {
  return {
    id: `n-${at}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    body,
    kind,
    at,
    read: false,
  };
}

export function prependNotices(list: Notice[], next: Notice, cap = 40): Notice[] {
  return [next, ...list].slice(0, cap);
}

export function unreadCount(list: Notice[]): number {
  return list.filter((n) => !n.read).length;
}

export function browserNotify(title: string, body: string): boolean {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  try {
    new Notification(title, { body, icon: "/favicon.svg" });
    return true;
  } catch {
    return false;
  }
}

export const KIND_TONE: Record<NoticeKind, string> = {
  in: "text-in",
  out: "text-brand",
  fail: "text-danger",
  face: "text-warn",
  quota: "text-warn",
  info: "text-cyan",
};
