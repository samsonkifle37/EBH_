"use client";

import { useEffect, useState } from "react";

interface Progress {
  flowerSent?: boolean;
  calendarConverted?: boolean;
  quizCompleted?: boolean;
  traditionsViewed?: number;
  stampCollected?: boolean;
  greetingVoted?: boolean;
  eventExplored?: boolean;
}

const STEPS = [
  { key: "flowerSent", label: "Flower sent", emoji: "🌸" },
  { key: "calendarConverted", label: "Birthday found", emoji: "🗓️" },
  { key: "quizCompleted", label: "Quiz done", emoji: "🧠" },
  { key: "stampCollected", label: "Stamp earned", emoji: "🏅" },
  { key: "greetingVoted", label: "Greeting voted", emoji: "🗳️" },
] as const;

function readProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem("ebh_enkutatash_progress") ?? "{}");
  } catch {
    return {};
  }
}

export default function ProgressTracker() {
  const [progress, setProgress] = useState<Progress>({});
  const [ambassador, setAmbassador] = useState(false);

  function refresh() {
    const p = readProgress();
    setProgress(p);
    const done = STEPS.every((s) => !!p[s.key as keyof Progress]);
    setAmbassador(done);
  }

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("enkutatash-progress", handler);
    return () => window.removeEventListener("enkutatash-progress", handler);
  }, []);

  const count = STEPS.filter((s) => !!progress[s.key as keyof Progress]).length;
  const pct = Math.round((count / STEPS.length) * 100);

  if (count === 0) return null; // don't show until they've done something

  return (
    <div className="mx-auto mb-8 max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-amber-900">
          {ambassador ? "🏆 Enkutatash Ambassador!" : `Your Enkutatash journey · ${count}/${STEPS.length}`}
        </p>
        <span className="text-sm font-black text-amber-600">{pct}%</span>
      </div>

      {/* Bar */}
      <div className="mt-2 overflow-hidden rounded-full bg-amber-200 h-2">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="mt-3 flex gap-3">
        {STEPS.map((s) => {
          const done = !!progress[s.key as keyof Progress];
          return (
            <div key={s.key} className="flex flex-1 flex-col items-center gap-1 text-center" title={s.label}>
              <span className={`text-xl transition ${done ? "opacity-100" : "opacity-25"}`}>{s.emoji}</span>
              <span className={`text-[10px] font-semibold ${done ? "text-amber-800" : "text-amber-400"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {ambassador && (
        <div className="mt-3 rounded-xl bg-amber-400 py-2 text-center text-xs font-bold text-white">
          You&apos;ve completed the full Enkutatash experience! Melkam Addis Amet! 🌸
        </div>
      )}
    </div>
  );
}
