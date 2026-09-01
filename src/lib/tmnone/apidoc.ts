/** Canonical public surface from https://www.tmn.one/apidoc.html */
export const FACE_WEBHOOK_BODY = { wallet_msisdn: "เบอร์ Wallet ที่ต้องการการสแกนหน้า" };

export const FEE_CHANNELS = [
  "refill",
  "p2p",
  "promptpay-in",
  "promptpay-out",
  "datasender_api",
] as const;

export const BANK_CODES = [
  "SCB",
  "BBL",
  "BAY",
  "KBANK",
  "KTB",
  "TTB",
  "CIMB",
  "LHBANK",
  "UOB",
  "KKP",
  "GSB",
  "BAAC",
  "GHB",
  "ISBT",
  "TISCO",
  "TCRB",
] as const;

export const PUBLIC_FUNCTIONS = [
  { name: "getBalance", args: "", note: "ดึงยอดเงินคงเหลือ" },
  {
    name: "getWalletFee",
    args: "channel",
    note: "refill | p2p | promptpay-in | promptpay-out | datasender_api",
  },
  {
    name: "fetchTransactionHistory",
    args: "start_date, end_date, limit = 10, page = 1",
    note: "start inclusive · end exclusive · limit ≤ 50",
  },
  { name: "fetchTransactionInfo", args: "report_id", note: "รายละเอียดจาก history" },
  { name: "fetchQRDetail", args: "qr_data", note: "raw QR บนสลิป" },
  { name: "fetchVoucherHistory", args: "", note: "ประวัติซองอั่งเปา" },
  { name: "generateVoucher", args: "amount, detail = ''", note: "สั่งซองอั่งเปา" },
  { name: "getRecipientInfo", args: "payee_wallet_id", note: "ข้อมูลเบอร์ Wallet" },
  { name: "transferP2P", args: "payee_wallet_id, amount, personal_msg = ''", note: "โอนวอลเล็ต" },
  { name: "getTransferP2PStatus", args: "draft_transaction_id", note: "สถานะหลัง transferP2P" },
  {
    name: "transferQRPromptpay",
    args: "payee_proxy_value, amount, personal_msg = ''",
    note: "พร้อมเพย์ เบอร์/บัตร",
  },
  {
    name: "transferBankAC",
    args: "bank_code, bank_ac, amount, wallet_pin",
    note: BANK_CODES.join(","),
  },
  { name: "getPaymentCode", args: "", note: "data.payment_code → QR ร้านค้า/7-11" },
  { name: "getAmityToken", args: "", note: "Chat บน tmn.one/amity.html" },
] as const;

export function histLimit(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v) || v <= 0) return 10;
  return Math.min(50, Math.floor(v));
}

export function pinLoginFailed(accessToken: unknown): string {
  if (!accessToken) return "เข้าสู่ระบบไม่สำเร็จ";
  if (typeof accessToken === "object" && accessToken && "error" in accessToken) {
    const err = (accessToken as { error?: unknown }).error;
    if (err) return String(err);
  }
  return "";
}
