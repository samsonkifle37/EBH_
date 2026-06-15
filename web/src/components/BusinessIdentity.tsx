interface SignatureItem {
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface IdentityProps {
  founderName: string;
  founderPhotoUrl: string;
  founderStory: string;
  brandStory: string;
  yearFounded: number | null;
  signatureItems: SignatureItem[];
  verification: {
    ownerClaimed: boolean;
    companiesHouse: boolean;
    google: boolean;
    level: number;
    lastVerified: Date | null;
    trustScore: number;
  };
}

function VerifyRow({ ok, label }: { ok: boolean; label: string }) {
  if (!ok) return null;
  return (
    <li className="flex items-center gap-2 text-sm text-neutral-700">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700" aria-hidden>✓</span>
      {label}
    </li>
  );
}

/** Boutique identity sections: founder, brand story, signature items, "what's verified". */
export default function BusinessIdentity({ founderName, founderPhotoUrl, founderStory, brandStory, yearFounded, signatureItems, verification }: IdentityProps) {
  const v = verification;
  const hasFounder = !!(founderName || founderStory || founderPhotoUrl);
  const items = signatureItems.filter((s) => s.title || s.imageUrl);

  return (
    <div className="mt-10 space-y-10">
      {hasFounder && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Meet the founder</h2>
          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-start">
            {founderPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={founderPhotoUrl} alt={founderName || "Founder"} className="h-24 w-24 shrink-0 rounded-2xl object-cover" loading="lazy" />
            )}
            <div>
              {founderName && <p className="font-semibold text-neutral-900">{founderName}</p>}
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Founder</p>
              {founderStory && <p className="mt-2 leading-relaxed text-neutral-700">{founderStory}</p>}
            </div>
          </div>
        </section>
      )}

      {brandStory && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Our story</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-neutral-700">{brandStory}</p>
          {yearFounded && <p className="mt-2 text-sm font-medium text-neutral-400">Proudly serving since {yearFounded}</p>}
        </section>
      )}

      {items.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Signature offerings</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {items.map((s, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                {s.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.imageUrl} alt={s.title || "Signature item"} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                )}
                <div className="p-4">
                  {s.title && <p className="font-semibold text-neutral-900">{s.title}</p>}
                  {s.description && <p className="mt-1 text-sm text-neutral-500">{s.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Why you can trust this listing</h2>
        <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <ul className="space-y-2">
            <VerifyRow ok={v.ownerClaimed} label="Verified owner — claimed and managed by the business" />
            <VerifyRow ok={v.companiesHouse} label="Matched to an official UK company (Companies House)" />
            <VerifyRow ok={v.google} label="Verified on Google" />
            <VerifyRow ok={v.level >= 1} label="Contact details verified" />
          </ul>
          <p className="mt-3 text-xs font-medium text-neutral-400">
            Trust Score {v.trustScore}/100 · Based on verified public data
            {v.lastVerified ? ` · Last checked ${v.lastVerified.toLocaleDateString("en-GB")}` : ""}
          </p>
        </div>
      </section>
    </div>
  );
}
