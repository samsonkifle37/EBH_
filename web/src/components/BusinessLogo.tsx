import { businessInitials } from "@/lib/website";
import { cn } from "@/lib/cn";

/** Business logo with a branded initials fallback — so no profile looks empty. */
export default function BusinessLogo({
  name,
  logoUrl,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={cn("rounded-2xl border border-neutral-200/80 bg-white object-contain", className)}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-ebh-green text-white",
        className,
      )}
      aria-label={`${name} logo`}
      role="img"
    >
      <span className="text-[42%] font-black leading-none tracking-tight">{businessInitials(name)}</span>
    </div>
  );
}
