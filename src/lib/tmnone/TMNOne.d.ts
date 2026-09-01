declare class TMNOne {
  faceauth_webhook_url?: string;
  faceauth_wait_timeout: number;
  setData(
    tmnone_keyid: string,
    wallet_msisdn: string,
    wallet_login_token: string,
    wallet_tmn_id: string,
    wallet_device_id?: string,
  ): void;
  enableDebugging(): void;
  loginWithPin6(pin: string): Promise<string | { error: string }>;
  getBalance(): Promise<unknown>;
  getWalletFee(channel: string): Promise<unknown>;
  fetchTransactionHistory(
    start_date: string,
    end_date: string,
    limit?: number,
    page?: number,
  ): Promise<unknown>;
  fetchTransactionInfo(report_id: string): Promise<unknown>;
  fetchQRDetail(qr_data: string): Promise<unknown>;
  fetchVoucherHistory(): Promise<unknown>;
  generateVoucher(amount: number, detail?: string): Promise<unknown>;
  getRecipientInfo(payee_wallet_id: string): Promise<unknown>;
  transferP2P(
    payee_wallet_id: string,
    amount: number | string,
    personal_msg?: string,
  ): Promise<unknown>;
  getTransferP2PStatus(draft_transaction_id: string): Promise<unknown>;
  transferQRPromptpay(
    payee_proxy_value: string,
    amount: number | string,
    personal_msg?: string,
  ): Promise<unknown>;
  transferBankAC(
    bank_code: string,
    bank_ac: string,
    amount: number | string,
    wallet_pin: string,
  ): Promise<unknown>;
  getPaymentCode(): Promise<unknown>;
  getAmityToken(): Promise<unknown>;
}

declare const _default: typeof TMNOne;
export default _default;
