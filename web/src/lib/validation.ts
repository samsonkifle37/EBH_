import { z } from "zod";
import { CATEGORIES, CITIES, EVENT_TYPES } from "@/lib/types";

export const businessInputSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.enum(CATEGORIES),
  city: z.enum(CITIES),
  address: z.string().max(200).optional().default(""),
  postcode: z.string().max(10).optional().default(""),
  phone: z.string().max(20).optional().default(""),
  website: z.string().url().max(200).optional().or(z.literal("")).default(""),
  description: z.string().max(2000).optional().default(""),
  instagram: z.string().max(200).optional().default(""),
  facebook: z.string().max(200).optional().default(""),
  hoursPreset: z.enum(["none", "office", "shop", "restaurant"]).optional().default("none"),
  photoUrls: z.array(z.string().url()).max(8).optional().default([]),
  // --- pride / identity fields (optional; owners enrich over time) ---
  coverImageUrl: z.string().url().max(400).optional().or(z.literal("")).default(""),
  logoUrl: z.string().url().max(400).optional().or(z.literal("")).default(""),
  founderName: z.string().max(120).optional().default(""),
  founderPhotoUrl: z.string().url().max(400).optional().or(z.literal("")).default(""),
  founderStory: z.string().max(2000).optional().default(""),
  brandStory: z.string().max(2000).optional().default(""),
  yearFounded: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  signatureItems: z
    .array(z.object({ title: z.string().max(120).default(""), description: z.string().max(400).default(""), imageUrl: z.string().max(400).default("") }))
    .max(6)
    .optional()
    .default([]),
  // --- website essentials ---
  whatsapp: z.string().max(30).optional().default(""),
  services: z
    .array(z.object({ name: z.string().max(120).default(""), description: z.string().max(400).default(""), priceRange: z.string().max(60).default(""), imageUrl: z.string().max(400).default("") }))
    .max(12)
    .optional()
    .default([]),
  faqs: z
    .array(z.object({ question: z.string().max(200).default(""), answer: z.string().max(1000).default("") }))
    .max(12)
    .optional()
    .default([]),
});

export const eventInputSchema = z.object({
  title: z.string().min(3).max(120),
  type: z.enum(EVENT_TYPES),
  city: z.enum(CITIES),
  venueName: z.string().min(2).max(120),
  address: z.string().max(200).optional().default(""),
  startsAt: z.coerce.date(),
  description: z.string().max(3000).optional().default(""),
  ticketUrl: z.string().url().max(300).optional().or(z.literal("")).default(""),
  priceFrom: z.coerce.number().min(0).max(10000).optional().nullable(),
  imageUrl: z.string().url().max(300).optional().or(z.literal("")).default(""),
});

export const HOUR_PRESETS: Record<string, string> = {
  none: "{}",
  office: JSON.stringify({
    mon: [{ open: "09:00", close: "17:30" }],
    tue: [{ open: "09:00", close: "17:30" }],
    wed: [{ open: "09:00", close: "17:30" }],
    thu: [{ open: "09:00", close: "17:30" }],
    fri: [{ open: "09:00", close: "17:00" }],
  }),
  shop: JSON.stringify({
    mon: [{ open: "09:00", close: "19:00" }],
    tue: [{ open: "09:00", close: "19:00" }],
    wed: [{ open: "09:00", close: "19:00" }],
    thu: [{ open: "09:00", close: "19:00" }],
    fri: [{ open: "09:00", close: "20:00" }],
    sat: [{ open: "09:00", close: "20:00" }],
    sun: [{ open: "10:00", close: "17:00" }],
  }),
  restaurant: JSON.stringify({
    mon: [{ open: "12:00", close: "22:00" }],
    tue: [{ open: "12:00", close: "22:00" }],
    wed: [{ open: "12:00", close: "22:00" }],
    thu: [{ open: "12:00", close: "22:30" }],
    fri: [{ open: "12:00", close: "23:00" }],
    sat: [{ open: "12:00", close: "23:00" }],
    sun: [{ open: "12:00", close: "21:00" }],
  }),
};
