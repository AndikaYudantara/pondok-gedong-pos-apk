import { Preferences } from "@capacitor/preferences";
import { Printer } from "@/plugins/printer";
import type { Order } from "@/lib/pos/types";
import { formatDateTime, formatRupiah } from "@/lib/pos/format";

export async function printTest() {
  const { value: mac } = await Preferences.get({
    key: "printer_mac",
  });

  if (!mac) {
    throw new Error("No printer selected");
  }

  await Printer.connect({
    macAddress: mac,
  });

  await Printer.printTest();
}

const LINE_WIDTH = 32;

function center(text: string) {
  const spaces = Math.max(0, Math.floor((LINE_WIDTH - text.length) / 2));
  return " ".repeat(spaces) + text;
}

function rightAlign(text: string) {
  const spaces = Math.max(0, LINE_WIDTH - text.length);
  return " ".repeat(spaces) + text;
}

function leftRight(left: string, right: string) {
  const spaces = Math.max(1, LINE_WIDTH - left.length - right.length);

  return left + " ".repeat(spaces) + right;
}

function separator() {
  return "-".repeat(LINE_WIDTH);
}

export function buildReceipt(order: Order) {
  let receipt = "";

  receipt += center("Jl. Gunung Batukaru, Desa Pujungan") + "\n";
  receipt += center("Kec. Pupuan, Kab. Tabanan, Bali") + "\n";
  receipt += separator() + "\n";

  receipt += leftRight(`#${order.number}`, formatDateTime(order.createdAt)) + "\n";

  if (order.customer) {
    receipt += `Pelanggan : ${order.customer}\n`;
  }

  receipt += separator() + "\n";

  order.lines.forEach((item) => {
    const total = item.qty * item.price;

    receipt += leftRight(`${item.qty}x ${item.name}`, formatRupiah(total)) + "\n";
  });

  receipt += separator() + "\n";

  receipt += leftRight("TOTAL :", formatRupiah(order.total)) + "\n";

  if (order.payment === "Tunai") {
    receipt += leftRight("Tunai :", formatRupiah(order.cashReceived ?? 0)) + "\n";
    receipt += leftRight("Kembali:", formatRupiah(order.change ?? 0)) + "\n";
  }

  receipt += separator() + "\n";

  receipt += center("Terima Kasih") + "\n";
  receipt += center("Sampai Jumpa Lagi") + "\n";

  receipt += "\n\n\n";

  return receipt;
}
