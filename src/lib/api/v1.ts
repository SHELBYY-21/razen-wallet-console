import { authorize } from "@/lib/mcp/auth";
import { ctxFromEnv } from "@/lib/mcp/handle";
import { tmnConfigured } from "@/lib/tmnone/creds";
import { tmnInvoke } from "@/lib/tmn/client";
import type { TmnCredentials } from "@/lib/razen/types";
import { health, openapi } from "./spec";

export { health, openapi };

export function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

export function gate(request: Request) {
  return authorize(request.headers.get("authorization")) ? null : unauthorized();
}

function credsFrom(body: Record<string, unknown> | undefined): TmnCredentials {
  const env = ctxFromEnv().credentials;
  return {
    tmn_key_id: String(body?.tmn_key_id ?? env.tmn_key_id ?? ""),
    msisdn: String(body?.msisdn ?? env.msisdn ?? ""),
    login_token: String(body?.login_token ?? env.login_token ?? ""),
    tmn_id: String(body?.tmn_id ?? env.tmn_id ?? ""),
    device_id: String(body?.device_id ?? env.device_id ?? ""),
  };
}

function ctxWith(body?: Record<string, unknown>) {
  const base = ctxFromEnv();
  const credentials = credsFrom(body);
  const pin = String(body?.pin ?? base.pin ?? "");
  return { ...base, credentials, pin };
}

export async function walletGet() {
  const ctx = ctxFromEnv();
  if (!tmnConfigured(ctx.credentials)) {
    return { ok: false as const, error: "ยังไม่ตั้งค่ากระเป๋าในสภาพแวดล้อม" };
  }
  return tmnInvoke("getBalance", [], ctx);
}

export async function walletLogin(body: Record<string, unknown>) {
  const ctx = ctxWith(body);
  if (!tmnConfigured(ctx.credentials)) {
    return { ok: false as const, error: "ต้องมี tmn_key_id, msisdn, login_token, tmn_id" };
  }
  const login = await tmnInvoke("loginWithPin6", [ctx.pin], ctx);
  if (!login.ok) return login;
  const balance = await tmnInvoke("getBalance", [], ctx);
  return { ok: true as const, data: { login: login.data, balance: balance.ok ? balance.data : null } };
}

export async function txList(query: { start?: string; end?: string }) {
  const ctx = ctxFromEnv();
  const start = query.start || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const end = query.end || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  return tmnInvoke("fetchTransactionHistory", [start, end, 50, 1], ctx);
}

export async function txSend(body: Record<string, unknown>) {
  const ctx = ctxWith(body);
  const method = String(body.method || "p2p");
  const amount = Number(body.amount);
  const note = String(body.note ?? "");
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false as const, error: "ยอดไม่ถูกต้อง" };
  if (method === "promptpay") {
    return tmnInvoke("transferQRPromptpay", [String(body.payee ?? ""), amount, note], ctx);
  }
  if (method === "bank") {
    return tmnInvoke("transferBankAC", [String(body.bank ?? ""), String(body.payee ?? ""), amount, ctx.pin], ctx);
  }
  return tmnInvoke("transferP2P", [String(body.payee ?? ""), amount, note], ctx);
}
