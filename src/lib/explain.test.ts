import { describe, expect, it } from "vitest";
import seedRows from "../../data/opportunities.json";
import { explainScore } from "./explain";

const seedRow = (id: string) => {
  const row = seedRows.find((r) => r.id === id);
  if (!row) throw new Error(`Seed row ${id} is missing`);
  return row;
};

describe("explainScore", () => {
  it("warns first when a high score meets a low domain rating (op_01)", () => {
    const signals = explainScore(seedRow("op_01"));
    expect(signals[0]).toEqual({
      tone: "bad",
      text: "The score is high (93) but the domain rating is low (14). Treat the score with caution.",
    });
    expect(signals.map((s) => s.tone)).toEqual(["bad", "good", "bad", "good"]);
  });

  it("gives no warning for a top row on a medium site (op_35)", () => {
    expect(explainScore(seedRow("op_35")).map((s) => s.tone)).toEqual(["good", "neutral", "good"]);
  });

  it("flags an off-topic row (op_03)", () => {
    expect(explainScore(seedRow("op_03"))[0].tone).toBe("bad");
  });

  it("treats a domain rating of 70 as high", () => {
    const row = { relevanceScore: 50, domainRating: 70, topic: "SEO", competitorLinked: "x.com" };
    expect(explainScore(row)[1].tone).toBe("good");
  });
});
