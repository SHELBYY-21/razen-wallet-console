import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MAX_ITEMS, pruneDecayed, rankMemories, touch } from "./score.ts";
import { withProceduralSeed } from "./seed.ts";
import type { MemoryDb, MemoryItem, MemoryKind, RememberInput } from "./types.ts";

export type { MemoryItem, MemoryKind, RememberInput } from "./types";

function filePath() {
  return process.env.RAZEN_MEMORY_PATH || "/tmp/razen-memory.json";
}

function coerce(raw: Partial<MemoryItem> & { key?: string }): MemoryItem | null {
  if (!raw?.key) return null;
  const kind: MemoryKind =
    raw.kind === "episodic" || raw.kind === "procedural" ? raw.kind : "semantic";
  const at = Number(raw.at) || Date.now();
  return {
    id: raw.id || `${kind}-${at.toString(36)}`,
    kind,
    key: String(raw.key).trim(),
    value: String(raw.value ?? "").trim(),
    at,
    accountId: raw.accountId || "desk",
    lastAccessed: Number(raw.lastAccessed) || at,
    accessCount: Number(raw.accessCount) || 0,
    importance: Number.isFinite(raw.importance) ? Number(raw.importance) : 0.5,
  };
}

async function loadFile(): Promise<MemoryDb> {
  const p = filePath();
  try {
    const parsed = JSON.parse(await readFile(p, "utf8")) as MemoryDb;
    const items = (parsed.items ?? []).map(coerce).filter((x): x is MemoryItem => !!x);
    return { items: withProceduralSeed(items) };
  } catch {
    return { items: withProceduralSeed([]) };
  }
}

async function saveFile(db: MemoryDb) {
  const p = filePath();
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify({ items: db.items }));
}

function ts(v: unknown): number {
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  const n = Date.parse(String(v ?? ""));
  return Number.isFinite(n) ? n : Date.now();
}

function fromRow(row: Record<string, unknown>): MemoryItem | null {
  return coerce({
    id: String(row.id ?? ""),
    kind: row.kind as MemoryKind,
    key: String(row.key ?? ""),
    value: String(row.value ?? ""),
    at: ts(row.at),
    accountId: String(row.account_id ?? "desk"),
    lastAccessed: ts(row.last_accessed),
    accessCount: Number(row.access_count ?? 0),
    importance: Number(row.importance ?? 0.5),
  });
}

async function sql() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function loadSql(): Promise<MemoryDb> {
  const db = await sql();
  const rows = await db.query<Record<string, unknown>>(
    "select id, kind, key, value, account_id, at, last_accessed, access_count, importance from agent_memory",
  );
  const items = rows.map(fromRow).filter((x): x is MemoryItem => !!x);
  const seeded = withProceduralSeed(items);
  if (seeded.length !== items.length) {
    for (const m of seeded.filter((x) => !items.some((y) => y.id === x.id))) {
      await insertSql(m);
    }
  }
  return { items: seeded };
}

async function insertSql(m: MemoryItem) {
  const db = await sql();
  await db.query(
    `insert into agent_memory (id, kind, key, value, account_id, at, last_accessed, access_count, importance)
     values ($1,$2,$3,$4,$5,to_timestamp($6/1000.0),to_timestamp($7/1000.0),$8,$9)
     on conflict (kind, key, account_id) do update set
       id = excluded.id,
       value = excluded.value,
       at = excluded.at,
       last_accessed = excluded.last_accessed,
       access_count = excluded.access_count,
       importance = excluded.importance`,
    [m.id, m.kind, m.key, m.value, m.accountId, m.at, m.lastAccessed, m.accessCount, m.importance],
  );
}

async function useSql(): Promise<boolean> {
  if (process.env.RAZEN_MEMORY_PATH) return false;
  try {
    await sql();
    return true;
  } catch {
    return false;
  }
}

async function load(): Promise<MemoryDb> {
  if (await useSql()) return loadSql();
  return loadFile();
}

async function persist(items: MemoryItem[]) {
  const pruned = pruneDecayed(items).slice(0, MAX_ITEMS);
  if (await useSql()) {
    const db = await sql();
    const keep = new Set(pruned.map((x) => x.id));
    const rows = await db.query<{ id: string }>("select id from agent_memory");
    for (const row of rows) {
      if (!keep.has(row.id)) await db.query("delete from agent_memory where id = $1", [row.id]);
    }
    for (const m of pruned) await insertSql(m);
    return;
  }
  await saveFile({ items: pruned });
}

export async function remember(input: RememberInput | MemoryKind, key?: string, value?: string): Promise<MemoryItem> {
  const body: RememberInput =
    typeof input === "string"
      ? { kind: input, key: key ?? "", value: value ?? "" }
      : input;
  const now = Date.now();
  const accountId = (body.accountId || "desk").trim() || "desk";
  const item: MemoryItem = {
    id: `${body.kind}-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    kind: body.kind,
    key: body.key.trim(),
    value: body.value.trim(),
    at: now,
    accountId,
    lastAccessed: now,
    accessCount: 1,
    importance: body.importance ?? (body.kind === "procedural" ? 1 : body.kind === "semantic" ? 0.7 : 0.5),
  };
  const db = await load();
  const next = [
    item,
    ...db.items.filter((x) => !(x.kind === item.kind && x.key === item.key && x.accountId === item.accountId)),
  ];
  await persist(next);
  return item;
}

export async function recall(
  q: string,
  kindOrOpts?: MemoryKind | { kind?: MemoryKind; accountId?: string; limit?: number },
): Promise<MemoryItem[]> {
  const opts =
    typeof kindOrOpts === "string" || kindOrOpts == null
      ? { kind: kindOrOpts }
      : kindOrOpts;
  const db = await load();
  const ranked = rankMemories(db.items, q, opts);
  const now = Date.now();
  const touchedIds = new Set(ranked.map((x) => x.id));
  const items = db.items.map((x) => (touchedIds.has(x.id) ? touch(x, now) : x));
  await persist(items);
  return items.filter((x) => touchedIds.has(x.id)).sort((a, b) => {
    const ia = ranked.findIndex((r) => r.id === a.id);
    const ib = ranked.findIndex((r) => r.id === b.id);
    return ia - ib;
  });
}

export async function forget(id: string): Promise<boolean> {
  const db = await load();
  const next = db.items.filter((x) => x.id !== id && x.key !== id);
  const changed = next.length !== db.items.length;
  if (changed) await persist(next);
  return changed;
}
