"use client";

import { useState } from "react";

const ASSETS = [
  { type: "card", label: "Profile card", hint: "Great for posts, WhatsApp and LinkedIn", ratio: "aspect-[1200/630]" },
  { type: "story", label: "Instagram story", hint: "1080×1920 — perfect for Stories", ratio: "aspect-[9/16]" },
  { type: "poster", label: "QR poster", hint: "Print and display in your window", ratio: "aspect-[4/5]" },
] as const;

export default function ShareKit({ businessId, slug, name, publicUrl }: { businessId: string; slug: string; name: string; publicUrl: string }) {
  const [copied, setCopied] = useState(false);

  function track() {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "SHARE_CLICK", businessId }),
    }).catch(() => {});
  }

  const message = `Proud member of Ethiopian Business Hub UK — check out ${name}: ${publicUrl}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { track(); navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700"
        >
          {copied ? "Link copied ✓" : "Copy profile link"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={track}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Share on WhatsApp
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {ASSETS.map((a) => (
          <div key={a.type} className="rounded-2xl border border-neutral-200 bg-white p-3">
            <div className={`overflow-hidden rounded-xl bg-neutral-100 ${a.ratio}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/share/${slug}/${a.type}`} alt={`${name} ${a.label}`} className="h-full w-full object-cover" />
            </div>
            <p className="mt-3 text-sm font-semibold text-neutral-900">{a.label}</p>
            <p className="text-xs text-neutral-500">{a.hint}</p>
            <a
              href={`/api/share/${slug}/${a.type}`}
              download={`${slug}-${a.type}.png`}
              onClick={track}
              className="mt-3 inline-block rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Download
            </a>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-400">Every asset is generated automatically and personalised with your name, location, badge and a QR code to your profile.</p>
    </div>
  );
}
