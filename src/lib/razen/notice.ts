import type { Notice, NoticeKind } from "./types";

export type NoticeLink = { txId?: string; href?: string };

export function makeNotice(
  title: string,
  body: string,
  kind: NoticeKind = "info",
  at = Date.now(),
  link?: NoticeLink,
): Notice {
  return {
    id: `n-${at}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    body,
    kind,
    at,
    read: false,
    txId: link?.txId,
    href: link?.href,
  };
}

export function prependNotices(list: Notice[], next: Notice, cap = 40): Notice[] {
  return [next, ...list].slice(0, cap);
}

export function unreadCount(list: Notice[]): number {
  return list.filter((n) => !n.read).length;
}

export function markOneRead(list: Notice[], id: string): Notice[] {
  return list.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export function browserNotify(title: string, body: string): boolean {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  try {
    new Notification(title, { body, icon: "/icon-192.png" });
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
  info: "text-muted",
};

export const KIND_LABEL: Record<NoticeKind, string> = {
  in: "เงินเข้า",
  out: "จ่าย",
  fail: "ไม่ผ่าน",
  face: "ใบหน้า",
  quota: "โควต้า",
  info: "ระบบ",
};
