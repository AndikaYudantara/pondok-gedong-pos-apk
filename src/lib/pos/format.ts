import type { CartLine, MenuItem, MenuVariant } from "./types";

export function formatRupiah(value: number): string {
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

/** Effective unit price for an item with an optional selected variant. */
export function unitPrice(item: MenuItem, variant?: MenuVariant): number {
  return item.price + (variant?.priceDelta ?? 0);
}

/** Effective unit price for a cart line. */
export function lineUnitPrice(line: CartLine): number {
  return unitPrice(line.item, line.variant);
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("id-ID");
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isSameDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getDate() === ref.getDate() &&
    d.getMonth() === ref.getMonth() &&
    d.getFullYear() === ref.getFullYear()
  );
}
