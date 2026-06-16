import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BarChart3,
  Boxes,
  KeyRound,
  Lock,
  LogOut,
  Tag,
  UtensilsCrossed,
  Printer,
  Bluetooth,
  Loader2,
  DatabaseBackup,
} from "lucide-react";
import { toast } from "sonner";
import type { Category, MenuItem, Order } from "@/lib/pos/types";
import { getAdminPassword, setAdminPassword, DEFAULT_ADMIN_PASSWORD } from "@/lib/pos/storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReportView } from "./ReportView";
import { MenuManager } from "./MenuManager";
import { CategoryManager } from "./CategoryManager";
import { StockManager } from "./StockManager";
import { Printer as PrinterPlugin } from "@/plugins/printer";
import { Preferences } from "@capacitor/preferences";
import { BackupManager } from "./BackupManager";

type AdminTab = "laporan" | "menu" | "stok" | "kategori" | "backup" | "akun";

const ADMIN_NAV: { id: AdminTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "laporan", label: "Laporan", icon: BarChart3 },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "stok", label: "Stok", icon: Boxes },
  { id: "kategori", label: "Kategori", icon: Tag },
  { id: "backup", label: "Backup", icon: DatabaseBackup },
  { id: "akun", label: "Akun", icon: KeyRound },
];

interface AdminDashboardProps {
  authed: boolean;
  onAuth: (ok: boolean) => void;
  orders: Order[];
  menu: MenuItem[];
  categories: Category[];
  onAddItem: (item: Omit<MenuItem, "id">) => void;
  onUpdateItem: (id: string, patch: Partial<MenuItem>) => void;
  onDeleteItem: (id: string) => void;
  onSetStock: (id: string, stock: number | null) => void;
  onAdjustStock: (id: string, delta: number) => void;
  onAddCategory: (name: string) => boolean;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
  onRestoreBackup: (menu: MenuItem[], categories: Category[]) => void;
}

export function AdminDashboard(props: AdminDashboardProps) {
  const { authed, onAuth } = props;
  const [tab, setTab] = useState<AdminTab>("laporan");

  if (!authed) {
    return <AdminLogin onSuccess={() => onAuth(true)} />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-full bg-secondary p-1">
          {ADMIN_NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                tab === n.id
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => onAuth(false)}>
          <LogOut className="size-4" /> Keluar
        </Button>
      </div>

      {tab === "laporan" && <ReportView orders={props.orders} />}
      {tab === "menu" && (
        <MenuManager
          menu={props.menu}
          categories={props.categories}
          onAdd={props.onAddItem}
          onUpdate={props.onUpdateItem}
          onDelete={props.onDeleteItem}
        />
      )}
      {tab === "stok" && (
        <StockManager
          menu={props.menu}
          onSetStock={props.onSetStock}
          onAdjustStock={props.onAdjustStock}
        />
      )}
      {tab === "kategori" && (
        <CategoryManager
          categories={props.categories}
          menu={props.menu}
          onAdd={props.onAddCategory}
          onRename={props.onRenameCategory}
          onDelete={props.onDeleteCategory}
        />
      )}

      {tab === "backup" && (
        <BackupManager
          menu={props.menu}
          categories={props.categories}
          onRestore={props.onRestoreBackup}
        />
      )}

      {tab === "akun" && <AccountSettings />}
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === getAdminPassword()) {
      onSuccess();
    } else {
      toast.error("Password salah");
      setPw("");
    }
  }

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-sm flex-col items-center justify-center">
      <div className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-(--shadow-card)">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="size-7" />
        </div>
        <h2 className="font-display text-xl font-bold">Dashboard Admin</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Masukkan password untuk mengelola menu &amp; laporan.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3 text-left">
          <div className="space-y-2">
            <Label htmlFor="admin-pw">Password</Label>
            <Input
              id="admin-pw"
              type="password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full">
            Masuk
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          Password default:{" "}
          <span className="font-mono font-semibold">{DEFAULT_ADMIN_PASSWORD}</span>
        </p>
      </div>
    </div>
  );
}

