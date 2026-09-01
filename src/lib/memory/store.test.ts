import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { forget, recall, remember } from "./store.ts";

describe("agent memory", () => {
  before(async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "razen-mem-"));
    process.env.RAZEN_MEMORY_PATH = path.join(dir, "memory.json");
  });

  it("stores semantic and recalls by keyword", async () => {
    await remember("semantic", "home_bank", "KBANK");
    await remember("episodic", "p2p:0812345678", "sent 100");
    const hit = await recall("KBANK");
    assert.equal(hit[0]?.key, "home_bank");
    const gone = await forget("home_bank");
    assert.equal(gone, true);
    assert.equal((await recall("KBANK")).length, 0);
  });
});
