import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Users, Wifi, WifiOff } from "lucide-react";
import type { PaymentMethod, WifiPackage, WifiSale } from "@/lib/pos/types";
import { formatRupiah, formatTime } from "@/lib/pos/format";
import { formatDuration, WIFI_PRICE_PER_HOUR } from "@/lib/pos/wifi";
import { fetchMikrotikStatus, type MikrotikStatus } from "@/lib/pos/mikrotik";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckoutDialog } from "./CheckoutDialog";
import { WifiVoucherDialog } from "./WifiVoucherDialog";

interface WifiPanelProps {
  packages: WifiPackage[];
  onSell: (
    pkg: WifiPackage,
    data: {
      payment: PaymentMethod;
      cashReceived?: number;
      change?: number;
      customer?: string;
    },
  ) => WifiSale;
}

export function WifiPanel({ packages, onSell }: WifiPanelProps) {
  const [selected, setSelected] = useState<WifiPackage | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [voucher, setVoucher] = useState<WifiSale | null>(null);

  const [status, setStatus] = useState<MikrotikStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const s = await fetchMikrotikStatus();
      setStatus(s);
    } catch {
      setError(true);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleSelect(pkg: WifiPackage) {
    setSelected(pkg);
    setCheckout(true);
  }

  function handleConfirm(data: {
    payment: PaymentMethod;
    cashReceived?: number;
    change?: number;
    customer?: string;
  }) {
    if (!selected) return;
    const sale = onSell(selected, data);
    setCheckout(false);
    setSelected(null);
    setVoucher(sale);
  }

  return (
    <div className="no-scrollbar flex h-full flex-col gap-4 overflow-y-auto pb-4">
      {/* Active users (Mikrotik) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-xl",
                error ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
              )}
            >
              {error ? <WifiOff className="size-5" /> : <Users className="size-5" />}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User Aktif</p>
              <p className="font-display text-2xl font-bold leading-tight">
                {error ? "—" : loading && !status ? "…" : status?.activeUsers ?? 0}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {error ? (
          <p className="mt-3 text-xs text-destructive">
            Gagal terhubung ke router Mikrotik.
          </p>
        ) : (
          <>
            {status && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                {status.mock ? "Data simulasi · " : ""}Diperbarui {formatTime(status.fetchedAt)}
              </p>
            )}
            {status && status.users.length > 0 && (
              <div className="no-scrollbar mt-3 max-h-32 space-y-1 overflow-y-auto">
                {status.users.map((u, i) => (
                  <div
                    key={`${u.name}-${i}`}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-1.5 text-xs"
                  >
                    <span className="flex items-center gap-2 font-mono font-medium">
                      <Wifi className="size-3 text-success" />
                      {u.name}
                    </span>
                    <span className="text-muted-foreground">
                      {u.address} · {u.uptime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Packages */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold">Paket Wifi</h2>
          <span className="text-xs text-muted-foreground">
            {formatRupiah(WIFI_PRICE_PER_HOUR)}/jam
          </span>
        </div>

        {packages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Belum ada paket wifi. Tambahkan di Admin → Wifi.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleSelect(pkg)}
                className="group flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-4 text-center shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-lift)]"
              >
                <Wifi className="size-6 text-primary" />
                <span className="mt-1 text-sm font-semibold leading-tight">{pkg.name}</span>
                <span className="text-xs text-muted-foreground">{formatDuration(pkg.hours)}</span>
                <span className="mt-1 text-base font-bold text-primary">
                  {formatRupiah(pkg.price)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <CheckoutDialog
        open={checkout}
        onOpenChange={(o) => {
          setCheckout(o);
          if (!o) setSelected(null);
        }}
        total={selected?.price ?? 0}
        title={selected ? `Beli Voucher · ${selected.name}` : "Beli Voucher"}
        confirmLabel="Buat Voucher"
        onConfirm={handleConfirm}
      />

      <WifiVoucherDialog
        open={!!voucher}
        onOpenChange={(o) => !o && setVoucher(null)}
        sale={voucher}
        mode="checkout"
        onNew={() => setVoucher(null)}
      />
    </div>
  );
}
