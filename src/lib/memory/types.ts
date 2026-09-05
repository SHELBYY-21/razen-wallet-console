export type MemoryKind = "semantic" | "episodic" | "procedural";

export type MemoryItem = {
  id: string;
  kind: MemoryKind;
  key: string;
  value: string;
  at: number;
  accountId: string;
  lastAccessed: number;
  accessCount: number;
  importance: number;
};

export type RememberInput = {
  kind: MemoryKind;
  key: string;
  value: string;
  accountId?: string;
  importance?: number;
};

export type MemoryDb = { items: MemoryItem[] };
