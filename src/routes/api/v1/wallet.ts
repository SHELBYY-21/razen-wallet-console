import { createFileRoute } from "@tanstack/react-router";
import { gate, walletGet, walletLogin } from "@/lib/api/v1";

export const Route = createFileRoute("/api/v1/wallet")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const blocked = gate(request);
        if (blocked) return blocked;
        const out = await walletGet();
        return Response.json(out, { status: out.ok ? 200 : 400 });
      },
      POST: async ({ request }) => {
        const blocked = gate(request);
        if (blocked) return blocked;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const out = await walletLogin(body);
        return Response.json(out, { status: out.ok ? 200 : 400 });
      },
    },
  },
});
