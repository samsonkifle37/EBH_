/**
 * Only allow same-origin relative redirect targets. Rejects absolute URLs,
 * protocol-relative ("//evil.com"), backslash tricks and control chars — which
 * could otherwise turn a `?next=` param into an open redirect (phishing).
 */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || next[0] !== "/") return fallback;
  if (next[1] === "/" || next[1] === "\\") return fallback; // // or /\ → off-site
  for (let i = 0; i < next.length; i++) {
    const c = next.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return fallback; // control characters
  }
  return next;
}
