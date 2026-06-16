import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "gold" | "dark" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800",
  gold: "bg-gold-bright text-ink shadow-sm hover:brightness-105",
  dark: "bg-ink text-white shadow-sm hover:bg-ink-soft",
  outline: "border border-neutral-300 bg-white/80 text-neutral-700 hover:border-emerald-600 hover:text-emerald-700",
  ghost: "text-neutral-700 hover:bg-neutral-100",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm sm:text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string): string {
  return cn(base, BUTTON_VARIANTS[variant], SIZES[size], className);
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps & Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };
type ButtonAsLink = CommonProps & { href: string; external?: boolean } & Omit<ComponentProps<"a">, "href" | "className" | "children">;

/** Polymorphic button: renders a Next <Link>, an external <a>, or a <button>. */
export default function Button(props: ButtonAsButton | ButtonAsLink) {
  if ("href" in props && props.href !== undefined) {
    const { href, external, variant, size, className, children, ...rest } = props;
    const cls = buttonClass(variant, size, className);
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant, size, className, children, ...rest } = props;
  const cls = buttonClass(variant, size, className);
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
