import type { Metadata } from "next";
import ConciergeChat from "@/components/ConciergeChat";

export const metadata: Metadata = {
  title: "AI Concierge",
  description: "Ask in plain English and get instant recommendations for Ethiopian businesses, venues and events across the UK.",
};

export default function ConciergePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">🤖 AI Concierge</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Instant recommendations from across the directory. Powered by live listings
        {process.env.ANTHROPIC_API_KEY ? " and Claude" : ""}.
      </p>
      <div className="mt-6">
        <ConciergeChat />
      </div>
    </main>
  );
}
