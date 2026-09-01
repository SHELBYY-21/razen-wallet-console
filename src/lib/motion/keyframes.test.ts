import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../../styles.css", import.meta.url), "utf8");

describe("razen motion spec", () => {
  it("defines locked keyframes and easings", () => {
    for (const name of [
      "razen-enter",
      "razen-exit",
      "razen-press",
      "razen-hud",
      "razen-sync",
    ]) {
      assert.match(css, new RegExp(`@keyframes ${name}`));
    }
    assert.match(css, /cubic-bezier\(0\.16, 1, 0\.3, 1\)/);
    assert.match(css, /cubic-bezier\(0\.4, 0, 1, 1\)/);
    assert.match(css, /prefers-reduced-motion: reduce/);
    assert.match(css, /--color-brand: #c6a15b;/);
    assert.match(css, /--color-bg: #070b0a;/);
  });
});
