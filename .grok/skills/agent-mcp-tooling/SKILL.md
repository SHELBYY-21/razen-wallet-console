---
name: agent-mcp-tooling
description: >
  RAZEN Transfer Console operating system — env, Vercel, GitHub Actions, and
  the TMN MCP endpoint. Use instead of re-patching PIN/UI/deploy. Trigger on
  env, secrets, MCP, tools, publish, Vercel, GitHub Actions, TMN live.
---

# RAZEN agent / MCP tooling

Do **not** re-litigate PIN dialogs, glass, or one-off UI tweaks. This console
is a working transfer desk. Extend the **system** below.

## Surfaces

| Layer | Where | Role |
|---|---|---|
| Operator UI | `/` `/transfer` `/gifts` `/history` `/accounts` `/tools` | One-tap confirm, no PIN prompt |
| MCP | `POST /api/mcp` JSON-RPC | Agent tools over TMNOne (sim or live) |
| Env | Vercel project env + `.env.local` | Secrets stay off git |
| CI | `.github/workflows/ci.yml` | typecheck, `test:app`, build |
| CD | `POST /api/ship` GitHub webhook | Production at razen-wallet-console.vercel.app |

## Env (names only)

Required on Vercel (already stored): `RAZEN_MCP_TOKEN` (encrypted), `RAZEN_PUBLIC_URL`, `TMN_MODE`, `SHIP_SECRET`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `GITHUB_REPO_ID`.

For LIVE wallet, add (encrypted): `TMN_KEY_ID` `TMN_MSISDN` `TMN_LOGIN_TOKEN` `TMN_ID` `TMN_DEVICE_ID` `TMN_PIN`. Then set `TMN_MODE=live`.

Local copy: `.env.example` → `.env.local`. Never commit `.env.local`.

## MCP contract

`Authorization: Bearer $RAZEN_MCP_TOKEN` when the token env is set.

```
POST /api/mcp
{ "jsonrpc":"2.0", "id":1, "method":"tools/list" }
{ "jsonrpc":"2.0", "id":1, "method":"tools/call",
  "params": { "name":"tmn_recipient", "arguments": { "msisdn":"0812345678" } } }
```

Tools: `tmn_login` `tmn_balance` `tmn_recipient` `tmn_transfer_p2p` `tmn_transfer_promptpay` `tmn_transfer_bank` `tmn_voucher` `tmn_fees` `tmn_history` `tmn_payment_code` `tmn_qr` `razen_status`.

Client config: `.mcp.json` (token via env interpolation).

## Deploy

Auto-deploy is **GitHub `push` to `main` → `POST /api/ship` → Vercel gitSource**.

Does not use the Vercel GitHub App (that app lives on `CEadmin789`, not this repo).
The repo webhook + `SHIP_SECRET` HMAC is the CD system.

```
set -a && source .env.local && set +a
vercel deploy --prod --yes
```

Manual ship from this sandbox: `POST /v13/deployments` with `gitSource.repoId=1353981322` ref `main`.

## Do not

- Re-add PIN / face confirmation on operator transfers
- Overwrite `friendly-fiesta` / `ce-vault` / `www.tmnce88.xyz`
- Put `VERCEL_TOKEN` or wallet PIN in committed files
- Invent a second TMN client — call `tmnInvoke` via `@/lib/mcp/handle`