function AccountSettings() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [printerName, setPrinterName] = useState("");
  const [printerMac, setPrinterMac] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<{ name: string; address: string }[]>(
    [],
  );

  useEffect(() => {
    loadPrinter();
  }, []);

  async function loadPrinter() {
    const name = await Preferences.get({
      key: "printer_name",
    });

    const mac = await Preferences.get({
      key: "printer_mac",
    });

    setPrinterName(name.value ?? "");
    setPrinterMac(mac.value ?? "");
  }

  async function connectPrinter() {
    try {
      const result = await PrinterPlugin.getPairedDevices();

      const printers = result.devices.filter(
        (d) =>
          d.name.toUpperCase().includes("RPP") ||
          d.name.toUpperCase().includes("POS") ||
          d.name.toUpperCase().includes("BT"),
      );

      setAvailablePrinters(printers);

      setPrinterDialogOpen(true);
    } catch (error) {
      console.error(error);

      toast.error("Gagal mengambil daftar printer");
    }
  }

  async function selectPrinter(name: string, address: string) {
    try {
      setPrinterDialogOpen(false);
      setConnecting(true);

      await PrinterPlugin.disconnect();

      await Preferences.set({
        key: "printer_name",
        value: name,
      });

      await Preferences.set({
        key: "printer_mac",
        value: address,
      });

      setPrinterName(name);
      setPrinterMac(address);

      await PrinterPlugin.connect({
        macAddress: printerMac,
      });

      setConnecting(false);

      toast.success(`${name} berhasil dipilih`);
    } catch (error) {
      console.error(error);
      setConnecting(false);

      toast.error("Gagal menghubungkan printer");
    }
  }

  async function testPrinter() {
    console.log("Testing printer with MAC:", printerMac);
    try {
      if (!printerMac) {
        toast.error("Printer belum dipilih");
        return;
      }

      const status = await PrinterPlugin.isConnected();

      if (!status.connected) {
        await PrinterPlugin.connect({
          macAddress: printerMac,
        });
      }

      await PrinterPlugin.printTest();

      toast.success("Perintah cetak dikirim");
    } catch (error) {
      console.error(error);

      toast.error("Gagal mencetak");
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (current !== getAdminPassword()) {
      toast.error("Password saat ini salah");
      return;
    }
    if (next.length < 4) {
      toast.error("Password baru minimal 4 karakter");
      return;
    }
    if (next !== confirm) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setAdminPassword(next);
    toast.success("Password berhasil diubah");
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <>
      <div className="max-w-sm space-y-2">
        <div>
          <h2 className="font-display text-lg font-bold">Ubah Password</h2>
          <p className="text-sm text-muted-foreground">Amankan akses dashboard admin.</p>
        </div>
        <form onSubmit={save} className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="cur-pw">Password saat ini</Label>
            <Input
              id="cur-pw"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pw">Password baru</Label>
            <Input
              id="new-pw"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conf-pw">Konfirmasi password baru</Label>
            <Input
              id="conf-pw"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit">Simpan Password</Button>
        </form>
        <div className="pt-6">
          <h2 className="font-display text-lg font-bold">Printer</h2>

          <p className="text-sm text-muted-foreground">Kelola printer Bluetooth.</p>

          <div className="mt-4 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{printerName || "Belum Terhubung"}</p>

                <p className="text-xs text-muted-foreground">
                  {printerMac || "Pilih printer terlebih dahulu"}
                </p>
              </div>

              <div
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  printerMac ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground",
                )}
              >
                {printerMac ? "Connected" : "Disconnected"}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant={printerMac ? "default" : "outline"}
                className="flex-1"
                onClick={connectPrinter}
                disabled={connecting}
              >
                <Bluetooth className="size-4" />

                {printerMac ? "Change Printer" : "Connect"}
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={testPrinter}
                disabled={!printerMac}
              >
                <Printer className="size-4" />
                Test Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={printerDialogOpen} onOpenChange={setPrinterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Printer Bluetooth</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {availablePrinters.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada perangkat ditemukan</p>
            ) : (
              availablePrinters.map((device) => (
                <Button
                  key={device.address}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => selectPrinter(device.name, device.address)}
                >
                  <div className="text-left">
                    <div>{device.name}</div>

                    <div className="text-xs text-muted-foreground">{device.address}</div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {connecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl bg-card p-6 shadow-lg">
            <Loader2 className="mx-auto size-8 animate-spin" />

            <p className="mt-3 text-center">Menghubungkan...</p>
          </div>
        </div>
      )}
    </>
  );
}
