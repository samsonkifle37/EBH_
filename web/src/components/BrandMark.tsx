import {
  MARK_N_PATH,
  MARK_U_PATH,
  MARK_DIAMOND_PATH,
  EBH_GOLD_FROM,
  EBH_GOLD_MID,
  EBH_GOLD_TO,
  EBH_GREEN_DARK,
} from "@/lib/brand";
import { cn } from "@/lib/cn";

/** The EBH gold "nu" monogram. `tile` draws it on the dark-green app-icon tile. */
export default function BrandMark({ className, tile = false }: { className?: string; tile?: boolean }) {
  const gradId = tile ? "ebhMarkGoldTile" : "ebhMarkGold";
  return (
    <svg viewBox="0 0 120 120" className={cn("block", className)} role="img" aria-label="Ethiopian Business Hub">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={EBH_GOLD_FROM} />
          <stop offset="0.55" stopColor={EBH_GOLD_MID} />
          <stop offset="1" stopColor={EBH_GOLD_TO} />
        </linearGradient>
      </defs>
      {tile && <rect x="2" y="2" width="116" height="116" rx="28" fill={EBH_GREEN_DARK} />}
      <g fill="none" stroke={`url(#${gradId})`} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round">
        <path d={MARK_N_PATH} />
        <path d={MARK_U_PATH} />
      </g>
      <path d={MARK_DIAMOND_PATH} fill={`url(#${gradId})`} />
    </svg>
  );
}
