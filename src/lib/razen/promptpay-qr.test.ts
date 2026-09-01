import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parsePromptPayPayload } from "./promptpay-qr.ts";

describe("parsePromptPayPayload", () => {
  it("reads a merchant PromptPay mobile QR", () => {
    const raw =
      "00020101021129370016A000000677010111011300668123456785802TH6304ABCD";
    const r = parsePromptPayPayload(raw);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.hit.kind, "phone");
      assert.equal(r.hit.value, "0812345678");
    }
  });

  it("reads national id", () => {
    const raw =
      "00020101021129370016A000000677010111021312345678901235802TH6304ABCD";
    const r = parsePromptPayPayload(raw);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.hit.kind, "nationalId");
      assert.equal(r.hit.value, "1234567890123");
    }
  });

  it("rejects non-promptpay", () => {
    const r = parsePromptPayPayload("https://example.com");
    assert.equal(r.ok, false);
  });
});
