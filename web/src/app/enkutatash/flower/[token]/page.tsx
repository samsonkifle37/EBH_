import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const flower = await db.enkutatashFlower.findUnique({ where: { shareToken: token } });
  if (!flower) return { title: "Flower not found" };
  return {
    title: `${flower.senderName} sent you an Adey Abeba bouquet! 🌸`,
    description: `Open your Enkutatash bouquet from ${flower.senderName}. Melkam Addis Amet!`,
    openGraph: {
      title: `${flower.senderName} sent you an Adey Abeba bouquet! 🌸`,
      description: flower.message || "Wishing you a Happy Ethiopian New Year!",
      images: [{ url: `/api/og/enkutatash-flower/${token}` }],
    },
    twitter: { card: "summary_large_image" },
  };
}

const PETAL_COLOURS: Record<string, string[]> = {
  gold: ["#f59e0b", "#fbbf24", "#f97316"],
  white: ["#e5e7eb", "#f9fafb", "#d1d5db"],
  pink: ["#f472b6", "#fb7185", "#e879f9"],
  purple: ["#a78bfa", "#c084fc", "#818cf8"],
};

function FlowerSvg({ colour }: { colour: string }) {
  const petals = PETAL_COLOURS[colour] ?? PETAL_COLOURS.gold;
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const r = 64, pr = r * 0.38, cr = r * 0.22, off = r * 0.36;
  return (
    <svg width={128} height={128} viewBox="0 0 128 128" aria-hidden>
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const cx = r + off * Math.cos(rad);
        const cy = r + off * Math.sin(rad);
        return <ellipse key={a} cx={cx} cy={cy} rx={pr} ry={pr * 0.55} transform={`rotate(${a} ${cx} ${cy})`} fill={petals[i % petals.length]} opacity={0.92} />;
      })}
      <circle cx={r} cy={r} r={cr} fill="#f59e0b" />
      <circle cx={r} cy={r} r={cr * 0.55} fill="#fde68a" />
    </svg>
  );
}

export default async function FlowerReceivePage({ params }: Props) {
  const { token } = await params;
  const flower = await db.enkutatashFlower.findUnique({ where: { shareToken: token } });
  if (!flower) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-16 text-center">
        {/* Flower */}
        <div className="flex flex-col items-center gap-3">
          <FlowerSvg colour={flower.colour} />
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Adey Abeba Bouquet</p>
        </div>

        {/* Message */}
        <div className="w-full rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-neutral-500">For</p>
          <p className="mt-0.5 text-2xl font-black text-neutral-900">{flower.recipientName}</p>
          {flower.message && (
            <p className="mt-3 text-base italic text-neutral-600">&ldquo;{flower.message}&rdquo;</p>
          )}
          <p className="mt-4 text-sm text-neutral-500">
            From <span className="font-bold text-neutral-800">{flower.senderName}</span>
          </p>
        </div>

        {/* Greeting */}
        <div className="rounded-2xl bg-[var(--color-ebh-green)] px-6 py-4 text-white">
          <p className="text-xl font-black">መልካም አዲስ ዓመት</p>
          <p className="text-sm opacity-80">Melkam Addis Amet · Happy New Year</p>
        </div>

        {/* CTA */}
        <div className="flex w-full flex-col gap-3">
          <Link
            href="/enkutatash"
            className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-amber-600"
          >
            🌸 Send your own bouquet
          </Link>
          <Link href="/" className="text-xs text-neutral-400 underline hover:text-neutral-600">
            Discover Ethiopian businesses on EBH UK
          </Link>
        </div>

        <p className="text-xs text-neutral-400">Ethiopian Business Hub · ebh.uk</p>
      </div>
    </main>
  );
}
