export type TmnCreds = {
  keyId: string;
  msisdn: string;
  loginToken: string;
  tmnId: string;
  deviceId?: string;
  pin: string;
  faceWebhook?: string;
};

export type TmnOp =
  | "login"
  | "balance"
  | "fee"
  | "history"
  | "txinfo"
  | "qr"
  | "vouchers"
  | "generateVoucher"
  | "recipient"
  | "p2p"
  | "p2pStatus"
  | "promptpay"
  | "bank"
  | "paymentCode"
  | "amity"
  | "probe";

export type TmnRequest = {
  op: TmnOp;
  creds: TmnCreds;
  payload?: Record<string, string | number | undefined>;
};

export type TmnWire = {
  ok: boolean;
  error: string;
  json: string;
};
