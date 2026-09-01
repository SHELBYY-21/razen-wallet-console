import TMNOne from "./TMNOne.js";
import { pinLoginFailed } from "./apidoc.ts";

/** Official JS sample from https://www.tmn.one/apidoc.html */
export type OfficialTmn = {
  tmn_key_id: string;
  mobile_number: string;
  login_token: string;
  pin: string;
  tmn_id: string;
  device_id?: string;
  faceauth_webhook_url?: string;
  faceauth_wait_timeout?: number;
  proxy_ip?: string;
  proxy_username?: string;
  proxy_password?: string;
};

export function configureTmn(instance: InstanceType<typeof TMNOne>, _TMN: OfficialTmn) {
  instance.enableDebugging();
  instance.setData(
    _TMN.tmn_key_id,
    _TMN.mobile_number,
    _TMN.login_token,
    _TMN.tmn_id,
    _TMN.device_id || "",
  );
  const ip = _TMN.proxy_ip || process.env.TMN_PROXY_IP || "";
  if (ip) {
    instance.setProxy(
      ip,
      _TMN.proxy_username || process.env.TMN_PROXY_USERNAME || "",
      _TMN.proxy_password || process.env.TMN_PROXY_PASSWORD || "",
    );
  }
  if (_TMN.faceauth_webhook_url) instance.faceauth_webhook_url = _TMN.faceauth_webhook_url;
  if (_TMN.faceauth_wait_timeout && _TMN.faceauth_wait_timeout > 0) {
    instance.faceauth_wait_timeout = _TMN.faceauth_wait_timeout;
  }
}

export function ymd(offsetDays: number) {
  return new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
}

export function firstReportId(transactions: unknown): string {
  const walk = (v: unknown): string => {
    if (!v) return "";
    if (Array.isArray(v)) {
      for (const item of v) {
        const hit = walk(item);
        if (hit) return hit;
      }
      return "";
    }
    if (typeof v === "object") {
      const rec = v as Record<string, unknown>;
      const id = rec.report_id ?? rec.reportId;
      if (typeof id === "string" && id.trim()) return id.trim();
      for (const val of Object.values(rec)) {
        const hit = walk(val);
        if (hit) return hit;
      }
    }
    return "";
  };
  return walk(transactions);
}

export async function runOfficialExample(
  _TMN: OfficialTmn,
  range?: { start?: string; end?: string; reportId?: string },
) {
  const instance = new TMNOne();
  configureTmn(instance, _TMN);

  const accessToken = await instance.loginWithPin6(_TMN.pin);
  const fail = pinLoginFailed(accessToken);
  if (fail) throw new Error(fail);
  const balance = await instance.getBalance();
  const start = range?.start || ymd(-30);
  const end = range?.end || ymd(1);
  const transactions = await instance.fetchTransactionHistory(start, end);
  const reportId = range?.reportId || firstReportId(transactions);
  const transaction = reportId ? await instance.fetchTransactionInfo(reportId) : null;

  return { login: accessToken, balance, transactions, transaction, start, end, reportId };
}
