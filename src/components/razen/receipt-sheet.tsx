import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { bankByCode } from "@/lib/razen/banks";
import { baht, formatDateTime } from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";
import type { Transaction } from "@/lib/razen/types";

const METHOD_LABEL: Record<string, string> = {
  p2p: "โอน P2P",
  promptpay: "พร้อมเพย์",
  bank: "โอนธนาคาร",
  gift: "ซองของขวัญ",
};

export function ReceiptSheet() {
  const id = useRazen((s) => s.lastReceiptId);
  const txs = useRazen((s) => s.txs);
  const close = useRazen((s) => s.setLastReceipt);
  const tx = txs.find((t) => t.id === id) ?? null;
  return (
    <Sheet open={!!tx} onOpenChange={(o) => !o && close(null)}>
      <SheetContent side="bottom" className="px-0 pb-8">
        <SheetHeader>
          <SheetTitle>ใบรายการ</SheetTitle>
        </SheetHeader>
        {tx && <ReceiptBody tx={tx} />}
      </SheetContent>
    </Sheet>
  );
}

function ReceiptBody({ tx }: { tx: Transaction }) {
  const [copied, setCopied] = useState(false);
  const bank = bankByCode(tx.bankCode);
  async function copy() {
    try {
      await navigator.clipboard.writeText(tx.ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="space-y-4 px-5 pt-4">
      <div className="rounded-xl bg-elevated p-5 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-in/15 text-in">
          <Check className="size-6" />
        </div>
        <p className="text-xs text-muted">
          {tx.direction === "out" ? "ยอดที่ส่ง" : "ยอดที่รับ"}
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-fg">
          {baht(tx.amount)}
        </p>
        {tx.fee > 0 && (
          <p className="mt-1 text-xs text-muted">รวมค่าธรรมเนียม {baht(tx.fee)}</p>
        )}
      </div>
      <div className="space-y-3 text-sm">
        <Row label="ผู้รับ / ผู้ส่ง" value={tx.counterpart} />
        <Row label="ช่องทาง" value={METHOD_LABEL[tx.method]} />
        {bank && <Row label="ธนาคาร" value={bank.short} />}
        <Row label="รายละเอียด" value={tx.counterpartMeta} />
        {tx.note && <Row label="บันทึก" value={tx.note} />}
        <Row label="เวลา" value={formatDateTime(tx.createdAt)} />
        <Separator />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted">เลขอ้างอิง</p>
            <p className="font-medium tabular-nums">{tx.ref}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={copy}>
            {copied ? <Check /> : <Copy />}
            คัดลอก
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Badge variant={tx.status === "completed" ? "in" : "out"}>
          {tx.status === "completed"
            ? "รายการสำเร็จ"
            : tx.status === "processing"
              ? "กำลังดำเนินการ"
              : "รอตรวจสอบ"}
        </Badge>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="text-right text-fg">{value}</span>
    </div>
  );
}
