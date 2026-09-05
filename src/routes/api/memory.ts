import { createFileRoute } from "@tanstack/react-router";
import { forget, recall, remember, type MemoryKind } from "@/lib/memory/store";

function asKind(v: unknown): MemoryKind | undefined {
  return v === "semantic" || v === "episodic" || v === "procedural" ? v : undefined;
}

export const Route = createFileRoute("/api/memory")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const items = await recall(url.searchParams.get("q") ?? "", {
          kind: asKind(url.searchParams.get("kind")),
          accountId: url.searchParams.get("accountId") || "desk",
          limit: Number(url.searchParams.get("limit") || 8) || 8,
        });
        return Response.json({ items });
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const kind = asKind(body.kind);
        if (!kind) return Response.json({ error: "kind must be semantic|episodic|procedural" }, { status: 400 });
        const item = await remember({
          kind,
          key: String(body.key ?? ""),
          value: String(body.value ?? ""),
          accountId: String(body.accountId ?? "desk"),
          importance: body.importance == null ? undefined : Number(body.importance),
        });
        return Response.json({ item });
      },
      DELETE: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id") || "";
        return Response.json({ deleted: await forget(id) });
      },
    },
  },
});
