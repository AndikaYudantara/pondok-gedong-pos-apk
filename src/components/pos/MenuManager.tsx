import { useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Category, MenuItem, MenuVariant } from "@/lib/pos/types";
import { formatRupiah } from "@/lib/pos/format";
import { fileToCompressedDataUrl } from "@/lib/pos/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface MenuManagerProps {
  menu: MenuItem[];
  categories: Category[];
  onAdd: (item: Omit<MenuItem, "id">) => void;
  onUpdate: (id: string, patch: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
}

interface DraftVariant {
  id: string;
  name: string;
  price: string;
}

interface Draft {
  name: string;
  category: Category;
  price: string;
  emoji: string;
  image?: string;
  description: string;
  trackStock: boolean;
  stock: string;
  variants: DraftVariant[];
}

const emptyDraft = (category: Category): Draft => ({
  name: "",
  category,
  price: "",
  emoji: "☕",
  image: undefined,
  description: "",
  trackStock: true,
  stock: "10",
  variants: [],
});

export function MenuManager({ menu, categories, onAdd, onUpdate, onDelete }: MenuManagerProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft(categories[0] ?? "Lainnya"));
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setEditing(null);
    setDraft(emptyDraft(categories[0] ?? "Lainnya"));
    setOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setDraft({
      name: item.name,
      category: item.category,
      price: String(item.price),
      emoji: item.emoji,
      image: item.image,
      description: item.description ?? "",
      trackStock: item.stock != null,
      stock: item.stock != null ? String(item.stock) : "10",
      variants: (item.variants ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        price: String(v.priceDelta),
      })),
    });
    setOpen(true);
  }

  function addVariant() {
    setDraft((d) => ({
      ...d,
      variants: [...d.variants, { id: crypto.randomUUID(), name: "", price: "0" }],
    }));
  }

  function updateVariant(id: string, patch: Partial<DraftVariant>) {
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }));
  }

  function removeVariant(id: string) {
    setDraft((d) => ({ ...d, variants: d.variants.filter((v) => v.id !== id) }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    try {
      const url = await fileToCompressedDataUrl(file);
      setDraft((d) => ({ ...d, image: url }));
    } catch {
      toast.error("Gagal memproses gambar");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function save() {
    const name = draft.name.trim();
    const price = Number(draft.price);
    if (!name) {
      toast.error("Nama menu wajib diisi");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Harga tidak valid");
      return;
    }
    const variants: MenuVariant[] = draft.variants
      .map((v) => ({
        id: v.id,
        name: v.name.trim(),
        priceDelta: Number(v.price || "0"),
      }))
      .filter((v) => v.name);
    const payload = {
      name,
      category: draft.category,
      price,
      emoji: draft.emoji.trim() || "🍽️",
      image: draft.image,
      description: draft.description.trim() || undefined,
      stock: draft.trackStock ? Number(draft.stock || "0") : null,
      variants: variants.length ? variants : undefined,
    };
    if (editing) {
      onUpdate(editing.id, payload);
      toast.success("Menu diperbarui");
    } else {
      onAdd(payload);
      toast.success("Menu ditambahkan");
    }
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Kelola Menu</h2>
          <p className="text-sm text-muted-foreground">{menu.length} item</p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="size-4" /> Tambah Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {menu.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-2xl">
              {item.image ? (
                <img src={item.image} alt={item.name} className="size-full object-cover" />
              ) : (
                <span>{item.emoji}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category}</p>
              <p className="text-sm font-bold text-primary">{formatRupiah(item.price)}</p>
              {item.variants && item.variants.length > 0 && (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {item.variants.length} varian: {item.variants.map((v) => v.name).join(", ")}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(item)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-destructive hover:text-destructive"
                onClick={() => setDeleting(item)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {menu.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            Belum ada menu. Tambahkan menu pertama Anda.
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Menu" : "Tambah Menu"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Photo */}
            <div className="space-y-2">
              <Label>Foto Menu</Label>
              <div className="flex items-center gap-3">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-3xl">
                  {draft.image ? (
                    <img src={draft.image} alt="Pratinjau" className="size-full object-cover" />
                  ) : (
                    <span>{draft.emoji}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImagePlus className="size-4" /> Unggah Foto
                  </Button>
                  {draft.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => setDraft((d) => ({ ...d, image: undefined }))}
                    >
                      <X className="size-4" /> Hapus Foto
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="m-name">Nama Menu</Label>
              <Input
                id="m-name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="cth. Kopi Susu Gula Aren"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="m-price">Harga (Rp)</Label>
                <Input
                  id="m-price"
                  inputMode="numeric"
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, price: e.target.value.replace(/[^\d]/g, "") }))
                  }
                  placeholder="23000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-emoji">Emoji</Label>
                <Input
                  id="m-emoji"
                  value={draft.emoji}
                  onChange={(e) => setDraft((d) => ({ ...d, emoji: e.target.value }))}
                  placeholder="☕"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={draft.category}
                onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="m-desc">Deskripsi (opsional)</Label>
              <Input
                id="m-desc"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="cth. Khas pegunungan"
              />
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="m-track" className="cursor-pointer">
                    Lacak Stok
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Kurangi otomatis saat terjual
                  </p>
                </div>
                <Switch
                  id="m-track"
                  checked={draft.trackStock}
                  onCheckedChange={(v) => setDraft((d) => ({ ...d, trackStock: v }))}
                />
              </div>
              {draft.trackStock && (
                <div className="space-y-2">
                  <Label htmlFor="m-stock">Jumlah Stok</Label>
                  <Input
                    id="m-stock"
                    inputMode="numeric"
                    value={draft.stock}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, stock: e.target.value.replace(/[^\d]/g, "") }))
                    }
                    placeholder="10"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="cursor-default">Varian (opsional)</Label>
                  <p className="text-xs text-muted-foreground">
                    Selisih harga dari harga dasar (boleh 0 / minus)
                  </p>
                </div>
                <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={addVariant}>
                  <Plus className="size-4" /> Varian
                </Button>
              </div>
              {draft.variants.length > 0 && (
                <div className="space-y-2">
                  {draft.variants.map((v) => (
                    <div key={v.id} className="flex items-center gap-2">
                      <Input
                        value={v.name}
                        onChange={(e) => updateVariant(v.id, { name: e.target.value })}
                        placeholder="cth. Dingin"
                        className="flex-1"
                      />
                      <div className="relative w-28 shrink-0">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          Rp
                        </span>
                        <Input
                          inputMode="numeric"
                          value={v.price}
                          onChange={(e) =>
                            updateVariant(v.id, { price: e.target.value.replace(/[^\d-]/g, "") })
                          }
                          placeholder="0"
                          className="pl-8"
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-9 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeVariant(v.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus menu ini?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" akan dihapus permanen dari daftar menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) {
                  onDelete(deleting.id);
                  toast.success("Menu dihapus");
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
