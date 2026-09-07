import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parsePayee, payeeKey } from "./payee.ts";
import { rankMemories } from "./score.ts";
import type { MemoryItem } from "./types.ts";

describe("payee memory keys", () => {
  it("round-trips digits for p2p recall", () => {
    const key = payeeKey("p2p", "081-234-5678");
    assert.equal(key, "payee:p2p:0812345678");
    assert.equal(parsePayee(key, "p2p"), "0812345678");
    assert.equal(parsePayee(key, "bank"), null);
  });

  it("ranks this wallet's payee ahead of another account", () => {
    const items: MemoryItem[] = [
      {
        id: "a",
        kind: "semantic",
        key: payeeKey("p2p", "0811111111"),
        value: "A",
        at: 1,
        accountId: "w1",
        lastAccessed: 1,
        accessCount: 1,
        importance: 0.7,
      },
      {
        id: "b",
        kind: "semantic",
        key: payeeKey("p2p", "0822222222"),
        value: "B",
        at: 2,
        accountId: "w2",
        lastAccessed: 2,
        accessCount: 4,
        importance: 0.9,
      },
    ];
    const hit = rankMemories(items, "p2p", { accountId: "w1", kind: "semantic" });
    assert.equal(hit.length, 1);
    assert.equal(parsePayee(hit[0].key, "p2p"), "0811111111");
  });
});
