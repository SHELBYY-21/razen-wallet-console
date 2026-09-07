import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addYmd, firstReportId, ymd } from "./bootstrap.ts";

describe("official JS bootstrap helpers", () => {
  it("pulls report_id from nested history", () => {
    assert.equal(firstReportId({ activities: [{ report_id: "umk1678000000" }] }), "umk1678000000");
    assert.equal(firstReportId(null), "");
  });

  it("formats Y-m-d like the JS sample", () => {
    assert.match(ymd(0), /^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses Asia/Bangkok calendar before 07:00 ICT", () => {
    const ict0246 = Date.parse("2026-09-07T19:46:00Z");
    assert.equal(new Date(ict0246).toISOString().slice(0, 10), "2026-09-07");
    assert.equal(ymd(0, ict0246), "2026-09-08");
    assert.equal(ymd(1, ict0246), "2026-09-09");
  });

  it("adds exclusive end on a date-only string", () => {
    assert.equal(addYmd("2026-09-08", 1), "2026-09-09");
    assert.equal(addYmd("2026-12-31", 1), "2027-01-01");
  });
});
