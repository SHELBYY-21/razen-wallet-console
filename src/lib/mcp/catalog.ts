export type McpTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
};

export const MCP_INSTRUCTIONS = `RAZEN TMNOne operator MCP.
Default mode is SIM unless TMN_MODE=live and TMN_KEY_ID / TMN_MSISDN / TMN_LOGIN_TOKEN / TMN_ID / TMN_PIN are set.
Wallet PIN is used only inside loginWithPin6 — never prompt the operator for PIN on each transfer.
Workflow: tmn_bootstrap (setData→login→balance→history→txinfo) then tmn_recipient before tmn_transfer_p2p / promptpay / bank.
History: start inclusive YYYY-MM-DD, end exclusive, limit ≤ 50.
Face webhook POSTs {"wallet_msisdn":"..."} then waits faceauth_wait_timeout (default 180).
Memory: razen_memory_remember / recall / forget (semantic facts, episodic events, procedural how-tos).
Artifacts: razen_artifact_receipt returns a self-contained HTML slip.`;

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
    description:
      "fetchTransactionHistory(start inclusive YYYY-MM-DD, end exclusive, limit≤50, page)",
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
    name: "tmn_txinfo",
    description: "fetchTransactionInfo(report_id)",
    inputSchema: {
      type: "object",
      properties: { report_id: { type: "string" } },
      required: ["report_id"],
    },
  },
  {
    name: "tmn_vouchers",
    description: "fetchVoucherHistory()",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "tmn_p2p_status",
    description: "getTransferP2PStatus(draft_transaction_id)",
    inputSchema: {
      type: "object",
      properties: { draft_id: { type: "string" } },
      required: ["draft_id"],
    },
  },
  {
    name: "tmn_amity",
    description: "getAmityToken() — chat token for tmn.one/amity.html",
    inputSchema: { type: "object", properties: {}, required: [] },
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  {
    name: "razen_memory_remember",
    description: "Store agent memory. kind=semantic|episodic|procedural",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", description: "semantic | episodic | procedural" },
        key: { type: "string" },
        value: { type: "string" },
      },
      required: ["kind", "key", "value"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  {
    name: "razen_memory_recall",
    description: "Retrieve agent memory by keyword and optional kind",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string" },
        kind: { type: "string" },
      },
      required: [],
    },
    annotations: { readOnlyHint: true, idempotentHint: true },
  },
  {
    name: "razen_memory_forget",
    description: "Delete a memory by id or key",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    annotations: { destructiveHint: true },
  },
  {
    name: "razen_artifact_receipt",
    description: "Build a self-contained HTML transfer receipt artifact",
    inputSchema: {
      type: "object",
      properties: {
        ref: { type: "string" },
        amount: { type: "string" },
        counterpart: { type: "string" },
        method: { type: "string" },
        note: { type: "string" },
      },
      required: ["ref", "amount", "counterpart"],
    },
    annotations: { readOnlyHint: true, idempotentHint: true },
  },
];
