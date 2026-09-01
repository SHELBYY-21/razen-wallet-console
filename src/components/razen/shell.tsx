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
import { ReceiptSheet } from "@/components/razen/receipt-sheet";
import { useRazen } from "@/lib/razen/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "แดชบอร์ด", short: "หน้าหลัก", icon: Home },
  { to: "/transfer", label: "โอนเงิน", short: "โอน", icon: Send },
  { to: "/history", label: "ประวัติรายการ", short: "ประวัติ", icon: Clock3 },
  { to: "/accounts", label: "บัญชี", short: "บัญชี", icon: Wallet },
  { to: "/gifts", label: "ซองอั่งเปา", short: "ซอง", icon: Gift },
  { to: "/tools", label: "เครื่องมือ", short: "ตั้งค่า", icon: Settings2 },
] as const;

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

  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <div className="atmosphere pointer-events-none fixed inset-0 z-0" aria-hidden />
      <aside className="glass-frost fixed inset-y-0 left-0 z-30 hidden w-60 flex-col md:flex">
        <div className="px-5 py-6">
          <RazenWordmark />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]",
                  active
                    ? "bg-brand text-brand-fg"
                    : "text-muted hover:bg-fg/8 hover:text-fg",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 px-5 py-5">
          <div className="flex items-center justify-between text-xs text-subtle">
            <span>คอนโซล</span>
            <span className={mode === "live" ? "text-in" : "text-cyan"}>
              {mode === "live" ? "LIVE" : "SIM"}
            </span>
          </div>
          <p className="font-mono text-xs tabular-nums text-muted">{clock || "--:--:--"}</p>
        </div>
      </aside>

      <div className="relative z-10 md:pl-60">
        <header className="glass-frost sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:px-8">
          <div className="md:hidden">
            <RazenWordmark compact />
          </div>
          <p className="hidden text-xs text-subtle md:block">RAZEN Transfer Console</p>
          <span
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider",
              mode === "live" ? "bg-in/15 text-in" : "bg-cyan/12 text-cyan",
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {mode === "live" ? "LIVE" : "SIM"}
          </span>
        </header>
        <main className="mx-auto min-h-[calc(100dvh-52px)] w-full max-w-5xl px-4 pt-5 pb-24 md:px-8 md:pt-8 md:pb-10">
          {mounted ? children : <SkeletonDash />}
        </main>
      </div>

      <nav className="glass-frost fixed inset-x-0 bottom-0 z-30 md:hidden">
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
                className={cn(
                  "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors duration-150",
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
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs tracking-[0.28em] text-cyan uppercase">แดชบอร์ด</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">ภาพรวมบัญชีเงิน</h1>
      </header>
      <div className="glass-hero rounded-2xl p-5 text-brand-fg md:p-6">
        <p className="text-sm opacity-80">ยอดเงินคงเหลือ</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
          ฿12,680.00
        </p>
        <p className="mt-3 text-xs opacity-75">บัญชีที่ 1 · 092****708</p>
      </div>
    </div>
  );
}
