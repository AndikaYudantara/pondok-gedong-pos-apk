import { Printer, Wifi } from "lucide-react";
import type { WifiSale } from "@/lib/pos/types";
import { formatDateTime, formatRupiah } from "@/lib/pos/format";
import { formatDuration } from "@/lib/pos/wifi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface WifiVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: WifiSale | null;
  /** "checkout" shows success header + Voucher Baru, "history" shows close only. */
  mode?: "checkout" | "history";
  onNew?: () => void;
}

export function WifiVoucherDialog({
  open,
  onOpenChange,
  sale,
  mode = "checkout",
  onNew,
}: WifiVoucherDialogProps) {
  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-0">
        <div className="flex flex-col items-center gap-2 px-6 pt-7 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/15">
            <Wifi className="size-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold">
            {mode === "checkout" ? "Voucher Wifi Berhasil" : `Voucher #${sale.number}`}
          </h2>
          {mode === "checkout" && (
            <p className="text-sm text-muted-foreground">Voucher #{sale.number} telah dibuat</p>
          )}
        </div>

        <div className="mx-6 my-4 rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-sm">
          <div className="text-center">
            <p className="font-display text-base font-bold">Pondok Gedong Cafe</p>
            <p className="text-xs text-muted-foreground">Voucher Wifi 📶</p>
          </div>
          <div className="my-3 border-t border-dashed border-border" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>#{sale.number}</span>
            <span>{formatDateTime(sale.createdAt)}</span>
          </div>
          {sale.customer && (
            <p className="mt-1 text-xs text-muted-foreground">Pelanggan: {sale.customer}</p>
          )}

          <div className="my-3 rounded-xl bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Kode Voucher</p>
            <p className="font-mono text-2xl font-extrabold tracking-widest text-primary">
              {sale.code}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Login: username &amp; password = kode di atas
            </p>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Paket</span>
            <span className="font-medium">{sale.packageName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durasi</span>
            <span className="font-medium">{formatDuration(sale.hours)}</span>
          </div>

          <div className="my-3 border-t border-dashed border-border" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatRupiah(sale.price)}</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Metode</span>
            <span>{sale.payment}</span>
          </div>
          {sale.payment === "Tunai" && (
            <>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tunai</span>
                <span>{formatRupiah(sale.cashReceived ?? 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kembalian</span>
                <span>{formatRupiah(sale.change ?? 0)}</span>
              </div>
            </>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Selamat menikmati internet ⛰️
          </p>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <Button variant="outline" size="lg" className="flex-1" onClick={() => window.print()}>
            <Printer className="size-4" />
            Cetak
          </Button>
          {mode === "checkout" ? (
            <Button variant="default" size="lg" className="flex-1" onClick={onNew}>
              Voucher Baru
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
