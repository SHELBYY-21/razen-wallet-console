import { tmnAction } from "@/lib/tmnone/actions";
import { credsOf } from "@/lib/tmnone/creds";
import type { TmnOp } from "@/lib/tmnone/types";
import type { Settings, TmnCredentials, TmnMode } from "@/lib/razen/types";
import { simInvoke, type TmnResult } from "./sim";

export type {
  TmnResult,
  TmnOk,
  TmnErr,
  RecipientInfo,
  FeeInfo,
  PaymentCodeOut,
  QrSlip,
} from "./sim";
export { recipientFromPhone, simInvoke } from "./sim";

const OP: Record<string, TmnOp> = {
  loginWithPin6: "login",
  getBalance: "balance",
  getWalletFee: "fee",
  fetchTransactionHistory: "history",
  fetchTransactionInfo: "txinfo",
  fetchQRDetail: "qr",
  fetchVoucherHistory: "vouchers",
  generateVoucher: "generateVoucher",
  getRecipientInfo: "recipient",
  transferP2P: "p2p",
  getTransferP2PStatus: "p2pStatus",
  transferQRPromptpay: "promptpay",
  transferBankAC: "bank",
  getPaymentCode: "paymentCode",
  getAmityToken: "amity",
  bootstrap: "probe",
};

function payloadOf(method: string, params: unknown[]) {
  switch (method) {
    case "getWalletFee":
      return { channel: String(params[0] ?? "p2p") };
    case "fetchTransactionHistory":
      return {
        start: String(params[0] ?? ""),
        end: String(params[1] ?? ""),
        limit: Number(params[2] ?? 20),
        page: Number(params[3] ?? 1),
      };
    case "fetchTransactionInfo":
      return { reportId: String(params[0] ?? "") };
    case "bootstrap":
      return {
        start: String(params[0] ?? ""),
        end: String(params[1] ?? ""),
        reportId: String(params[2] ?? ""),
      };
    case "fetchQRDetail":
      return { qr: String(params[0] ?? "") };
    case "generateVoucher":
      return { amount: Number(params[0]), detail: String(params[1] ?? "") };
    case "getRecipientInfo":
    case "transferP2P":
      return {
        walletId: String(params[0] ?? ""),
        amount: Number(params[1] ?? 0),
        msg: String(params[2] ?? ""),
      };
    case "getTransferP2PStatus":
      return { draftId: String(params[0] ?? "") };
    case "transferQRPromptpay":
      return {
        proxy: String(params[0] ?? ""),
        amount: Number(params[1] ?? 0),
        msg: String(params[2] ?? ""),
      };
    case "transferBankAC":
      return {
        bank: String(params[0] ?? ""),
        account: String(params[1] ?? ""),
        amount: Number(params[2] ?? 0),
      };
    default:
      return {};
  }
}

async function sdkCall<T>(
  method: string,
  params: unknown[],
  credentials: TmnCredentials,
  pin: string,
  settings?: Settings,
): Promise<TmnResult<T>> {
  const op = OP[method];
  if (!op) return { ok: false, error: `ไม่รู้จักเมธอด ${method}` };
  try {
    const pinUsed = method === "loginWithPin6" ? String(params[0] ?? pin) : pin;
    const wire = await tmnAction({
      data: {
        op,
        creds: credsOf(credentials, pinUsed, settings),
        payload: payloadOf(method, params),
      },
    });
    if (!wire.ok) return { ok: false, error: wire.error || "TMNOne ไม่สำเร็จ" };
    const data = wire.json ? (JSON.parse(wire.json) as T) : (null as T);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เรียก TMNOne ไม่สำเร็จ" };
  }
}

async function proxyCall<T>(
  apiBase: string,
  apiToken: string,
  method: string,
  params: unknown[],
  credentials: TmnCredentials,
): Promise<TmnResult<T>> {
  const url = apiBase.replace(/\/$/, "");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: JSON.stringify({ method, params, credentials }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string; data?: T } | T | null;
    if (!res.ok) {
      const err =
        json && typeof json === "object" && "error" in json && json.error
          ? String(json.error)
          : `HTTP ${res.status}`;
      return { ok: false, error: err };
    }
    if (json && typeof json === "object" && "error" in json && json.error) {
      return { ok: false, error: String(json.error) };
    }
    if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
      return { ok: true, data: json.data as T };
    }
    return { ok: true, data: json as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เชื่อม API ไม่สำเร็จ" };
  }
}

export async function tmnInvoke<T>(
  method: string,
  params: unknown[],
  ctx: {
    mode: TmnMode;
    apiBase: string;
    apiToken: string;
    credentials: TmnCredentials;
    pin?: string;
    balance?: number;
    settings?: Settings;
  },
): Promise<TmnResult<T>> {
  if (ctx.mode === "live") {
    if (ctx.apiBase.trim()) {
      return proxyCall<T>(ctx.apiBase, ctx.apiToken, method, params, ctx.credentials);
    }
    return sdkCall<T>(method, params, ctx.credentials, ctx.pin || "", ctx.settings);
  }
  return simInvoke<T>(method, params, ctx);
}

export const TMN_METHODS = [
  "setData",
  "loginWithPin6",
  "getBalance",
  "getWalletFee",
  "fetchTransactionHistory",
  "fetchTransactionInfo",
  "fetchQRDetail",
  "fetchVoucherHistory",
  "generateVoucher",
  "getRecipientInfo",
  "transferP2P",
  "getTransferP2PStatus",
  "transferQRPromptpay",
  "transferBankAC",
  "getPaymentCode",
  "getAmityToken",
] as const;
