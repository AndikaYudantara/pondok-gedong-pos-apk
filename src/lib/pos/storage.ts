import { useCallback, useEffect, useRef, useState } from "react";
import type { Order } from "./types";

const ORDERS_KEY = "pondok-gedong-orders";
const COUNTER_KEY = "pondok-gedong-order-counter";

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
