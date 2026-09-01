import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deskHtml } from "./desk.ts";

describe("desk artifact", () => {
  it("is a self-contained TMNOne runbook", () => {
    const html = deskHtml();
    assert.match(html, /<!DOCTYPE html>/);
    assert.match(html, /setData/);
    assert.match(html, /getBalance/);
    assert.match(html, /setProxy/);
    assert.equal(html.includes("Inter"), false);
  });
});
