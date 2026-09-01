import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authorize } from "./auth.ts";
import { MCP_INSTRUCTIONS, MCP_TOOLS } from "./catalog.ts";

describe("mcp authorize", () => {
  it("allows when no token is configured", () => {
    delete process.env.RAZEN_MCP_TOKEN;
    assert.equal(authorize(null), true);
  });

  it("rejects missing bearer when token is set", () => {
    process.env.RAZEN_MCP_TOKEN = "secret-token";
    assert.equal(authorize(null), false);
    assert.equal(authorize("Bearer secret-token"), true);
    assert.equal(authorize("Bearer wrong"), false);
    delete process.env.RAZEN_MCP_TOKEN;
  });
});

describe("mcp catalog", () => {
  it("exposes the TMN operator tools", () => {
    const names = MCP_TOOLS.map((t) => t.name);
    assert.ok(names.includes("tmn_transfer_p2p"));
    assert.ok(names.includes("tmn_balance"));
    assert.ok(names.includes("razen_status"));
    assert.ok(names.includes("razen_memory_remember"));
    assert.ok(names.includes("razen_artifact_receipt"));
    assert.equal(MCP_TOOLS.length, 21);
  });
});

describe("mcp initialize", () => {
  it("returns server instructions", () => {
    assert.match(MCP_INSTRUCTIONS, /loginWithPin6/);
    assert.match(MCP_INSTRUCTIONS, /semantic/);
    assert.ok(MCP_INSTRUCTIONS.length > 80);
  });
});
