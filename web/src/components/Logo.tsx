import BrandMark from "@/components/BrandMark";
import { cn } from "@/lib/cn";

interface Props {
  theme?: "light" | "dark";
  /** Show the full "Ethiopian Business Hub UK" wordmark (always shows "EBH"). */
  showWordmark?: boolean;
  /** Show the gold "Discover. Connect. Grow Together." tagline. */
  showTagline?: boolean;
  className?: string;
  markClassName?: string;
}

/** Composed brand lockup: gold mark + EBH wordmark (+ optional tagline). */
export default function Logo({
  theme = "light",
  showWordmark = true,
  showTagline = false,
  className,
  markClassName,
}: Props) {
  const ink = theme === "dark" ? "text-white" : "text-ink";
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className={cn("h-9 w-9 shrink-0", markClassName)} />
      <span className="flex flex-col justify-center leading-none">
        <span className="flex items-baseline gap-1.5">
          <span className="text-lg font-black tracking-tight text-ebh-green">EBH</span>
          {showWordmark && (
            <span className={cn("hidden text-[13px] font-bold leading-tight sm:inline", ink)}>
              Ethiopian Business Hub <span className="text-ebh-green">UK</span>
            </span>
          )}
        </span>
        {showTagline && (
          <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            Discover. Connect. Grow Together.
          </span>
        )}
      </span>
    </span>
  );
}
