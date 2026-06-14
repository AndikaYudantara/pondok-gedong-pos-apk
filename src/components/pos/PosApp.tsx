import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, LayoutGrid, Wallet } from "lucide-react";
import logo from "@/assets/logo.png";
import type { CartLine, MenuItem, Order, PaymentMethod } from "@/lib/pos/types";
import { formatRupiah } from "@/lib/pos/format";
import { useOrders } from "@/lib/pos/storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { MenuPanel } from "./MenuPanel";
import { CartPanel } from "./CartPanel";
import { CheckoutDialog } from "./CheckoutDialog";
import { ReceiptDialog } from "./ReceiptDialog";
import { HistoryView } from "./HistoryView";
import { ReportView } from "./ReportView";

type Tab = "kasir" | "riwayat" | "laporan";

const NAV: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "kasir", label: "Kasir", icon: LayoutGrid },
  { id: "riwayat", label: "Riwayat", icon: ClipboardList },
  { id: "laporan", label: "Laporan", icon: Wallet },
];

export function PosApp() {
  const [tab, setTab] = useState<Tab>("kasir");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const { orders, addOrder, deleteOrder, nextNumber } = useOrders();

  const subtotal = useMemo(
    () => cart.reduce((s, l) => s + l.item.price * l.qty, 0),
    [cart],
  );
  const totalQty = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);
  const cartQty = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of cart) map[l.item.id] = l.qty;
    return map;
  }, [cart]);

  function addItem(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { item, qty: 1 }];
    });
  }

  function inc(id: string) {
    setCart((prev) => prev.map((l) => (l.item.id === id ? { ...l, qty: l.qty + 1 } : l)));
  }
  function dec(id: string) {
    setCart((prev) =>
      prev.map((l) => (l.item.id === id ? { ...l, qty: Math.max(1, l.qty - 1) } : l)),
    );
  }
  function remove(id: string) {
    setCart((prev) => prev.filter((l) => l.item.id !== id));
  }
  function clear() {
    setCart([]);
  }

  function openCheckout() {
    setMobileCartOpen(false);
    setCheckoutOpen(true);
  }

  function confirmPayment(data: {
    payment: PaymentMethod;
    cashReceived?: number;
    change?: number;
    customer?: string;
  }) {
    const order: Order = {
      id: crypto.randomUUID(),
      number: nextNumber(),
      createdAt: new Date().toISOString(),
      lines: cart.map((l) => ({
        id: l.item.id,
        name: l.item.name,
        price: l.item.price,
        qty: l.qty,
      })),
      subtotal,
      total: subtotal,
      payment: data.payment,
      cashReceived: data.cashReceived,
      change: data.change,
      customer: data.customer,
    };
    addOrder(order);
    setLastOrder(order);
    setCheckoutOpen(false);
    setReceiptOpen(true);
    setCart([]);
    toast.success(`Pesanan #${order.number} berhasil disimpan`);
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="z-20 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Logo Pondok Gedong Cafe" width={40} height={40} className="size-9" />
          <div className="leading-tight">
            <p className="font-display text-base font-bold">Pondok Gedong Cafe</p>
            <p className="text-[11px] text-muted-foreground">POS · Cafe di Atas Gunung ⛰️</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full bg-secondary p-1 sm:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                tab === n.id
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Body */}
      <main className="flex min-h-0 flex-1">
        {tab === "kasir" && (
          <>
            <section className="min-w-0 flex-1 overflow-hidden p-4 pb-24 lg:pb-4">
              <MenuPanel onAdd={addItem} cartQty={cartQty} />
            </section>
            <aside className="hidden w-[22rem] shrink-0 border-l border-border bg-card/40 p-4 lg:flex lg:flex-col">
              <CartPanel
                cart={cart}
                subtotal={subtotal}
                onInc={inc}
                onDec={dec}
                onRemove={remove}
                onClear={clear}
                onCheckout={openCheckout}
              />
            </aside>
          </>
        )}

        {tab === "riwayat" && (
          <section className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
            <HistoryView orders={orders} onDelete={deleteOrder} />
          </section>
        )}

        {tab === "laporan" && (
          <section className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
            <ReportView orders={orders} />
          </section>
        )}
      </main>

      {/* Mobile floating cart bar (kasir only) */}
      {tab === "kasir" && cart.length > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="fixed inset-x-4 bottom-16 z-30 flex items-center justify-between rounded-2xl bg-success px-5 py-3.5 text-success-foreground shadow-[var(--shadow-lift)] lg:hidden"
        >
          <span className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-success-foreground/20 text-sm">
              {totalQty}
            </span>
            Lihat Pesanan
          </span>
          <span className="font-bold">{formatRupiah(subtotal)}</span>
        </button>
      )}

      {/* Mobile bottom nav */}
      <nav className="z-30 flex shrink-0 items-center justify-around border-t border-border bg-card sm:hidden">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              tab === n.id ? "text-primary" : "text-muted-foreground",
            )}
          >
            <n.icon className="size-5" />
            {n.label}
          </button>
        ))}
      </nav>

      {/* Mobile cart sheet */}
      <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
        <SheetContent side="bottom" className="h-[85dvh] rounded-t-3xl p-4">
          <SheetTitle className="sr-only">Pesanan</SheetTitle>
          <CartPanel
            cart={cart}
            subtotal={subtotal}
            onInc={inc}
            onDec={dec}
            onRemove={remove}
            onClear={clear}
            onCheckout={openCheckout}
          />
        </SheetContent>
      </Sheet>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        total={subtotal}
        onConfirm={confirmPayment}
      />
      <ReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        order={lastOrder}
        onNewOrder={() => setReceiptOpen(false)}
      />
    </div>
  );
}

