export type WalletVerdict =
  | { kind: "ok" }
  | { kind: "fail"; error: string; code?: string }
  | { kind: "expired"; error: string }
  | { kind: "face"; error: string }
  | { kind: "pin"; error: string };

export function safeErrMessage(e: unknown) {
  if (e instanceof Error) return e.message || "unknown error";
  if (e && typeof e === "object" && "error" in e && typeof (e as { error: unknown }).error === "string") {
    return (e as { error: string }).error;
  }
  return String(e || "ไม่สามารถติดต่อ TMNOne ได้");
}

function methodOf(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const m = (data as { method?: unknown }).method;
  return typeof m === "string" ? m : "";
}

export function verdictOf(data: unknown): WalletVerdict {
  if (data == null || data === "") {
    return { kind: "fail", error: "ไม่มีคำตอบจาก Wallet" };
  }
  if (typeof data === "string") {
    if (!data.trim()) return { kind: "fail", error: "ไม่มีคำตอบจาก Wallet" };
    return { kind: "ok" };
  }
  if (typeof data !== "object") return { kind: "ok" };

  const rec = data as Record<string, unknown>;
  if (typeof rec.error === "string" && rec.error.trim()) {
    const e = rec.error;
    if (/MAS-401/.test(e)) {
      return { kind: "expired", error: "MAS-401 session หมดอายุ — loginWithPin6 ใหม่" };
    }
    if (/liveness/i.test(e) || /face/i.test(e) && /timeout/i.test(e)) {
      return { kind: "face", error: `หมดเวลายืนยันใบหน้า (${e})` };
    }
    return { kind: "fail", error: e };
  }

  const code = typeof rec.code === "string" ? rec.code : "";
  const message = typeof rec.message === "string" ? rec.message : "";
  const nested = rec.data;

  if (code === "MAS-401") {
    return { kind: "expired", error: message || "MAS-401 session หมดอายุ" };
  }
  if (code.endsWith("-428")) {
    const method = methodOf(nested);
    if (method === "face") {
      return { kind: "face", error: message || "ต้องยืนยันใบหน้า (VerifyFace)" };
    }
    if (method === "pin") {
      return { kind: "pin", error: message || "ต้องยืนยัน PIN อีกครั้ง" };
    }
    return { kind: "fail", error: message ? `${code} - ${message}` : `${code} ต้องการยืนยันเพิ่ม` };
  }
  if (code && !code.endsWith("-200")) {
    return { kind: "fail", error: message ? `${code} - ${message}` : code, code };
  }
  return { kind: "ok" };
}
