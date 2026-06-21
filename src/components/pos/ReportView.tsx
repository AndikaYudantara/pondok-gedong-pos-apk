import { useMemo, useState } from "react";
import { ChevronRight, Coins, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import type { Order } from "@/lib/pos/types";
import {
  formatDate,
  formatRupiah,
  formatTime,
  isSameDay,
  isSameMonth,
  toDateInputValue,
} from "@/lib/pos/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReportViewProps {
  orders: Order[];
}

type DetailKey = "omzet" | "transaksi" | "item" | "total" | null;

/** Remove a trailing " (variant)" suffix to merge variants of the same item. */
function baseName(name: string): string {
  return name.replace(/\s*\([^()]*\)\s*$/, "").trim();
}

export function ReportView({ orders }: ReportViewProps) {
  const [selected, setSelected] = useState(() => new Date());
  const [detail, setDetail] = useState<DetailKey>(null);

  const isToday = isSameDay(selected.toISOString(), new Date());

  const day = useMemo(() => {
    const days = orders.filter((o) => isSameDay(o.createdAt, selected));
    const revenue = days.reduce((s, o) => s + o.total, 0);
    const items = days.reduce((s, o) => s + o.lines.reduce((a, l) => a + l.qty, 0), 0);

    // Variants merged (group by base item name).
    const mergedMap = new Map<string, { name: string; qty: number; revenue: number }>();
    // Variants separated (group by full line name including variant).
    const sepMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of days) {
      for (const l of o.lines) {
        const bn = baseName(l.name);
        const m = mergedMap.get(bn) ?? { name: bn, qty: 0, revenue: 0 };
        m.qty += l.qty;
        m.revenue += l.price * l.qty;
        mergedMap.set(bn, m);

        const s = sepMap.get(l.name) ?? { name: l.name, qty: 0, revenue: 0 };
        s.qty += l.qty;
        s.revenue += l.price * l.qty;
        sepMap.set(l.name, s);
      }
    }
    const merged = [...mergedMap.values()].sort((a, b) => b.revenue - a.revenue);
    const separated = [...sepMap.values()].sort((a, b) => b.qty - a.qty);
    const best = merged.slice(0, 5);

    const tunai = days.filter((o) => o.payment === "Tunai").reduce((s, o) => s + o.total, 0);
    const qris = days.filter((o) => o.payment === "QRIS").reduce((s, o) => s + o.total, 0);

    const transactions = [...days].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      count: days.length,
      revenue,
      items,
      merged,
      separated,
      best,
      tunai,
      qris,
      transactions,
    };
  }, [orders, selected]);

  const month = useMemo(() => {
    const inMonth = orders.filter((o) => isSameMonth(o.createdAt, selected));
    const revenue = inMonth.reduce((s, o) => s + o.total, 0);
    const count = inMonth.length;
    // Per-day breakdown.
    const byDay = new Map<string, { date: string; revenue: number; count: number }>();
    for (const o of inMonth) {
      const d = new Date(o.createdAt);
      const key = toDateInputValue(d);
      const cur = byDay.get(key) ?? { date: key, revenue: 0, count: 0 };
      cur.revenue += o.total;
      cur.count += 1;
      byDay.set(key, cur);
    }
    const days = [...byDay.values()].sort((a, b) => b.date.localeCompare(a.date));
    const label = selected.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    return { revenue, count, days, label };
  }, [orders, selected]);

  const allRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);

  const dayLabel = isToday ? "Hari Ini" : formatDate(selected);

  const stats = [
    {
      key: "omzet" as const,
      label: `Omzet ${isToday ? "Hari Ini" : "Tanggal Ini"}`,
      value: formatRupiah(day.revenue),
      icon: Coins,
      tone: "primary" as const,
    },
    {
      key: "transaksi" as const,
      label: `Transaksi ${isToday ? "Hari Ini" : "Tanggal Ini"}`,
      value: String(day.count),
      icon: Receipt,
      tone: "accent" as const,
    },
    {
      key: "item" as const,
      label: "Item Terjual",
      value: String(day.items),
      icon: ShoppingBag,
      tone: "primary" as const,
    },
    {
      key: "total" as const,
      label: "Total Omzet",
      value: formatRupiah(allRevenue),
      icon: TrendingUp,
      tone: "accent" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Date selector */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-(--shadow-card)">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Lihat laporan tanggal</p>
          <p className="text-sm font-bold capitalize">{formatDate(selected)}</p>
        </div>
        <input
          type="date"
          max={toDateInputValue(new Date())}
          value={toDateInputValue(selected)}
          onChange={(e) => {
            if (!e.target.value) return;
            const [y, m, d] = e.target.value.split("-").map(Number);
            setSelected(new Date(y, m - 1, d));
          }}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        {!isToday && (
          <button
            onClick={() => setSelected(new Date())}
            className="rounded-xl bg-secondary px-3 py-2 text-sm font-semibold"
          >
            Hari Ini
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.key}
            onClick={() => setDetail(s.key)}
            className="group rounded-2xl border border-border bg-card p-4 text-left shadow-(--shadow-card) transition hover:border-primary/40 hover:shadow-md"
          >
            <div
              className={
                "mb-2 flex size-9 items-center justify-center rounded-xl " +
                (s.tone === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent")
              }
            >
              <s.icon className="size-5" />
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-lg font-bold leading-tight">{s.value}</p>
            <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-primary opacity-80">
              Detail <ChevronRight className="size-3" />
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-(--shadow-card)">
          <h3 className="mb-3 font-bold">Metode Pembayaran ({dayLabel})</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tunai</span>
              <span className="font-semibold">{formatRupiah(day.tunai)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">QRIS</span>
              <span className="font-semibold">{formatRupiah(day.qris)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-(--shadow-card)">
          <h3 className="mb-3 font-bold">Menu Terlaris ({dayLabel})</h3>
          {day.best.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {day.best.map((b, i) => (
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

      {/* ===== Detail dialogs ===== */}

      {/* 1. Omzet — semua item terjual (varian digabung) */}
      <Dialog open={detail === "omzet"} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Omzet {dayLabel}</DialogTitle>
            <DialogDescription className="capitalize">{formatDate(selected)}</DialogDescription>
          </DialogHeader>
          {day.merged.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada penjualan.</p>
          ) : (
            <div className="space-y-1">
              {day.merged.map((m) => (
                <div
                  key={m.name}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm odd:bg-secondary/40"
                >
                  <span className="flex-1 truncate">{m.name}</span>
                  <span className="tabular-nums text-muted-foreground">{m.qty}x</span>
                  <span className="w-28 text-right font-semibold tabular-nums">
                    {formatRupiah(m.revenue)}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3 font-bold">
                <span>Total Omzet</span>
                <span className="tabular-nums">{formatRupiah(day.revenue)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Transaksi — riwayat transaksi */}
      <Dialog open={detail === "transaksi"} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaksi {dayLabel}</DialogTitle>
            <DialogDescription>
              {day.count} transaksi · {formatRupiah(day.revenue)}
            </DialogDescription>
          </DialogHeader>
          {day.transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-2">
              {day.transactions.map((o) => (
                <div key={o.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">#{o.number}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(o.createdAt)} · {o.payment}
                    </span>
                  </div>
                  {o.customer && <p className="text-xs text-muted-foreground">{o.customer}</p>}
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {o.lines.map((l, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span className="truncate">
                          {l.qty}x {l.name}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatRupiah(l.price * l.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-1 flex justify-between border-t border-border pt-1 text-sm font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatRupiah(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. Item terjual — jumlah item (varian dipisah) */}
      <Dialog open={detail === "item"} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Item Terjual {dayLabel}</DialogTitle>
            <DialogDescription>{day.items} item terjual (varian dipisah)</DialogDescription>
          </DialogHeader>
          {day.separated.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada penjualan.</p>
          ) : (
            <div className="space-y-1">
              {day.separated.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm odd:bg-secondary/40"
                >
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="w-16 text-right font-semibold tabular-nums">{s.qty}x</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3 font-bold">
                <span>Total Item</span>
                <span className="tabular-nums">{day.items}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. Total omzet — seluruh omzet bulan ini */}
      <Dialog open={detail === "total"} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="capitalize">Omzet Bulan {month.label}</DialogTitle>
            <DialogDescription>
              {month.count} transaksi · {formatRupiah(month.revenue)}
            </DialogDescription>
          </DialogHeader>
          {month.days.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada penjualan bulan ini.
            </p>
          ) : (
            <div className="space-y-1">
              {month.days.map((d) => {
                const [, m, day2] = d.date.split("-");
                return (
                  <button
                    key={d.date}
                    onClick={() => {
                      const [y, mm, dd] = d.date.split("-").map(Number);
                      setSelected(new Date(y, mm - 1, dd));
                      setDetail(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm odd:bg-secondary/40 hover:bg-secondary"
                  >
                    <span className="flex-1 tabular-nums">
                      {day2}/{m}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{d.count} trx</span>
                    <span className="w-28 text-right font-semibold tabular-nums">
                      {formatRupiah(d.revenue)}
                    </span>
                  </button>
                );
              })}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3 font-bold">
                <span>Total Bulan Ini</span>
                <span className="tabular-nums">{formatRupiah(month.revenue)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
