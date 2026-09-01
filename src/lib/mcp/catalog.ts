export type McpTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
};

export const MCP_TOOLS: McpTool[] = [
  {
    name: "tmn_bootstrap",
    description:
      "PHP apidoc sequence: setData + loginWithPin6 + getBalance + fetchTransactionHistory(yesterday, tomorrow)",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "tmn_login",
    description: "loginWithPin6 — เปิดเซสชันกระเป๋า TrueMoney",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "tmn_balance",
    description: "getBalance — ยอดเงินปัจจุบัน",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "tmn_recipient",
    description: "getRecipientInfo — ค้นชื่อผู้รับจากเบอร์/วอลเล็ต",
    inputSchema: {
      type: "object",
      properties: { msisdn: { type: "string", description: "เบอร์ 10 หลัก" } },
      required: ["msisdn"],
    },
  },
  {
    name: "tmn_transfer_p2p",
    description: "transferP2P — โอนวอลเล็ต",
    inputSchema: {
      type: "object",
      properties: {
        msisdn: { type: "string" },
        amount: { type: "number" },
        note: { type: "string" },
      },
      required: ["msisdn", "amount"],
    },
  },
  {
    name: "tmn_transfer_promptpay",
    description: "transferQRPromptpay — โอนพร้อมเพย์",
    inputSchema: {
      type: "object",
      properties: {
        proxy: { type: "string" },
        amount: { type: "number" },
        note: { type: "string" },
      },
      required: ["proxy", "amount"],
    },
  },
  {
    name: "tmn_transfer_bank",
    description: "transferBankAC — โอนบัญชีธนาคาร",
    inputSchema: {
      type: "object",
      properties: {
        bank: { type: "string", description: "รหัสธนาคาร เช่น SCB KTB KBANK" },
        account: { type: "string" },
        amount: { type: "number" },
      },
      required: ["bank", "account", "amount"],
    },
  },
  {
    name: "tmn_voucher",
    description: "generateVoucher — สร้างซองอั่งเปา",
    inputSchema: {
      type: "object",
      properties: {
        amount: { type: "number" },
        message: { type: "string" },
      },
      required: ["amount"],
    },
  },
  {
    name: "tmn_fees",
    description: "getWalletFee — ค่าธรรมเนียมช่องทาง",
    inputSchema: {
      type: "object",
      properties: { channel: { type: "string" } },
      required: [],
    },
  },
  {
    name: "tmn_history",
    description: "fetchTransactionHistory — ประวัติรายการ",
    inputSchema: {
      type: "object",
      properties: {
        start: { type: "string" },
        end: { type: "string" },
        limit: { type: "number" },
      },
      required: [],
    },
  },
  {
    name: "tmn_payment_code",
    description: "getPaymentCode — QR จ่ายร้านค้า",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "tmn_qr",
    description: "fetchQRDetail — อ่านสลิป QR",
    inputSchema: {
      type: "object",
      properties: { raw: { type: "string" } },
      required: ["raw"],
    },
  },
  {
    name: "razen_status",
    description: "สถานะคอนโซลและโหมด TMN",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
];
