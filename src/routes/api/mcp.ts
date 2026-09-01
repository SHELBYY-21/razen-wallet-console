import { createFileRoute } from "@tanstack/react-router";
import { authorize, handleMcp, type JsonRpc } from "@/lib/mcp/handle";
import { MCP_TOOLS } from "@/lib/mcp/catalog";

function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!authorize(request.headers.get("authorization"))) return unauthorized();
        return Response.json({
          name: "razen-tmn",
          version: "1.0.0",
          transport: "json-rpc",
          tools: MCP_TOOLS.map((t) => t.name),
        });
      },
      POST: async ({ request }) => {
        if (!authorize(request.headers.get("authorization"))) return unauthorized();
        let body: JsonRpc = {};
        try {
          body = (await request.json()) as JsonRpc;
        } catch {
          return Response.json(
            { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
            { status: 400 },
          );
        }
        const out = await handleMcp(body);
        return Response.json(out);
      },
    },
  },
});
