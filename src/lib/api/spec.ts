export function health() {
  const mode = process.env.TMN_MODE === "live" ? "live" : "sim";
  const wallet = Boolean(
    process.env.TMN_KEY_ID && process.env.TMN_MSISDN && process.env.TMN_LOGIN_TOKEN && process.env.TMN_ID,
  );
  return {
    ok: true as const,
    app: "RAZEN Transfer Console",
    mode,
    wallet,
    publicUrl: process.env.RAZEN_PUBLIC_URL ?? "",
  };
}

export const openapi = {
  openapi: "3.0.3",
  info: { title: "RAZEN Wallet API", version: "1.0.0" },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/health": { get: { summary: "Runtime health" } },
    "/wallet": {
      get: { summary: "getBalance" },
      post: { summary: "loginWithPin6 then getBalance" },
    },
    "/transactions": {
      get: { summary: "fetchTransactionHistory" },
      post: { summary: "transferP2P | transferQRPromptpay | transferBankAC" },
    },
  },
};
