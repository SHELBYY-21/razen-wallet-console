import { createFileRoute } from "@tanstack/react-router";
import { DeskDash } from "@/components/razen/desk-dash";

export const Route = createFileRoute("/desk")({ component: DeskPage });

function DeskPage() {
  return <DeskDash />;
}
