import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pruneDecayed, rankMemories, utility } from "./score.ts";
import type { MemoryItem } from "./types.ts";

function mem(partial: Partial<MemoryItem> & Pick<MemoryItem, "key" | "value">): MemoryItem {
  const at = partial.at ?? 1_000;
  return {
    id: partial.id ?? partial.key,
    kind: partial.kind ?? "semantic",
    key: partial.key,
    value: partial.value,
    at,
    accountId: partial.accountId ?? "desk",
    lastAccessed: partial.lastAccessed ?? at,
    accessCount: partial.accessCount ?? 0,
    importance: partial.importance ?? 0.5,
  };
}

describe("memory ranking", () => {
  it("filters by accountId so wallets never leak", () => {
    const items = [
      mem({ key: "home_bank", value: "KBANK", accountId: "acc-1" }),
      mem({ key: "home_bank", value: "SCB", accountId: "acc-2" }),
      mem({ kind: "procedural", key: "bootstrap", value: "loginWithPin6", accountId: "desk" }),
    ];
    const hit = rankMemories(items, "bank", { accountId: "acc-1" });
    assert.equal(hit.some((x) => x.value === "SCB"), false);
    assert.equal(hit.find((x) => x.key === "home_bank")?.value, "KBANK");
    const skills = rankMemories(items, "login", { accountId: "acc-1" });
    assert.equal(skills[0].key, "bootstrap");
  });

  it("prefers recency over a stale duplicate fact", () => {
    const now = 10_000_000;
    const items = [
      mem({
        id: "old",
        key: "theme",
        value: "light",
        lastAccessed: now - 30 * 24 * 3_600_000,
        accessCount: 1,
        importance: 0.5,
      }),
      mem({
        id: "new",
        key: "theme",
        value: "dark",
        lastAccessed: now,
        accessCount: 3,
        importance: 0.7,
      }),
    ];
    const hit = rankMemories(items, "theme", { now, limit: 1 });
    assert.equal(hit[0].value, "dark");
  });

  it("decays stale low-importance episodes but keeps procedural seeds", () => {
    const now = Date.now();
    const stale = mem({
      kind: "episodic",
      key: "old-tx",
      value: "sent 1",
      lastAccessed: now - 40 * 24 * 3_600_000,
      accessCount: 0,
      importance: 0.2,
    });
    const skill = mem({
      kind: "procedural",
      key: "bootstrap",
      value: "loginWithPin6",
      lastAccessed: now - 40 * 24 * 3_600_000,
      importance: 1,
    });
    assert.ok(utility(stale, now) < 0.15);
    const kept = pruneDecayed([stale, skill], now);
    assert.deepEqual(
      kept.map((x) => x.key),
      ["bootstrap"],
    );
  });
});
