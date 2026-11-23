import type { Opportunity } from "@/generated/prisma/client";
import { isRelevantTopic, MIN_DOMAIN_RATING } from "./quality";

/** A domain rating at or above this is a strong site. */
export const HIGH_DOMAIN_RATING = 70;
/** A relevance score at or above this is a top match. */
export const HIGH_RELEVANCE_SCORE = 70;

export type ScoreSignal = { tone: "good" | "neutral" | "bad"; text: string };

/**
 * The relevance score comes from the data, so it is not recalculated here.
 * These signals show what supports the score and what argues against it.
 */
export function explainScore(
  opportunity: Pick<Opportunity, "relevanceScore" | "domainRating" | "topic" | "competitorLinked">,
): ScoreSignal[] {
  const { relevanceScore: score, domainRating: dr, competitorLinked } = opportunity;
  const topic = opportunity.topic.trim();
  const signals: ScoreSignal[] = [];

  // The trap in the seed data: op_01 has the second-best score but a very weak site.
  if (score >= HIGH_RELEVANCE_SCORE && dr < MIN_DOMAIN_RATING) {
    signals.push({
      tone: "bad",
      text: `The score is high (${score}) but the domain rating is low (${dr}). Treat the score with caution.`,
    });
  }

  signals.push(
    isRelevantTopic(topic)
      ? { tone: "good", text: `The topic, ${topic}, is one Moonrank customers care about.` }
      : { tone: "bad", text: `The topic, ${topic}, is off-topic for Moonrank customers.` },
  );

  if (dr >= HIGH_DOMAIN_RATING) {
    signals.push({ tone: "good", text: `High domain rating (${dr}): a link from this site carries weight.` });
  } else if (dr >= MIN_DOMAIN_RATING) {
    signals.push({ tone: "neutral", text: `Medium domain rating (${dr}).` });
  } else {
    signals.push({ tone: "bad", text: `Low domain rating (${dr}): a link from this site is worth little.` });
  }

  signals.push({
    tone: "good",
    text: `The page already links to ${competitorLinked}, so it covers tools like Moonrank.`,
  });

  return signals;
}
