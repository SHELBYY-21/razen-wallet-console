export type TransferMethod = "p2p" | "promptpay" | "bank" | "gift";
export type TxDirection = "in" | "out";
export type TxStatus = "pending" | "processing" | "completed" | "failed";
export type PromptPayKind = "phone" | "nationalId";
export type TmnMode = "sim" | "live";
export type WalletFeeChannel =
  | "refill"
  | "p2p"
  | "promptpay-in"
  | "promptpay-out"
  | "datasender_api";

export type TmnCredentials = {
  tmn_key_id: string;
  msisdn: string;
  login_token: string;
  tmn_id: string;
  device_id: string;
};

export type Account = {
  id: string;
  nickname: string;
  number: string;
  masked: string;
  openedAt: number;
  color: "brand" | "info" | "in";
  status: "active" | "inactive";
  creds: TmnCredentials;
  walletBalance: number | null;
};

export type Contact = {
  id: string;
  name: string;
  phone: string;
  note?: string;
};

export type Transaction = {
  id: string;
  ref: string;
  method: TransferMethod;
  direction: TxDirection;
  status: TxStatus;
  amount: number;
  fee: number;
  counterpart: string;
  counterpartMeta: string;
  note: string;
  accountId: string;
  createdAt: number;
  settledAt?: number;
  bankCode?: string;
  draftId?: string;
  reportId?: string;
};

export type Envelope = {
  id: string;
  code: string;
  amount: number;
  message: string;
  fromName: string;
  createdAt: number;
  claimedAt?: number;
  claimedBy?: string;
  txId: string;
  status: "open" | "claimed";
  packId?: string;
  voucherLink?: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
};

export type Settings = {
  notifPush: boolean;
  notifEmail: boolean;
  dailyLimit: number;
  apiBase: string;
  apiToken: string;
  mode: TmnMode;
  faceauth_webhook_url: string;
  faceauth_wait_timeout: number;
};
