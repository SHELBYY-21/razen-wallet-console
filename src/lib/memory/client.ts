import type { MemoryKind } from "./types";

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
