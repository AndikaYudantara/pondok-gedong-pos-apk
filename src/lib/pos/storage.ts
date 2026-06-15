import { useCallback, useEffect, useRef, useState } from "react";
import type { Category, MenuItem, Order } from "./types";
import { MENU } from "./menu";
import { CATEGORIES } from "./types";

const ORDERS_KEY = "pondok-gedong-orders";
const COUNTER_KEY = "pondok-gedong-order-counter";
const MENU_KEY = "pondok-gedong-menu";
const CATEGORIES_KEY = "pondok-gedong-categories";
const ADMIN_PW_KEY = "pondok-gedong-admin-pw";

/** Default admin password (can be changed inside the dashboard). */
export const DEFAULT_ADMIN_PASSWORD = "admin123";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * SSR-safe persisted state backed by localStorage.
 * Reads happen only on the client after mount, so it is portable to a
 * classic React/Vite + Capacitor build with zero changes.
 */
export function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setState(safeParse<T>(window.localStorage.getItem(key), initial));
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded.current || typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

export function useOrders() {
  const [orders, setOrders] = usePersistedState<Order[]>(ORDERS_KEY, []);

  const nextNumber = useCallback(() => {
    if (typeof window === "undefined") return 1;
    const current = Number(window.localStorage.getItem(COUNTER_KEY) || "0") + 1;
    window.localStorage.setItem(COUNTER_KEY, String(current));
    return current;
  }, []);

  const addOrder = useCallback(
    (order: Order) => {
      setOrders((prev) => [order, ...prev]);
    },
    [setOrders],
  );

  const deleteOrder = useCallback(
    (id: string) => {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    },
    [setOrders],
  );

  return { orders, addOrder, deleteOrder, nextNumber };
}

export function useMenu() {
  const [menu, setMenu] = usePersistedState<MenuItem[]>(MENU_KEY, MENU);

  const addItem = useCallback(
    (item: Omit<MenuItem, "id">) => {
      setMenu((prev) => [{ ...item, id: crypto.randomUUID() }, ...prev]);
    },
    [setMenu],
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<MenuItem>) => {
      setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    },
    [setMenu],
  );

  const deleteItem = useCallback(
    (id: string) => {
      setMenu((prev) => prev.filter((m) => m.id !== id));
    },
    [setMenu],
  );

  /** Set an absolute stock value (`null` = tidak dilacak / unlimited). */
  const setStock = useCallback(
    (id: string, stock: number | null) => {
      setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, stock } : m)));
    },
    [setMenu],
  );

  /** Add (or subtract with negative) to current stock; ignores untracked items. */
  const adjustStock = useCallback(
    (id: string, delta: number) => {
      setMenu((prev) =>
        prev.map((m) =>
          m.id === id && m.stock != null
            ? { ...m, stock: Math.max(0, m.stock + delta) }
            : m,
        ),
      );
    },
    [setMenu],
  );

  /** Decrement stock for each sold line; ignores untracked items. */
  const decrementStock = useCallback(
    (lines: { id: string; qty: number }[]) => {
      setMenu((prev) =>
        prev.map((m) => {
          if (m.stock == null) return m;
          const sold = lines.find((l) => l.id === m.id);
          if (!sold) return m;
          return { ...m, stock: Math.max(0, m.stock - sold.qty) };
        }),
      );
    },
    [setMenu],
  );

  return { menu, addItem, updateItem, deleteItem, setStock, adjustStock, decrementStock };
}

export function useCategories() {
  const [categories, setCategories] = usePersistedState<Category[]>(CATEGORIES_KEY, CATEGORIES);

  const addCategory = useCallback(
    (name: string) => {
      const clean = name.trim();
      if (!clean) return false;
      let ok = true;
      setCategories((prev) => {
        if (prev.some((c) => c.toLowerCase() === clean.toLowerCase())) {
          ok = false;
          return prev;
        }
        return [...prev, clean];
      });
      return ok;
    },
    [setCategories],
  );

  const renameCategory = useCallback(
    (oldName: string, newName: string) => {
      const clean = newName.trim();
      if (!clean) return;
      setCategories((prev) => prev.map((c) => (c === oldName ? clean : c)));
    },
    [setCategories],
  );

  const deleteCategory = useCallback(
    (name: string) => {
      setCategories((prev) => prev.filter((c) => c !== name));
    },
    [setCategories],
  );

  return { categories, addCategory, renameCategory, deleteCategory };
}

/** Admin password helpers (stored locally, portable to Capacitor). */
export function getAdminPassword(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSWORD;
  return window.localStorage.getItem(ADMIN_PW_KEY) || DEFAULT_ADMIN_PASSWORD;
}

export function setAdminPassword(pw: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_PW_KEY, pw);
}
