import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapHistory, parseBalance, pickDeepStr } from "./parse.ts";

describe("wallet parse", () => {
  it("reads current_balance from getBalance", () => {
    assert.equal(parseBalance({ data: { current_balance: "34850.50" } }), 34850.5);
  });

  it("maps history rows", () => {
    const rows = mapHistory(
      { activities: [{ report_id: "umk1", amount: -20, type: "debit", title: "โอนออก" }] },
      "acc-1",
    );
    assert.equal(rows[0]?.ref, "umk1");
    assert.equal(rows[0]?.direction, "out");
  });

  it("reads nested draft_transaction_id and report_id", () => {
    assert.equal(
      pickDeepStr({ code: "P2P-200", data: { draft_transaction_id: "dft-1" } }, "draft_transaction_id"),
      "dft-1",
    );
    assert.equal(pickDeepStr({ data: { report_id: "umk9" } }, "report_id"), "umk9");
  });
});
