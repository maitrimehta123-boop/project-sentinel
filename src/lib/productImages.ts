import img1 from "@/assets/products/product-1.jpg";
import img2 from "@/assets/products/product-2.jpg";
import img3 from "@/assets/products/product-3.jpg";
import img4 from "@/assets/products/product-4.jpg";
import img5 from "@/assets/products/product-5.jpg";
import img6 from "@/assets/products/product-6.jpg";
import img7 from "@/assets/products/product-7.jpg";
import img8 from "@/assets/products/product-8.jpg";
import img9 from "@/assets/products/product-9.jpg";
import img10 from "@/assets/products/product-10.jpg";

// These catalog photos are already bundled in /public/assets/products, so they are
// referenced with plain root-relative paths instead of the old broken CDN pointers.
const a756 = { url: "/assets/products/1000212756.jpg" };
const a762 = { url: "/assets/products/1000212762.jpg" };
const a764 = { url: "/assets/products/1000212764.jpg" };
const a766 = { url: "/assets/products/1000212766.jpg" };
const a768 = { url: "/assets/products/1000212768.jpg" };
const a775 = { url: "/assets/products/1000212775.jpg" };
const a777 = { url: "/assets/products/1000212777.jpg" };
const a779 = { url: "/assets/products/1000212779.jpg" };
const a781 = { url: "/assets/products/1000212781.jpg" };
const a783 = { url: "/assets/products/1000212783.jpg" };

const placeholder = img1;

/**
 * Catalog images bundled with the app, keyed by the filename stored in the database.
 * Real catalog photos are CDN assets keyed by their numeric id (e.g. "1000212756").
 */
const LOCAL_IMAGES: Record<string, string> = {
  "1000212756": a756.url,
  "1000212762": a762.url,
  "1000212764": a764.url,
  "1000212766": a766.url,
  "1000212768": a768.url,
  "1000212775": a775.url,
  "1000212777": a777.url,
  "1000212779": a779.url,
  "1000212781": a781.url,
  "1000212783": a783.url,
  "product-1.jpg": img1,
  "product-2.jpg": img2,
  "product-3.jpg": img3,
  "product-4.jpg": img4,
  "product-5.jpg": img5,
  "product-6.jpg": img6,
  "product-7.jpg": img7,
  "product-8.jpg": img8,
  "product-9.jpg": img9,
  "product-10.jpg": img10,
};

/**
 * Resolves a stored image reference to a usable URL.
 * Accepts absolute URLs (admin-added products), CDN asset paths, or bundled catalog filenames.
 */
export const resolveImage = (ref?: string | null): string => {
  if (!ref) return placeholder;
  if (LOCAL_IMAGES[ref]) return LOCAL_IMAGES[ref];
  // Stored values can be plain filenames ("1000212783_(1) copy.jpg") or legacy CDN
  // pointers ("/__l5e/assets-v1/<uuid>/1000212756.jpg"). Match ONLY on the file name
  // segment — matching the whole string wrongly picked up digit runs inside the UUID
  // (e.g. "b402213c-…" → "402213"), which is why some products fell back to a placeholder.
  const fileName = ref.split("?")[0].split("/").pop() ?? "";
  if (LOCAL_IMAGES[fileName]) return LOCAL_IMAGES[fileName];
  const id = fileName.match(/\d{6,}/)?.[0];
  if (id && LOCAL_IMAGES[id]) return LOCAL_IMAGES[id];
  if (ref.startsWith("/__l5e/")) return placeholder;
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith("data:") || ref.startsWith("/")) return ref;
  return placeholder;
};


/**
 * Extra photo angles (close-up views of the same product photo) shown in the
 * product gallery. Keyed by the numeric catalog id found in the main image name.
 * The Trishield Bracelet is intentionally excluded — it already has its own set.
 */
const EXTRA_VIEWS: Record<string, string[]> = {
  "1000212756": ["/assets/products/1000212756-a.jpg", "/assets/products/1000212756-b.jpg"],
  "1000212762": ["/assets/products/1000212762-a.jpg", "/assets/products/1000212762-b.jpg"],
  "1000212764": ["/assets/products/1000212764-a.jpg", "/assets/products/1000212764-b.jpg"],
  "1000212766": ["/assets/products/1000212766-a.jpg", "/assets/products/1000212766-b.jpg"],
  "1000212768": ["/assets/products/1000212768-a.jpg", "/assets/products/1000212768-b.jpg"],
  "1000212775": ["/assets/products/1000212775 copy.jpg", "/assets/products/1000212775-a.jpg"],
  "1000212777": ["/assets/products/1000212777 copy.jpg", "/assets/products/1000212777-a.jpg"],
  "1000212779": ["/assets/products/1000212779 copy.jpg", "/assets/products/1000212779-a.jpg"],
  "1000212781": ["/assets/products/1000212781 copy.jpg", "/assets/products/1000212781-a.jpg"],
  "1000212783": ["/assets/products/1000212783 copy.jpg", "/assets/products/1000212783-a.jpg"],
};

const catalogKey = (ref?: string | null) => {
  if (!ref) return null;
  const fileName = ref.split("?")[0].split("/").pop() ?? "";
  return fileName.match(/\d{6,}/)?.[0] ?? null;
};

export const resolveImages = (product: {
  id?: string;
  image_url?: string | null;
  images?: string[] | null;
}): string[] => {
  const list = (product.images ?? []).filter(Boolean);
  const all = list.length ? list : product.image_url ? [product.image_url] : [];
  const resolved = all.map(resolveImage);
  if (product.id !== "trishield-bracelet") {
    const key = catalogKey(all[0] ?? product.image_url);
    for (const extra of (key && EXTRA_VIEWS[key]) || []) {
      if (!resolved.includes(extra)) resolved.push(extra);
    }
  }
  return resolved.length ? resolved : [placeholder];
};
