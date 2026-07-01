import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, LayoutGrid, ShieldCheck, Wifi } from "lucide-react";
import logo from "@/assets/logo.png";
import type {
  CartLine,
  MenuItem,
  MenuVariant,
  Order,
  PaymentMethod,
  WifiPackage,
  WifiSale,
} from "@/lib/pos/types";
import { formatRupiah, lineUnitPrice } from "@/lib/pos/format";
import {
  useCategories,
  useMenu,
  useOrders,
  useWifiPackages,
  useWifiSales,
} from "@/lib/pos/storage";
import { generateVoucherCode } from "@/lib/pos/wifi";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { MenuPanel } from "./MenuPanel";
import { CartPanel } from "./CartPanel";
import { CheckoutDialog } from "./CheckoutDialog";
import { ReceiptDialog } from "./ReceiptDialog";
import { HistoryView } from "./HistoryView";
import { AdminDashboard } from "./AdminDashboard";
import { WifiPanel } from "./WifiPanel";

type Tab = "kasir" | "wifi" | "riwayat" | "admin";

const NAV: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "kasir", label: "Kasir", icon: LayoutGrid },
  { id: "wifi", label: "Wifi", icon: Wifi },
  { id: "riwayat", label: "Riwayat", icon: ClipboardList },
  { id: "admin", label: "Admin", icon: ShieldCheck },
];

export function PosApp() {
  const [tab, setTab] = useState<Tab>("kasir");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [adminAuthed, setAdminAuthed] = useState(false);

  const { orders, addOrder, deleteOrder, nextNumber } = useOrders();
  const {
    menu,
    addItem: addMenuItem,
    updateItem,
    deleteItem,
    setStock,
    adjustStock,
    decrementStock,
    replaceMenu,
  } = useMenu();
  const { categories, addCategory, renameCategory, deleteCategory, replaceCategories } =
    useCategories();
  const { packages: wifiPackages, addPackage, updatePackage, deletePackage } = useWifiPackages();
  const { sales: wifiSales, addSale, deleteSale, nextNumber: nextWifiNumber } = useWifiSales();

  const subtotal = useMemo(
    () => cart.reduce((s, l) => s + lineUnitPrice(l) * l.qty, 0),
    [cart],
  );
  const totalQty = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);
  const cartQty = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of cart) map[l.item.id] = (map[l.item.id] ?? 0) + l.qty;
    return map;
  }, [cart]);

  function addItem(item: MenuItem, variant?: MenuVariant) {
    const current = menu.find((m) => m.id === item.id) ?? item;
    const key = variant ? `${item.id}|${variant.id}` : item.id;
    setCart((prev) => {
      const totalForItem = prev
        .filter((l) => l.item.id === item.id)
        .reduce((s, l) => s + l.qty, 0);
      if (current.stock != null && totalForItem >= current.stock) {
        toast.error(`Stok ${current.name} tidak mencukupi`);
        return prev;
      }
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, item: current, qty: l.qty + 1 } : l,
        );
      }
      return [...prev, { key, item: current, variant, qty: 1 }];
    });
  }

  function inc(key: string) {
    setCart((prev) => {
      const line = prev.find((l) => l.key === key);
      if (!line) return prev;
      const current = menu.find((m) => m.id === line.item.id);
      const totalForItem = prev
        .filter((l) => l.item.id === line.item.id)
        .reduce((s, l) => s + l.qty, 0);
      if (current?.stock != null && totalForItem >= current.stock) {
        toast.error(`Stok ${line.item.name} tidak mencukupi`);
        return prev;
      }
      return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
    });
  }
  function dec(key: string) {
    setCart((prev) =>
      prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, l.qty - 1) } : l)),
    );
  }
  function remove(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
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
        name: l.variant ? `${l.item.name} (${l.variant.name})` : l.item.name,
        price: lineUnitPrice(l),
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
    const stockLines: { id: string; qty: number }[] = [];
    for (const l of cart) {
      const e = stockLines.find((s) => s.id === l.item.id);
      if (e) e.qty += l.qty;
      else stockLines.push({ id: l.item.id, qty: l.qty });
    }
    decrementStock(stockLines);
    setLastOrder(order);
    setCheckoutOpen(false);
    setReceiptOpen(true);
    setCart([]);
    toast.success(`Pesanan #${order.number} berhasil disimpan`);
  }

  function sellWifi(
    pkg: WifiPackage,
    data: {
      payment: PaymentMethod;
      cashReceived?: number;
      change?: number;
      customer?: string;
    },
  ): WifiSale {
    const sale: WifiSale = {
      id: crypto.randomUUID(),
      number: nextWifiNumber(),
      createdAt: new Date().toISOString(),
      packageId: pkg.id,
      packageName: pkg.name,
      hours: pkg.hours,
      price: pkg.price,
      code: generateVoucherCode(),
      payment: data.payment,
      cashReceived: data.cashReceived,
      change: data.change,
      customer: data.customer,
    };
    addSale(sale);
    toast.success(`Voucher wifi ${sale.code} berhasil dibuat`);
    return sale;
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
            <section className="min-w-0 flex-1 overflow-hidden p-4 pb-4 lg:pb-4">
              <MenuPanel
                menu={menu}
                categories={categories}
                onAdd={addItem}
                cartQty={cartQty}
              />
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

        {tab === "wifi" && (
          <section className="flex-1 overflow-y-auto p-4 pb-4 lg:pb-4">
            <div className="mx-auto w-full max-w-3xl">
              <WifiPanel packages={wifiPackages} onSell={sellWifi} />
            </div>
          </section>
        )}

        {tab === "riwayat" && (
          <section className="flex-1 overflow-y-auto p-4 pb-4 lg:pb-4">
            <HistoryView orders={orders} onDelete={deleteOrder} />
          </section>
        )}


        {tab === "admin" && (
          <section className="flex-1 overflow-y-auto p-4 pb-4 lg:pb-4">
            <AdminDashboard
              authed={adminAuthed}
              onAuth={setAdminAuthed}
              orders={orders}
              menu={menu}
              categories={categories}
              onAddItem={addMenuItem}
              onUpdateItem={updateItem}
              onDeleteItem={deleteItem}
              onSetStock={setStock}
              onAdjustStock={adjustStock}
              onAddCategory={addCategory}
              onRenameCategory={renameCategory}
              onDeleteCategory={deleteCategory}
              onRestoreBackup={(m, c) => {
                replaceMenu(m);
                replaceCategories(c);
              }}
              wifiSales={wifiSales}
              wifiPackages={wifiPackages}
              onAddWifiPackage={addPackage}
              onUpdateWifiPackage={updatePackage}
              onDeleteWifiPackage={deletePackage}
              onDeleteWifiSale={deleteSale}
            />
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
        <SheetContent side="bottom" className="h-[88dvh] rounded-t-3xl p-4">
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
