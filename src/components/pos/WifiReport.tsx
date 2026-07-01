import { useMemo, useState } from "react";
import {
  Coins,
  Pencil,
  Plus,
  Receipt,
  Ticket,
  Trash2,
  TrendingUp,
  Wifi,
} from "lucide-react";
import type { WifiPackage, WifiSale } from "@/lib/pos/types";
import {
  formatDate,
  formatRupiah,
  formatTime,
  isSameDay,
  isSameMonth,
  toDateInputValue,
} from "@/lib/pos/format";
import { formatDuration, WIFI_PRICE_PER_HOUR } from "@/lib/pos/wifi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WifiVoucherDialog } from "./WifiVoucherDialog";

interface WifiReportProps {
  sales: WifiSale[];
  packages: WifiPackage[];
  onAddPackage: (pkg: Omit<WifiPackage, "id">) => void;
  onUpdatePackage: (id: string, patch: Partial<WifiPackage>) => void;
  onDeletePackage: (id: string) => void;
  onDeleteSale: (id: string) => void;
}

export function WifiReport({
  sales,
  packages,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage,
  onDeleteSale,
}: WifiReportProps) {
  const [selected, setSelected] = useState(() => new Date());
  const [viewVoucher, setViewVoucher] = useState<WifiSale | null>(null);

  const isToday = isSameDay(selected.toISOString(), new Date());

  const day = useMemo(() => {
    const list = sales
      .filter((s) => isSameDay(s.createdAt, selected))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const revenue = list.reduce((s, x) => s + x.price, 0);
    const hours = list.reduce((s, x) => s + x.hours, 0);
    return { list, revenue, hours, count: list.length };
  }, [sales, selected]);

  const month = useMemo(() => {
    const inMonth = sales.filter((s) => isSameMonth(s.createdAt, selected));
    const revenue = inMonth.reduce((s, x) => s + x.price, 0);
    const label = selected.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    return { revenue, count: inMonth.length, label };
  }, [sales, selected]);

  const stats = [
    {
      label: `Omzet Wifi ${isToday ? "Hari Ini" : "Tanggal Ini"}`,
      value: formatRupiah(day.revenue),
      icon: Coins,
      tone: "primary" as const,
    },
    {
      label: `Voucher ${isToday ? "Hari Ini" : "Tanggal Ini"}`,
      value: String(day.count),
      icon: Ticket,
      tone: "accent" as const,
    },
    {
      label: `Total Jam ${isToday ? "Hari Ini" : "Tanggal Ini"}`,
      value: `${day.hours} jam`,
      icon: Receipt,
      tone: "success" as const,
    },
    {
      label: `Omzet Wifi ${month.label}`,
      value: formatRupiah(month.revenue),
      icon: TrendingUp,
      tone: "primary" as const,
    },
  ];

  const toneClass: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent-foreground",
    success: "bg-success/10 text-success",
  };

  return (
    <div className="space-y-5">
      {/* Date selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold">Laporan Wifi</h2>
          <p className="text-sm text-muted-foreground">
            {isToday ? "Hari Ini · " : ""}
            {formatDate(selected)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={toDateInputValue(selected)}
            max={toDateInputValue(new Date())}
            onChange={(e) => {
              if (e.target.value) setSelected(new Date(e.target.value + "T00:00:00"));
            }}
            className="h-9 w-auto rounded-lg"
          />
          {!isToday && (
            <Button variant="outline" size="sm" onClick={() => setSelected(new Date())}>
              Hari Ini
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
          >
            <div
              className={cn(
                "mb-2 flex size-9 items-center justify-center rounded-lg",
                toneClass[s.tone],
              )}
            >
              <s.icon className="size-5" />
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 font-display text-lg font-bold leading-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sales list */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 font-semibold">Voucher Terjual</h3>
        {day.list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada voucher terjual pada tanggal ini.
          </p>
        ) : (
          <div className="space-y-2">
            {day.list.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wifi className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">{s.code}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      #{s.number}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.packageName} · {formatTime(s.createdAt)} · {s.payment}
                    {s.customer ? ` · ${s.customer}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-primary">
                  {formatRupiah(s.price)}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setViewVoucher(s)}>
                  Nota
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Hapus voucher ${s.code}?`)) onDeleteSale(s.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package management */}
      <PackageManager
        packages={packages}
        onAdd={onAddPackage}
        onUpdate={onUpdatePackage}
        onDelete={onDeletePackage}
      />

      <WifiVoucherDialog
        open={!!viewVoucher}
        onOpenChange={(o) => !o && setViewVoucher(null)}
        sale={viewVoucher}
        mode="history"
      />
    </div>
  );
}

function PackageManager({
  packages,
  onAdd,
  onUpdate,
  onDelete,
}: {
  packages: WifiPackage[];
  onAdd: (pkg: Omit<WifiPackage, "id">) => void;
  onUpdate: (id: string, patch: Partial<WifiPackage>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<WifiPackage | "new" | null>(null);
  const [name, setName] = useState("");
  const [hours, setHours] = useState("1");
  const [price, setPrice] = useState(String(WIFI_PRICE_PER_HOUR));
  const [customPrice, setCustomPrice] = useState(false);

  function open(pkg: WifiPackage | "new") {
    if (pkg === "new") {
      setName("");
      setHours("1");
      setPrice(String(WIFI_PRICE_PER_HOUR));
      setCustomPrice(false);
    } else {
      setName(pkg.name);
      setHours(String(pkg.hours));
      setPrice(String(pkg.price));
      setCustomPrice(pkg.price !== pkg.hours * WIFI_PRICE_PER_HOUR);
    }
    setEditing(pkg);
  }

  const hoursNum = Math.max(0, Number(hours) || 0);
  const effectivePrice = customPrice ? Math.max(0, Number(price) || 0) : hoursNum * WIFI_PRICE_PER_HOUR;

  function save() {
    if (!name.trim() || hoursNum <= 0) return;
    const data = { name: name.trim(), hours: hoursNum, price: effectivePrice };
    if (editing === "new") onAdd(data);
    else if (editing) onUpdate(editing.id, data);
    setEditing(null);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Kelola Paket Wifi</h3>
          <p className="text-xs text-muted-foreground">
            Harga dasar {formatRupiah(WIFI_PRICE_PER_HOUR)}/jam
          </p>
        </div>
        <Button size="sm" onClick={() => open("new")}>
          <Plus className="size-4" /> Paket
        </Button>
      </div>

      <div className="space-y-2">
        {packages.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wifi className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{formatDuration(p.hours)}</p>
            </div>
            <span className="shrink-0 text-sm font-bold text-primary">{formatRupiah(p.price)}</span>
            <Button variant="ghost" size="icon" onClick={() => open(p)}>
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm(`Hapus paket "${p.name}"?`)) onDelete(p.id);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {packages.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Belum ada paket.</p>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Tambah Paket" : "Edit Paket"}</DialogTitle>
            <DialogDescription>Atur nama, durasi, dan harga paket wifi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-name">Nama Paket</Label>
              <Input
                id="pkg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth. 3 Jam"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-hours">Durasi (jam)</Label>
              <Input
                id="pkg-hours"
                inputMode="numeric"
                value={hours}
                onChange={(e) => setHours(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={customPrice}
                onChange={(e) => setCustomPrice(e.target.checked)}
                className="size-4 rounded border-border"
              />
              Harga khusus (override otomatis)
            </label>
            {customPrice ? (
              <div className="space-y-1.5">
                <Label htmlFor="pkg-price">Harga</Label>
                <Input
                  id="pkg-price"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
            ) : (
              <p className="rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                Harga otomatis:{" "}
                <span className="font-bold text-primary">{formatRupiah(effectivePrice)}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={save} disabled={!name.trim() || hoursNum <= 0}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
