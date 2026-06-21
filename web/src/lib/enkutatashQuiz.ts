export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3; // index of correct option
  fact: string; // fun fact shown after answering
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "What does the word 'Enkutatash' mean in Amharic?",
    options: [
      "Spring flowers",
      "Gift of jewels",
      "New beginning",
      "Year of harvest",
    ],
    answer: 1,
    fact: "The name comes from 'jewels' — legend says the Queen of Sheba was gifted jewels by her court on returning from King Solomon.",
  },
  {
    id: "q2",
    question: "What is the symbolic flower of Enkutatash?",
    options: ["Ethiopian rose", "Meskerem lily", "Adey Abeba", "Golden jasmine"],
    answer: 2,
    fact: "Adey Abeba (African daisy) blooms bright yellow at the end of the rainy season — the perfect symbol of renewal and new beginnings.",
  },
  {
    id: "q3",
    question: "How many months does the Ethiopian calendar have?",
    options: ["12 months", "14 months", "10 months", "13 months"],
    answer: 3,
    fact: "Ethiopia's Ge'ez calendar has 12 months of 30 days plus a 13th month — Pagume — of 5 or 6 days. That's why Ethiopians say 'Ethiopia has 13 months of sunshine.'",
  },
  {
    id: "q4",
    question: "Which traditional song do children sing door-to-door at Enkutatash?",
    options: ["Tizita", "Nimsa", "Qinit", "Fukera"],
    answer: 1,
    fact: "Nimsas are joyful New Year songs children sing while gifting Adey Abeba bouquets to neighbours and receiving small gifts in return.",
  },
  {
    id: "q5",
    question: "What garment is traditionally worn at Enkutatash celebrations?",
    options: ["Red shamma", "Blue gabi", "White habesha kemis", "Green netela"],
    answer: 2,
    fact: "The white habesha kemis — often adorned with colourful tibeb (woven border) — is worn by women at celebrations and the overnight church service.",
  },
  {
    id: "q6",
    question: "In the Gregorian calendar, Enkutatash falls on which date?",
    options: ["1 October", "7 January", "11 September", "19 August"],
    answer: 2,
    fact: "Enkutatash is on 11 September (12 September in a Gregorian leap year). It marks the end of Ethiopia's heavy rainy season and the return of clear skies.",
  },
  {
    id: "q7",
    question: "By roughly how many years does the Ethiopian calendar differ from the Gregorian?",
    options: ["5–6 years", "7–8 years", "10 years", "3–4 years"],
    answer: 1,
    fact: "Ethiopia calculates the birth year of Jesus Christ differently, placing the Ethiopian year 7–8 behind the Gregorian calendar.",
  },
  {
    id: "q8",
    question: "What is the first month of the Ethiopian calendar?",
    options: ["Nehase", "Tikimt", "Hamle", "Meskerem"],
    answer: 3,
    fact: "Meskerem (September–October) is the start of the Ethiopian year. Its golden Adey Abeba flowers signal the arrival of Enkutatash.",
  },
];

export const TOTAL = QUIZ_QUESTIONS.length; // 8

export function scoreTier(score: number): "gold" | "silver" | "bronze" {
  if (score >= 7) return "gold";
  if (score >= 5) return "silver";
  return "bronze";
}

export const TIER_LABEL: Record<ReturnType<typeof scoreTier>, { label: string; emoji: string; colour: string }> = {
  gold: { label: "Gold — Enkutatash Expert!", emoji: "🥇", colour: "text-amber-600" },
  silver: { label: "Silver — Culture Enthusiast", emoji: "🥈", colour: "text-neutral-500" },
  bronze: { label: "Bronze — Keep Learning!", emoji: "🥉", colour: "text-orange-500" },
};
