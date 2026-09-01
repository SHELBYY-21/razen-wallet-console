import { useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRazen } from "@/lib/razen/store";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

export function PinDialog() {
  const open = useRazen((s) => s.pinOpen);
  const error = useRazen((s) => s.pinError);
  const submit = useRazen((s) => s.submitPin);
  const cancel = useRazen((s) => s.cancelPin);
  const [digits, setDigits] = useState("");

  useEffect(() => {
    if (open) setDigits("");
  }, [open, error]);

  useEffect(() => {
    if (digits.length === 6) submit(digits);
  }, [digits, submit]);

  function press(k: string) {
    if (k === "del") {
      setDigits((d) => d.slice(0, -1));
      return;
    }
    if (!k) return;
    setDigits((d) => (d.length >= 6 ? d : d + k));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && cancel()}>
      <DialogContent className="p-5" aria-describedby="pin-desc">
        <DialogHeader className="text-center">
          <DialogTitle>ยืนยันรหัส PIN</DialogTitle>
          <DialogDescription id="pin-desc">
            ใส่รหัส 6 หลัก (loginWithPin6) เพื่ออนุมัติรายการ
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-3 rounded-full",
                i < digits.length ? "bg-brand" : "bg-line",
                error && "bg-danger",
              )}
            />
          ))}
        </div>
        {error && (
          <p className="mb-3 text-center text-xs text-danger">รหัสไม่ถูกต้อง ลองอีกครั้ง</p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((k, i) =>
            k === "" ? (
              <span key={i} />
            ) : (
              <button
                key={k + i}
                type="button"
                onClick={() => press(k)}
                className="glass flex h-12 items-center justify-center rounded-lg text-lg font-medium text-fg transition-[transform,background-color] duration-150 ease-out hover:bg-fg/8 active:scale-[0.96]"
              >
                {k === "del" ? <Delete className="size-5" /> : k}
              </button>
            ),
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
