export type Bank = {
  code: string;
  abbr: string;
  name: string;
  short: string;
  color: string;
};

/** TMNOne transferBankAC bank_code set */
export const BANKS: Bank[] = [
  { code: "014", abbr: "SCB", name: "ธนาคารไทยพาณิชย์", short: "ไทยพาณิชย์", color: "#4E2A84" },
  { code: "004", abbr: "KBANK", name: "ธนาคารกสิกรไทย", short: "กสิกรไทย", color: "#138F2D" },
  { code: "002", abbr: "BBL", name: "ธนาคารกรุงเทพ", short: "กรุงเทพ", color: "#1E3A8A" },
  { code: "006", abbr: "KTB", name: "ธนาคารกรุงไทย", short: "กรุงไทย", color: "#1BA5E0" },
  { code: "025", abbr: "BAY", name: "ธนาคารกรุงศรีอยุธยา", short: "กรุงศรี", color: "#C9A227" },
  { code: "011", abbr: "TTB", name: "ธนาคารทหารไทยธนชาต", short: "ทีทีบี", color: "#0066B3" },
  { code: "030", abbr: "GSB", name: "ธนาคารออมสิน", short: "ออมสิน", color: "#EB1E8C" },
  { code: "034", abbr: "BAAC", name: "ธ.ก.ส.", short: "ธ.ก.ส.", color: "#8B6914" },
  { code: "022", abbr: "CIMB", name: "ธนาคารซีไอเอ็มบีไทย", short: "CIMB", color: "#ED1C24" },
  { code: "073", abbr: "LHBANK", name: "ธนาคารแลนด์ แอนด์ เฮ้าส์", short: "LH Bank", color: "#6B2D5B" },
  { code: "024", abbr: "UOB", name: "ธนาคารยูโอบี", short: "UOB", color: "#1B3A6B" },
  { code: "069", abbr: "KKP", name: "ธนาคารเกียรตินาคินภัทร", short: "KKP", color: "#1A1A1A" },
  { code: "033", abbr: "GHB", name: "ธนาคารอาคารสงเคราะห์", short: "ธอส.", color: "#E87722" },
  { code: "066", abbr: "ISBT", name: "ธนาคารอิสลามแห่งประเทศไทย", short: "อิสลาม", color: "#0B6E4F" },
  { code: "067", abbr: "TISCO", name: "ธนาคารทิสโก้", short: "ทิสโก้", color: "#0033A0" },
  { code: "071", abbr: "TCRB", name: "ธนาคารไทยเครดิต", short: "ไทยเครดิต", color: "#F15A22" },
];

export const HOME_BANK = "KBANK";

export function bankByCode(code?: string) {
  if (!code) return undefined;
  const u = code.toUpperCase();
  return BANKS.find((b) => b.abbr === u || b.code === u || b.code === code);
}

export function bankFee(code?: string) {
  if (!code) return 0;
  const b = bankByCode(code);
  return b?.abbr === HOME_BANK ? 0 : 15;
}
