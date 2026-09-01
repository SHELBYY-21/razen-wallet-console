import { tmnInvoke } from "@/lib/tmn/client";
import type { TmnCredentials, TmnMode } from "@/lib/razen/types";
import { MCP_TOOLS } from "./catalog";

export { authorize } from "./auth";

export type JsonRpc = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

function num(v: unknown, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown) {
  return v == null ? "" : String(v);
}

export function ctxFromEnv() {
  const mode: TmnMode = process.env.TMN_MODE === "live" ? "live" : "sim";
  const credentials: TmnCredentials = {
    tmn_key_id: process.env.TMN_KEY_ID ?? "",
    msisdn: process.env.TMN_MSISDN ?? "",
    login_token: process.env.TMN_LOGIN_TOKEN ?? "",
    tmn_id: process.env.TMN_ID ?? "",
    device_id: process.env.TMN_DEVICE_ID ?? "",
  };
  return {
    mode,
    apiBase: process.env.TMN_API_BASE ?? "",
    apiToken: process.env.TMN_API_TOKEN ?? "",
    credentials,
    pin: process.env.TMN_PIN ?? "",
    balance: 12_680,
  };
}

async function callTool(name: string, args: Record<string, unknown>) {
  const ctx = ctxFromEnv();
  switch (name) {
    case "razen_status":
      return {
        ok: true,
        data: {
          app: "RAZEN Transfer Console",
          mode: ctx.mode,
          publicUrl: process.env.RAZEN_PUBLIC_URL ?? "",
          tools: MCP_TOOLS.length,
        },
      };
    case "tmn_login":
      return tmnInvoke("loginWithPin6", [ctx.pin], ctx);
    case "tmn_bootstrap":
      return tmnInvoke("bootstrap", [], ctx);
    case "tmn_balance":
      return tmnInvoke("getBalance", [], ctx);
    case "tmn_recipient":
      return tmnInvoke("getRecipientInfo", [str(args.msisdn)], ctx);
    case "tmn_transfer_p2p":
      return tmnInvoke("transferP2P", [str(args.msisdn), num(args.amount), str(args.note)], ctx);
    case "tmn_transfer_promptpay":
      return tmnInvoke("transferQRPromptpay", [str(args.proxy), num(args.amount), str(args.note)], ctx);
    case "tmn_transfer_bank":
      return tmnInvoke("transferBankAC", [str(args.bank), str(args.account), num(args.amount)], ctx);
    case "tmn_voucher":
      return tmnInvoke("generateVoucher", [num(args.amount), str(args.message)], ctx);
    case "tmn_fees":
      return tmnInvoke("getWalletFee", [str(args.channel) || "p2p"], ctx);
    case "tmn_history": {
      const end = str(args.end) || new Date(Date.now() + 864e5).toISOString().slice(0, 10);
      const start =
        str(args.start) || new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
      return tmnInvoke("fetchTransactionHistory", [start, end, num(args.limit, 10), 1], ctx);
    }
    case "tmn_txinfo":
      return tmnInvoke("fetchTransactionInfo", [str(args.report_id)], ctx);
    case "tmn_vouchers":
      return tmnInvoke("fetchVoucherHistory", [], ctx);
    case "tmn_p2p_status":
      return tmnInvoke("getTransferP2PStatus", [str(args.draft_id)], ctx);
    case "tmn_amity":
      return tmnInvoke("getAmityToken", [], ctx);
    case "tmn_payment_code":
      return tmnInvoke("getPaymentCode", [], ctx);
    case "tmn_qr":
      return tmnInvoke("fetchQRDetail", [str(args.raw)], ctx);
    default:
      return { ok: false as const, error: `unknown tool ${name}` };
  }
}

export async function handleMcp(body: JsonRpc) {
  const id = body.id ?? 1;
  const method = body.method ?? "";
  const params = body.params ?? {};

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "razen-tmn", version: "1.0.0" },
      },
    };
  }

  if (method === "tools/list" || method === "notifications/initialized") {
    if (method === "notifications/initialized") return { jsonrpc: "2.0", id, result: {} };
    return { jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } };
  }

  if (method === "tools/call") {
    const name = str(params.name);
    const args =
      params.arguments && typeof params.arguments === "object"
        ? (params.arguments as Record<string, unknown>)
        : {};
    const out = await callTool(name, args);
    const text = JSON.stringify(out);
    if (!out.ok) {
      return {
        jsonrpc: "2.0",
        id,
        result: { isError: true, content: [{ type: "text", text }] },
      };
    }
    return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } };
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}
