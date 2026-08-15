import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const inputCls = "bg-background/40 border-gold/20";

const upload = async (file: File): Promise<string | null> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("shop-images").upload(path, file, { contentType: file.type });
  if (error) { toast.error("Upload failed: " + error.message); return null; }
  return supabase.storage.from("shop-images").getPublicUrl(path).data.publicUrl;
};

const UploadBtn = ({ label, onUploaded }: { label: string; onUploaded: (url: string) => void }) => {
  const [busy, setBusy] = useState(false);
  return (
    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-background/40 border border-gold/20 border-dashed cursor-pointer text-sm text-cosmic-silver/80 hover:text-gold transition-colors">
      <Upload className="h-4 w-4 text-gold" />
      {busy ? "Uploading..." : label}
      <input
        type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
          setBusy(true);
          const url = await upload(file);
          setBusy(false);
          if (url) { onUploaded(url); toast.success("Image uploaded"); }
        }}
      />
    </label>
  );
};

type Props = { product: any | null; onClose: () => void; onSaved: () => void };

/** Edit every shop-facing field of an existing product: details, price, offer and images. */
const ProductEditDialog = ({ product, onClose, onSaved }: Props) => {
  const [f, setF] = useState<any>({});
  const [gallery, setGallery] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!product) return;
    setF({
      name: product.name ?? "",
      description: product.description ?? "",
      category: product.category ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
      discount_percent: String(product.discount_percent ?? 0),
      rating: String(product.rating ?? 4.7),
      image_url: product.image_url ?? "",
      active: product.active !== false,
    });
    setGallery(Array.isArray(product.images) ? product.images.filter(Boolean) : []);
  }, [product]);

  const save = async () => {
    if (!f.name?.trim()) return toast.error("Name required");
    if (!f.price) return toast.error("Price required");
    const images = Array.from(new Set([f.image_url, ...gallery].filter(Boolean)));
    setSaving(true);
    const { error } = await supabase.from("products").update({
      name: f.name.trim(),
      description: f.description?.trim() || null,
      category: f.category?.trim() || null,
      price: Number(f.price),
      stock: parseInt(f.stock) || 0,
      discount_percent: Number(f.discount_percent) || 0,
      rating: Math.min(4.8, Number(f.rating) || 4.7),
      image_url: f.image_url || images[0] || null,
      images: images.length ? images : null,
      active: !!f.active,
    }).eq("id", product.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Product updated");
    onSaved(); onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-gold">
        <DialogHeader><DialogTitle className="font-display text-gold">Edit Product</DialogTitle></DialogHeader>
        {product && (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Product Name" value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} />
              <Input placeholder="Category" value={f.category ?? ""} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls} />
              <Input placeholder="Price (₹)" type="number" value={f.price ?? ""} onChange={(e) => setF({ ...f, price: e.target.value })} className={inputCls} />
              <Input placeholder="Offer / Discount %" type="number" value={f.discount_percent ?? ""} onChange={(e) => setF({ ...f, discount_percent: e.target.value })} className={inputCls} />
              <Input placeholder="Stock" type="number" value={f.stock ?? ""} onChange={(e) => setF({ ...f, stock: e.target.value })} className={inputCls} />
              <Input placeholder="Rating (max 4.8)" type="number" step="0.1" value={f.rating ?? ""} onChange={(e) => setF({ ...f, rating: e.target.value })} className={inputCls} />
            </div>

            <Textarea placeholder="Description / details" rows={5} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} className={inputCls} />

            <div>
              <label className="text-xs uppercase tracking-widest text-gold/70 mb-2 block">Main Image</label>
              <div className="flex items-center gap-4">
                <UploadBtn label="Replace Main Photo" onUploaded={(url) => setF((p: any) => ({ ...p, image_url: url }))} />
                {f.image_url && <img src={f.image_url} alt={f.name} className="h-16 w-16 rounded-lg object-cover border border-gold/20" />}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-gold/70 mb-2 block">Gallery Images</label>
              <div className="flex flex-wrap items-center gap-3">
                <UploadBtn label="Add Photo" onUploaded={(url) => setGallery((g) => (g.includes(url) ? g : [...g, url]))} />
                {gallery.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="gallery" className="h-16 w-16 rounded-lg object-cover border border-gold/20" />
                    <button type="button" aria-label="Remove image" onClick={() => setGallery((g) => g.filter((u) => u !== url))} className="absolute -top-2 -right-2 bg-background rounded-full text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                    {url !== f.image_url && (
                      <button type="button" aria-label="Make main image" onClick={() => setF((p: any) => ({ ...p, image_url: url }))} className="absolute -bottom-2 -right-2 bg-background rounded-full text-gold">
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-cosmic-silver/80">
              <input type="checkbox" checked={!!f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
              Visible in shop
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} className="border-gold/30">Cancel</Button>
              <Button onClick={save} disabled={saving} className="bg-gradient-gold text-primary-foreground">{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
