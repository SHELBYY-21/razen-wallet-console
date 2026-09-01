import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { receiptHtml } from "./receipt.ts";

describe("receipt artifact", () => {
  it("emits a self-contained HTML slip", () => {
    const html = receiptHtml({
      ref: "umk1",
      amount: "100.00",
      counterpart: "0812345678",
      method: "P2P",
      at: "2026-09-02 03:49",
    });
    assert.match(html, /umk1/);
    assert.match(html, /<!DOCTYPE html>/);
    assert.equal(html.includes("<script"), false);
  });
});
