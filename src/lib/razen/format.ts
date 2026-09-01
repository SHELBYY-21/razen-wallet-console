const thNum = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const thInt = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

export function baht(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}฿${thNum.format(Math.abs(n))}`;
}

export function bahtInt(n: number) {
  return `฿${thInt.format(n)}`;
}

export function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length < 4) return phone;
  return `${d.slice(0, 3)}***${d.slice(-3)}`;
}

export function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

export function relativeTime(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 45) return "เมื่อสักครู่";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const d = Math.round(h / 24);
  if (d === 1) return "เมื่อวาน";
  if (d < 14) return `${d} วันที่แล้ว`;
  return new Date(ts).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

export function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function weekdayShort(ts: number) {
  return new Date(ts).toLocaleDateString("th-TH", { weekday: "short" });
}

export function accountAgeDays(openedAt: number, now = Date.now()) {
  return Math.max(1, Math.floor((now - openedAt) / 86_400_000));
}

export function isThaiMobile(raw: string) {
  const d = raw.replace(/\D/g, "");
  return /^0[689]\d{8}$/.test(d);
}

export function isThaiNationalId(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(d[i]) * (13 - i);
  const check = (11 - (sum % 11)) % 10;
  return check === Number(d[12]);
}

export function isBankAccount(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 12;
}
