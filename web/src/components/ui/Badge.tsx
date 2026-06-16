import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "emerald" | "gold" | "ink" | "amber";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-neutral-600",
  emerald: "bg-emerald-50 text-emerald-700",
  gold: "bg-gold-soft text-gold",
  ink: "bg-ink text-white",
  amber: "bg-amber-50 text-amber-700",
};

/** Small status pill used for categories, trust, badges. */
export default function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", TONES[tone], className)}>
      {children}
    </span>
  );
}
