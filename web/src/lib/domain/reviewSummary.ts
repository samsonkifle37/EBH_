interface Theme {
  label: string;
  words: string[];
}

const THEMES: Theme[] = [
  { label: "Authentic food", words: ["food", "injera", "dish", "dishes", "authentic", "delicious", "tasty", "flavour", "flavor", "menu"] },
  { label: "Friendly service", words: ["service", "staff", "friendly", "welcoming", "helpful", "host", "owner"] },
  { label: "Great atmosphere", words: ["atmosphere", "ambience", "ambiance", "decor", "music", "cozy", "cosy", "vibe"] },
  { label: "Good value", words: ["value", "affordable", "reasonable", "portions", "portion"] },
  { label: "Waiting times", words: ["wait", "waiting", "slow", "queue", "minutes"] },
  { label: "Parking", words: ["parking", "park"] },
  { label: "Prices", words: ["expensive", "overpriced", "pricey", "price", "prices"] },
  { label: "Cleanliness", words: ["clean", "dirty", "spotless", "hygiene"] },
];

const POSITIVE = ["great","good","love","loved","lovely","amazing","excellent","best","wonderful","fantastic","friendly","delicious","authentic","perfect","easy","spotless","clean","beautiful","brilliant","recommend"];
const NEGATIVE = ["slow","bad","rude","long","dirty","expensive","overpriced","disappointing","cold","poor","terrible","awful","worst","never","unfortunately","too"];

function sentenceSentiment(sentence: string): number {
  const words = sentence.toLowerCase().split(/[^a-z]+/);
  let score = 0;
  for (const w of words) {
    if (POSITIVE.includes(w)) score++;
    if (NEGATIVE.includes(w)) score--;
  }
  return score;
}

export function summarizeReviews(texts: string[]): { loves: string[]; dislikes: string[] } {
  const loveCounts = new Map<string, number>();
  const dislikeCounts = new Map<string, number>();

  for (const text of texts) {
    for (const sentence of text.split(/[.!?]+/)) {
      const lower = sentence.toLowerCase();
      if (!lower.trim()) continue;
      const sentiment = sentenceSentiment(sentence);
      if (sentiment === 0) continue;
      for (const theme of THEMES) {
        if (theme.words.some((w) => lower.includes(w))) {
          const target = sentiment > 0 ? loveCounts : dislikeCounts;
          target.set(theme.label, (target.get(theme.label) ?? 0) + 1);
        }
      }
    }
  }

  const top = (m: Map<string, number>) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([label]) => label);

  return { loves: top(loveCounts), dislikes: top(dislikeCounts) };
}
