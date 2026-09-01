import { createFileRoute } from "@tanstack/react-router";
import { DeskDash } from "@/components/razen/desk-dash";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <DeskDash />;
}
