import { createFileRoute } from "@tanstack/react-router";
import { gate, txList, txSend } from "@/lib/api/v1";

export const Route = createFileRoute("/api/v1/transactions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const blocked = gate(request);
        if (blocked) return blocked;
        const url = new URL(request.url);
        const out = await txList({
          start: url.searchParams.get("start") || undefined,
          end: url.searchParams.get("end") || undefined,
        });
        return Response.json(out, { status: out.ok ? 200 : 400 });
      },
      POST: async ({ request }) => {
        const blocked = gate(request);
        if (blocked) return blocked;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const out = await txSend(body);
        return Response.json(out, { status: out.ok ? 200 : 400 });
      },
    },
  },
});
