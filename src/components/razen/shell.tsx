import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Clock3,
  Gift,
  Home,
  Send,
  Settings2,
  Wallet,
} from "lucide-react";
import { Toaster } from "sonner";
import { RazenWordmark } from "@/components/razen/logo";
import { BrandMark } from "@/components/razen/brand-mark";
import { ReceiptSheet } from "@/components/razen/receipt-sheet";
import { SyncOverlay } from "@/components/razen/sync-overlay";
import { useRazen } from "@/lib/razen/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "ภาพรวม", short: "ภาพรวม", icon: Home },
  { to: "/transfer", label: "โอนเงิน", short: "โอน", icon: Send },
  { to: "/history", label: "ประวัติ", short: "ประวัติ", icon: Clock3 },
  { to: "/accounts", label: "กระเป๋า", short: "กระเป๋า", icon: Wallet },
  { to: "/gifts", label: "ซองอั่งเปา", short: "ซอง", icon: Gift },
  { to: "/tools", label: "ตั้งค่า", short: "ตั้งค่า", icon: Settings2 },
] as const;

const TITLE: Record<string, { kicker: string; title: string }> = {
  "/": { kicker: "โต๊ะวันนี้", title: "ภาพรวม" },
  "/transfer": { kicker: "จ่ายออก", title: "โอนเงิน" },
  "/history": { kicker: "ตรวจสอบ", title: "ประวัติ" },
  "/accounts": { kicker: "วอลเล็ต", title: "กระเป๋า" },
  "/gifts": { kicker: "อั่งเปา", title: "ซอง" },
  "/tools": { kicker: "TMNOne", title: "ตั้งค่า" },
};

const MOBILE_NAV = NAV.filter((n) =>
  ["/", "/transfer", "/history", "/gifts", "/tools"].includes(n.to),
);

export function Shell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [clock, setClock] = useState("");
  const mark = useRazen((s) => s.markHydrated);
  const tick = useRazen((s) => s.tickPending);
  const syncWallet = useRazen((s) => s.syncWallet);
  const mode = useRazen((s) => s.settings.mode);
  const accounts = useRazen((s) => s.accounts);
  const activeId = useRazen((s) => s.activeAccountId);
  const acc = accounts.find((a) => a.id === activeId) ?? accounts[0];
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    try {
      void useRazen.persist.rehydrate();
    } catch {
      /* ignore */
    }
    mark();
    tick();
    void syncWallet();
    setMounted(true);
    const id = window.setInterval(() => tick(), 2500);
    const c = window.setInterval(() => {
      setClock(
        new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }, 1000);
    setClock(
      new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
    return () => {
      window.clearInterval(id);
      window.clearInterval(c);
    };
  }, [mark, tick, syncWallet]);

  const heading = TITLE[pathname] ?? TITLE["/"];

  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <a href="#main" className="skip-link">
        ข้ามไปเนื้อหา
      </a>
      <div className="atmosphere pointer-events-none fixed inset-0 z-0" aria-hidden />
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-line bg-surface/80 md:flex"
        aria-label="เมนูหลัก"
      >
        <div className="px-5 pt-7 pb-5">
          <RazenWordmark />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm transition-colors duration-200",
                  active
                    ? "bg-brand/12 text-brand shadow-[inset_2px_0_0_0_var(--color-brand)]"
                    : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 flex items-center gap-2 rounded-lg bg-elevated px-3 py-2.5 shadow-[var(--shadow-border)]">
          <BrandMark id="truemoney" alt="TrueMoney" className="size-8 rounded-full" />
          <div className="min-w-0">
            <p className="truncate text-sm">{acc?.nickname || "ยังไม่เชื่อม"}</p>
            <p className="font-mono text-[10px] text-cyan">
              {acc?.masked || "ตั้งค่ากระเป๋า"} · {mode === "live" ? "LIVE" : "SIM"}
            </p>
          </div>
        </div>
      </aside>

      <div className="relative z-10 md:pl-56">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-sm md:px-8">
          <div className="md:hidden">
            <RazenWordmark compact />
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="kicker">{heading.kicker}</p>
            <h1 className="text-xl font-semibold leading-none tracking-tight">{heading.title}</h1>
          </div>
          <div className="ml-auto font-mono text-[11px] tabular-nums text-subtle">{clock}</div>
        </header>
        <div className="razen-hud-line" aria-hidden />
        <main id="main" className="razen-enter min-h-[calc(100dvh-56px)] w-full px-4 py-5 pb-20 md:px-8 md:py-7 md:pb-8">
          {mounted ? children : <SkeletonDash />}
        </main>
      </div>

      <nav className="glass-frost fixed inset-x-0 bottom-0 z-30 md:hidden" aria-label="เมนูล่าง">
        <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors duration-200",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <item.icon className="size-5" />
                {item.short}
              </Link>
            );
          })}
        </div>
      </nav>

      {mounted && (
        <>
          <ReceiptSheet />
          <SyncOverlay />
        </>
      )}
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "glass-frost text-fg",
          },
        }}
      />
    </div>
  );
}

function SkeletonDash() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="panel-hero h-40" />
      <div className="stat-strip">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-cell h-20" />
        ))}
      </div>
    </div>
  );
}
