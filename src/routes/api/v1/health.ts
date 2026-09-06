import { createFileRoute } from "@tanstack/react-router";
import { health } from "@/lib/api/spec";

export const Route = createFileRoute("/api/v1/health")({
  server: {
    handlers: {
      GET: async () => Response.json(health()),
    },
  },
});
