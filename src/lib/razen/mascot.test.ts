import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const storeSrc = readFileSync(new URL("./store.ts", import.meta.url), "utf8");
const overlaySrc = readFileSync(
  new URL("../../components/razen/sync-overlay.tsx", import.meta.url),
  "utf8",
);
const mascotPath = fileURLToPath(
  new URL("../../../public/mascot/sync.png", import.meta.url),
);

describe("mascot flash", () => {
  it("is session-only and lasts 2400ms", () => {
    assert.match(storeSrc, /flashMascot\s*:/);
    assert.match(storeSrc, /SETTLE_AFTER\s*=\s*(2_400|2400)\b/);

    const partialize = storeSrc.match(
      /partialize:\s*\([^)]*\)\s*=>\s*\(\{([\s\S]*?)\}\s*\)/,
    );
    assert.ok(partialize, "partialize object exists");
    const keys = [...partialize[1].matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1]);
    assert.deepEqual(keys, [
      "accounts",
      "activeAccountId",
      "contacts",
      "txs",
      "envelopes",
      "notices",
      "pin",
      "settings",
      "seq",
    ]);
    assert.equal(keys.includes("mascotUntil"), false);
  });

  it("overlay uses mascot asset and enter/exit motion", () => {
    assert.match(overlaySrc, /\/mascot\/sync\.png/);
    assert.match(overlaySrc, /pointer-events-none/);
    assert.match(overlaySrc, /razen-enter/);
    assert.match(overlaySrc, /razen-exit/);
  });

  it("ships public/mascot/sync.png over 1000 bytes", () => {
    assert.equal(existsSync(mascotPath), true);
    assert.ok(statSync(mascotPath).size > 1000);
  });
});
