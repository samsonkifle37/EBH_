"use client";

import { useRef, useState } from "react";
import Link from "next/link";

interface Recommendation {
  type: "business" | "event";
  name: string;
  slug: string;
  reason: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  recommendations?: Recommendation[];
}

const SUGGESTIONS = [
  "Find a wedding venue for 250 guests in London",
  "Best Ethiopian restaurant in Birmingham",
  "Ethiopian accountant near me",
  "What events are on in Manchester?",
];

export default function ConciergeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        res.ok
          ? { role: "assistant", text: data.text, recommendations: data.recommendations }
          : { role: "assistant", text: data.error ?? "Sorry, something went wrong. Please try again." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, something went wrong. Please try again." }]);
    }
    setBusy(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[480px] flex-col rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-4xl">🤖</p>
            <p className="mt-3 font-semibold text-neutral-800">What are you looking for today?</p>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              I search the whole directory — businesses, venues and events — and answer in plain English.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-600 hover:border-emerald-600 hover:text-emerald-700">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[85%] ${m.role === "user" ? "rounded-2xl rounded-br-sm bg-emerald-700 px-4 py-2.5 text-sm text-white" : ""}`}>
              {m.role === "assistant" ? (
                <div>
                  <div className="rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-2.5 text-sm text-neutral-800">{m.text}</div>
                  {m.recommendations && m.recommendations.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {m.recommendations.map((r) => (
                        <li key={`${r.type}-${r.slug}`}>
                          <Link
                            href={r.type === "business" ? `/business/${r.slug}` : `/event/${r.slug}`}
                            className="block rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-emerald-600"
                          >
                            <p className="text-sm font-semibold text-neutral-900">
                              {r.type === "event" ? "🎟 " : "🏪 "}
                              {r.name}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500">{r.reason}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
        {busy && <p className="text-sm text-neutral-400">Thinking…</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-center gap-2 border-t border-neutral-200 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything — “habesha wedding photographer London”…"
          className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
        />
        <button disabled={busy || !input.trim()} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          Ask AI
        </button>
      </form>
    </div>
  );
}
