function walk(value: unknown, keys: string[]): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  for (const k of keys) {
    if (k in rec) {
      const n = walk(rec[k], keys);
      if (n != null) return n;
    }
  }
  for (const v of Object.values(rec)) {
    if (v && typeof v === "object") {
      const n = walk(v, keys);
      if (n != null) return n;
    }
  }
  return null;
}

export function parseBalance(data: unknown): number | null {
  return walk(data, [
    "current_balance",
    "available_balance",
    "balance",
    "currentBalance",
    "availableBalance",
    "amount",
  ]);
}

export function asList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter((x) => x && typeof x === "object") as Record<string, unknown>[];
  if (!data || typeof data !== "object") return [];
  const rec = data as Record<string, unknown>;
  for (const k of ["activities", "items", "transactions", "history", "data", "list"]) {
    if (Array.isArray(rec[k])) return asList(rec[k]);
  }
  if (rec.data && typeof rec.data === "object") return asList(rec.data);
  return [];
}

export function pickStr(row: Record<string, unknown>, ...keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "number") return String(v);
  }
  return "";
}
