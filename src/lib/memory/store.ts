import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type MemoryKind = "semantic" | "episodic" | "procedural";

export type MemoryItem = {
  id: string;
  kind: MemoryKind;
  key: string;
  value: string;
  at: number;
};

export type MemoryDb = { items: MemoryItem[] };

const MAX = 200;

function filePath() {
  return process.env.RAZEN_MEMORY_PATH || "/tmp/razen-memory.json";
}

async function load(): Promise<MemoryDb> {
  try {
    const raw = await readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as MemoryDb;
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}

async function save(db: MemoryDb) {
  const p = filePath();
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify(db), "utf8");
}

export async function remember(kind: MemoryKind, key: string, value: string): Promise<MemoryItem> {
  const db = await load();
  const item: MemoryItem = {
    id: `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    key: key.trim(),
    value: value.trim(),
    at: Date.now(),
  };
  db.items = [item, ...db.items.filter((x) => !(x.kind === kind && x.key === item.key))].slice(0, MAX);
  await save(db);
  return item;
}

export async function recall(q: string, kind?: MemoryKind): Promise<MemoryItem[]> {
  const db = await load();
  const needle = q.trim().toLowerCase();
  return db.items
    .filter((x) => (kind ? x.kind === kind : true))
    .filter((x) => !needle || x.key.toLowerCase().includes(needle) || x.value.toLowerCase().includes(needle))
    .slice(0, 20);
}

export async function forget(id: string): Promise<boolean> {
  const db = await load();
  const next = db.items.filter((x) => x.id !== id && x.key !== id);
  const changed = next.length !== db.items.length;
  if (changed) {
    db.items = next;
    await save(db);
  }
  return changed;
}
