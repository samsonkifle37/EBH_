/** Demo (seeded) listings are only visible when explicitly enabled. */
export function allowDemoData(): boolean {
  return process.env.ALLOW_DEMO_DATA === "true";
}

/** Prisma `where` fragment excluding demo records unless the flag is on. */
export function demoFilter(): { sourceType?: { not: string } } {
  return allowDemoData() ? {} : { sourceType: { not: "demo" } };
}
