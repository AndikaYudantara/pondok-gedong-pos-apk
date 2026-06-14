import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MENU } from "@/lib/pos/menu";
import { CATEGORIES, type Category, type MenuItem } from "@/lib/pos/types";
import { formatRupiah } from "@/lib/pos/format";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface MenuPanelProps {
  onAdd: (item: MenuItem) => void;
  cartQty: Record<string, number>;
}

export function MenuPanel({ onAdd, cartQty }: MenuPanelProps) {
  const [active, setActive] = useState<Category | "Semua">("Semua");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m) => {
      const matchCat = active === "Semua" || m.category === active;
      const matchQuery = !q || m.name.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [active, query]);

  const tabs: (Category | "Semua")[] = ["Semua", ...CATEGORIES];

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
          return (
            <button
              key={item.id}
              onClick={() => onAdd(item)}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-3 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] active:translate-y-0"
            >
              {qty > 0 && (
                <span className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow">
                  {qty}
                </span>
              )}
              <div className="mb-2 flex h-20 items-center justify-center rounded-xl bg-secondary text-4xl sm:h-24">
                <span>{item.emoji}</span>
              </div>
              <span className="line-clamp-2 text-sm font-semibold leading-tight text-card-foreground">
                {item.name}
              </span>
              <span className="mt-1 text-sm font-bold text-primary">{formatRupiah(item.price)}</span>
            </button>
          );
        })}

        {items.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            Menu tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
