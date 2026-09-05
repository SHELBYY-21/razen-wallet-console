import type { MemoryItem } from "./types";

const HALF_LIFE_H = 72;
export const DECAY_THRESHOLD = 0.15;
export const DEFAULT_LIMIT = 8;
export const MAX_ITEMS = 200;

export function utility(item: MemoryItem, now = Date.now()): number {
  const hours = Math.max(0, (now - item.lastAccessed) / 3_600_000);
  const recency = 0.5 ** (hours / HALF_LIFE_H);
  const frequency = Math.min(item.accessCount / 10, 1);
  return 0.4 * recency + 0.3 * frequency + 0.3 * item.importance;
}

export function keywordScore(item: MemoryItem, q: string): number {
  const needle = q.trim().toLowerCase();
  if (!needle) return 0.4;
  const hay = `${item.key} ${item.value}`.toLowerCase();
  if (hay.includes(needle)) return 1;
  const toks = needle.split(/\s+/).filter(Boolean);
  if (!toks.length) return 0;
  return toks.filter((t) => hay.includes(t)).length / toks.length;
}

export function rankMemories(
  items: MemoryItem[],
  q: string,
  opts: { kind?: MemoryItem["kind"]; accountId?: string; limit?: number; now?: number } = {},
): MemoryItem[] {
  const now = opts.now ?? Date.now();
  const limit = Math.max(1, Math.min(opts.limit ?? DEFAULT_LIMIT, 20));
  return items
    .filter((x) => (opts.kind ? x.kind === opts.kind : true))
    .filter((x) =>
      opts.accountId ? x.accountId === opts.accountId || x.kind === "procedural" : true,
    )
    .map((x) => ({
      item: x,
      score: keywordScore(x, q) * 0.7 + utility(x, now) * 0.3,
    }))
    .filter((x) => (q.trim() ? keywordScore(x.item, q) > 0 : true))
    .sort((a, b) => b.score - a.score || b.item.lastAccessed - a.item.lastAccessed)
    .slice(0, limit)
    .map((x) => x.item);
}

export function pruneDecayed(items: MemoryItem[], now = Date.now()): MemoryItem[] {
  return items.filter((x) => x.importance >= 0.8 || utility(x, now) >= DECAY_THRESHOLD);
}

export function touch(item: MemoryItem, now = Date.now()): MemoryItem {
  return { ...item, lastAccessed: now, accessCount: item.accessCount + 1 };
}
