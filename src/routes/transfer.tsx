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
    <div className="mx-auto max-w-xl space-y-4">
      <div className="panel-hero flex items-end justify-between gap-4 px-5 py-5">
        <div>
          <p className="kicker">จ่ายออก</p>
          <p className="mt-2 text-sm text-muted">ยอดใช้ได้</p>
        </div>
        <p className="font-display text-2xl font-semibold tabular-nums text-brand">{baht(balance)}</p>
      </div>

      <Tabs
        value={method}
        onValueChange={(v) =>
          navigate({ to: "/transfer", search: { method: v as Method } })
        }
      >
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl p-1">
          <TabsTrigger value="p2p" className="h-11 gap-1.5 rounded-lg">
            <BrandMark id="truemoney" alt="TrueMoney" className="size-5" /> P2P
          </TabsTrigger>
          <TabsTrigger value="promptpay" className="h-11 gap-1.5 rounded-lg">
            <BrandMark id="promptpay" alt="PromptPay" className="size-5" /> พร้อมเพย์
          </TabsTrigger>
          <TabsTrigger value="bank" className="h-11 gap-1.5 rounded-lg">
            <BrandMark id="KBANK" alt="" className="size-5" /> ธนาคาร
          </TabsTrigger>
        </TabsList>
        <TabsContent value="p2p">
          <div className="panel p-5">
            <TransferForm method="p2p" />
          </div>
        </TabsContent>
        <TabsContent value="promptpay">
          <div className="panel p-5">
            <TransferForm method="promptpay" />
          </div>
        </TabsContent>
        <TabsContent value="bank">
          <div className="panel p-5">
            <TransferForm method="bank" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
