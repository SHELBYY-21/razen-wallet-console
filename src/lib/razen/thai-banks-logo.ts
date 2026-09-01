/** Vendored from https://github.com/casperstack/thai-banks-logo/blob/master/index.ts
 *  Icons are local copies under /brands so transfer never hits GitHub. */

export type ThaiBankLogo = {
  name: string;
  fullname: string;
  nameEN: string;
  symbol: string;
  icon: string;
  color: string;
};

export type BankList = Record<string, ThaiBankLogo>;

const png = (file: string) => `/brands/${file}.png`;

export const bankLists: BankList = {
  KBANK: {
    name: "กสิกรไทย",
    fullname: "ธนาคารกสิกรไทย",
    nameEN: "Kasikorn Bank",
    symbol: "KBANK",
    icon: png("KBANK"),
    color: "#1DA858",
  },
  SCB: {
    name: "ไทยพาณิชย์",
    fullname: "ธนาคารไทยพาณิชย์",
    nameEN: "The Siam Commercial Bank",
    symbol: "SCB",
    icon: png("SCB"),
    color: "#543186",
  },
  KTB: {
    name: "กรุงไทย",
    fullname: "ธนาคารกรุงไทย",
    nameEN: "Krungthai Bank",
    symbol: "KTB",
    icon: png("KTB"),
    color: "#1DA8E6",
  },
  BBL: {
    name: "กรุงเทพ",
    fullname: "ธนาคารกรุงเทพ",
    nameEN: "Bangkok Bank",
    symbol: "BBL",
    icon: png("BBL"),
    color: "#29449D",
  },
  BAY: {
    name: "กรุงศรีอยุธยา",
    fullname: "ธนาคารกรุงศรีอยุธยา",
    nameEN: "Krungsri Bank",
    symbol: "BAY",
    icon: png("BAY"),
    color: "#FFD51C",
  },
  TTB: {
    name: "ทีเอ็มบีธนชาต",
    fullname: "ธนาคารทีเอ็มบีธนชาต",
    nameEN: "TMBThanachart Bank",
    symbol: "TTB",
    icon: png("TTB"),
    color: "#0C55F2",
  },
  UOB: {
    name: "ยูโอบี",
    fullname: "ธนาคารยูโอบี",
    nameEN: "United Overseas Bank",
    symbol: "UOB",
    icon: png("UOB"),
    color: "#E41A26",
  },
  KKP: {
    name: "เกียรตินาคิน",
    fullname: "ธนาคารเกียรตินาคินภัทร",
    nameEN: "Kiatnakin Phatra Bank",
    symbol: "KKP",
    icon: png("KKP"),
    color: "#5A547C",
  },
  GSB: {
    name: "ออมสิน",
    fullname: "ธนาคารออมสิน",
    nameEN: "Government Savings Bank",
    symbol: "GSB",
    icon: png("GSB"),
    color: "#ED1891",
  },
  BAAC: {
    name: "ธ.ก.ส.",
    fullname: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
    nameEN: "Bank for Agriculture and Agricultural Cooperatives",
    symbol: "BAAC",
    icon: png("BAAC"),
    color: "#CCA41C",
  },
  CIMB: {
    name: "ซีไอเอ็มบี",
    fullname: "ธนาคารซีไอเอ็มบี",
    nameEN: "CIMB Thai Bank",
    symbol: "CIMB",
    icon: png("CIMB"),
    color: "#BD1325",
  },
  CITI: {
    name: "ซิตี้แบงก์",
    fullname: "ธนาคารซิตี้แบงก์",
    nameEN: "citibank",
    symbol: "CITI",
    icon: png("CITI"),
    color: "#0F3D89",
  },
  GHB: {
    name: "ธ.อ.ส.",
    fullname: "ธนาคารอาคารสงเคราะห์",
    nameEN: "GH Bank",
    symbol: "GHB",
    icon: png("GHB"),
    color: "#FF8614",
  },
  HSBC: {
    name: "เอชเอสบีซี",
    fullname: "ธนาคารเอชเอสบีซี",
    nameEN: "HSBC Bank",
    symbol: "HSBC",
    icon: png("HSBC"),
    color: "#FF1518",
  },
  IBANK: {
    name: "อิสลามแห่งประเทศไทย",
    fullname: "ธนาคารอิสลามแห่งประเทศไทย",
    nameEN: "Islamic Bank of Thailand",
    symbol: "IBANK",
    icon: png("ISBT"),
    color: "#164626",
  },
  ICBC: {
    name: "ไอซีบีซี",
    fullname: "ธนาคารไอซีบีซี",
    nameEN: "ICBC Thai Commercial Bank",
    symbol: "ICBC",
    icon: png("ICBC"),
    color: "#CD1511",
  },
  LHB: {
    name: "แลนด์ แอนด์ เฮ้าส์",
    fullname: "ธนาคารแลนด์ แอนด์ เฮ้าส์",
    nameEN: "LH Bank",
    symbol: "LHB",
    icon: png("LHBANK"),
    color: "#727375",
  },
  TCRB: {
    name: "ไทยเครดิต",
    fullname: "ธนาคารไทยเครดิต",
    nameEN: "Thai Credit Bank",
    symbol: "TCRB",
    icon: png("TCRB"),
    color: "#FF7813",
  },
  TISCO: {
    name: "ทิสโก้",
    fullname: "ธนาคารทิสโก้",
    nameEN: "Tisco Bank",
    symbol: "TISCO",
    icon: png("TISCO"),
    color: "#267CBC",
  },
  PromptPay: {
    name: "พร้อมเพย์",
    fullname: "พร้อมเพย์",
    nameEN: "PromptPay",
    symbol: "PromptPay",
    icon: png("promptpay"),
    color: "#0C4370",
  },
  TrueMoney: {
    name: "ทรูมันนี่",
    fullname: "ทรูมันนี่",
    nameEN: "True Money",
    symbol: "TrueMoney",
    icon: png("truemoney"),
    color: "#EE252B",
  },
};

const ALIAS: Record<string, string> = {
  LHBANK: "LHB",
  ISBT: "IBANK",
  promptpay: "PromptPay",
  PROMPTPAY: "PromptPay",
  truemoney: "TrueMoney",
  TRUEMONEY: "TrueMoney",
};

export function bankLogo(id?: string) {
  if (!id) return undefined;
  const key = ALIAS[id] ?? ALIAS[id.toUpperCase()] ?? id;
  return bankLists[key] ?? bankLists[key.toUpperCase()];
}
