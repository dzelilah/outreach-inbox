import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { prisma } from "../src/lib/db";
import { seedOpportunitySchema, type SeedOpportunity } from "../src/lib/schemas";

const SEED_FILE = path.join(process.cwd(), "data", "opportunities.json");

/** Validates every row; invalid rows and duplicate ids are reported and skipped. */
function loadRows() {
  const raw: unknown = JSON.parse(readFileSync(SEED_FILE, "utf8"));
  if (!Array.isArray(raw)) {
    throw new Error(`${SEED_FILE} must contain a JSON array`);
  }

  const rows: SeedOpportunity[] = [];
  const seenIds = new Set<string>();
  raw.forEach((item, index) => {
    const result = seedOpportunitySchema.safeParse(item);
    if (!result.success) {
      console.warn(`Skipping row ${index + 1}:\n${z.prettifyError(result.error)}`);
      return;
    }
    if (seenIds.has(result.data.id)) {
      console.warn(`Skipping row ${index + 1}: duplicate id ${result.data.id}`);
      return;
    }
    seenIds.add(result.data.id);
    rows.push(result.data);
  });

  return { rows, skipped: raw.length - rows.length };
}

async function main() {
  const { rows, skipped } = loadRows();

  await prisma.$transaction(
    rows.map(({ id, draft, ...facts }) =>
      prisma.opportunity.upsert({
        where: { id },
        create: { id, ...facts, draft, originalDraft: draft },
        // Re-seeding refreshes the seed facts but keeps the user's status and draft edits.
        update: { ...facts, originalDraft: draft },
      }),
    ),
  );

  console.log(`Seed: ${rows.length} imported, ${skipped} skipped.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
