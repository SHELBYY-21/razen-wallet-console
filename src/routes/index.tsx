import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <iframe
      src="/welcome.html"
      title="RAZEN · ศูนย์บัญชาการ"
      className="fixed inset-0 z-[70] h-dvh w-full border-0 bg-black"
    />
  );
}
