import { parseConciergeQuery } from "@/lib/domain/concierge";
import { searchBusinesses, type BusinessSummary } from "@/lib/queries/businesses";
import { getUpcomingEvents } from "@/lib/queries/events";
import { CATEGORY_LABELS, CITY_LABELS, isCategory, isCity, type Category, type City } from "@/lib/types";

export interface Recommendation {
  type: "business" | "event";
  name: string;
  slug: string;
  reason: string;
}

export interface ConciergeResult {
  text: string;
  recommendations: Recommendation[];
}

/** Retrieve candidate businesses/events for a natural-language query. */
async function retrieve(message: string) {
  const query = parseConciergeQuery(message);

  let businesses: BusinessSummary[] = await searchBusinesses({
    category: query.category,
    city: query.city,
    limit: 5,
  });
  // If a keyword search narrows further, prefer it
  if (query.keywords.length > 0) {
    const keywordMatches = businesses.filter((b) =>
      query.keywords.some((k) => b.name.toLowerCase().includes(k) || b.description.toLowerCase().includes(k))
    );
    if (keywordMatches.length > 0) businesses = keywordMatches;
  }

  const wantsEvents = /\bevent|concert|festival|what'?s on|tickets?\b/i.test(message);
  const events = wantsEvents || !query.category ? await getUpcomingEvents({ city: query.city, limit: 3 }) : [];

  return { query, businesses: businesses.slice(0, 4), events: events.slice(0, 3) };
}

function describeBusiness(b: BusinessSummary): string {
  const cat = isCategory(b.category) ? CATEGORY_LABELS[b.category as Category] : b.category;
  const city = isCity(b.city) ? CITY_LABELS[b.city as City] : b.city;
  const rating = b.avg > 0 ? `rated ${b.avg.toFixed(1)}★ (${b.count} reviews)` : "newly listed";
  return `${cat} in ${city}, ${rating}${b.verificationLevel >= 1 ? ", verified" : ""}`;
}

async function claudeReply(message: string, context: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        system:
          "You are the AI concierge for Ethiopian Business Hub UK, a directory of Ethiopian businesses and events in the UK. Answer warmly and concisely (under 120 words). Only recommend from the provided directory results; never invent businesses. If results are empty, say so and suggest browsing the directory.",
        messages: [
          { role: "user", content: `Directory results:\n${context}\n\nUser question: ${message}` },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.content?.[0]?.text;
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  }
}

export async function conciergeReply(message: string): Promise<ConciergeResult> {
  const { query, businesses, events } = await retrieve(message);

  const recommendations: Recommendation[] = [
    ...businesses.map((b) => ({
      type: "business" as const,
      name: b.name,
      slug: b.slug,
      reason: describeBusiness(b),
    })),
    ...events.map((e) => ({
      type: "event" as const,
      name: e.title,
      slug: e.slug,
      reason: `${e.venueName}, ${isCity(e.city) ? CITY_LABELS[e.city as City] : e.city} — ${e.startsAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
    })),
  ];

  const context = recommendations.map((r, i) => `${i + 1}. [${r.type}] ${r.name} — ${r.reason}`).join("\n") || "(no matches)";

  // Try Claude if a key is configured; otherwise use the template reply.
  const aiText = await claudeReply(message, context);
  if (aiText) return { text: aiText, recommendations };

  let text: string;
  if (recommendations.length === 0) {
    text =
      "I couldn't find a match for that yet — our directory is growing every week. Try browsing by category or city, or ask me something like “Ethiopian restaurant in Birmingham”.";
  } else {
    const catLabel = query.category ? CATEGORY_LABELS[query.category].toLowerCase() : "options";
    const cityLabel = query.city ? ` in ${CITY_LABELS[query.city]}` : "";
    const capacityNote = query.capacity ? ` For ${query.capacity} guests, do check capacity with the venue directly.` : "";
    text = `Selam! Here ${recommendations.length === 1 ? "is the best match" : `are ${recommendations.length} great ${catLabel}`}${cityLabel} from our directory.${capacityNote} Tap any card for photos, reviews and contact details.`;
  }

  return { text, recommendations };
}
