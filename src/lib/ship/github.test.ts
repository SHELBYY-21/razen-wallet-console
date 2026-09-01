import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mainPush, verifyGithubSignature } from "./github.ts";

describe("github webhook", () => {
  it("accepts a valid sha256 signature", () => {
    const secret = "hook-secret";
    const raw = '{"ref":"refs/heads/main"}';
    const header = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
    assert.equal(verifyGithubSignature(raw, header, secret), true);
    assert.equal(verifyGithubSignature(raw, header, "nope"), false);
    assert.equal(verifyGithubSignature(raw, null, secret), false);
  });

  it("only ships the main branch", () => {
    assert.equal(mainPush({ ref: "refs/heads/main" }), true);
    assert.equal(mainPush({ ref: "refs/heads/dev" }), false);
    assert.equal(mainPush({ ref: "refs/heads/main", deleted: true }), false);
  });
});
