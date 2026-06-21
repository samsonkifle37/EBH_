"use client";

import { useState } from "react";
import { toEthiopian, ethiopianZodiac, daysUntilEnkutatash, ethiopianAge } from "@/lib/ethiopianCalendar";

interface Result {
  etYear: number;
  etMonth: number;
  etDay: number;
  etMonthName: string;
  zodiac: ReturnType<typeof ethiopianZodiac>;
  age: number;
  daysUntil: number;
}

export default function CalendarCard() {
  const [dob, setDob] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  function convert() {
    if (!dob) return;
    const [gYear, gMonth, gDay] = dob.split("-").map(Number);
    const et = toEthiopian(gYear, gMonth, gDay);
    const zodiac = ethiopianZodiac(et.year);
    const age = ethiopianAge(gYear, gMonth, gDay);
    const daysUntil = daysUntilEnkutatash();

    setResult({ etYear: et.year, etMonth: et.month, etDay: et.day, etMonthName: et.monthName, zodiac, age, daysUntil });

    // track progress
    const p = JSON.parse(localStorage.getItem("ebh_enkutatash_progress") ?? "{}");
    p.calendarConverted = true;
    localStorage.setItem("ebh_enkutatash_progress", JSON.stringify(p));
    window.dispatchEvent(new Event("enkutatash-progress"));
  }

  function shareText() {
    if (!result) return "";
    return `🗓️ I was born on ${result.etDay} ${result.etMonthName} ${result.etYear} in the Ethiopian calendar! I'm ${result.age} in Ethiopian years. Ethiopian New Year (Enkutatash) is in ${result.daysUntil} days! 🌸 Discover yours at ebh.uk/enkutatash`;
  }

  async function copyText() {
    await navigator.clipboard.writeText(shareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    const p = JSON.parse(localStorage.getItem("ebh_enkutatash_progress") ?? "{}");
    p.birthdayShared = true;
    localStorage.setItem("ebh_enkutatash_progress", JSON.stringify(p));
    window.dispatchEvent(new Event("enkutatash-progress"));
  }

  function waShare() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText())}`, "_blank");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Input */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Enter your Gregorian birthday</label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          min="1900-01-01"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <button
        onClick={convert}
        disabled={!dob}
        className="rounded-xl bg-[var(--color-ebh-green)] px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-[var(--color-ebh-green-dark)] disabled:opacity-40"
      >
        🗓️ Find my Ethiopian birthday
      </button>

      {/* Result */}
      {result && (
        <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          {/* Main date */}
          <div className="text-center">
            <p className="text-3xl font-black text-[var(--color-ebh-green)]">
              {result.etDay} {result.etMonthName}
            </p>
            <p className="text-lg font-bold text-neutral-700">{result.etYear} E.C.</p>
            <p className="mt-0.5 text-xs text-neutral-500">(Ethiopian Calendar year)</p>
          </div>

          {/* Stats grid */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-white p-2.5 shadow-sm">
              <p className="text-xl font-black text-amber-500">{result.age}</p>
              <p className="text-neutral-500">Ethiopian age</p>
            </div>
            <div className="rounded-xl bg-white p-2.5 shadow-sm">
              <p className="text-lg font-black text-[var(--color-ebh-green)]">{result.zodiac.symbol}</p>
              <p className="font-semibold text-neutral-700">{result.zodiac.name.split(" ")[0]}</p>
              <p className="text-neutral-500">year</p>
            </div>
            <div className="rounded-xl bg-white p-2.5 shadow-sm">
              <p className="text-xl font-black text-emerald-600">{result.daysUntil}</p>
              <p className="text-neutral-500">days until Enkutatash</p>
            </div>
          </div>

          {/* Share */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={waShare}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white"
            >
              📲 WhatsApp
            </button>
            <button
              onClick={copyText}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-neutral-300 py-2.5 text-xs font-semibold text-neutral-700"
            >
              {copied ? "✓ Copied!" : "🔗 Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
