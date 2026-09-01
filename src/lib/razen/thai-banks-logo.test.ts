import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bankLists, bankLogo } from "./thai-banks-logo.ts";
import { BANKS, bankByCode } from "./banks.ts";

describe("casperstack bankLists", () => {
  it("keeps catalog colors and local icons", () => {
    assert.equal(bankLists.SCB.color, "#543186");
    assert.equal(bankLists.KBANK.color, "#1DA858");
    assert.equal(bankLists.PromptPay.icon, "/brands/promptpay.png");
    assert.equal(bankLogo("LHBANK")?.symbol, "LHB");
    assert.equal(bankLogo("ISBT")?.symbol, "IBANK");
    assert.equal(bankByCode("LHBANK")?.abbr, "LHBANK");
    assert.equal(BANKS.length, 16);
    assert.equal(BANKS.every((b) => b.icon.startsWith("/brands/")), true);
  });
});
