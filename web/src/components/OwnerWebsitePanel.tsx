"use client";

import { useState } from "react";

/** Owner controls for Website Mode: preview, copy the shareable website link,
 * download the QR poster, and see the PrimaryWebsiteScore. */
export default function OwnerWebsitePanel({
  websiteUrl,
  posterUrl,
  score,
  qualifies,
}: {
  websiteUrl: string;
  posterUrl: string;
  score: number;
  qualifies: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-emerald-900">🌐 Your website</p>
          <p className="text-sm text-emerald-800/80">Share this anywhere — Instagram bio, business cards, shop window, WhatsApp.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-1.5">
          <span className="text-xl font-black text-emerald-700">{score}</span>
          <span className="text-[11px] font-semibold text-neutral-500">/100<br />website score</span>
        </div>
      </div>

      {!qualifies && (
        <p className="mt-3 text-xs text-emerald-800">Share your website and keep it complete to use it as your primary website.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Preview website mode ↗
        </a>
        <button
          onClick={() => { navigator.clipboard.writeText(websiteUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="inline-flex min-h-11 items-center rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          {copied ? "Link copied ✓" : "Copy website link"}
        </button>
        <a
          href={posterUrl}
          download
          className="inline-flex min-h-11 items-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700"
        >
          Download QR poster
        </a>
      </div>
    </div>
  );
}
