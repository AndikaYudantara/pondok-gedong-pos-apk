import type { MenuItem } from "./types";

export const MENU: MenuItem[] = [
  // Kopi
  { id: "k1", name: "Espresso", category: "Kopi", price: 15000, emoji: "☕", description: "Single shot", stock: 50 },
  { id: "k2", name: "Kopi Tubruk Gedong", category: "Kopi", price: 12000, emoji: "☕", description: "Khas pegunungan", stock: 50 },
  { id: "k3", name: "Cappuccino", category: "Kopi", price: 22000, emoji: "☕", stock: 40 },
  { id: "k4", name: "Caffè Latte", category: "Kopi", price: 24000, emoji: "☕", stock: 40 },
  { id: "k5", name: "Kopi Susu Gula Aren", category: "Kopi", price: 23000, emoji: "🥛", stock: 40 },
  { id: "k6", name: "Americano", category: "Kopi", price: 18000, emoji: "☕", stock: 50 },
  { id: "k7", name: "Vietnam Drip", category: "Kopi", price: 25000, emoji: "☕", stock: 30 },

  // Non-Kopi
  { id: "n1", name: "Cokelat Panas", category: "Non-Kopi", price: 20000, emoji: "🍫", stock: 30 },
  { id: "n2", name: "Matcha Latte", category: "Non-Kopi", price: 26000, emoji: "🍵", stock: 30 },
  { id: "n3", name: "Teh Tarik", category: "Non-Kopi", price: 15000, emoji: "🫖", stock: 40 },
  { id: "n4", name: "Wedang Jahe", category: "Non-Kopi", price: 14000, emoji: "🫚", description: "Penghangat badan", stock: 40 },
  { id: "n5", name: "Lemon Tea Dingin", category: "Non-Kopi", price: 16000, emoji: "🍋", stock: 40 },
  { id: "n6", name: "Air Mineral", category: "Non-Kopi", price: 6000, emoji: "💧", stock: 100 },

  // Makanan
  { id: "m1", name: "Nasi Goreng Gedong", category: "Makanan", price: 28000, emoji: "🍳", stock: 25 },
  { id: "m2", name: "Indomie Rebus Telur", category: "Makanan", price: 18000, emoji: "🍜", stock: 30 },
  { id: "m3", name: "Indomie Goreng Spesial", category: "Makanan", price: 20000, emoji: "🍜", stock: 30 },
  { id: "m4", name: "Roti Bakar Cokelat", category: "Makanan", price: 17000, emoji: "🍞", stock: 20 },
  { id: "m5", name: "Sandwich Telur", category: "Makanan", price: 22000, emoji: "🥪", stock: 20 },

  // Camilan
  { id: "c1", name: "Pisang Goreng", category: "Camilan", price: 15000, emoji: "🍌", stock: 30 },
  { id: "c2", name: "Kentang Goreng", category: "Camilan", price: 18000, emoji: "🍟", stock: 30 },
  { id: "c3", name: "Singkong Goreng", category: "Camilan", price: 13000, emoji: "🥔", stock: 25 },
  { id: "c4", name: "Tahu Crispy", category: "Camilan", price: 14000, emoji: "🟫", stock: 25 },
  { id: "c5", name: "Roti Maryam", category: "Camilan", price: 16000, emoji: "🫓", stock: 20 },
];
