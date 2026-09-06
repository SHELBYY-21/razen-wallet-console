import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { health, openapi } from "./spec.ts";
import { authorize } from "../mcp/auth.ts";

describe("v1 api", () => {
  it("health reports app and mode", () => {
    const h = health();
    assert.equal(h.ok, true);
    assert.equal(h.app, "RAZEN Transfer Console");
    assert.ok(h.mode === "sim" || h.mode === "live");
  });

  it("openapi lists wallet and transactions", () => {
    assert.ok(openapi.paths["/wallet"]);
    assert.ok(openapi.paths["/transactions"]);
    assert.ok(openapi.paths["/health"]);
  });

  it("gate allows when token unset, denies mismatch", () => {
    delete process.env.RAZEN_MCP_TOKEN;
    assert.equal(authorize(null), true);
    process.env.RAZEN_MCP_TOKEN = "secret";
    assert.equal(authorize(null), false);
    assert.equal(authorize("Bearer secret"), true);
    delete process.env.RAZEN_MCP_TOKEN;
  });
});
