export type Category = "Kopi" | "Non-Kopi" | "Makanan" | "Camilan";

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  emoji: string;
  description?: string;
}

export interface CartLine {
  item: MenuItem;
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
