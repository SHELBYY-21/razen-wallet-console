import { bankLists, bankLogo } from "./thai-banks-logo.ts";

export type Bank = {
  code: string;
  abbr: string;
  name: string;
  short: string;
  color: string;
  icon: string;
};

/** TMNOne transferBankAC bank_code → casperstack symbol */
const TMN: { code: string; symbol: string }[] = [
  { code: "014", symbol: "SCB" },
  { code: "004", symbol: "KBANK" },
  { code: "002", symbol: "BBL" },
  { code: "006", symbol: "KTB" },
  { code: "025", symbol: "BAY" },
  { code: "011", symbol: "TTB" },
  { code: "030", symbol: "GSB" },
  { code: "034", symbol: "BAAC" },
  { code: "022", symbol: "CIMB" },
  { code: "073", symbol: "LHB" },
  { code: "024", symbol: "UOB" },
  { code: "069", symbol: "KKP" },
  { code: "033", symbol: "GHB" },
  { code: "066", symbol: "IBANK" },
  { code: "067", symbol: "TISCO" },
  { code: "071", symbol: "TCRB" },
];

function row(code: string, symbol: string): Bank {
  const m = bankLists[symbol];
  const abbr = symbol === "LHB" ? "LHBANK" : symbol === "IBANK" ? "ISBT" : symbol;
  return {
    code,
    abbr,
    name: m.fullname,
    short: m.name,
    color: m.color,
    icon: m.icon,
  };
}

export const BANKS: Bank[] = TMN.map((t) => row(t.code, t.symbol));

export const HOME_BANK = "KBANK";

export function bankByCode(code?: string) {
  if (!code) return undefined;
  const u = code.toUpperCase();
  const logo = bankLogo(u);
  const hit = BANKS.find(
    (b) => b.abbr === u || b.code === u || b.code === code || b.short === code,
  );
  if (hit) return hit;
  if (!logo) return undefined;
  const abbr = logo.symbol === "LHB" ? "LHBANK" : logo.symbol === "IBANK" ? "ISBT" : logo.symbol;
  return {
    code: "",
    abbr,
    name: logo.fullname,
    short: logo.name,
    color: logo.color,
    icon: logo.icon,
  };
}

export function bankFee(code?: string) {
  if (!code) return 0;
  const b = bankByCode(code);
  return b?.abbr === HOME_BANK ? 0 : 15;
}
