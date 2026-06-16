import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Premium surface: rounded, soft-shadowed ivory card. */
export default function Card({
  children,
  className,
  interactive = false,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "article" | "section";
}) {
  return (
    <As
      className={cn(
        "rounded-2xl border border-neutral-200/80 bg-ivory-card shadow-sm",
        interactive && "transition hover:-translate-y-0.5 hover:border-emerald-600/60 hover:shadow-md",
        className,
      )}
    >
      {children}
    </As>
  );
}
