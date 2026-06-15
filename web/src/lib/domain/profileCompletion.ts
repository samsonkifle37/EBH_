export interface CompletionInput {
  coverImageUrl: string;
  founderPhotoUrl: string;
  founderStory: string;
  brandStory: string;
  signatureCount: number;
  phone: string;
  website: string;
  hoursJson: string;
  photoCount: number;
}

export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
  points: number;
  /** Owner-facing nudge shown when this is the next action. */
  hint: string;
}

export interface CompletionResult {
  score: number; // 0-100
  complete: boolean;
  items: CompletionItem[];
  nextAction: CompletionItem | null;
}

function hasHours(json: string): boolean {
  try {
    const v = JSON.parse(json);
    return !!v && typeof v === "object" && Object.keys(v).length > 0;
  } catch {
    return false;
  }
}

/** Weighted profile completeness + the single highest-impact next step. */
export function profileCompletion(b: CompletionInput): CompletionResult {
  const items: CompletionItem[] = [
    { key: "cover", label: "Add a cover photo", points: 20, hint: "A great cover photo is the first thing customers see.", done: b.coverImageUrl.trim().length > 0 },
    { key: "founderPhoto", label: "Add your founder photo", points: 15, hint: "People trust people — show the face behind the business.", done: b.founderPhotoUrl.trim().length > 0 },
    { key: "founderStory", label: "Tell your founder story", points: 15, hint: "Share why you started — it's what makes you memorable.", done: b.founderStory.trim().length >= 40 },
    { key: "brandStory", label: "Add your brand story", points: 10, hint: "Describe what you do and what makes you special.", done: b.brandStory.trim().length >= 40 },
    { key: "signature", label: "Add a signature product or service", points: 15, hint: "Showcase what you're known for.", done: b.signatureCount >= 1 },
    { key: "photos", label: "Add at least 3 photos", points: 10, hint: "Photos bring your profile to life.", done: b.photoCount >= 3 },
    { key: "phone", label: "Add a phone number", points: 5, hint: "Let customers call you.", done: b.phone.trim().length > 0 },
    { key: "website", label: "Add your website", points: 5, hint: "Link your website or socials.", done: b.website.trim().length > 0 },
    { key: "hours", label: "Add opening hours", points: 5, hint: "Show customers when you're open.", done: hasHours(b.hoursJson) },
  ];

  const score = items.filter((i) => i.done).reduce((a, i) => a + i.points, 0);
  // next action = heaviest incomplete item
  const incomplete = items.filter((i) => !i.done).sort((a, b) => b.points - a.points);
  return { score, complete: score === 100, items, nextAction: incomplete[0] ?? null };
}
