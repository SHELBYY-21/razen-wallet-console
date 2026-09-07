import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { usesRecipientInfo } from "./apidoc.ts";

describe("TMNOne rail lookup", () => {
  it("getRecipientInfo is wallet P2P only", () => {
    assert.equal(usesRecipientInfo("p2p"), true);
    assert.equal(usesRecipientInfo("promptpay"), false);
    assert.equal(usesRecipientInfo("bank"), false);
  });
});
