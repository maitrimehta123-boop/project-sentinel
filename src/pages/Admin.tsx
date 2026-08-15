import { useEffect, useState, useCallback } from "react";
import PageLayout from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Trash2, Download, Upload, Star, Plus, X, Pencil, Truck } from "lucide-react";
import ProductEditDialog from "@/components/admin/ProductEditDialog";

/* ─── shared helpers ─── */

const useList = (table: string, order = "created_at") => {
  const [data, setData] = useState<any[]>([]);
  const load = useCallback(() => {
    supabase.from(table as any).select("*").order(order, { ascending: false }).then(({ data }) => setData(data ?? []));
  }, [table, order]);
  useEffect(() => { load(); }, [load]);
  return [data, load] as const;
};

const Card = ({ children }: { children: React.ReactNode }) => <div className="glass-gold rounded-2xl p-5 mt-6">{children}</div>;

const inputCls = "bg-background/40 border-gold/20";

/* ─── image upload helper ─── */

const uploadImage = async (file: File, bucket: string): Promise<string | null> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) { toast.error("Upload failed: " + error.message); return null; }
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return pub.publicUrl;
};

const ImageUpload = ({ bucket, onUploaded, label }: { bucket: string; onUploaded: (url: string) => void; label?: string }) => {
  const [uploading, setUploading] = useState(false);
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    const url = await uploadImage(file, bucket);
    setUploading(false);
    if (url) { onUploaded(url); toast.success("Image uploaded"); }
  };
  return (
    <div>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-cosmic-silver/80 hover:text-gold transition-colors">
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-background/40 border border-gold/20 border-dashed">
          <Upload className="h-4 w-4 text-gold" />
          {uploading ? "Uploading..." : label || "Upload Image"}
        </span>
        <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handle} className="hidden" disabled={uploading} />
      </label>
    </div>
  );
};

/* ─── main admin ─── */

