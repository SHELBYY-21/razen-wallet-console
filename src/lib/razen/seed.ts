import type { Account, Contact, Envelope, TmnCredentials, Transaction } from "./types";

export const SEED_PIN = "123456";

const emptyCreds = (msisdn = ""): TmnCredentials => ({
  tmn_key_id: "",
  msisdn,
  login_token: "",
  tmn_id: "",
  device_id: "",
});

export function buildSeed(now = Date.now()) {
  const a1: Account = {
    id: "acc-1",
    nickname: "บัญชีหลัก",
    number: "",
    masked: "ยังไม่เชื่อม",
    openedAt: now,
    color: "brand",
    status: "active",
    creds: emptyCreds(),
    walletBalance: null,
  };

  const contacts: Contact[] = [];
  const txs: Transaction[] = [];
  const envelopes: Envelope[] = [];

  return {
    accounts: [a1],
    activeAccountId: a1.id,
    contacts,
    txs,
    envelopes,
    pin: SEED_PIN,
    notices: [] as { id: string; title: string; body: string; at: number; read: boolean }[],
    settings: {
      notifPush: true,
      notifEmail: false,
      dailyLimit: 200_000,
      apiBase: "",
      apiToken: "",
      mode: "live" as const,
      faceauth_webhook_url: "",
      faceauth_wait_timeout: 180,
    },
    seq: 1,
  };
}

export function openingBalanceFor(_txs: Transaction[], _accountId: string) {
  return 0;
}

export function ledgerBalance(txs: Transaction[], accountId: string) {
  let n = 0;
  for (const t of txs) {
    if (t.accountId !== accountId || t.status === "failed") continue;
    if (t.direction === "in") {
      if (t.status === "completed") n += t.amount;
    } else {
      n -= t.amount + t.fee;
    }
  }
  return Math.round(n * 100) / 100;
}
