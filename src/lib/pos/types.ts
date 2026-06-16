export type Category = string;

export interface MenuVariant {
  id: string;
  name: string;
  /** Added to the base price (can be 0 or negative). */
  priceDelta: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  emoji: string;
  /** Optional photo as a data URL (uploaded by admin). Falls back to emoji. */
  image?: string;
  description?: string;
  /** Available stock. `null`/undefined = stok tidak dilacak (unlimited). */
  stock?: number | null;
  /** Optional variants (e.g. Panas/Dingin, Reguler/Large). */
  variants?: MenuVariant[];
}

export interface CartLine {
  /** Unique per item + selected variant combination. */
  key: string;
  item: MenuItem;
  variant?: MenuVariant;
  qty: number;
  note?: string;
}

export type PaymentMethod = "Tunai" | "QRIS";

export interface OrderLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
}

export interface Order {
  id: string;
  number: number;
  createdAt: string; // ISO
  lines: OrderLine[];
  subtotal: number;
  total: number;
  payment: PaymentMethod;
  cashReceived?: number;
  change?: number;
  customer?: string;
}

export const CATEGORIES: Category[] = ["Kopi", "Non-Kopi", "Makanan", "Camilan"];
