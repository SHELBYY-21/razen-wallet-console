import { ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRazen } from "@/lib/razen/store";

export function FaceDialog() {
  const open = useRazen((s) => s.faceOpen);
  const seconds = useRazen((s) => s.faceSeconds);
  const resolve = useRazen((s) => s.resolveFace);
  const webhook = useRazen((s) => s.settings.faceauth_webhook_url);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resolve(false)}>
      <DialogContent className="border-danger/30 p-5">
        <DialogHeader>
          <DialogTitle className="font-mono tracking-[0.18em] text-danger">
            FACE AUTH // VERIFY
          </DialogTitle>
          <DialogDescription>
            รายการนี้ต้องยืนยันใบหน้าตามเกณฑ์ TMNOne (เกิน 50,000 บาท/รายการ หรือ 200,000 บาท/วัน)
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex size-20 items-center justify-center rounded-full border border-danger/50 text-danger">
            <ScanFace className="size-10" />
          </div>
          <p className="font-mono text-3xl tabular-nums text-fg">{seconds}s</p>
          <p className="text-center text-xs text-muted">
            เปิดแอป FaceScan แล้วใส่เบอร์ Wallet — เครื่องสแกนไม่จำเป็นต้องอยู่ที่เดียวกัน
          </p>
          {webhook && (
            <p className="text-center font-mono text-[10px] text-subtle">
              webhook → {webhook}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => resolve(true)}>
            ยืนยันแล้ว
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => resolve(false)}>
            ยกเลิก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
