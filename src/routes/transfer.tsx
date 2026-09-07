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
    <div className="stack-dense mx-auto max-w-xl">
      <div className="tmn-card flex items-center justify-between gap-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <BrandMark id="truemoney" alt="TrueMoney" className="size-10 rounded-full bg-white p-0.5" />
          <div>
            <p className="text-xs tracking-[0.16em] uppercase text-white/70">TrueMoney Wallet</p>
            <p className="mt-1 text-sm text-white/80">ยอดพร้อมโอน</p>
          </div>
        </div>
        <p className="font-sans text-2xl font-semibold tabular-nums">{baht(balance)}</p>
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
