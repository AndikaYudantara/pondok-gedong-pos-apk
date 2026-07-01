import type { WifiPackage } from "./types";

/** Base price per hour for wifi vouchers. */
export const WIFI_PRICE_PER_HOUR = 2000;

/** Default fixed wifi packages (can be managed by admin). */
export const WIFI_PACKAGES: WifiPackage[] = [
  { id: "w1", name: "1 Jam", hours: 1, price: 1 * WIFI_PRICE_PER_HOUR },
  { id: "w3", name: "3 Jam", hours: 3, price: 3 * WIFI_PRICE_PER_HOUR },
  { id: "w6", name: "6 Jam", hours: 6, price: 6 * WIFI_PRICE_PER_HOUR },
  { id: "w12", name: "12 Jam", hours: 12, price: 12 * WIFI_PRICE_PER_HOUR },
  { id: "w24", name: "1 Hari (24 Jam)", hours: 24, price: 24 * WIFI_PRICE_PER_HOUR },
];

/** Human-friendly duration label from hours. */
export function formatDuration(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24;
    return `${days} Hari`;
  }
  return `${hours} Jam`;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

/** Generate a short, easy-to-read voucher code, e.g. "PG-7K4M9Q". */
export function generateVoucherCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return `PG-${code}`;
}
