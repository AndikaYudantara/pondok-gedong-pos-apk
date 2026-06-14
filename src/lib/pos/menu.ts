import type { MenuItem } from "./types";

export const MENU: MenuItem[] = [
  // Kopi
  { id: "k1", name: "Espresso", category: "Kopi", price: 15000, emoji: "☕", description: "Single shot" },
  { id: "k2", name: "Kopi Tubruk Gedong", category: "Kopi", price: 12000, emoji: "☕", description: "Khas pegunungan" },
  { id: "k3", name: "Cappuccino", category: "Kopi", price: 22000, emoji: "☕" },
  { id: "k4", name: "Caffè Latte", category: "Kopi", price: 24000, emoji: "☕" },
  { id: "k5", name: "Kopi Susu Gula Aren", category: "Kopi", price: 23000, emoji: "🥛" },
  { id: "k6", name: "Americano", category: "Kopi", price: 18000, emoji: "☕" },
  { id: "k7", name: "Vietnam Drip", category: "Kopi", price: 25000, emoji: "☕" },

  // Non-Kopi
  { id: "n1", name: "Cokelat Panas", category: "Non-Kopi", price: 20000, emoji: "🍫" },
  { id: "n2", name: "Matcha Latte", category: "Non-Kopi", price: 26000, emoji: "🍵" },
  { id: "n3", name: "Teh Tarik", category: "Non-Kopi", price: 15000, emoji: "🫖" },
  { id: "n4", name: "Wedang Jahe", category: "Non-Kopi", price: 14000, emoji: "🫚", description: "Penghangat badan" },
  { id: "n5", name: "Lemon Tea Dingin", category: "Non-Kopi", price: 16000, emoji: "🍋" },
  { id: "n6", name: "Air Mineral", category: "Non-Kopi", price: 6000, emoji: "💧" },

  // Makanan
  { id: "m1", name: "Nasi Goreng Gedong", category: "Makanan", price: 28000, emoji: "🍳" },
  { id: "m2", name: "Indomie Rebus Telur", category: "Makanan", price: 18000, emoji: "🍜" },
  { id: "m3", name: "Indomie Goreng Spesial", category: "Makanan", price: 20000, emoji: "🍜" },
  { id: "m4", name: "Roti Bakar Cokelat", category: "Makanan", price: 17000, emoji: "🍞" },
  { id: "m5", name: "Sandwich Telur", category: "Makanan", price: 22000, emoji: "🥪" },

  // Camilan
  { id: "c1", name: "Pisang Goreng", category: "Camilan", price: 15000, emoji: "🍌" },
  { id: "c2", name: "Kentang Goreng", category: "Camilan", price: 18000, emoji: "🍟" },
  { id: "c3", name: "Singkong Goreng", category: "Camilan", price: 13000, emoji: "🥔" },
  { id: "c4", name: "Tahu Crispy", category: "Camilan", price: 14000, emoji: "🟫" },
  { id: "c5", name: "Roti Maryam", category: "Camilan", price: 16000, emoji: "🫓" },
];
