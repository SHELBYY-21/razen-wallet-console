import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeErrMessage, verdictOf } from "./errors.ts";

describe("verdictOf", () => {
  it("accepts -200 and token strings", () => {
    assert.equal(verdictOf({ code: "UPC-200", data: { current_balance: 10 } }).kind, "ok");
    assert.equal(verdictOf("AT-abc").kind, "ok");
    assert.equal(verdictOf({ connected: true }).kind, "ok");
  });

  it("fails empty and { error }", () => {
    assert.equal(verdictOf(null).kind, "fail");
    assert.equal(verdictOf("").kind, "fail");
    const v = verdictOf({ error: "network down" });
    assert.equal(v.kind, "fail");
    if (v.kind === "fail") assert.match(v.error, /network down/);
  });

  it("classifies MAS-401 and -428", () => {
    assert.equal(verdictOf({ code: "MAS-401", message: "gone" }).kind, "expired");
    assert.equal(verdictOf({ error: "MAS-401 - unauthorized" }).kind, "expired");
    const face = verdictOf({
      code: "TRC-428",
      message: "verify",
      data: { method: "face", csid: "x" },
    });
    assert.equal(face.kind, "face");
    const pin = verdictOf({
      code: "FND-428",
      data: { method: "pin" },
    });
    assert.equal(pin.kind, "pin");
  });

  it("fails other non-200 codes", () => {
    const v = verdictOf({ code: "P2P-400", message: "ยอดไม่พอ" });
    assert.equal(v.kind, "fail");
    if (v.kind === "fail") assert.match(v.error, /P2P-400/);
  });

  it("safeErrMessage does not throw without stack", () => {
    assert.equal(safeErrMessage({}), "[object Object]");
    assert.equal(safeErrMessage({ error: "x" }), "x");
    assert.equal(safeErrMessage(new Error("boom")), "boom");
  });
});
