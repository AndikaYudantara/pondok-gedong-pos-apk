import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Category, MenuItem } from "@/lib/pos/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface CategoryManagerProps {
  categories: Category[];
  menu: MenuItem[];
  onAdd: (name: string) => boolean;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

export function CategoryManager({
  categories,
  menu,
  onAdd,
  onRename,
  onDelete,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  function add() {
    const ok = onAdd(newName);
    if (ok) {
      toast.success("Kategori ditambahkan");
      setNewName("");
    } else {
      toast.error("Kategori kosong atau sudah ada");
    }
  }

  function startEdit(name: string) {
    setEditing(name);
    setEditValue(name);
  }

  function saveEdit() {
    const clean = editValue.trim();
    if (!clean || !editing) return;
    if (clean !== editing && categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      toast.error("Nama kategori sudah ada");
      return;
    }
    onRename(editing, clean);
    toast.success("Kategori diperbarui");
    setEditing(null);
  }

  const countFor = (cat: string) => menu.filter((m) => m.category === cat).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold">Kelola Kategori</h2>
        <p className="text-sm text-muted-foreground">{categories.length} kategori</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Nama kategori baru…"
          className="bg-card"
        />
        <Button onClick={add} className="shrink-0 gap-1.5">
          <Plus className="size-4" /> Tambah
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => {
          const used = countFor(cat);
          return (
            <div
              key={cat}
              className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
            >
              {editing === cat ? (
                <>
                  <Input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="h-9"
                  />
                  <Button size="icon" variant="ghost" className="size-8" onClick={saveEdit}>
                    <Check className="size-4 text-success" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => setEditing(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium">{cat}</span>
                  <span className="text-xs text-muted-foreground">{used} menu</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => startEdit(cat)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleting(cat)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </>
              )}
            </div>
          );
        })}
        {categories.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">Belum ada kategori.</p>
        )}
      </div>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori "{deleting}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && countFor(deleting) > 0
                ? `${countFor(deleting)} menu memakai kategori ini. Menu tetap ada, tetapi kategorinya perlu diperbarui.`
                : "Kategori ini akan dihapus."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) {
                  onDelete(deleting);
                  toast.success("Kategori dihapus");
                }
                setDeleting(null);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
