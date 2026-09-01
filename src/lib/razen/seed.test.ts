import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildSeed } from "./seed.ts";

describe("operator seed", () => {
  it("starts empty until getBalance from the wallet", () => {
    const seed = buildSeed();
    assert.equal(seed.txs.length, 0);
    assert.equal(seed.accounts[0]?.walletBalance, null);
    assert.equal(seed.accounts[0]?.creds.tmn_key_id, "");
    assert.equal(seed.settings.mode, "live");
  });
});
