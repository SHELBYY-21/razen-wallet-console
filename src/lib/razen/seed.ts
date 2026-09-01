import type { Account, Contact, Envelope, TmnCredentials, Transaction } from "./types";

const DAY = 86_400_000;
const MIN = 60_000;

export const SEED_PIN = "123456";
export const PRIMARY_OPENING = 10_030;
export const PRIMARY_BALANCE = 12_680;

function creds(msisdn: string, key: string): TmnCredentials {
  return {
    tmn_key_id: key,
    msisdn,
    login_token: `L-${key.replace(/^x/, "")}-4b21-8c90-89186d786db5`,
    tmn_id: `tmn.${msisdn}`,
    device_id: msisdn.padEnd(16, "a").slice(0, 16),
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
    creds: creds("0924488708", "x1001"),
  };
  const a2: Account = {
    id: "acc-2",
    nickname: "บัญชีสำรอง",
    number: "0812345678",
    masked: "081****678",
    openedAt: now - 40 * DAY,
    color: "info",
    status: "active",
    creds: creds("0812345678", "x1002"),
  };
  const a3: Account = {
    id: "acc-3",
    nickname: "บัญชีร้าน",
    number: "0981234567",
    masked: "098****567",
    openedAt: now - 21 * DAY,
    color: "in",
    status: "active",
    creds: creds("0981234567", "x1003"),
  };

  const contacts: Contact[] = [
    { id: "c1", name: "นาย สมชาย ใจดี", phone: "0812345678", note: "ลูกค้าประจำ" },
    { id: "c2", name: "นางสาว วิภาดา ศรีสุข", phone: "0891112233", note: "คู่ค้า" },
    { id: "c3", name: "นาง มาลี ใจดี", phone: "0925550101", note: "ครอบครัว" },
    { id: "c4", name: "นางสาว นภัสสร จันทร์เพ็ญ", phone: "0867704490" },
    { id: "c5", name: "นาย ธนพล วงศ์สกุล", phone: "0981234567", note: "บัญชีร้าน" },
  ];

  const txs: Transaction[] = [
    tx("t1", "in", "p2p", 2500, 0, "นาย สมชาย ใจดี", "081****678", now - 6 * DAY, "ค่าอาหารกลุ่ม", "umk1678000101"),
    tx("t2", "in", "promptpay", 1800, 0, "นางสาว วิภาดา ศรีสุข", "พร้อมเพย์ 089****233", now - 5 * DAY + 3 * MIN, "คืนเงิน", "umk1678000102"),
    tx("t3", "out", "bank", 1500, 15, "บจก. แสงตะวัน", "กสิกรไทย · ***8891", now - 5 * DAY, "ค่าเช่าโกดัง", "umk1678000103", "KBANK"),
    tx("t4", "in", "bank", 1500, 0, "นางสาว วิภาดา ศรีสุข", "ไทยพาณิชย์ · ***2201", now - 4 * DAY, "โอนงาน", "umk1678000104", "SCB"),
    tx("t5", "in", "p2p", 1200, 0, "นางสาว นภัสสร จันทร์เพ็ญ", "086****490", now - 3 * DAY, "", "umk1678000105"),
    tx("t6", "out", "p2p", 850, 0, "นาง มาลี ใจดี", "092****101", now - 3 * DAY + 40 * MIN, "ตลาด", "umk1678000106"),
    tx("t7", "in", "promptpay", 800, 0, "นาย สมชาย ใจดี", "พร้อมเพย์ 081****678", now - 2 * DAY, "", "umk1678000107"),
    tx("t8", "out", "promptpay", 470, 0, "นางสาว นภัสสร จันทร์เพ็ญ", "พร้อมเพย์ 086****490", now - 2 * DAY + 80 * MIN, "ค่าแท็กซี่", "umk1678000108"),
    tx("t9", "in", "bank", 600, 0, "นาย สมชาย ใจดี", "กรุงไทย · ***4410", now - 1 * DAY, "", "umk1678000109", "KTB"),
    tx("t10", "out", "gift", 400, 0, "ซองอั่งเปา KM7Q2P", "รหัส KM7Q2P", now - 1 * DAY + 20 * MIN, "สุขสันต์วันเกิด", "umk1678000110"),
    tx("t11", "out", "bank", 1200, 15, "บจก. โชคชัยค้าส่ง", "กรุงเทพ · ***5520", now - 90 * MIN, "สั่งของ", "umk1678000111", "BBL"),
    tx("t12", "out", "p2p", 800, 0, "นางสาว วิภาดา ศรีสุข", "089****233", now - 45 * MIN, "มัดจำ", "umk1678000112"),
    tx("t13", "out", "promptpay", 500, 0, "นาง มาลี ใจดี", "พร้อมเพย์ 092****101", now - 20 * MIN, "", "umk1678000113"),
  ];

  const envelopes: Envelope[] = [
    {
      id: "e1",
      code: "KM7Q2P",
      amount: 400,
      message: "สุขสันต์วันเกิด",
      fromName: "บัญชีหลัก",
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
        title: "โอน P2P ฟรีเหลือ 12 ครั้ง",
        body: "รอบเดือนนี้ใช้สิทธิ์รับโอนฟรีไป 3 จาก 15 ครั้ง",
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
  amount: number,
  fee: number,
  counterpart: string,
  counterpartMeta: string,
  createdAt: number,
  note: string,
  reportId: string,
  bankCode?: string,
): Transaction {
  return {
    id,
    ref: reportId,
    method,
    direction,
    status: "completed",
    amount,
    fee,
    counterpart,
    counterpartMeta,
    note,
    accountId: "acc-1",
    createdAt,
    settledAt: createdAt + 18_000,
    bankCode,
    reportId,
  };
}

export function openingBalanceFor(_txs: Transaction[], accountId: string) {
  if (accountId === "acc-2") return 4_250;
  if (accountId === "acc-3") return 8_900;
  return PRIMARY_OPENING;
}

export function ledgerBalance(txs: Transaction[], accountId: string) {
  let n = openingBalanceFor(txs, accountId);
  for (const t of txs) {
    if (t.accountId !== accountId || t.status === "failed") continue;
    if (t.direction === "in") {
      if (t.status === "completed") n += t.amount;
    } else {
      n -= t.amount + t.fee;
    }
  }
  return Math.round(n * 100) / 100;
}
