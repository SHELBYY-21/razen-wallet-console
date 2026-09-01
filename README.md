# RAZEN Transfer Console

Operator desk for TrueMoney / TMNOne. Live: [razen-wallet-console.vercel.app](https://razen-wallet-console.vercel.app)

- UI: P2P, PromptPay, bank, envelopes — confirm recipient, no PIN prompt
- MCP: `POST /api/mcp` (Bearer `RAZEN_MCP_TOKEN`)
- Env: copy `.env.example` → `.env.local`
- CD: push `main` → `/api/ship` → production
