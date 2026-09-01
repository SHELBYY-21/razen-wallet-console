import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { firstReportId, ymd } from "./bootstrap.ts";

describe("official JS bootstrap helpers", () => {
  it("pulls report_id from nested history", () => {
    assert.equal(firstReportId({ activities: [{ report_id: "umk1678000000" }] }), "umk1678000000");
    assert.equal(firstReportId(null), "");
  });

  it("formats Y-m-d like the JS sample", () => {
    assert.match(ymd(0), /^\d{4}-\d{2}-\d{2}$/);
  });
});
