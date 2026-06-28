"use client";

import { useState } from "react";

/**
 * NU Discover Ethiopia logo — navy tile, gold Amharic "ኑ" glyph, "NU" wordmark.
 *
 * Uses the official raster at /nu-logo.png when present; if that file is missing
 * it gracefully falls back to a faithful inline SVG recreation, so the brand
 * mark always renders. To use the exact artwork, save the supplied logo to
 * web/public/nu-logo.png (square, e.g. 512×512).
 */
export default function NuLogo({ className }: { className?: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/nu-logo.png"
        alt="NU Discover Ethiopia"
        className={className}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="NU Discover Ethiopia">
      <defs>
        <linearGradient id="nuNavy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16284f" />
          <stop offset="0.55" stopColor="#0b1733" />
          <stop offset="1" stopColor="#050c1f" />
        </linearGradient>
        <linearGradient id="nuGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e3a1" />
          <stop offset="0.5" stopColor="#e6b54e" />
          <stop offset="1" stopColor="#c8881f" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="500" height="500" rx="116" fill="url(#nuNavy)" />
      <text
        x="256"
        y="248"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="300"
        fill="url(#nuGold)"
        fontFamily="'Noto Sans Ethiopic','Nyala','Kefa','Abyssinica SIL',serif"
      >
        ኑ
      </text>
      <text
        x="256"
        y="430"
        textAnchor="middle"
        fontSize="92"
        fontWeight="800"
        letterSpacing="8"
        fill="url(#nuGold)"
        fontFamily="'Geist','Arial',sans-serif"
      >
        NU
      </text>
    </svg>
  );
}
