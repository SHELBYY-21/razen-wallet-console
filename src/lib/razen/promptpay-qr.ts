export type PromptPayKind = "phone" | "nationalId" | "ewallet";

export type PromptPayHit = {
  kind: PromptPayKind;
  value: string;
};

function tlv(src: string) {
  const out = new Map<string, string>();
  let i = 0;
  while (i + 4 <= src.length) {
    const tag = src.slice(i, i + 2);
    const len = Number(src.slice(i + 2, i + 4));
    if (!Number.isFinite(len) || len < 0) break;
    const val = src.slice(i + 4, i + 4 + len);
    if (val.length < len) break;
    out.set(tag, val);
    i += 4 + len;
  }
  return out;
}

function mobileFrom66(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("0066") && d.length >= 13) return `0${d.slice(4)}`;
  if (d.startsWith("66") && d.length >= 11) return `0${d.slice(2)}`;
  if (d.startsWith("0") && d.length === 10) return d;
  return d;
}

export function parsePromptPayPayload(raw: string): { ok: true; hit: PromptPayHit } | { ok: false; error: string } {
  const payload = raw.trim().replace(/\s+/g, "");
  if (payload.length < 16) return { ok: false, error: "QR สั้นเกินไป" };
  const root = tlv(payload);
  if (!root.has("00")) return { ok: false, error: "ไม่ใช่ QR พร้อมเพย์ (ไม่มีแท็ก EMV)" };

  const slots = ["29", "30", "31"].map((t) => root.get(t)).filter(Boolean) as string[];
  if (!slots.length) return { ok: false, error: "QR นี้ไม่ใช่พร้อมเพย์ร้านค้า" };

  for (const slot of slots) {
    const inner = tlv(slot);
    const guid = (inner.get("00") || "").toUpperCase();
    if (guid && !guid.includes("A000000677")) continue;
    const phone = inner.get("01");
    if (phone) {
      const value = mobileFrom66(phone);
      if (/^0[689]\d{8}$/.test(value)) return { ok: true, hit: { kind: "phone", value } };
    }
    const nid = inner.get("02");
    if (nid) {
      const value = nid.replace(/\D/g, "");
      if (value.length === 13) return { ok: true, hit: { kind: "nationalId", value } };
    }
    const wallet = inner.get("03");
    if (wallet) return { ok: true, hit: { kind: "ewallet", value: wallet.replace(/\D/g, "") } };
  }
  return { ok: false, error: "อ่าน QR ได้ แต่ไม่ใช่พร้อมเพย์โอนเงิน" };
}
