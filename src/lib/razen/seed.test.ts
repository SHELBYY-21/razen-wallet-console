import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isThaiMobile } from "./format.ts";
import { buildSeed, ledgerBalance, PRIMARY_BALANCE } from "./seed.ts";

describe("operator seed", () => {
  it("shows a ready desk: ฿12,680, completed txs, real mobiles", () => {
    const seed = buildSeed(Date.parse("2026-09-02T00:00:00+07:00"));
    assert.equal(ledgerBalance(seed.txs, "acc-1"), PRIMARY_BALANCE);
    assert.equal(seed.txs.every((t) => t.status === "completed"), true);
    assert.equal(seed.txs.every((t) => t.ref.startsWith("umk")), true);
    assert.equal(seed.contacts.every((c) => isThaiMobile(c.phone)), true);
    assert.equal(seed.accounts.every((a) => a.status === "active"), true);
    assert.equal(seed.accounts.some((a) => /ทดสอบ|test/i.test(a.nickname)), false);
  });
});
