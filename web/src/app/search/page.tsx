import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Ethiopian Businesses",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; city?: string }>;
}

/**
 * /search — mobile bottom-nav entry point for search.
 * Forwards query params to the businesses directory.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  if (params.city) qs.set("city", params.city);

  const dest = qs.toString() ? `/businesses?${qs}` : "/businesses";
  redirect(dest);
}
