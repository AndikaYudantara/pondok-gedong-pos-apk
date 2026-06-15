import { useEffect, useMemo, useState } from "react";
import { Banknote, QrCode } from "lucide-react";
import type { PaymentMethod } from "@/lib/pos/types";
import { formatRupiah } from "@/lib/pos/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirm: (data: {
    payment: PaymentMethod;
    cashReceived?: number;
    change?: number;
    customer?: string;
  }) => void;
}

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 150000];

export function CheckoutDialog({ open, onOpenChange, total, onConfirm }: CheckoutDialogProps) {
  const [payment, setPayment] = useState<PaymentMethod>("Tunai");
  const [cash, setCash] = useState<string>("");
  const [customer, setCustomer] = useState("");

  useEffect(() => {
    if (open) {
      setPayment("Tunai");
      setCash("");
      setCustomer("");
    }
  }, [open]);

  const cashNum = Number(cash) || 0;
  const change = useMemo(() => cashNum - total, [cashNum, total]);
  const canPay = payment === "QRIS" || cashNum >= total;

  function handleConfirm() {
    if (!canPay) return;
    onConfirm({
      payment,
      customer: customer.trim() || undefined,
      cashReceived: payment === "Tunai" ? cashNum : undefined,
      change: payment === "Tunai" ? change : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Pembayaran</DialogTitle>
          <DialogDescription>
            Total tagihan <span className="font-bold text-primary">{formatRupiah(total)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer">Nama Pelanggan (opsional)</Label>
            <Input
              id="customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="cth. Meja 3 / Budi"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Metode Pembayaran</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["Tunai", "QRIS"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setPayment(m)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-colors",
                    payment === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {m === "Tunai" ? <Banknote className="size-4" /> : <QrCode className="size-4" />}
                  {m}
                </button>
              ))}
            </div>
          </div>

          {payment === "Tunai" && (
            <div className="space-y-2">
              <Label htmlFor="cash">Uang Diterima</Label>
              <Input
                id="cash"
                inputMode="numeric"
                value={cash}
                onChange={(e) => setCash(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="h-12 rounded-xl text-lg font-bold"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCash(String(total))}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/70"
                >
                  Uang Pas
                </button>
                {QUICK_AMOUNTS.filter((a) => a >= total).map((a) => (
                  <button
                    key={a}
                    onClick={() => setCash(String(a))}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/70"
                  >
                    {formatRupiah(a)}
                  </button>
                ))}
              </div>
              {cashNum > 0 && (
                <div
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold",
                    change >= 0
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  <span>{change >= 0 ? "Kembalian" : "Kurang"}</span>
                  <span>{formatRupiah(Math.abs(change))}</span>
                </div>
              )}
            </div>
          )}

          <Button
            variant="success"
            size="xl"
            className="w-full"
            disabled={!canPay}
            onClick={handleConfirm}
          >
            Selesaikan Pesanan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
