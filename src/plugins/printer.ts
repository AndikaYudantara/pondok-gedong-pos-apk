import { registerPlugin } from "@capacitor/core";

export interface PrinterPlugin {
  getPairedDevices(): Promise<{
    devices: {
      name: string;
      address: string;
    }[];
  }>;

  connect(options: { macAddress: string }): Promise<{
    connected: boolean;
  }>;

  printTest(): Promise<void>;

  printReceipt(options: { text: string }): Promise<void>;

  isConnected(): Promise<{
    connected: boolean;
  }>;

  disconnect(): Promise<void>;
}

export const Printer = registerPlugin<PrinterPlugin>("Printer");
