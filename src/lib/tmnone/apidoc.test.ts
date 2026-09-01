import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BANK_CODES, histLimit, pinLoginFailed, PUBLIC_FUNCTIONS } from "./apidoc.ts";

describe("apidoc contract", () => {
  it("covers the 14 public functions", () => {
    assert.equal(PUBLIC_FUNCTIONS.length, 14);
    assert.equal(BANK_CODES.length, 16);
  });

  it("clamps history limit to 50", () => {
    assert.equal(histLimit(undefined), 10);
    assert.equal(histLimit(3), 3);
    assert.equal(histLimit(99), 50);
  });

  it("matches loginWithPin6 error check", () => {
    assert.equal(pinLoginFailed(null), "เข้าสู่ระบบไม่สำเร็จ");
    assert.equal(pinLoginFailed({ error: "bad pin" }), "bad pin");
    assert.equal(pinLoginFailed("AT-ok"), "");
  });
});
