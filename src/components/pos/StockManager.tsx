import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Infinity as InfinityIcon, Minus, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/lib/pos/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LOW_STOCK = 5;

interface StockManagerProps {
  menu: MenuItem[];
  onSetStock: (id: string, stock: number | null) => void;
  onAdjustStock: (id: string, delta: number) => void;
}

export function StockManager({ menu, onSetStock, onAdjustStock }: StockManagerProps) {
  const [query, setQuery] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((m) => {
      const matchQuery = !q || m.name.toLowerCase().includes(q);
      const matchLow = !onlyLow || (m.stock != null && m.stock <= LOW_STOCK);
      return matchQuery && matchLow;
    });
  }, [menu, query, onlyLow]);

  const lowCount = useMemo(
    () => menu.filter((m) => m.stock != null && m.stock <= LOW_STOCK).length,
    [menu],
  );
  const outCount = useMemo(
    () => menu.filter((m) => m.stock != null && m.stock <= 0).length,
    [menu],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Manajemen Stok</h2>
          <p className="text-sm text-muted-foreground">
            {menu.length} item · {outCount} habis · {lowCount} stok menipis
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu…"
            className="bg-card pl-9"
          />
        </div>
        <Button
          variant={onlyLow ? "default" : "secondary"}
          className="gap-1.5"
          onClick={() => setOnlyLow((v) => !v)}
        >
          <AlertTriangle className="size-4" /> Stok Menipis
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const tracked = item.stock != null;
          const stock = item.stock ?? 0;
          const out = tracked && stock <= 0;
          const low = tracked && stock > 0 && stock <= LOW_STOCK;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
            >
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary text-xl">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="size-full object-cover" />
                ) : (
                  <span>{item.emoji}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-tight">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>

              {tracked ? (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "min-w-[3.5rem] rounded-full px-2.5 py-0.5 text-center text-xs font-bold",
                      out
                        ? "bg-destructive/15 text-destructive"
                        : low
                          ? "bg-accent/20 text-accent-foreground"
                          : "bg-success/15 text-success",
                    )}
                  >
                    {out ? "Habis" : `${stock}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      disabled={stock <= 0}
                      onClick={() => onAdjustStock(item.id, -1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <Input
                      inputMode="numeric"
                      value={stock}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, "");
                        onSetStock(item.id, v === "" ? 0 : Number(v));
                      }}
                      className="h-8 w-16 text-center"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() => onAdjustStock(item.id, 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-xs text-muted-foreground"
                    onClick={() => {
                      onSetStock(item.id, null);
                      toast.success(`Stok ${item.name} tidak dilacak`);
                    }}
                  >
                    <InfinityIcon className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <InfinityIcon className="size-3.5" /> Tidak dilacak
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5"
                    onClick={() => {
                      onSetStock(item.id, 10);
                      toast.success(`Mulai melacak stok ${item.name}`);
                    }}
                  >
                    <Boxes className="size-4" /> Lacak
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Tidak ada menu yang cocok.
          </p>
        )}
      </div>
    </div>
  );
}
