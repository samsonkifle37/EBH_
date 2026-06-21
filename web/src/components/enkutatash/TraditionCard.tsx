"use client";

import { useState } from "react";

const STORIES = [
  {
    key: "kemis",
    emoji: "👘",
    title: "The Habesha Kemis",
    subtitle: "Traditional dress of celebration",
    body: "On Enkutatash, Ethiopians dress in the habesha kemis — a white cotton or chiffon robe with colourful woven borders (tibeb) at the hem, cuffs and neckline. The white symbolises purity and a fresh start. Women weave patterns that vary by region: Amhara, Tigrinya and Harari styles each have distinct colour combinations. Modern celebrations have brought new fabric choices, but the white base remains.",
    colour: "bg-neutral-50 border-neutral-200",
    tag: "Fashion & Identity",
  },
  {
    key: "church",
    emoji: "⛪",
    title: "The Night Vigil",
    subtitle: "Welcoming the New Year at church",
    body: "The Ethiopian Orthodox Church marks Enkutatash with an overnight service called the liqsit. Families attend dressed in white, holding candles. Priests chant ancient Ge'ez hymns as midnight passes and the New Year is announced. Incense fills the air and church bells ring across towns and villages. For many Ethiopians, the night at church is the heart of the celebration.",
    colour: "bg-amber-50 border-amber-200",
    tag: "Faith & Community",
  },
  {
    key: "coffee",
    emoji: "☕",
    title: "The Coffee Ceremony",
    subtitle: "Bonding over three rounds of coffee",
    body: "No Ethiopian celebration is complete without the buna (coffee) ceremony. Green beans are roasted on a charcoal burner, ground with a mortar and pestle, then brewed in a clay jebena pot. Coffee is served three times — abol, tona and baraka — each round representing a blessing. Frankincense burns alongside as family and neighbours gather to share stories, gratitude and plans for the new year.",
    colour: "bg-orange-50 border-orange-200",
    tag: "Ritual & Warmth",
  },
  {
    key: "symbols",
    emoji: "🌻",
    title: "Adey Abeba & Nimsas",
    subtitle: "Flowers, songs and children's joy",
    body: "Children wake early on Enkutatash to gather Adey Abeba — bright yellow African daisies that bloom after the rainy season. They go door to door singing nimsas: traditional songs that wish the household happiness, health and prosperity. In return they receive small coins, sweets or bread. The custom connects generations, teaching young Ethiopians to share blessings and celebrate community.",
    colour: "bg-yellow-50 border-yellow-200",
    tag: "Children & Tradition",
  },
] as const;

export default function TraditionCard() {
  const [current, setCurrent] = useState(0);
  const [reactions, setReactions] = useState<Record<string, "knew" | "learned" | null>>({});
  const [allDone, setAllDone] = useState(false);

  const story = STORIES[current];
  const myReaction = reactions[story.key] ?? null;
  const seen = Object.keys(reactions).length;

  function react(r: "knew" | "learned") {
    const next = { ...reactions, [story.key]: r };
    setReactions(next);
    if (Object.keys(next).length === STORIES.length) {
      setAllDone(true);
      const p = JSON.parse(localStorage.getItem("ebh_enkutatash_progress") ?? "{}");
      p.traditionsViewed = STORIES.length;
      p.stampCollected = true;
      localStorage.setItem("ebh_enkutatash_progress", JSON.stringify(p));
      window.dispatchEvent(new Event("enkutatash-progress"));
    } else if (current < STORIES.length - 1 && !reactions[story.key]) {
      setTimeout(() => setCurrent((c) => c + 1), 600);
    }
  }

  if (allDone) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="text-5xl">🏅</div>
        <p className="text-base font-bold text-neutral-900">Culture Keeper stamp earned!</p>
        <p className="text-sm text-neutral-500">You explored all 4 Enkutatash traditions.</p>
        <div className="grid grid-cols-4 gap-2 text-2xl">
          {STORIES.map((s) => (
            <div key={s.key} className="flex flex-col items-center gap-1">
              <span>{s.emoji}</span>
              <span className="text-xs text-neutral-400">{reactions[s.key] === "knew" ? "✓" : "✦"}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => { setCurrent(0); setReactions({}); setAllDone(false); }}
          className="text-xs text-emerald-700 underline"
        >
          Read again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {STORIES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setCurrent(i)}
            className={`h-2 flex-1 rounded-full transition-all ${i === current ? "bg-amber-400" : reactions[s.key] ? "bg-emerald-400" : "bg-neutral-200"}`}
          />
        ))}
      </div>

      {/* Story card */}
      <div className={`rounded-2xl border p-4 ${story.colour}`} key={story.key}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{story.emoji}</span>
          <div>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{story.tag}</span>
            <p className="mt-1 text-base font-bold text-neutral-900">{story.title}</p>
            <p className="text-xs text-neutral-500">{story.subtitle}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-700">{story.body}</p>
      </div>

      {/* Reaction */}
      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-500">Did you know this?</p>
        <div className="flex gap-2">
          <button
            onClick={() => react("knew")}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${myReaction === "knew" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-neutral-300 text-neutral-700 hover:border-emerald-400"}`}
          >
            ✓ Already knew it
          </button>
          <button
            onClick={() => react("learned")}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${myReaction === "learned" ? "border-amber-500 bg-amber-50 text-amber-800" : "border-neutral-300 text-neutral-700 hover:border-amber-400"}`}
          >
            ✦ New to me!
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 text-xs">
        {current > 0 && (
          <button onClick={() => setCurrent((c) => c - 1)} className="text-neutral-400 hover:text-neutral-700">
            ← Prev
          </button>
        )}
        <span className="ml-auto text-neutral-400">{seen}/{STORIES.length} read</span>
        {current < STORIES.length - 1 && (
          <button onClick={() => setCurrent((c) => c + 1)} className="text-emerald-700 font-semibold hover:text-emerald-900">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
