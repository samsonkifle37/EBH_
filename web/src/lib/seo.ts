// SEO helpers: absolute URLs, shared metadata, and validated JSON-LD builders.
// One place so structured data stays consistent and well-formed across pages.

export const SITE_URL = (process.env.SITE_URL ?? "https://ethiopianbh.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "Ethiopian Business Hub UK";
export const SUPPORT_EMAIL = "admin@nu-discoverethiopia.com";

export function absoluteUrl(path = "/"): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Open Graph + Twitter defaults for a page, merged into Next metadata. */
export function socialMeta(opts: { title: string; description: string; path: string; image?: string }) {
  const url = absoluteUrl(opts.path);
  const images = opts.image ? [{ url: opts.image }] : undefined;
  return {
    alternates: { canonical: opts.path },
    openGraph: { title: opts.title, description: opts.description, url, siteName: SITE_NAME, type: "website" as const, locale: "en_GB", images },
    twitter: { card: "summary_large_image" as const, title: opts.title, description: opts.description, images: opts.image ? [opts.image] : undefined },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    slogan: "Discover, Connect, Grow Together",
    description: "The trust and reputation layer for Ethiopian-owned businesses in the UK.",
    areaServed: "GB",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
      availableLanguage: ["en"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/businesses?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function contactPointJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    contactType: "customer support",
    email: SUPPORT_EMAIL,
    areaServed: "GB",
    availableLanguage: ["en"],
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/** Render a JSON-LD <script>. Use inside a server component. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data);
}
