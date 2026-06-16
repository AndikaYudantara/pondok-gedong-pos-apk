import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Category, MenuItem } from "@/lib/pos/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BACKUP_TYPE = "pondok-gedong-menu-backup";
const BACKUP_VERSION = 1;

interface BackupShape {
  type: string;
  version: number;
  exportedAt: string;
  menu: MenuItem[];
  categories: Category[];
}

interface BackupManagerProps {
  menu: MenuItem[];
  categories: Category[];
  onRestore: (menu: MenuItem[], categories: Category[]) => void;
}

export function BackupManager({ menu, categories, onRestore }: BackupManagerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupShape | null>(null);

  function exportBackup() {
    const data: BackupShape = {
      type: BACKUP_TYPE,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      menu,
      categories,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `pondok-gedong-menu-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup menu berhasil diunduh");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<BackupShape>;
      if (
        parsed.type !== BACKUP_TYPE ||
        !Array.isArray(parsed.menu) ||
        !Array.isArray(parsed.categories)
      ) {
        toast.error("File backup tidak valid");
        return;
      }
      setPending(parsed as BackupShape);
    } catch {
      toast.error("Gagal membaca file backup");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold">Backup &amp; Pulihkan Menu</h2>
        <p className="text-sm text-muted-foreground">
          Simpan data menu &amp; kategori ke file agar tidak hilang saat aplikasi
          diperbarui atau dipindahkan ke perangkat lain.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">Ekspor Backup</p>
            <p className="text-sm text-muted-foreground">
              Unduh {menu.length} menu &amp; {categories.length} kategori sebagai file JSON.
            </p>
          </div>
          <Button onClick={exportBackup} className="shrink-0 gap-1.5">
            <Download className="size-4" /> Ekspor
          </Button>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Impor Backup</p>
              <p className="text-sm text-muted-foreground">
                Pulihkan dari file backup. Data menu saat ini akan ditimpa.
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              variant="secondary"
              className="shrink-0 gap-1.5"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4" /> Impor
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: Lakukan ekspor secara berkala. Sebelum memperbarui aplikasi (update
        APK), ekspor dulu lalu impor kembali setelah update.
      </p>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pulihkan dari backup?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending && (
                <>
                  File berisi {pending.menu.length} menu &amp; {pending.categories.length}{" "}
                  kategori
                  {pending.exportedAt
                    ? ` (dibuat ${new Date(pending.exportedAt).toLocaleString("id-ID")})`
                    : ""}
                  . Seluruh menu &amp; kategori saat ini akan diganti. Tindakan ini
                  tidak dapat dibatalkan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) {
                  onRestore(pending.menu, pending.categories);
                  toast.success("Menu berhasil dipulihkan");
                }
                setPending(null);
              }}
            >
              Pulihkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
