"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  variant?: "hero" | "compact";
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Smart search that routes to the directory (?q=). Preserves the existing
 * search contract — purely a nicer front-end onto /businesses.
 */
export default function SearchBar({ variant = "hero", defaultValue = "", placeholder, className }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const hero = variant === "hero";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/businesses?q=${encodeURIComponent(query)}` : "/businesses");
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        "flex items-center gap-2 rounded-2xl border bg-white",
        hero ? "border-neutral-200 p-2 shadow-lg shadow-emerald-900/5" : "border-neutral-200 px-2 py-1",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className={cn("ml-2 shrink-0 text-neutral-400", hero ? "h-5 w-5" : "h-4 w-4")} aria-hidden>
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.4 9.83l3.38 3.38a.75.75 0 1 0 1.06-1.06l-3.38-3.38A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
      </svg>
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search Ethiopian businesses"
        placeholder={placeholder ?? "Search restaurants, grocery, lawyers, beauty…"}
        className={cn("min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400", hero ? "px-1 py-2.5 text-sm sm:text-base" : "px-1 py-1.5 text-sm")}
      />
      <button
        type="submit"
        className={cn(
          "shrink-0 rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800",
          hero ? "px-5 py-2.5 text-sm" : "px-3.5 py-1.5 text-xs",
        )}
      >
        Search
      </button>
    </form>
  );
}
