"use client";

import { useEffect, useState } from "react";

interface Greeting {
  key: string;
  amharic: string;
  latin: string;
  meaning: string;
}

function getSessionId() {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("ebh_enkutatash_sid");
  if (!sid) {
    sid = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    localStorage.setItem("ebh_enkutatash_sid", sid);
  }
  return sid;
}

export default function GreetingCard() {
  const [greetings, setGreetings] = useState<Greeting[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enkutatash/greetings")
      .then((r) => r.json())
      .then(({ greetings: gs, counts: cs }) => {
        setGreetings(gs);
        setCounts(cs);
      })
      .finally(() => setLoading(false));

    const sid = getSessionId();
    const saved = localStorage.getItem(`ebh_greeting_vote_${sid}`);
    if (saved) setMyVote(saved);
  }, []);

  async function vote(key: string) {
    const sid = getSessionId();
    setMyVote(key);
    localStorage.setItem(`ebh_greeting_vote_${sid}`, key);

    const res = await fetch("/api/enkutatash/greetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ greeting: key, sessionId: sid }),
    });
    const { counts: newCounts } = await res.json();
    setCounts(newCounts);

    const p = JSON.parse(localStorage.getItem("ebh_enkutatash_progress") ?? "{}");
    p.greetingVoted = true;
    localStorage.setItem("ebh_enkutatash_progress", JSON.stringify(p));
    window.dispatchEvent(new Event("enkutatash-progress"));
  }

  function shareGreeting(g: Greeting) {
    const text = `"${g.amharic}" (${g.latin})\n\n${g.meaning} 🌸\n\nWishing everyone a blessed Enkutatash! · ebh.uk/enkutatash`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-neutral-500">Which Ethiopian New Year greeting is your favourite? Vote and share yours.</p>

      {loading ? (
        <div className="py-8 text-center text-sm text-neutral-400">Loading greetings…</div>
      ) : (
        greetings.map((g) => {
          const pct = Math.round(((counts[g.key] ?? 0) / total) * 100);
          const isVoted = myVote === g.key;
          return (
            <div
              key={g.key}
              className={`rounded-2xl border transition ${isVoted ? "border-amber-400 bg-amber-50" : "border-neutral-200 bg-white"}`}
            >
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-black leading-tight text-neutral-900">{g.amharic}</p>
                    <p className="text-xs font-semibold text-[var(--color-ebh-green)]">{g.latin}</p>
                    <p className="text-xs text-neutral-500">{g.meaning}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => shareGreeting(g)}
                      title="Share this greeting"
                      className="rounded-lg bg-neutral-100 p-1.5 text-xs text-neutral-500 hover:bg-neutral-200"
                    >
                      📲
                    </button>
                    <button
                      onClick={() => vote(g.key)}
                      disabled={isVoted}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        isVoted
                          ? "bg-amber-400 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      {isVoted ? "✓ Voted" : "Vote"}
                    </button>
                  </div>
                </div>

                {/* Vote bar */}
                {myVote && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 overflow-hidden rounded-full bg-neutral-100 h-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isVoted ? "bg-amber-400" : "bg-neutral-300"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-neutral-500 w-7 text-right">{pct}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      {!myVote && !loading && (
        <p className="text-center text-xs text-neutral-400">Tap a greeting to vote and see community results</p>
      )}
      {myVote && total > 1 && (
        <p className="text-center text-xs text-neutral-400">{total} {total === 1 ? "vote" : "votes"} total — tap any greeting to change yours</p>
      )}
    </div>
  );
}
