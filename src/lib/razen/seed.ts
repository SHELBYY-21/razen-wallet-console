import type { Account, Contact, Envelope, TmnCredentials, Transaction } from "./types";

const DAY = 86_400_000;
const MIN = 60_000;

export const SEED_PIN = "123456";

function creds(msisdn: string, suffix: string): TmnCredentials {
  return {
    tmn_key_id: `x${suffix}`,
    msisdn,
    login_token: `L-sim-${suffix}-0000-0000-00000000`,
    tmn_id: `tmn.${msisdn}`,
    device_id: `dev${suffix}abcdef`,
  };
}

export function buildSeed(now = Date.now()) {
  const a1: Account = {
    id: "acc-1",
    nickname: "บัญชีหลัก",
    number: "0924488708",
    masked: "092****708",
    openedAt: now - 14 * DAY,
    color: "brand",
    status: "active",
    creds: creds("0924488708", "1001"),
  };
  const a2: Account = {
    id: "acc-2",
    nickname: "บัญชีรอง",
    number: "0812345678",
    masked: "081****234",
    openedAt: now - 40 * DAY,
    color: "info",
    status: "active",
    creds: creds("0812345678", "1002"),
  };
  const a3: Account = {
    id: "acc-3",
    nickname: "บัญชีทดสอบ",
    number: "0650000890",
    masked: "065****890",
    openedAt: now - 3 * DAY,
    color: "in",
    status: "inactive",
    creds: creds("0650000890", "1003"),
  };

  const contacts: Contact[] = [
    { id: "c1", name: "สมชาย ใจดี", phone: "0812345678", note: "เพื่อน" },
    { id: "c2", name: "วิภาดา ศรีสุข", phone: "0891112233", note: "งาน" },
    { id: "c3", name: "คุณแม่", phone: "0925550101" },
    { id: "c4", name: "นภัสสร จันทร์เพ็ญ", phone: "0867704490" },
    { id: "c5", name: "บริษัท แสงตะวัน จำกัด", phone: "021140998" },
  ];

  const txs: Transaction[] = [
    tx("t1", "in", "p2p", "completed", 2500, 0, "สมชาย ใจดี", "081****234", now - 6 * DAY, "ค่าอาหารกลุ่ม"),
    tx("t2", "in", "promptpay", "completed", 1800, 0, "พร้อมเพย์ 089****233", "เบอร์โทร", now - 5 * DAY + 3 * MIN, "คืนเงิน"),
    tx("t3", "out", "bank", "completed", 1500, 15, "บจก. แสงตะวัน", "กสิกรไทย · ***8891", now - 5 * DAY, "ค่าเช่าโกดัง", "KBANK"),
    tx("t4", "in", "bank", "completed", 1500, 0, "วิภาดา ศรีสุข", "ไทยพาณิชย์ · ***2201", now - 4 * DAY, "โอนงาน", "SCB"),
    tx("t5", "in", "p2p", "completed", 1200, 0, "นภัสสร จันทร์เพ็ญ", "086****490", now - 3 * DAY, ""),
    tx("t6", "out", "p2p", "completed", 850, 0, "คุณแม่", "092****101", now - 3 * DAY + 40 * MIN, "ตลาด"),
    tx("t7", "in", "promptpay", "completed", 800, 0, "พร้อมเพย์ 081****678", "เบอร์โทร", now - 2 * DAY, ""),
    tx("t8", "out", "promptpay", "completed", 470, 0, "พร้อมเพย์ 086****490", "เบอร์โทร", now - 2 * DAY + 80 * MIN, "ค่าแท็กซี่"),
    tx("t9", "in", "bank", "completed", 600, 0, "สมชาย ใจดี", "กรุงไทย · ***4410", now - 1 * DAY, "", "KTB"),
    tx("t10", "out", "gift", "completed", 400, 0, "ซองอั่งเปา RZ-GIFT", "รหัส KM7Q2P", now - 1 * DAY + 20 * MIN, "สุขสันต์วันเกิด"),
    tx("t11", "out", "bank", "pending", 1200, 15, "บจก. โชคชัยค้าส่ง", "กรุงเทพ · ***5520", now - 4 * MIN, "สั่งของ", "BBL"),
    tx("t12", "out", "p2p", "pending", 800, 0, "วิภาดา ศรีสุข", "089****233", now - 2 * MIN, "มัดจำ"),
    tx("t13", "out", "promptpay", "pending", 500, 0, "พร้อมเพย์ 092****101", "เบอร์โทร", now - 1 * MIN, ""),
  ];

  const envelopes: Envelope[] = [
    {
      id: "e1",
      code: "KM7Q2P",
      amount: 400,
      message: "สุขสันต์วันเกิด",
      fromName: "RAZEN",
      createdAt: now - 1 * DAY + 20 * MIN,
      txId: "t10",
      status: "open",
      voucherLink: "https://gift.truemoney.com/campaign/?v=KM7Q2P",
    },
  ];

  return {
    accounts: [a1, a2, a3],
    activeAccountId: a1.id,
    contacts,
    txs,
    envelopes,
    pin: SEED_PIN,
    notices: [
      {
        id: "n1",
        title: "รายการรอดำเนินการ",
        body: "มี 3 รายการที่ระบบกำลังตรวจสอบ — จะเคลียร์อัตโนมัติในไม่กี่วินาที",
        at: now - 3 * MIN,
        read: false,
      },
    ],
    settings: {
      notifPush: true,
      notifEmail: false,
      dailyLimit: 200_000,
      apiBase: "",
      apiToken: "",
      mode: "sim" as const,
      faceauth_webhook_url: "",
      faceauth_wait_timeout: 180,
    },
    seq: 14,
  };
}

function tx(
  id: string,
  direction: Transaction["direction"],
  method: Transaction["method"],
  status: Transaction["status"],
  amount: number,
  fee: number,
  counterpart: string,
  counterpartMeta: string,
  createdAt: number,
  note: string,
  bankCode?: string,
): Transaction {
  return {
    id,
    ref: `RZ${id.slice(1).padStart(8, "0")}`,
    method,
    direction,
    status,
    amount,
    fee,
    counterpart,
    counterpartMeta,
    note,
    accountId: "acc-1",
    createdAt,
    settledAt: status === "completed" ? createdAt + 20_000 : undefined,
    bankCode,
  };
}

export function openingBalanceFor(txs: Transaction[], accountId: string) {
  void txs;
  void accountId;
  return 10_030;
}
