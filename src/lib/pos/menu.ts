import type { MenuItem } from "./types";

export const MENU: MenuItem[] = [
  // Kopi
  {
    id: "k2",
    name: "Kopi Bali",
    category: "Kopi",
    price: 12000,
    emoji: "☕",
    description: "Khas pegunungan",
    stock: 50,
  },
  {
    id: "k3",
    name: "Good Day Cappuccino",
    category: "Kopi",
    price: 22000,
    emoji: "☕",
    stock: 40,
    variants: [
      { id: "k3-p", name: "Panas", priceDelta: 0 },
      { id: "k3-d", name: "Dingin", priceDelta: 3000 },
    ],
  },

  // Non-Kopi
  { id: "n1", name: "Cokelat Panas", category: "Non-Kopi", price: 20000, emoji: "🍫", stock: 30 },

  // Makanan
  {
    id: "m1",
    name: "Nasi Goreng",
    category: "Makanan",
    price: 28000,
    emoji: "🍳",
    stock: 25,
  },
  {
    id: "m2",
    name: "Indomie Rebus Telur",
    category: "Makanan",
    price: 18000,
    emoji: "🍜",
    stock: 30,
  },
  {
    id: "m3",
    name: "Indomie Goreng Spesial",
    category: "Makanan",
    price: 20000,
    emoji: "🍜",
    stock: 30,
  },

  // Camilan

  { id: "c2", name: "Kentang Goreng", category: "Camilan", price: 18000, emoji: "🍟", stock: 30 },
  { id: "c4", name: "Sosis", category: "Camilan", price: 14000, emoji: "🟫", stock: 25 },
];
