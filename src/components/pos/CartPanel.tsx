import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { CartLine } from "@/lib/pos/types";
import { formatRupiah } from "@/lib/pos/format";
import { Button } from "@/components/ui/button";

interface CartPanelProps {
  cart: CartLine[];
  subtotal: number;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export function CartPanel({
  cart,
  subtotal,
  onInc,
  onDec,
  onRemove,
  onClear,
  onCheckout,
}: CartPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ShoppingBag className="size-5 text-primary" />
          Pesanan
        </h2>
        {cart.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            Kosongkan
          </button>
        )}
      </div>

      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-1">
        {cart.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <ShoppingBag className="size-10 opacity-40" />
            <p className="text-sm">Belum ada pesanan.</p>
            <p className="text-xs">Pilih menu untuk mulai.</p>
          </div>
        )}

        {cart.map((line) => (
          <div
            key={line.item.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
              {line.item.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{line.item.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatRupiah(line.item.price)} × {line.qty}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="secondary"
                className="size-7 rounded-lg"
                onClick={() => (line.qty > 1 ? onDec(line.item.id) : onRemove(line.item.id))}
              >
                {line.qty > 1 ? <Minus /> : <Trash2 className="text-destructive" />}
              </Button>
              <span className="w-5 text-center text-sm font-bold tabular-nums">{line.qty}</span>
              <Button
                size="icon"
                variant="secondary"
                className="size-7 rounded-lg"
                onClick={() => onInc(line.item.id)}
              >
                <Plus />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-3 border-t border-border pt-3">
        <div className="flex items-center justify-between text-base font-bold">
          <span>Total</span>
          <span className="text-primary">{formatRupiah(subtotal)}</span>
        </div>
        <Button
          variant="success"
          size="xl"
          className="w-full"
          disabled={cart.length === 0}
          onClick={onCheckout}
        >
          Bayar · {formatRupiah(subtotal)}
        </Button>
      </div>
    </div>
  );
}