const Admin = () => {
  return (
    <PageLayout title="Admin Dashboard">
      <div className="container max-w-6xl">
        <StatsOverview />
        <Tabs defaultValue="appointments" className="w-full mt-6">
          <TabsList className="glass-gold flex-wrap h-auto justify-start">
            {["appointments", "shop", "orders", "testimonials", "offers", "messages", "customers"].map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground">{t}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="appointments"><AppointmentsTab /></TabsContent>
          <TabsContent value="shop"><ProductsTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
          <TabsContent value="offers"><OffersTab /></TabsContent>
          <TabsContent value="messages"><MessagesTab /></TabsContent>
          <TabsContent value="customers"><CustomersTab /></TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

/* ─── stats ─── */

const StatsOverview = () => {
  const [stats, setStats] = useState({ bookings: 0, todayBookings: 0, orders: 0, revenue: 0 });
  useEffect(() => {
    (async () => {
      const { data: appts } = await supabase.from("appointments").select("id, created_at");
      const { data: orders } = await supabase.from("orders").select("id, total, status");
      const today = new Date().toDateString();
      setStats({
        bookings: appts?.length ?? 0,
        todayBookings: (appts ?? []).filter((a: any) => new Date(a.created_at).toDateString() === today).length,
        orders: orders?.length ?? 0,
        revenue: (orders ?? []).reduce((s: number, o: any) => s + Number(o.total || 0), 0),
      });
    })();
  }, []);
  const items = [
    { label: "WhatsApp Bookings", value: stats.bookings },
    { label: "Bookings Today", value: stats.todayBookings },
    { label: "Shop Orders", value: stats.orders },
    { label: "Shop Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}` },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((i) => (
        <div key={i.label} className="glass-gold rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-gold">{i.value}</div>
          <div className="text-xs text-cosmic-silver/70 mt-1">{i.label}</div>
        </div>
      ))}
    </div>
  );
};

/* ─── appointments ─── */

const AppointmentsTab = () => {
  const [list, reload] = useList("appointments");
  return (
    <div className="space-y-3 mt-6">
      {list.length === 0 && <div className="text-center text-cosmic-silver/60 py-8">No appointments yet</div>}
      {list.map((a) => (
        <div key={a.id} className="glass-gold rounded-2xl p-4">
          <div className="flex justify-between">
            <div><div className="font-display text-gold">{a.name}</div><div className="text-xs text-cosmic-silver/70">{a.phone} • {a.service}</div></div>
            <div className="text-xs text-cosmic-silver/70">{a.appointment_date} {a.appointment_time}</div>
          </div>
          {a.message && <p className="text-xs text-cosmic-silver/60 mt-2">{a.message}</p>}
          <select value={a.status} onChange={async (e) => { await supabase.from("appointments").update({ status: e.target.value }).eq("id", a.id); reload(); }} className="bg-background/60 border border-gold/30 rounded px-2 text-xs mt-2">
            {["pending", "confirmed", "completed", "cancelled"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
};

/* ─── orders ─── */

const OrdersTab = () => (
  <Card>
    <h3 className="font-display text-gold mb-2 flex items-center gap-2"><Truck className="h-4 w-4" /> Orders & Order Tracking</h3>
    <p className="text-sm text-cosmic-silver/70">
      Order tracking is managed on its own dedicated admin page — update status, courier, tracking number and
      delivery notes there, and customers see it live on their tracking page.
    </p>
    <Button asChild className="mt-4 bg-gradient-gold text-primary-foreground">
      <Link to="/admin/orders">Open Order Tracking</Link>
    </Button>
  </Card>
);

/* ─── products (with image upload) ─── */

const ProductsTab = () => {
  const [list, reload] = useList("products");
  const [f, setF] = useState({ name: "", description: "", price: "", image_url: "", category: "", stock: "100", discount_percent: "0", rating: "4.7" });
  const [imagePreview, setImagePreview] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const create = async () => {
    if (!f.name || !f.price) return toast.error("Name and price required");
    const images = [f.image_url, ...gallery].filter(Boolean);
    const { error } = await supabase.from("products").insert({
      name: f.name,
      description: f.description,
      category: f.category,
      image_url: f.image_url || images[0] || null,
      images: images.length ? images : null,
      price: parseFloat(f.price),
      stock: parseInt(f.stock),
      discount_percent: Number(f.discount_percent) || 0,
      rating: Math.min(4.8, Number(f.rating) || 4.7),
    });
    if (error) return toast.error(error.message);
    toast.success("Product added");
    setF({ name: "", description: "", price: "", image_url: "", category: "", stock: "100", discount_percent: "0", rating: "4.7" });
    setImagePreview(""); setGallery([]); reload();
  };
  const del = async (id: string) => { await supabase.from("products").delete().eq("id", id); reload(); };

  /** Inline edit of the fields the shop renders. */
  const patch = async (
    id: string,
    values: { price?: number; discount_percent?: number; category?: string; rating?: number }
  ) => {
    const { error } = await supabase.from("products").update(values).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product updated"); reload();
  };

  return (
    <>
      <Card>
        <h3 className="font-display text-gold mb-3">Add Product</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Product Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} />
          <Input placeholder="Category (e.g. mala, gemstone)" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls} />
          <Input placeholder="Price (₹)" type="number" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} className={inputCls} />
          <Input placeholder="Stock" type="number" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} className={inputCls} />
          <Input placeholder="Discount %" type="number" value={f.discount_percent} onChange={(e) => setF({ ...f, discount_percent: e.target.value })} className={inputCls} />
          <Input placeholder="Rating (max 4.8)" type="number" step="0.1" value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })} className={inputCls} />
        </div>
        <div className="mt-3">
          <label className="text-xs uppercase tracking-widest text-gold/70 mb-2 block">Product Image</label>
          <div className="flex items-center gap-4">
            <ImageUpload bucket="shop-images" label="Upload Product Photo" onUploaded={(url) => { setF({ ...f, image_url: url }); setImagePreview(url); }} />
            {imagePreview && <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover border border-gold/20" />}
          </div>
          {f.image_url && <Input value={f.image_url} readOnly className={`mt-2 text-xs ${inputCls}`} placeholder="Image URL (auto-filled after upload)" />}
        </div>
        <div className="mt-3">
          <label className="text-xs uppercase tracking-widest text-gold/70 mb-2 block">Gallery Images (add 3–4 more)</label>
          <div className="flex flex-wrap items-center gap-3">
            <ImageUpload bucket="shop-images" label="Add Gallery Photo" onUploaded={(url) => setGallery((g) => [...g, url])} />
            {gallery.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="gallery" className="h-16 w-16 rounded-lg object-cover border border-gold/20" />
                <button type="button" onClick={() => setGallery((g) => g.filter((u) => u !== url))} className="absolute -top-2 -right-2 bg-background rounded-full text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <Textarea placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`mt-3 ${inputCls}`} />
        <Button onClick={create} className="mt-3 bg-gradient-gold text-primary-foreground">Add Product</Button>
      </Card>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {list.map((p) => (
          <div key={p.id} className="glass-gold rounded-2xl p-4 flex gap-3">
            {p.image_url && <img src={p.image_url} className="h-16 w-16 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{p.name}</div>
              <div className="text-xs text-gold">₹{Number(p.price).toLocaleString("en-IN")}</div>
              <div className="text-xs text-cosmic-silver/60">Stock: {p.stock}</div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                <Input defaultValue={p.price} type="number" onBlur={(e) => Number(e.target.value) !== Number(p.price) && patch(p.id, { price: Number(e.target.value) })} className={`h-8 text-xs ${inputCls}`} aria-label="Price" />
                <Input defaultValue={p.discount_percent ?? 0} type="number" onBlur={(e) => Number(e.target.value) !== Number(p.discount_percent) && patch(p.id, { discount_percent: Number(e.target.value) })} className={`h-8 text-xs ${inputCls}`} aria-label="Discount %" />
                <Input defaultValue={p.category ?? ""} onBlur={(e) => e.target.value !== (p.category ?? "") && patch(p.id, { category: e.target.value })} className={`h-8 text-xs ${inputCls}`} aria-label="Category" />
                <Input defaultValue={p.rating ?? 4.7} type="number" step="0.1" onBlur={(e) => Number(e.target.value) !== Number(p.rating) && patch(p.id, { rating: Math.min(4.8, Number(e.target.value)) })} className={`h-8 text-xs ${inputCls}`} aria-label="Rating" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => setEditing(p)} aria-label="Edit product" className="text-gold"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(p.id)} aria-label="Delete product" className="text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <ProductEditDialog product={editing} onClose={() => setEditing(null)} onSaved={reload} />
    </>
  );
};

/* ─── testimonials (client reviews) ─── */

const TestimonialsTab = () => {
  const [list, reload] = useList("testimonials");
  const [f, setF] = useState({ client_name: "", location: "", rating: 5, message: "", avatar_url: "" });
  const [avatarPreview, setAvatarPreview] = useState("");

  const create = async () => {
    if (!f.client_name.trim()) return toast.error("Client name required");
    if (!f.message.trim()) return toast.error("Review message required");
    const { error } = await supabase.from("testimonials").insert({
      client_name: f.client_name.trim(),
      location: f.location.trim() || null,
      rating: f.rating,
      message: f.message.trim(),
      avatar_url: f.avatar_url || null,
      featured: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Review added"); setF({ client_name: "", location: "", rating: 5, message: "", avatar_url: "" }); setAvatarPreview(""); reload();
  };
  const del = async (id: string) => { await supabase.from("testimonials").delete().eq("id", id); reload(); };

  return (
    <>
      <Card>
        <h3 className="font-display text-gold mb-3">Add Client Review</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Client Name" value={f.client_name} onChange={(e) => setF({ ...f, client_name: e.target.value })} className={inputCls} />
          <Input placeholder="Location (e.g. Mumbai)" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} className={inputCls} />
        </div>
        <div className="mt-3">
          <label className="text-xs uppercase tracking-widest text-gold/70 mb-2 block">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setF({ ...f, rating: n })}>
                <Star className={`h-6 w-6 ${n <= f.rating ? "fill-gold text-gold" : "text-cosmic-silver/30"}`} />
              </button>
            ))}
          </div>
        </div>
        <Textarea placeholder="Client's review message" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className={`mt-3 ${inputCls}`} />
        <div className="mt-3">
          <label className="text-xs uppercase tracking-widest text-gold/70 mb-2 block">Client Photo (optional)</label>
          <div className="flex items-center gap-4">
            <ImageUpload bucket="testimonials" label="Upload Client Photo" onUploaded={(url) => { setF({ ...f, avatar_url: url }); setAvatarPreview(url); }} />
            {avatarPreview && <img src={avatarPreview} alt="preview" className="h-16 w-16 rounded-full object-cover border border-gold/20" />}
          </div>
        </div>
        <Button onClick={create} className="mt-3 bg-gradient-gold text-primary-foreground">Add Review</Button>
      </Card>
      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        {list.map((t) => (
          <div key={t.id} className="glass-gold rounded-2xl p-4 flex gap-3">
            {t.avatar_url ? <img src={t.avatar_url} className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">{t.client_name?.[0] || "?"}</div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t.client_name}</span>
                <span className="text-xs text-gold">{"★".repeat(t.rating)}</span>
              </div>
              {t.location && <div className="text-xs text-cosmic-silver/60">{t.location}</div>}
              <p className="text-xs text-cosmic-silver/80 mt-1 line-clamp-2">{t.message}</p>
            </div>
            <button onClick={() => del(t.id)} className="text-destructive self-start"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </>
  );
};

/* ─── offers (coupons) ─── */

const OffersTab = () => {
  const [list, reload] = useList("coupons");
  const [f, setF] = useState({ code: "", description: "", discount_type: "percent", discount_value: "", min_order: "0", max_discount: "", usage_limit: "", expires_at: "" });

  const create = async () => {
    if (!f.code.trim()) return toast.error("Coupon code required");
    if (!f.discount_value) return toast.error("Discount value required");
    const payload: any = {
      code: f.code.trim().toUpperCase(),
      description: f.description.trim() || null,
      discount_type: f.discount_type,
      discount_value: parseFloat(f.discount_value),
      min_order: parseFloat(f.min_order) || 0,
      max_discount: f.max_discount ? parseFloat(f.max_discount) : null,
      usage_limit: f.usage_limit ? parseInt(f.usage_limit) : null,
      expires_at: f.expires_at ? new Date(f.expires_at).toISOString() : null,
      active: true,
    };
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Offer created"); setF({ code: "", description: "", discount_type: "percent", discount_value: "", min_order: "0", max_discount: "", usage_limit: "", expires_at: "" }); reload();
  };
  const toggle = async (id: string, active: boolean) => { await supabase.from("coupons").update({ active: !active }).eq("id", id); reload(); };
  const del = async (id: string) => { await supabase.from("coupons").delete().eq("id", id); reload(); };

  return (
    <>
      <Card>
        <h3 className="font-display text-gold mb-3">Add Offer / Coupon</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Coupon Code (e.g. DIWALI20)" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} className={inputCls} />
          <select value={f.discount_type} onChange={(e) => setF({ ...f, discount_type: e.target.value })} className={`h-10 rounded-md ${inputCls} px-3`}>
            <option value="percent">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
          <Input placeholder={f.discount_type === "percent" ? "Discount % (e.g. 20)" : "Discount ₹ (e.g. 100)"} type="number" value={f.discount_value} onChange={(e) => setF({ ...f, discount_value: e.target.value })} className={inputCls} />
          <Input placeholder="Min Order ₹ (default 0)" type="number" value={f.min_order} onChange={(e) => setF({ ...f, min_order: e.target.value })} className={inputCls} />
          <Input placeholder="Max Discount ₹ (optional)" type="number" value={f.max_discount} onChange={(e) => setF({ ...f, max_discount: e.target.value })} className={inputCls} />
          <Input placeholder="Usage Limit (optional)" type="number" value={f.usage_limit} onChange={(e) => setF({ ...f, usage_limit: e.target.value })} className={inputCls} />
          <Input placeholder="Expiry Date (optional)" type="date" value={f.expires_at} onChange={(e) => setF({ ...f, expires_at: e.target.value })} className={inputCls} />
          <Input placeholder="Description (optional)" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={inputCls} />
        </div>
        <Button onClick={create} className="mt-3 bg-gradient-gold text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Create Offer</Button>
      </Card>
      <div className="space-y-3 mt-6">
        {list.length === 0 && <div className="text-center text-cosmic-silver/60 py-8">No offers yet</div>}
        {list.map((c) => (
          <div key={c.id} className="glass-gold rounded-2xl p-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-gold text-lg">{c.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{c.active ? "Active" : "Inactive"}</span>
              </div>
              <div className="text-xs text-cosmic-silver/70 mt-1">
                {c.discount_type === "percent" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                {c.min_order > 0 && ` • Min order ₹${c.min_order}`}
                {c.max_discount && ` • Max ₹${c.max_discount}`}
                {c.usage_limit && ` • ${c.used_count}/${c.usage_limit} used`}
                {c.expires_at && ` • Expires ${new Date(c.expires_at).toLocaleDateString()}`}
              </div>
              {c.description && <div className="text-xs text-cosmic-silver/60 mt-1">{c.description}</div>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(c.id, c.active)} className="text-xs px-2 py-1 rounded border border-gold/30 hover:bg-gold/10">{c.active ? "Deactivate" : "Activate"}</button>
              <button onClick={() => del(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ─── messages ─── */

const MessagesTab = () => {
  const [list] = useList("contact_messages");
  return (
    <div className="space-y-3 mt-6">
      {list.length === 0 && <div className="text-center text-cosmic-silver/60 py-8">No messages yet</div>}
      {list.map((m) => (
        <div key={m.id} className="glass-gold rounded-2xl p-4">
          <div className="flex justify-between">
            <div className="font-display text-gold">{m.name}</div>
            <div className="text-xs text-cosmic-silver/60">{new Date(m.created_at).toLocaleString()}</div>
          </div>
          <div className="text-xs text-cosmic-silver/70">{m.email} • {m.phone}</div>
          {m.subject && <div className="text-sm text-foreground mt-1">{m.subject}</div>}
          <p className="text-sm text-cosmic-silver/85 mt-2">{m.message}</p>
        </div>
      ))}
    </div>
  );
};

/* ─── customers ─── */

const CustomersTab = () => {
  const [list] = useList("profiles");

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Registered On"];
    const rows = list.map((p) => [p.full_name || "—", p.email || "—", p.phone || "—", new Date(p.created_at).toLocaleString()]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-cosmic-silver/70">{list.length} registered customers</div>
        <Button onClick={exportCSV} className="bg-gradient-gold text-primary-foreground" disabled={list.length === 0}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
      </div>
      <div className="space-y-2">
        {list.map((p) => (
          <div key={p.id} className="glass-gold rounded-2xl p-3 flex justify-between">
            <div><div className="text-sm font-semibold">{p.full_name || "—"}</div><div className="text-xs text-cosmic-silver/60">{p.email}</div></div>
            <div className="text-xs text-cosmic-silver/60 text-right"><div>{p.phone || "—"}</div><div>{new Date(p.created_at).toLocaleDateString()}</div></div>
          </div>
        ))}
        {list.length === 0 && <div className="text-center text-cosmic-silver/60 py-8">No registered customers yet</div>}
      </div>
    </div>
  );
};

export default Admin;
