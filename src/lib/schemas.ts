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

const MAX_DRAFT_LENGTH = 5000;

/** Input of the saveDraft and approveDraft Server Actions. The text is saved exactly as typed. */
export const draftInputSchema = z.object({
  id: requiredText,
  draft: z
    .string()
    .max(MAX_DRAFT_LENGTH, `The draft can be at most ${MAX_DRAFT_LENGTH} characters.`)
    .refine((draft) => draft.trim() !== "", "The draft cannot be empty."),
});

/**
 * Input of the bulkUpdateStatus Server Action. Only Skip and Move to review:
 * there is no bulk approve, because a human approves every message one by one.
 */
export const bulkStatusSchema = z.object({
  ids: z.array(requiredText).min(1, "Select at least one opportunity."),
  status: z.enum(["SKIPPED", "TO_REVIEW"]),
});

/** Input of the setStatus Server Action. APPROVED is missing on purpose: approving goes through approveDraft, which saves the text too. */
export const setStatusSchema = z.object({
  id: requiredText,
  status: z.enum(["TO_REVIEW", "SKIPPED", "DONE"]),
});
