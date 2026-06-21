"use client";

import { useState, useEffect } from "react";
import { QUIZ_QUESTIONS, TOTAL, scoreTier, TIER_LABEL } from "@/lib/enkutatashQuiz";

type Phase = "intro" | "quiz" | "result";

interface LeaderEntry {
  name: string;
  score: number;
  total: number;
  city: string;
  createdAt: string;
}

export default function QuizCard() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [chosen, setChosen] = useState<(number | null)[]>(Array(TOTAL).fill(null));
  const [score, setScore] = useState(0);
  const [showFact, setShowFact] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedCity, setSubmittedCity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [showBoard, setShowBoard] = useState(false);

  const q = QUIZ_QUESTIONS[current];
  const hasAnswered = chosen[current] !== null;
  const isCorrect = chosen[current] === q?.answer;

  function pick(idx: number) {
    if (hasAnswered) return;
    const next = [...chosen];
    next[current] = idx;
    setChosen(next);
    if (idx === q.answer) setScore((s) => s + 1);
    setShowFact(true);
  }

  function advance() {
    setShowFact(false);
    if (current < TOTAL - 1) {
      setCurrent((c) => c + 1);
    } else {
      setPhase("result");
      // save progress
      const p = JSON.parse(localStorage.getItem("ebh_enkutatash_progress") ?? "{}");
      p.quizCompleted = true;
      p.quizScore = score + (chosen[current] === q.answer ? 1 : 0);
      localStorage.setItem("ebh_enkutatash_progress", JSON.stringify(p));
      window.dispatchEvent(new Event("enkutatash-progress"));
    }
  }

  async function submitScore() {
    if (!submittedName.trim()) return;
    try {
      await fetch("/api/enkutatash/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: submittedName.trim(), score, city: submittedCity.trim() }),
      });
      setSubmitted(true);
      fetchLeaderboard();
      setShowBoard(true);
    } catch { /* silent */ }
  }

  async function fetchLeaderboard() {
    try {
      const r = await fetch("/api/enkutatash/quiz/leaderboard");
      const { scores } = await r.json();
      setLeaderboard(scores);
    } catch { /* silent */ }
  }

  function shareScore() {
    const tier = scoreTier(score);
    const { emoji } = TIER_LABEL[tier];
    const text = `${emoji} I scored ${score}/${TOTAL} on the Enkutatash Challenge! ${tier === "gold" ? "Gold 🏆" : tier === "silver" ? "Silver 🥈" : "Bronze 🥉"}\n\nCan you beat me? Take the quiz at ebh.uk/enkutatash 🌸`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    const p = JSON.parse(localStorage.getItem("ebh_enkutatash_progress") ?? "{}");
    p.quizShared = true;
    localStorage.setItem("ebh_enkutatash_progress", JSON.stringify(p));
    window.dispatchEvent(new Event("enkutatash-progress"));
  }

  function restart() {
    setCurrent(0);
    setChosen(Array(TOTAL).fill(null));
    setScore(0);
    setShowFact(false);
    setSubmitted(false);
    setSubmittedName("");
    setSubmittedCity("");
    setShowBoard(false);
    setPhase("intro");
  }

  if (phase === "intro") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="text-4xl">🧠</div>
        <div>
          <p className="text-base font-bold text-neutral-900">The Enkutatash Challenge</p>
          <p className="mt-1 text-sm text-neutral-500">{TOTAL} questions · ~3 minutes · How well do you know Ethiopian New Year?</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 text-left text-xs text-amber-800">
          <span className="font-semibold">How it works:</span> Read the question, pick your answer, see the cultural fact, then move on. Your score goes on the weekly leaderboard!
        </div>
        <button
          onClick={() => setPhase("quiz")}
          className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-amber-600"
        >
          Start quiz →
        </button>
      </div>
    );
  }

  if (phase === "result") {
    const tier = scoreTier(score);
    const { label, emoji, colour } = TIER_LABEL[tier];
    return (
      <div className="flex flex-col gap-4">
        {/* Score */}
        <div className="rounded-2xl bg-emerald-50 p-5 text-center">
          <p className="text-5xl font-black text-[var(--color-ebh-green)]">{score}/{TOTAL}</p>
          <p className={`mt-1 text-sm font-bold ${colour}`}>{emoji} {label}</p>
        </div>

        {/* Submit to leaderboard */}
        {!submitted ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-neutral-500">Add your score to the weekly leaderboard</p>
            <input
              value={submittedName}
              onChange={(e) => setSubmittedName(e.target.value)}
              placeholder="Your name or nickname"
              maxLength={60}
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <input
              value={submittedCity}
              onChange={(e) => setSubmittedCity(e.target.value)}
              placeholder="City (optional)"
              maxLength={60}
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button
              onClick={submitScore}
              disabled={!submittedName.trim()}
              className="rounded-xl bg-[var(--color-ebh-green)] py-2.5 text-sm font-bold text-white disabled:opacity-40"
            >
              Add to leaderboard
            </button>
          </div>
        ) : (
          <p className="text-center text-sm font-semibold text-emerald-700">✓ Score added to the leaderboard!</p>
        )}

        {/* Leaderboard */}
        {showBoard && leaderboard.length > 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">This week&apos;s top scores</p>
            <ol className="flex flex-col gap-1.5">
              {leaderboard.map((e, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-center font-bold text-neutral-400">{i + 1}</span>
                    <span className="font-semibold text-neutral-800">{e.name}</span>
                    {e.city && <span className="text-xs text-neutral-400">{e.city}</span>}
                  </span>
                  <span className="font-bold text-[var(--color-ebh-green)]">{e.score}/{e.total}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {!showBoard && submitted && (
          <button onClick={() => { fetchLeaderboard(); setShowBoard(true); }} className="text-xs text-emerald-700 underline">
            Show leaderboard
          </button>
        )}

        <div className="flex gap-2">
          <button onClick={shareScore} className="flex-1 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white">
            📲 Share score
          </button>
          <button onClick={restart} className="flex-1 rounded-xl border border-neutral-300 py-2.5 text-sm font-semibold text-neutral-700">
            Play again
          </button>
        </div>
      </div>
    );
  }

  // quiz phase
  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-hidden rounded-full bg-neutral-200 h-1.5">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-300"
            style={{ width: `${((current + 1) / TOTAL) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-neutral-500">{current + 1}/{TOTAL}</span>
      </div>

      {/* Question */}
      <p className="text-sm font-bold leading-snug text-neutral-900">{q.question}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const isThis = chosen[current] === i;
          const correct = i === q.answer;
          let cls = "w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ";
          if (!hasAnswered) {
            cls += "border-neutral-300 text-neutral-700 hover:border-emerald-400 hover:bg-emerald-50";
          } else if (correct) {
            cls += "border-emerald-500 bg-emerald-50 text-emerald-800";
          } else if (isThis) {
            cls += "border-red-400 bg-red-50 text-red-800";
          } else {
            cls += "border-neutral-200 text-neutral-400";
          }
          return (
            <button key={i} onClick={() => pick(i)} disabled={hasAnswered} className={cls}>
              {hasAnswered && correct && "✓ "}
              {hasAnswered && isThis && !correct && "✗ "}
              {opt}
            </button>
          );
        })}
      </div>

      {/* Cultural fact */}
      {showFact && (
        <div className={`rounded-2xl p-3 text-xs leading-relaxed ${isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
          <span className="font-bold">{isCorrect ? "🌟 Correct! " : "🌱 Good to know: "}</span>
          {q.fact}
        </div>
      )}

      {/* Next */}
      {hasAnswered && (
        <button
          onClick={advance}
          className="rounded-xl bg-[var(--color-ebh-green)] px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-[var(--color-ebh-green-dark)]"
        >
          {current < TOTAL - 1 ? "Next question →" : "See my results →"}
        </button>
      )}
    </div>
  );
}
