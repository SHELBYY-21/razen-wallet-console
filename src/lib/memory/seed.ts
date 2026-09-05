import type { MemoryItem } from "./types";

const NOW = 1_700_000_000_000;

function proc(key: string, value: string): MemoryItem {
  return {
    id: `procedural-seed-${key}`,
    kind: "procedural",
    key,
    value,
    at: NOW,
    accountId: "desk",
    lastAccessed: NOW,
    accessCount: 1,
    importance: 1,
  };
}

/** TMNOne how-tos — always available, never decay. */
export const PROCEDURAL_SEED: MemoryItem[] = [
  proc(
    "bootstrap",
    "setData(key, msisdn, login_token, tmn_id, device_id) → loginWithPin6(pin) → getBalance → fetchTransactionHistory(start inclusive, end exclusive)",
  ),
  proc(
    "transfer_p2p",
    "getRecipientInfo(msisdn) then transferP2P(payee, amount, note). PIN only inside loginWithPin6.",
  ),
  proc(
    "transfer_promptpay",
    "transferQRPromptpay(proxy phone or national id, amount, note). Scan QR then pay.",
  ),
  proc(
    "transfer_bank",
    "transferBankAC(bank_code, account, amount, wallet_pin). bank_code = SCB|BBL|BAY|KBANK|KTB|TTB|CIMB|LHBANK|UOB|KKP|GSB|BAAC|GHB|ISBT|TISCO|TCRB.",
  ),
  proc(
    "face_id",
    "On VerifyFace POST faceauth_webhook_url {wallet_msisdn} then wait faceauth_wait_timeout (default 180s).",
  ),
];

export function withProceduralSeed(items: MemoryItem[]): MemoryItem[] {
  const keys = new Set(items.filter((x) => x.kind === "procedural").map((x) => x.key));
  const missing = PROCEDURAL_SEED.filter((x) => !keys.has(x.key));
  return missing.length ? [...missing, ...items] : items;
}
