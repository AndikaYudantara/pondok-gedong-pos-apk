import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { type Category, type MenuItem, type MenuVariant } from "@/lib/pos/types";
import { formatRupiah, unitPrice } from "@/lib/pos/format";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MenuPanelProps {
  menu: MenuItem[];
  categories: Category[];
  onAdd: (item: MenuItem, variant?: MenuVariant) => void;
  cartQty: Record<string, number>;
}

export function MenuPanel({ menu, categories, onAdd, cartQty }: MenuPanelProps) {
  const [active, setActive] = useState<Category | "Semua">("Semua");
  const [query, setQuery] = useState("");
  const [picking, setPicking] = useState<MenuItem | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((m) => {
      const matchCat = active === "Semua" || m.category === active;
      const matchQuery = !q || m.name.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [menu, active, query]);

  const tabs: (Category | "Semua")[] = ["Semua", ...categories];

  function handleSelect(item: MenuItem) {
    if (item.variants && item.variants.length > 0) {
      setPicking(item);
    } else {
      onAdd(item);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari menu…"
          className="h-11 rounded-xl bg-card pl-9"
        />
      </div>

      <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active === tab
                ? "bg-primary text-primary-foreground shadow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="no-scrollbar grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pb-2 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const qty = cartQty[item.id] ?? 0;
          const tracked = item.stock != null;
          const remaining = tracked ? Math.max(0, (item.stock ?? 0) - qty) : null;
          const soldOut = tracked && (item.stock ?? 0) <= 0;
          const reachedMax = tracked && qty >= (item.stock ?? 0);
          const hasVariants = !!item.variants && item.variants.length > 0;
          return (
            <button
              key={item.id}
              disabled={soldOut || reachedMax}
              onClick={() => handleSelect(item)}
              className={cn(
                "group relative flex flex-col rounded-2xl border border-border bg-card p-3 text-left shadow-(--shadow-card) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lift) active:translate-y-0",
                (soldOut || reachedMax) &&
                  "cursor-not-allowed opacity-55 hover:translate-y-0 hover:shadow-(--shadow-card)",
              )}
            >
              {qty > 0 && (
                <span className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow">
                  {qty}
                </span>
              )}
              {soldOut && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground shadow">
                  Habis
                </span>
              )}
              <div className="mb-2 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-secondary text-4xl sm:h-24">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span>{item.emoji}</span>
                )}
              </div>
              <span className="line-clamp-2 text-sm font-semibold leading-tight text-card-foreground">
                {item.name}
              </span>
              <div className="mt-1 flex items-center justify-between gap-1">
                <span className="text-sm font-bold text-primary">
                  {hasVariants ? `mulai ${formatRupiah(item.price)}` : formatRupiah(item.price)}
                </span>
                {tracked && !soldOut && (
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      remaining! <= 5 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    sisa {remaining}
                  </span>
                )}
              </div>
              {hasVariants && (
                <span className="mt-1 inline-flex w-fit rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.variants!.length} varian
                </span>
              )}
            </button>
          );
        })}

        {items.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            Menu tidak ditemukan.
          </div>
        )}
      </div>

      <Dialog open={!!picking} onOpenChange={(o) => !o && setPicking(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Pilih varian · {picking?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {picking?.variants?.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  if (picking) onAdd(picking, v);
                  setPicking(null);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-secondary/50"
              >
                <span className="font-semibold">{v.name}</span>
                <span className="font-bold text-primary">
                  {formatRupiah(unitPrice(picking, v))}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
