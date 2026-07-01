import { useState } from "react";
import { BarChart3, Boxes, DatabaseBackup, KeyRound, Lock, LogOut, Tag, UtensilsCrossed, Wifi } from "lucide-react";
import { toast } from "sonner";
import type { Category, MenuItem, Order, WifiPackage, WifiSale } from "@/lib/pos/types";
import {
  getAdminPassword,
  setAdminPassword,
  DEFAULT_ADMIN_PASSWORD,
} from "@/lib/pos/storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReportView } from "./ReportView";
import { MenuManager } from "./MenuManager";
import { CategoryManager } from "./CategoryManager";
import { StockManager } from "./StockManager";
import { BackupManager } from "./BackupManager";
import { WifiReport } from "./WifiReport";

type AdminTab = "laporan" | "menu" | "stok" | "kategori" | "wifi" | "backup" | "akun";

const ADMIN_NAV: { id: AdminTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "laporan", label: "Laporan", icon: BarChart3 },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "stok", label: "Stok", icon: Boxes },
  { id: "kategori", label: "Kategori", icon: Tag },
  { id: "wifi", label: "Wifi", icon: Wifi },
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
  wifiSales: WifiSale[];
  wifiPackages: WifiPackage[];
  onAddWifiPackage: (pkg: Omit<WifiPackage, "id">) => void;
  onUpdateWifiPackage: (id: string, patch: Partial<WifiPackage>) => void;
  onDeleteWifiPackage: (id: string) => void;
  onDeleteWifiSale: (id: string) => void;
}

export function AdminDashboard(props: AdminDashboardProps) {
  const { authed, onAuth } = props;
  const [tab, setTab] = useState<AdminTab>("laporan");

  if (!authed) {
    return <AdminLogin onSuccess={() => onAuth(true)} />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div className="flex items-center gap-2">
        <div className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto rounded-full bg-secondary p-1">
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
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5 px-2 sm:px-3"
          onClick={() => onAuth(false)}
        >
          <LogOut className="size-4" /> <span className="hidden sm:inline">Keluar</span>
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
      {tab === "wifi" && (
        <WifiReport
          sales={props.wifiSales}
          packages={props.wifiPackages}
          onAddPackage={props.onAddWifiPackage}
          onUpdatePackage={props.onUpdateWifiPackage}
          onDeletePackage={props.onDeleteWifiPackage}
          onDeleteSale={props.onDeleteWifiSale}
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
      <div className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-[var(--shadow-card)]">
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
          Password default: <span className="font-mono font-semibold">{DEFAULT_ADMIN_PASSWORD}</span>
        </p>
      </div>
    </div>
  );
}

function AccountSettings() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

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
    <div className="max-w-sm space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold">Ubah Password</h2>
        <p className="text-sm text-muted-foreground">Amankan akses dashboard admin.</p>
      </div>
      <form onSubmit={save} className="space-y-3">
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
    </div>
  );
}