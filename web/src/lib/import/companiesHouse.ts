import type { CompanySearchItem } from "@/lib/domain/importMap";

export function companiesHouseKey(): string | null {
  return process.env.COMPANIES_HOUSE_API_KEY ?? null;
}

export async function searchCompanies(term: string): Promise<CompanySearchItem[]> {
  const key = companiesHouseKey();
  if (!key) {
    throw new Error(
      "COMPANIES_HOUSE_API_KEY is not set. Get a free key at developer.company-information.service.gov.uk and add it to web/.env."
    );
  }
  const url = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(term)}&items_per_page=50`;
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Companies House API error ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { items?: CompanySearchItem[] };
  return data.items ?? [];
}
