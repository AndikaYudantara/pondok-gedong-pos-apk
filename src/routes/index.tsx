import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { PosApp } from "@/components/pos/PosApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pondok Gedong Cafe — POS Kasir" },
      {
        name: "description",
        content:
          "Aplikasi kasir (POS) untuk Pondok Gedong Cafe, cafe di atas gunung. Catat pesanan, hitung pembayaran, dan pantau penjualan harian.",
      },
      { property: "og:title", content: "Pondok Gedong Cafe — POS Kasir" },
      {
        property: "og:description",
        content: "Aplikasi kasir POS untuk Pondok Gedong Cafe, cafe di atas gunung.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  // POS state lives in localStorage, so render only on the client.
  // This keeps the app trivially portable to a classic React/Vite + Capacitor build.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-[100dvh] bg-background" aria-hidden />;
  }

  return (
    <>
      <PosApp />
      <Toaster position="top-center" />
    </>
  );
}
