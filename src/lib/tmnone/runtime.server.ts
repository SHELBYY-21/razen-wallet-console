import TMNOne from "./TMNOne.js";
import { histLimit, pinLoginFailed } from "./apidoc";
import { configureTmn, runOfficialExample } from "./bootstrap";
import { safeErrMessage, verdictOf } from "./errors";
import type { TmnCreds, TmnOp, TmnRequest, TmnWire } from "./types";

function wire(ok: boolean, error: string, data?: unknown): TmnWire {
  return { ok, error, json: JSON.stringify(data ?? null) };
}

async function session(creds: TmnCreds) {
  const tmn = new TMNOne();
  configureTmn(tmn, {
    tmn_key_id: creds.keyId.trim(),
    mobile_number: creds.msisdn.trim(),
    login_token: creds.loginToken.trim(),
    pin: creds.pin,
    tmn_id: creds.tmnId.trim(),
    device_id: creds.deviceId?.trim() || "",
    faceauth_webhook_url: creds.faceWebhook?.trim() || "",
    faceauth_wait_timeout: creds.faceWait,
    proxy_ip: creds.proxyIp?.trim() || "",
    proxy_username: creds.proxyUser?.trim() || "",
    proxy_password: creds.proxyPass?.trim() || "",
  });
  const accessToken = await tmn.loginWithPin6(creds.pin);
  const fail = pinLoginFailed(accessToken);
  if (fail) throw new Error(fail);
  return tmn;
}

async function dispatch(tmn: InstanceType<typeof TMNOne>, op: TmnOp, payload: Record<string, string | number | undefined>) {
  switch (op) {
    case "login":
      return { code: "MAS-200", connected: true };
    case "balance":
      return tmn.getBalance();
    case "fee":
      return tmn.getWalletFee(String(payload.channel || "p2p"));
    case "history":
      return tmn.fetchTransactionHistory(
        String(payload.start || ""),
        String(payload.end || ""),
        histLimit(payload.limit),
        Math.max(1, Number(payload.page || 1)),
      );
    case "txinfo":
      return tmn.fetchTransactionInfo(String(payload.reportId || ""));
    case "qr":
      return tmn.fetchQRDetail(String(payload.qr || ""));
    case "vouchers":
      return tmn.fetchVoucherHistory();
    case "generateVoucher":
      return tmn.generateVoucher(Number(payload.amount), String(payload.detail || ""));
    case "recipient":
      return tmn.getRecipientInfo(String(payload.walletId || ""));
    case "p2p":
      return tmn.transferP2P(
        String(payload.walletId || ""),
        Number(payload.amount),
        String(payload.msg || ""),
      );
    case "p2pStatus":
      return tmn.getTransferP2PStatus(String(payload.draftId || ""));
    case "promptpay":
      return tmn.transferQRPromptpay(
        String(payload.proxy || ""),
        Number(payload.amount),
        String(payload.msg || ""),
      );
    case "bank":
      return tmn.transferBankAC(
        String(payload.bank || ""),
        String(payload.account || ""),
        Number(payload.amount),
        String(payload.pin || ""),
      );
    case "paymentCode":
      return tmn.getPaymentCode();
    case "amity":
      return tmn.getAmityToken();
    case "probe":
      return null;
    default:
      return { error: "unknown op" };
  }
}

export async function runTmn(req: TmnRequest): Promise<TmnWire> {
  const { op, creds, payload = {} } = req;
  if (!creds?.keyId || !creds.msisdn || !creds.loginToken || !creds.tmnId) {
    return wire(false, "กรอก tmnone_keyid, wallet_msisdn, login_token, tmn_id ให้ครบ");
  }
  if (!/^\d{6}$/.test(creds.pin || "")) {
    return wire(false, "PIN ต้องเป็น 6 หลัก");
  }
  try {
    if (op === "probe") {
      const data = await runOfficialExample(
        {
          tmn_key_id: creds.keyId.trim(),
          mobile_number: creds.msisdn.trim(),
          login_token: creds.loginToken.trim(),
          pin: creds.pin,
          tmn_id: creds.tmnId.trim(),
          device_id: creds.deviceId?.trim() || "",
          faceauth_webhook_url: creds.faceWebhook?.trim() || "",
          faceauth_wait_timeout: creds.faceWait,
          proxy_ip: creds.proxyIp?.trim() || "",
          proxy_username: creds.proxyUser?.trim() || "",
          proxy_password: creds.proxyPass?.trim() || "",
        },
        {
          start: String(payload.start || ""),
          end: String(payload.end || ""),
          reportId: String(payload.reportId || ""),
        },
      );
      return wire(true, "", data);
    }
    let tmn = await session(creds);
    if (op === "bank") payload.pin = creds.pin;
    let data = await dispatch(tmn, op, payload);
    let v = verdictOf(data);
    if (v.kind === "expired") {
      tmn = await session(creds);
      data = await dispatch(tmn, op, payload);
      v = verdictOf(data);
    }
    if (v.kind !== "ok") return wire(false, v.error, data);
    return wire(true, "", data);
  } catch (e) {
    return wire(false, safeErrMessage(e));
  }
}
