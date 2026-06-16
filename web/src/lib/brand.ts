// Single source of truth for the EBH brand mark (the gold "nu" monogram).
// Used by the React <BrandMark> component, the favicon (app/icon.svg), and the
// share/OG images (rendered as an SVG data URI).

export const EBH_GREEN = "#15613e";
export const EBH_GREEN_DARK = "#0f3d28";
export const EBH_GOLD_FROM = "#EAC56A";
export const EBH_GOLD_MID = "#C9971E";
export const EBH_GOLD_TO = "#A2730E";

// viewBox 0 0 120 120. Two rounded strokes form an "n" sharing a tall middle
// stem that flows into a "u" bowl; a diamond tittle sits above the right stem.
export const MARK_N_PATH = "M26 96 V56 A17 17 0 0 1 60 56 V96";
export const MARK_U_PATH = "M60 50 V80 A17 17 0 0 0 94 80 V42";
export const MARK_DIAMOND_PATH = "M94 20 L102 28 L94 36 L86 28 Z";

/** Raw SVG string for the mark, for non-React contexts (favicon, OG images). */
export function markSvg({ tile = false, id = "ebhGold" }: { tile?: boolean; id?: string } = {}): string {
  const grad =
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${EBH_GOLD_FROM}"/>` +
    `<stop offset="0.55" stop-color="${EBH_GOLD_MID}"/>` +
    `<stop offset="1" stop-color="${EBH_GOLD_TO}"/>` +
    `</linearGradient>`;
  const tileRect = tile ? `<rect x="2" y="2" width="116" height="116" rx="28" fill="${EBH_GREEN_DARK}"/>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">` +
    `<defs>${grad}</defs>${tileRect}` +
    `<g fill="none" stroke="url(#${id})" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${MARK_N_PATH}"/><path d="${MARK_U_PATH}"/></g>` +
    `<path d="${MARK_DIAMOND_PATH}" fill="url(#${id})"/>` +
    `</svg>`
  );
}

/** Base64 data URI of the mark — handy for <img src> inside satori/OG images. */
export function markDataUri(opts?: { tile?: boolean; id?: string }): string {
  const b64 = Buffer.from(markSvg(opts)).toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}
