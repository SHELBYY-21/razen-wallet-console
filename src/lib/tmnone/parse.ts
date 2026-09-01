import type { Transaction } from "../razen/types";

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

export function mapHistory(data: unknown, accountId: string): Transaction[] {
  return asList(data).map((row, i) => {
    const amt = Number(pickStr(row, "amount", "total_amount", "transaction_amount") || 0);
    const type = pickStr(row, "type", "action", "transaction_type").toLowerCase();
    const out =
      amt < 0 || type.includes("debit") || type.includes("out") || type.includes("transfer");
    const when = pickStr(row, "date_time", "created_at", "timestamp", "date");
    const ts = when ? Date.parse(when) : Date.now();
    const rid = pickStr(row, "report_id", "id") || `tx-${i}`;
    return {
      id: `w-${rid}`,
      ref: rid,
      method: "p2p",
      direction: out ? "out" : "in",
      status: "completed",
      amount: Math.abs(amt) || 0,
      fee: 0,
      counterpart: pickStr(row, "title", "description", "counter_party", "subtitle") || "Wallet",
      counterpartMeta: pickStr(row, "subtitle", "ref1") || "TMN",
      note: pickStr(row, "note", "message"),
      accountId,
      createdAt: Number.isFinite(ts) ? ts : Date.now(),
      reportId: rid,
    };
  });
}
