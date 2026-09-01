import { createHmac, timingSafeEqual } from "node:crypto";

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

export async function headSha(repo = "SHELBYY-21/razen-wallet-console"): Promise<string | null> {
  const res = await fetch(`https://api.github.com/repos/${repo}/commits/main`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "razen-ship" },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { sha?: string };
  return json.sha ?? null;
}
