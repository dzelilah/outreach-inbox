import type { Opportunity } from "@/generated/prisma/client";

/** Pages with a lower domain rating than this are low quality. */
export const MIN_DOMAIN_RATING = 30;

/** Topics that are relevant for a Moonrank customer. Matching ignores case and surrounding spaces. */
export const RELEVANT_TOPICS = [
  "AI search",
  "GEO",
  "SEO",
  "E-commerce SEO",
  "Agencies",
  "B2B marketing",
];

/** Reasons a row counts as low quality, with the label shown in the UI. */
export const QUALITY_ISSUE_LABELS = {
  LOW_DOMAIN_RATING: "Low DR",
  MISSING_CONTACT: "No contact",
  OFF_TOPIC: "Off-topic",
} as const;

export type QualityIssue = keyof typeof QUALITY_ISSUE_LABELS;

const normalize = (value: string) => value.trim().toLowerCase();
const relevantTopics = new Set(RELEVANT_TOPICS.map(normalize));

export function getQualityIssues(
  opportunity: Pick<Opportunity, "domainRating" | "topic" | "contactName" | "contactLinkedinUrl">,
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  if (opportunity.domainRating < MIN_DOMAIN_RATING) issues.push("LOW_DOMAIN_RATING");
  // Without a name and a profile there is nobody to address the message to.
  if (!opportunity.contactName || !opportunity.contactLinkedinUrl) issues.push("MISSING_CONTACT");
  if (!relevantTopics.has(normalize(opportunity.topic))) issues.push("OFF_TOPIC");
  return issues;
}

/** Filters the user can change. They live in the URL. */
export type InboxFilters = { showLowQuality: boolean };

/** Keeps the rows the filters allow. Low-quality rows are hidden unless the user asks for them. */
export function applyFilters<T extends { issues: QualityIssue[] }>(items: T[], filters: InboxFilters) {
  return items.filter((item) => filters.showLowQuality || item.issues.length === 0);
}

/**
 * Highest relevance score first. Equal scores go to the higher domain rating,
 * then to the id, so the order is the same on every load.
 */
export function compareByRelevance(
  a: Pick<Opportunity, "id" | "relevanceScore" | "domainRating">,
  b: Pick<Opportunity, "id" | "relevanceScore" | "domainRating">,
) {
  return (
    b.relevanceScore - a.relevanceScore ||
    b.domainRating - a.domainRating ||
    a.id.localeCompare(b.id)
  );
}

/** Maps each domain that appears on more than one opportunity to the ids of those opportunities. */
export function findDuplicateDomains(opportunities: Pick<Opportunity, "id" | "domain">[]) {
  const idsByDomain = new Map<string, string[]>();
  for (const { id, domain } of opportunities) {
    const key = normalize(domain).replace(/^www\./, "");
    idsByDomain.set(key, [...(idsByDomain.get(key) ?? []), id]);
  }
  return new Map([...idsByDomain].filter(([, ids]) => ids.length > 1));
}
