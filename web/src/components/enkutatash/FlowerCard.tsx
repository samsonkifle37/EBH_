"use client";

import { useState } from "react";

const COLOURS = [
  { key: "gold", label: "Gold", bg: "bg-amber-400", ring: "ring-amber-500", petals: ["#f59e0b", "#fbbf24", "#f97316"] },
  { key: "white", label: "White", bg: "bg-neutral-100", ring: "ring-neutral-400", petals: ["#e5e7eb", "#f9fafb", "#d1d5db"] },
  { key: "pink", label: "Pink", bg: "bg-pink-400", ring: "ring-pink-500", petals: ["#f472b6", "#fb7185", "#e879f9"] },
  { key: "purple", label: "Purple", bg: "bg-violet-400", ring: "ring-violet-500", petals: ["#a78bfa", "#c084fc", "#818cf8"] },
] as const;
type Colour = (typeof COLOURS)[number]["key"];

function AdeyAbebaFlower({ colour, size = 80 }: { colour: Colour; size?: number }) {
  const col = COLOURS.find((c) => c.key === colour)!;
  const r = size / 2;
  const pr = r * 0.38; // petal radius
  const cr = r * 0.22; // centre radius
  const off = r * 0.36; // petal offset from centre
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const cx = r + off * Math.cos(rad);
        const cy = r + off * Math.sin(rad);
        return <ellipse key={a} cx={cx} cy={cy} rx={pr} ry={pr * 0.55} transform={`rotate(${a} ${cx} ${cy})`} fill={col.petals[i % col.petals.length]} opacity={0.92} />;
      })}
      <circle cx={r} cy={r} r={cr} fill="#f59e0b" />
      <circle cx={r} cy={r} r={cr * 0.55} fill="#fde68a" />
    </svg>
  );
}

type Step = "build" | "sending" | "done";

export default function FlowerCard() {
  const [colour, setColour] = useState<Colour>("gold");
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<Step>("build");
  const [shareToken, setShareToken] = useState("");
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/enkutatash/flower/${shareToken}` : "";

  const whatsappText = `🌸 ${senderName} sent you an Adey Abeba bouquet for Enkutatash!\n\n${message ? `"${message}"\n\n` : ""}Open your bouquet: ${shareUrl}\n\nMelkam Addis Amet! · EBH UK`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  async function sendFlower(e: React.FormEvent) {
    e.preventDefault();
    if (!senderName.trim() || !recipientName.trim()) return;
    setStep("sending");
    try {
      const res = await fetch("/api/enkutatash/flowers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderName: senderName.trim(), recipientName: recipientName.trim(), message: message.trim(), colour }),
      });
      if (!res.ok) throw new Error();
      const { token } = await res.json();
      setShareToken(token);
      setStep("done");

      // local progress
      const p = JSON.parse(localStorage.getItem("ebh_enkutatash_progress") ?? "{}");
      p.flowerSent = true;
      localStorage.setItem("ebh_enkutatash_progress", JSON.stringify(p));
      window.dispatchEvent(new Event("enkutatash-progress"));
    } catch {
      setStep("build");
      alert("Something went wrong — please try again.");
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // analytics
    fetch("/api/enkutatash/flowers", { method: "HEAD" }).catch(() => {});
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <AdeyAbebaFlower colour={colour} size={100} />
        <div>
          <p className="text-lg font-bold text-neutral-900">Bouquet ready! 🌸</p>
          <p className="mt-1 text-sm text-neutral-500">
            Share it with <span className="font-semibold text-emerald-700">{recipientName}</span>
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-[#1fba58]"
            onClick={() => { const p = JSON.parse(localStorage.getItem("ebh_enkutatash_progress") ?? "{}"); p.flowerShared = true; localStorage.setItem("ebh_enkutatash_progress", JSON.stringify(p)); window.dispatchEvent(new Event("enkutatash-progress")); }}
          >
            📲 Share on WhatsApp
          </a>
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-emerald-500 hover:text-emerald-700"
          >
            {copied ? "✓ Link copied!" : "🔗 Copy link"}
          </button>
          <button
            onClick={() => { setStep("build"); setShareToken(""); }}
            className="text-xs text-neutral-400 underline hover:text-neutral-600"
          >
            Send another bouquet
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={sendFlower} className="flex flex-col gap-4">
      {/* Flower preview */}
      <div className="flex justify-center">
        <AdeyAbebaFlower colour={colour} size={88} />
      </div>

      {/* Colour picker */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Choose your flower colour</p>
        <div className="flex gap-3">
          {COLOURS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setColour(c.key)}
              aria-label={c.label}
              className={`h-9 w-9 rounded-full ${c.bg} transition ring-offset-2 ${colour === c.key ? `ring-2 ${c.ring}` : "ring-0 hover:ring-2 hover:ring-neutral-300"}`}
            />
          ))}
        </div>
      </div>

      {/* Names */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">From</label>
          <input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            maxLength={60}
            placeholder="Your name"
            required
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">To</label>
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            maxLength={60}
            placeholder="Their name"
            required
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-neutral-600">Message (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="Melkam Addis Amet!"
          className="w-full resize-none rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={step === "sending"}
        className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-amber-600 disabled:opacity-60"
      >
        {step === "sending" ? "Creating bouquet…" : "🌸 Send bouquet"}
      </button>
    </form>
  );
}
