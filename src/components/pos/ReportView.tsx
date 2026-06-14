import { useMemo } from "react";
import { Coins, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import type { Order } from "@/lib/pos/types";
import { formatRupiah, isSameDay } from "@/lib/pos/format";

interface ReportViewProps {
  orders: Order[];
}

export function ReportView({ orders }: ReportViewProps) {
  const today = useMemo(() => {
    const ref = new Date();
    const todays = orders.filter((o) => isSameDay(o.createdAt, ref));
    const revenue = todays.reduce((s, o) => s + o.total, 0);
    const items = todays.reduce((s, o) => s + o.lines.reduce((a, l) => a + l.qty, 0), 0);

    const tally = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of todays) {
      for (const l of o.lines) {
        const cur = tally.get(l.name) ?? { name: l.name, qty: 0, revenue: 0 };
        cur.qty += l.qty;
        cur.revenue += l.price * l.qty;
        tally.set(l.name, cur);
      }
    }
    const best = [...tally.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    const tunai = todays.filter((o) => o.payment === "Tunai").reduce((s, o) => s + o.total, 0);
    const qris = todays.filter((o) => o.payment === "QRIS").reduce((s, o) => s + o.total, 0);

    return { count: todays.length, revenue, items, best, tunai, qris };
  }, [orders]);

  const allRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);

  const stats = [
    { label: "Omzet Hari Ini", value: formatRupiah(today.revenue), icon: Coins, tone: "primary" },
    { label: "Transaksi Hari Ini", value: String(today.count), icon: Receipt, tone: "accent" },
    { label: "Item Terjual", value: String(today.items), icon: ShoppingBag, tone: "primary" },
    { label: "Total Omzet", value: formatRupiah(allRevenue), icon: TrendingUp, tone: "accent" },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
          >
            <div
              className={
                "mb-2 flex size-9 items-center justify-center rounded-xl " +
                (s.tone === "primary"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/10 text-accent")
              }
            >
              <s.icon className="size-5" />
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-lg font-bold leading-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 font-bold">Metode Pembayaran (Hari Ini)</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tunai</span>
              <span className="font-semibold">{formatRupiah(today.tunai)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">QRIS</span>
              <span className="font-semibold">{formatRupiah(today.qris)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 font-bold">Menu Terlaris (Hari Ini)</h3>
          {today.best.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada penjualan hari ini.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {today.best.map((b, i) => (
                <li key={b.name} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{b.name}</span>
                  <span className="font-semibold tabular-nums">{b.qty}x</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
