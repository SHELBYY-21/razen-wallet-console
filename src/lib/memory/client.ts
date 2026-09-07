import type { MemoryItem, MemoryKind } from "./types";

export function rememberLocal(
  kind: MemoryKind,
  key: string,
  value: string,
  accountId = "desk",
) {
  if (typeof fetch === "undefined") return;
  void fetch("/api/memory", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, key, value, accountId }),
  }).catch(() => undefined);
}

export async function recallLocal(
  q: string,
  accountId: string,
  kind?: MemoryKind,
): Promise<MemoryItem[]> {
  if (typeof fetch === "undefined") return [];
  const url = new URL("/api/memory", window.location.origin);
  url.searchParams.set("q", q);
  url.searchParams.set("accountId", accountId);
  if (kind) url.searchParams.set("kind", kind);
  try {
    const res = await fetch(url);
    const json = (await res.json()) as { items?: MemoryItem[] };
    return json.items ?? [];
  } catch {
    return [];
  }
}
