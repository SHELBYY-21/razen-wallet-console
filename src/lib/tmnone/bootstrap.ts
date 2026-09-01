import TMNOne from "./TMNOne.js";

/** Official JS sample from https://www.tmn.one/apidoc.html */
export type OfficialTmn = {
  tmn_key_id: string;
  mobile_number: string;
  login_token: string;
  pin: string;
  tmn_id: string;
  device_id?: string;
};

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
  instance.enableDebugging();
  instance.setData(
    _TMN.tmn_key_id,
    _TMN.mobile_number,
    _TMN.login_token,
    _TMN.tmn_id,
    _TMN.device_id || "",
  );

  const login = await instance.loginWithPin6(_TMN.pin);
  const balance = await instance.getBalance();
  const start = range?.start || ymd(-30);
  const end = range?.end || ymd(1);
  const transactions = await instance.fetchTransactionHistory(start, end);
  const reportId = range?.reportId || firstReportId(transactions);
  const transaction = reportId ? await instance.fetchTransactionInfo(reportId) : null;

  return { login, balance, transactions, transaction, start, end, reportId };
}
