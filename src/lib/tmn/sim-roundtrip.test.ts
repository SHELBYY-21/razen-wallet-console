import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { simInvoke } from "./sim.ts";
import type { TmnCredentials } from "../razen/types.ts";

const creds: TmnCredentials = {
  tmn_key_id: "x1001",
  msisdn: "0924488708",
  login_token: "L-sim-1001",
  tmn_id: "tmn.0924488708",
  device_id: "dev1001",
};

const ctx = { credentials: creds, pin: "123456", balance: 12_680 };

type Round = { name: string; ok: boolean; error?: string };

describe("TMNOne sim 50 rounds", () => {
  it("runs 50 mixed calls", async () => {
    const rounds: Round[] = [];
    for (let i = 0; i < 50; i++) {
      const lane = i % 10;
      let r;
      if (lane === 0) {
        r = await simInvoke("loginWithPin6", ["123456"], ctx);
      } else if (lane === 1) {
        r = await simInvoke("loginWithPin6", ["000000"], ctx);
        assert.equal(r.ok, false);
      } else if (lane === 2) {
        r = await simInvoke("getRecipientInfo", ["0812345678"], ctx);
        assert.equal(r.ok, true);
      } else if (lane === 3) {
        r = await simInvoke("getRecipientInfo", ["0650000890"], ctx);
        assert.equal(r.ok, false);
      } else if (lane === 4) {
        r = await simInvoke("transferP2P", ["0812345678", 100 + i, "r" + i], ctx);
        assert.equal(r.ok, true);
      } else if (lane === 5) {
        r = await simInvoke("transferP2P", ["0812345678", 0], ctx);
        assert.equal(r.ok, false);
      } else if (lane === 6) {
        r = await simInvoke("transferQRPromptpay", ["0891112233", 250], ctx);
        assert.equal(r.ok, true);
      } else if (lane === 7) {
        r = await simInvoke("transferBankAC", ["KBANK", "1234567890", 300, "123456"], ctx);
        assert.equal(r.ok, true);
      } else if (lane === 8) {
        r = await simInvoke("generateVoucher", [80, "ซอง"], ctx);
        assert.equal(r.ok, true);
      } else {
        r = await simInvoke("getBalance", [], ctx);
        assert.equal(r.ok, true);
      }
      rounds.push({ name: `#${i}:${lane}`, ok: r.ok, error: r.ok ? undefined : r.error });
    }
    const ok = rounds.filter((x) => x.ok).length;
    const fail = rounds.length - ok;
    assert.equal(rounds.length, 50);
    assert.equal(ok, 35);
    assert.equal(fail, 15);
  });
});
