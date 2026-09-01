export async function shipMain(): Promise<{ ok: boolean; id?: string; url?: string; error?: string }> {
  const token = process.env.VERCEL_TOKEN?.trim();
  const org = process.env.VERCEL_ORG_ID?.trim();
  const project = process.env.VERCEL_PROJECT_ID?.trim();
  const repoId = Number(process.env.GITHUB_REPO_ID || "1353981322");
  if (!token || !org || !project) {
    return { ok: false, error: "missing Vercel deploy env" };
  }
  const res = await fetch(`https://api.vercel.com/v13/deployments?teamId=${org}&forceNew=1`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "razen-wallet-console",
      project,
      target: "production",
      gitSource: { type: "github", repoId, ref: "main" },
    }),
  });
  const json = (await res.json().catch(() => null)) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  } | null;
  if (!res.ok) {
    return { ok: false, error: json?.error?.message || `vercel ${res.status}` };
  }
  return { ok: true, id: json?.id, url: json?.url ? `https://${json.url}` : undefined };
}
