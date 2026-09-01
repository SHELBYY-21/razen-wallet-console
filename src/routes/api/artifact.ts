import { createFileRoute } from "@tanstack/react-router";
import { deskHtml } from "@/lib/artifact/desk";
import { receiptHtml } from "@/lib/artifact/receipt";

export const Route = createFileRoute("/api/artifact")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const q = new URL(request.url).searchParams;
        const kind = q.get("kind") || "receipt";
        const html =
          kind === "desk"
            ? deskHtml()
            : receiptHtml({
                ref: q.get("ref") || "—",
                amount: q.get("amount") || "0.00",
                counterpart: q.get("counterpart") || "—",
                method: q.get("method") || "P2P",
                at: q.get("at") || new Date().toISOString(),
                note: q.get("note") || "",
              });
        const name = kind === "desk" ? "razen-desk" : `razen-${q.get("ref") || "receipt"}`;
        return new Response(html, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "content-disposition": `inline; filename="${name}.html"`,
          },
        });
      },
    },
  },
});
