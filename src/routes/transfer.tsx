import { createFileRoute } from "@tanstack/react-router";
import { TransferForm } from "@/components/razen/transfer-form";
import { BrandMark } from "@/components/razen/brand-mark";
import { baht } from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";
import type { TransferMethod } from "@/lib/razen/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Method = Exclude<TransferMethod, "gift">;

export const Route = createFileRoute("/transfer")({
  validateSearch: (s: Record<string, unknown>) => {
    const m = s.method;
    const method: Method =
      m === "p2p" || m === "promptpay" || m === "bank" ? m : "p2p";
    return { method };
  },
  component: TransferPage,
});

function TransferPage() {
  const { method } = Route.useSearch();
  const navigate = Route.useNavigate();
  const getBalance = useRazen((s) => s.balance);
  const balance = getBalance();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <p className="text-xs font-medium tracking-wide text-cyan">โอนเงิน</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">เลือกช่องทางการโอน</h1>
        <p className="mt-1 text-sm text-muted">ยอดใช้ได้ {baht(balance)}</p>
      </header>

      <Tabs
        value={method}
        onValueChange={(v) =>
          navigate({ to: "/transfer", search: { method: v as Method } })
        }
      >
        <TabsList className="grid h-auto w-full grid-cols-3 p-1">
          <TabsTrigger value="p2p" className="h-11 gap-1.5">
            <BrandMark id="truemoney" alt="TrueMoney" className="size-5" /> P2P
          </TabsTrigger>
          <TabsTrigger value="promptpay" className="h-11 gap-1.5">
            <BrandMark id="promptpay" alt="PromptPay" className="size-5" /> พร้อมเพย์
          </TabsTrigger>
          <TabsTrigger value="bank" className="h-11 gap-1.5">
            <BrandMark id="KBANK" alt="" className="size-5" /> ธนาคาร
          </TabsTrigger>
        </TabsList>
        <TabsContent value="p2p">
          <div className="glass rounded-2xl p-4 md:p-5">
            <TransferForm method="p2p" />
          </div>
        </TabsContent>
        <TabsContent value="promptpay">
          <div className="glass rounded-2xl p-4 md:p-5">
            <TransferForm method="promptpay" />
          </div>
        </TabsContent>
        <TabsContent value="bank">
          <div className="glass rounded-2xl p-4 md:p-5">
            <TransferForm method="bank" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
