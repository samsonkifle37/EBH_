import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Mobile bottom action bar (hidden on lg+, where a sticky side panel is used
 * instead). Safe-area aware. Add bottom padding to the page so content isn't
 * obscured.
 */
export default function StickyCTA({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-ivory-card/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden",
        className,
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2">{children}</div>
    </div>
  );
}
