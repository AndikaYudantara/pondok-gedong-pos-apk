import { useState } from "react";
import { Clock, Receipt, Trash2 } from "lucide-react";
import type { Order } from "@/lib/pos/types";
import { formatDateTime, formatRupiah, formatTime } from "@/lib/pos/format";
import { Button } from "@/components/ui/button";
import { ReceiptDialog } from "@/components/pos/ReceiptDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HistoryViewProps {
  orders: Order[];
  onDelete: (id: string) => void;
}

export function HistoryView({ orders, onDelete }: HistoryViewProps) {
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center text-muted-foreground">
        <Receipt className="size-12 opacity-40" />
        <p className="font-medium">Belum ada transaksi</p>
        <p className="text-sm">Riwayat pesanan akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-2xl space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-(--shadow-card)"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold">#{order.number}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {order.payment}
                  </span>
                </div>
                {order.customer && (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{order.customer}</p>
                )}
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-bold text-primary">{formatRupiah(order.total)}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setPendingDelete(order)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <div className="mt-3 border-t border-dashed border-border pt-2">
              <ul className="space-y-0.5 text-sm">
                {order.lines.map((l) => (
                  <li key={l.id} className="flex justify-between text-muted-foreground">
                    <span>
                      {l.qty}× {l.name}
                    </span>
                    <span className="tabular-nums">{formatRupiah(l.price * l.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setReceiptOrder(order)}
              >
                <Receipt className="size-4" />
                Lihat Nota
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ReceiptDialog
        open={!!receiptOrder}
        onOpenChange={(o) => !o && setReceiptOrder(null)}
        order={receiptOrder}
        mode="history"
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus transaksi #{pendingDelete?.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi {pendingDelete && formatTime(pendingDelete.createdAt)} senilai{" "}
              {pendingDelete && formatRupiah(pendingDelete.total)} akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
