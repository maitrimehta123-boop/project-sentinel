// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Static routes are listed here; product URLs are pulled live from Supabase so the
// sitemap always mirrors the catalogue that /shop renders.

import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://astrowithhrishi.com";

// Netlify injects build env vars; locally they live in .env, which this plain
// script does not get from Vite — so read it directly when present.
const fromEnvFile = (key: string): string | undefined => {
  if (!existsSync(".env")) return undefined;
  const line = readFileSync(".env", "utf8")
    .split("\n")
    .find((l) => l.trim().startsWith(`${key}=`));
  return line?.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
};

const envVar = (key: string) => process.env[key] || fromEnvFile(key);

const SUPABASE_URL = envVar("VITE_SUPABASE_URL") ?? "https://lzfcquqtsxkemodhbyqh.supabase.co";
// Publishable anon key — same value the browser bundle already ships.
const ANON_FALLBACK =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZmNxdXF0c3hrZW1vZGhieXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDIwODksImV4cCI6MjEwMTIxODA4OX0._KGjh1D8w216PVdnG_csbsA015twT9erbkBAYhrGcCQ";
const SUPABASE_KEY =
  envVar("VITE_SUPABASE_PUBLISHABLE_KEY") ?? envVar("VITE_SUPABASE_ANON_KEY") ?? ANON_FALLBACK;



interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const fetchProductPaths = async (): Promise<SitemapEntry[]> => {
  if (!SUPABASE_KEY) return [];
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id&active=eq.true`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    );
    if (!response.ok) return [];
    const rows = (await response.json()) as { id: string }[];
    return rows.map((row) => ({
      path: `/product/${row.id}`,
      changefreq: "weekly" as const,
      priority: "0.8",
    }));
  } catch {
    return [];
  }
};

const generateSitemap = (entries: SitemapEntry[]) => {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
};

const entries = [...staticEntries, ...(await fetchProductPaths())];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
