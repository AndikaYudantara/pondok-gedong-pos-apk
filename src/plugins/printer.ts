import { registerPlugin } from "@capacitor/core";

export interface PrinterPlugin {
  getPairedDevices(): Promise<{
    devices: {
      name: string;
      address: string;
    }[];
  }>;
}

export const Printer =
  registerPlugin<PrinterPlugin>("Printer");