"use client";

import { useState, useEffect } from "react";

// Enkutatash 2026 — 1 Meskerem 2019 (Ethiopian calendar)
// = 11 September 2026 at midnight East Africa Time (UTC+3)
const ENKUTATASH_2026 = new Date("2026-09-11T00:00:00+03:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

function calc(): TimeLeft {
  const diff = ENKUTATASH_2026.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    past: false,
  };
}

export default function EnkutatashCountdown() {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1_000);
    return () => clearInterval(id);
  }, []);

  // Render nothing on the server (avoids hydration mismatch)
  if (!time) {
    return (
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        {["Days", "Hours", "Mins", "Secs"].map((label) => (
          <div key={label} className="flex flex-col items-center">
            <span className="font-mono text-4xl font-extrabold text-white sm:text-5xl tabular-nums">--</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (time.past) {
    return (
      <p className="text-center text-2xl font-bold text-gold-bright">
        🎉 Happy Enkutatash! Melkam Addis Amet!
      </p>
    );
  }

  const units = [
    { value: time.days, label: "Days" },
    { value: time.hours, label: "Hours" },
    { value: time.minutes, label: "Mins" },
    { value: time.seconds, label: "Secs" },
  ];

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8">
      {units.map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-4 sm:gap-8">
          <div className="flex flex-col items-center">
            <span className="font-mono text-4xl font-extrabold text-white sm:text-5xl tabular-nums">
              {String(value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
              {label}
            </span>
          </div>
          {i < 3 && (
            <span className="mb-4 text-2xl font-bold text-emerald-500 sm:text-3xl">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
