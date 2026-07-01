import { CheckCircle2, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/pos/types";
import { formatDateTime, formatRupiah } from "@/lib/pos/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Printer as PrinterPlugin } from "@/plugins/printer";
import { Preferences } from "@capacitor/preferences";
import { buildReceipt } from "@/lib/pos/printer";
import { toast } from "sonner";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null; /** Called when finishing a fresh checkout. Omit in history mode. */
  onNewOrder?: () => void;
  /** "checkout" shows success header + Pesanan Baru, "history" shows close only */
  mode?: "checkout" | "history";
}

export function ReceiptDialog({
  open,
  onOpenChange,
  order,
  onNewOrder,
  mode = "checkout",
}: ReceiptDialogProps) {
  if (!order) return null;

  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!open || !order) {
      return;
    }

    printReceipt();
  }, [open, order]);

  async function printReceipt() {
    if (printing) {
      return;
    }
    try {
      const mac = await Preferences.get({
        key: "printer_mac",
      });

      if (!mac.value) {
        toast.error("Printer belum terhubung");
        return;
      }

      const status = await PrinterPlugin.isConnected();

      if (!status.connected) {
        await PrinterPlugin.connect({
          macAddress: mac.value,
        });
      }

      await PrinterPlugin.printReceipt({
        text: buildReceipt(order!),
      });

      toast.success("Struk berhasil dicetak");
    } catch (error) {
      console.error(error);

      toast.error("Gagal mencetak");
    } finally {
      setPrinting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-0">
        {mode === "checkout" ? (
          <div className="flex flex-col items-center gap-2 px-6 pt-7 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="size-8 text-success" />
            </div>
            <h2 className="text-lg font-bold">Pembayaran Berhasil</h2>
            <p className="text-sm text-muted-foreground">Pesanan #{order.number} telah disimpan</p>
          </div>
        ) : (
          <div className="px-6 pt-7 text-center">
            <h2 className="text-lg font-bold">Nota Pesanan #{order.number}</h2>
          </div>
        )}

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
            onClick={printReceipt}
            disabled={printing}
          >
            <Printer className="size-4" />
            Cetak
          </Button>
          {mode === "checkout" ? (
            <Button variant="default" size="lg" className="flex-1" onClick={onNewOrder}>
              Pesanan Baru
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
