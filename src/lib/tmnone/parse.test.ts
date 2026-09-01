import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapHistory, parseBalance } from "./parse.ts";

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
});
