import { CheckCircle2, Printer } from "lucide-react";
import type { Order } from "@/lib/pos/types";
import { formatDateTime, formatRupiah } from "@/lib/pos/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onNewOrder: () => void;
}

export function ReceiptDialog({ open, onOpenChange, order, onNewOrder }: ReceiptDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-0">
        <div className="flex flex-col items-center gap-2 px-6 pt-7 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <h2 className="text-lg font-bold">Pembayaran Berhasil</h2>
          <p className="text-sm text-muted-foreground">Pesanan #{order.number} telah disimpan</p>
        </div>

        <div className="mx-6 my-4 rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-sm">
          <div className="text-center">
            <p className="font-display text-base font-bold">Pondok Gedong Cafe</p>
            <p className="text-xs text-muted-foreground">Cafe di Atas Gunung ⛰️</p>
          </div>
          <div className="my-3 border-t border-dashed border-border" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>#{order.number}</span>
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
          {order.customer && (
            <p className="mt-1 text-xs text-muted-foreground">Pelanggan: {order.customer}</p>
          )}
          <div className="my-3 border-t border-dashed border-border" />

          <ul className="space-y-1.5">
            {order.lines.map((l) => (
              <li key={l.id} className="flex justify-between gap-2">
                <span className="min-w-0">
                  <span className="font-medium">{l.qty}×</span> {l.name}
                </span>
                <span className="shrink-0 tabular-nums">{formatRupiah(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>

          <div className="my-3 border-t border-dashed border-border" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Metode</span>
            <span>{order.payment}</span>
          </div>
          {order.payment === "Tunai" && (
            <>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tunai</span>
                <span>{formatRupiah(order.cashReceived ?? 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kembalian</span>
                <span>{formatRupiah(order.change ?? 0)}</span>
              </div>
            </>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Terima kasih & sampai jumpa lagi 🌿
          </p>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            Cetak
          </Button>
          <Button variant="default" size="lg" className="flex-1" onClick={onNewOrder}>
            Pesanan Baru
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
