import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://astrowithhrishi.com";

const logoUrl = `${SITE_URL}/assets/brand-logo.jpg`;

interface SEOProps {
  title: string;
  description?: string;
  /** Route path, e.g. "/shop". Turned into an absolute canonical URL. */
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  /** Optional JSON-LD structured data object(s). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SEO = ({ title, description, path = "/", image, type = "website", noindex, jsonLd }: SEOProps) => {
  const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const img = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : logoUrl;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <meta property="og:site_name" content="Astro With Hrishi" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={img} />
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(block)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
