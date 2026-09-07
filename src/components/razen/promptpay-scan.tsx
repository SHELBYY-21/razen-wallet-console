import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { parsePromptPayPayload } from "@/lib/razen/promptpay-qr";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/razen/brand-mark";

type Props = { onHit: (value: string) => void };

export function PromptPayScan({ onHit }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!open) return;
    let dead = false;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (dead) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const tick = () => {
          if (dead) return;
          if (video.readyState >= 2) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(img.data, img.width, img.height);
            if (code?.data) {
              const parsed = parsePromptPayPayload(code.data);
              if (parsed.ok) {
                onHit(parsed.hit.value);
                setOpen(false);
                return;
              }
              setErr(parsed.error);
            }
          }
          raf = requestAnimationFrame(tick);
        };
        let raf = requestAnimationFrame(tick);
        stopRef.current = () => {
          dead = true;
          cancelAnimationFrame(raf);
          stream.getTracks().forEach((t) => t.stop());
        };
      } catch {
        setErr("เปิดกล้องไม่ได้ — วางรูป QR แทน");
      }
    })();

    return () => {
      dead = true;
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [open, onHit]);

  async function onFile(file: File) {
    setErr("");
    const bmp = await createImageBitmap(file);
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(bmp, 0, 0);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, img.width, img.height);
    if (!code?.data) {
      setErr("อ่าน QR จากรูปไม่ได้");
      return;
    }
    const parsed = parsePromptPayPayload(code.data);
    if (!parsed.ok) {
      setErr(parsed.error);
      return;
    }
    onHit(parsed.hit.value);
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant="outline" className="shrink-0 gap-2" onClick={() => { setErr(""); setOpen(true); }}>
        <BrandMark id="promptpay" alt="" className="size-5" />
        สแกน QR
      </Button>
      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)] bg-black" role="dialog" aria-modal="true" aria-labelledby="scan-title">
          <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgb(0_0_0/0.55)_39%)]" />
          <div className="absolute left-1/2 top-1/2 size-[min(72vw,280px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-white/80" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <p id="scan-title" className="flex items-center gap-2 text-sm font-medium text-white">
              <BrandMark id="promptpay" alt="" className="size-6" />
              สแกน QR พร้อมเพย์
            </p>
            <button type="button" className="min-h-11 px-3 text-sm text-white/80" onClick={() => setOpen(false)} aria-label="ปิดหน้าต่างสแกน">
              ปิด
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 pb-8">
            {err && (
              <p role="alert" className="text-center text-sm text-red-300">
                {err}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
                วางรูป QR
              </Button>
            </div>
            <p className="text-center text-xs text-white/60">สแกนแล้วใส่เบอร์ — กดถัดไปถึงโอน</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
        </div>
      )}
    </>
  );
}
