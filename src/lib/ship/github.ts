import { createHmac, timingSafeEqual } from "node:crypto";

const REPO = "SHELBYY-21/razen-wallet-console";

export function verifyGithubSignature(raw: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function mainPush(body: { ref?: string; deleted?: boolean }): boolean {
  return body.ref === "refs/heads/main" && !body.deleted;
}

export async function verifyGithubRepoToken(header: string | null): Promise<boolean> {
  if (!header?.startsWith("Bearer ")) return false;
  const token = header.slice(7).trim();
  if (!token) return false;
  const res = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "razen-ship",
    },
  });
  return res.ok;
}
