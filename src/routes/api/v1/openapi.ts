import { createFileRoute } from "@tanstack/react-router";
import { openapi } from "@/lib/api/spec";

export const Route = createFileRoute("/api/v1/openapi")({
  server: {
    handlers: {
      GET: async () => Response.json(openapi),
    },
  },
});
