"use client";

import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics/client";
import {
  buildMailto,
  CONTACT_CATEGORIES,
  SUPPORT_EMAIL,
  type ContactCategory,
} from "@/lib/contact";

function pageContext() {
  if (typeof window === "undefined") return {};
  return { url: window.location.href, userAgent: navigator.userAgent };
}

export default function ContactSupport() {
  const router = useRouter();

  function openMainEmail() {
    const { url } = pageContext();
    track("SUPPORT_EMAIL_CLICKED", { channel: "main" });
    window.location.assign(
      buildMailto(SUPPORT_EMAIL, "[EBH] Support request", "Hi EBH team,\n\nHow can we help?\n", { url }),
    );
  }

  function handleCard(cat: ContactCategory) {
    if (cat.action === "report") {
      track("ABUSE_FLOW_OPENED", { channel: cat.id });
      router.push("/report");
      return;
    }
    const { url, userAgent } = pageContext();
    track("SUPPORT_CARD_CLICKED", { channel: cat.id });
    window.location.assign(
      buildMailto(SUPPORT_EMAIL, cat.subject, cat.template, {
        url,
        userAgent,
        includeDiagnostics: cat.id === "technical-support",
      }),
    );
  }

  return (
    <>
      {/* Primary email — single source of support */}
      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
        <p className="text-sm font-semibold text-emerald-900">Email support</p>
        <button
          type="button"
          onClick={openMainEmail}
          aria-label={`Email support at ${SUPPORT_EMAIL}`}
          className="mt-1 inline-flex min-h-[44px] items-center break-all text-lg font-bold text-emerald-700 underline underline-offset-2 transition hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          {SUPPORT_EMAIL}
        </button>
        <p className="mt-2 text-sm text-emerald-800">
          We aim to respond within <span className="font-semibold">2&ndash;3 working days</span>. Urgent safety or abuse issues are prioritised.
        </p>
      </div>

      {/* Category cards — each is a button-like target */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {CONTACT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCard(cat)}
            aria-label={
              cat.action === "report"
                ? `${cat.title} — open the report flow`
                : `${cat.title} — email support with a pre-filled message`
            }
            className="group flex min-h-[44px] flex-col items-start rounded-2xl border border-neutral-200/80 bg-ivory-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600/60 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>{cat.icon}</span>
              <span className="font-semibold text-ink group-hover:text-emerald-800">{cat.title}</span>
            </span>
            <span className="mt-1 text-sm text-neutral-600">{cat.body}</span>
            <span className="mt-2 text-xs font-semibold text-emerald-700">
              {cat.action === "report" ? "Open report flow →" : "Email us →"}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        For immediate safety concerns, use the report button on the relevant listing.
      </p>

      {/* Escalation */}
      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
        <p className="font-semibold text-ink">Escalation path</p>
        <p className="mt-1">
          If your issue isn&rsquo;t resolved, reply to our email and ask to escalate — it will be reviewed by a senior team member.
          For data-protection complaints you may also contact the UK Information Commissioner&rsquo;s Office at{" "}
          <a
            href="https://ico.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            ico.org.uk
          </a>
          .
        </p>
      </div>
    </>
  );
}
