import { createFileRoute } from "@tanstack/react-router";
import { mainPush, verifyGithubRepoToken, verifyGithubSignature } from "@/lib/ship/github";
import { shipMain } from "@/lib/ship/deploy";

export const Route = createFileRoute("/api/ship")({
  server: {
    handlers: {
      GET: async () => Response.json({ ok: true, endpoint: "ship", branch: "main" }),
      POST: async ({ request }) => {
        const secret = process.env.SHIP_SECRET?.trim() ?? "";
        const raw = await request.text();
        const signed = verifyGithubSignature(raw, request.headers.get("x-hub-signature-256"), secret);
        const fromActions = await verifyGithubRepoToken(request.headers.get("authorization"));
        if (!signed && !fromActions) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        let body: { ref?: string; deleted?: boolean } = {};
        try {
          body = JSON.parse(raw) as { ref?: string; deleted?: boolean };
        } catch {
          return Response.json({ error: "parse error" }, { status: 400 });
        }
        if (!mainPush(body)) return Response.json({ ok: true, skipped: true });
        const out = await shipMain();
        return Response.json(out, { status: out.ok ? 200 : 502 });
      },
    },
  },
});
