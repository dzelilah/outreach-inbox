import { z } from "zod";
import { QUALITY_VIEWS } from "./quality";

const percentage = z.int().min(0).max(100);
const requiredText = z.string().trim().min(1);
/** Missing, empty or whitespace-only optional text is stored as null. */
const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((value) => value || null);

/** One row of the seed data in data/opportunities.json. */
export const seedOpportunitySchema = z.object({
  id: requiredText,
  domain: requiredText,
  domainRating: percentage,
  linkingPageTitle: requiredText,
  linkingPageUrl: z.url({ protocol: /^https?$/ }),
  competitorLinked: requiredText,
  contactName: optionalText,
  contactRole: optionalText,
  contactLinkedinUrl: optionalText,
  relevanceScore: percentage,
  topic: requiredText,
  draft: requiredText,
  alreadyContacted: z.boolean().default(false),
});

export type SeedOpportunity = z.infer<typeof seedOpportunitySchema>;

/** The ?quality= URL param. A missing or unknown value falls back to the default view. */
export const qualityViewSchema = z.enum(QUALITY_VIEWS).catch("relevant");
