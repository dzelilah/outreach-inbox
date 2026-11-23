import { describe, expect, it } from "vitest";
import seedRows from "../../data/opportunities.json";
import {
  compareByRelevance,
  findDuplicateDomains,
  getQualityIssues,
  type QualityIssue,
} from "./quality";

const idsWith = (issue: QualityIssue) =>
  seedRows.filter((row) => getQualityIssues(row).includes(issue)).map((row) => row.id);

const row = {
  domainRating: 50,
  topic: "SEO",
  contactName: "Editor",
  contactLinkedinUrl: "https://linkedin.example/in/editor",
};

describe("getQualityIssues", () => {
  it("flags the low-quality rows in the seed data", () => {
    expect(idsWith("LOW_DOMAIN_RATING")).toEqual(["op_01", "op_04", "op_05", "op_25"]);
    expect(idsWith("OFF_TOPIC")).toEqual(["op_03", "op_16", "op_30"]);
    expect(idsWith("MISSING_CONTACT")).toEqual(["op_07", "op_08"]);
    expect(seedRows.filter((r) => getQualityIssues(r).length > 0)).toHaveLength(9);
  });

  it("treats a domain rating of exactly 30 as acceptable", () => {
    expect(getQualityIssues({ ...row, domainRating: 30 })).toEqual([]);
    expect(getQualityIssues({ ...row, domainRating: 29 })).toEqual(["LOW_DOMAIN_RATING"]);
  });

  it("matches topics regardless of case and surrounding spaces", () => {
    expect(getQualityIssues({ ...row, topic: "  e-commerce seo " })).toEqual([]);
    expect(getQualityIssues({ ...row, topic: "Cooking" })).toEqual(["OFF_TOPIC"]);
  });

  it("needs both a contact name and a profile", () => {
    expect(getQualityIssues({ ...row, contactLinkedinUrl: null })).toEqual(["MISSING_CONTACT"]);
    expect(getQualityIssues({ ...row, contactName: null })).toEqual(["MISSING_CONTACT"]);
  });
});

describe("compareByRelevance", () => {
  it("sorts by score, then domain rating, then id", () => {
    const sorted = [
      { id: "b", relevanceScore: 80, domainRating: 40 },
      { id: "a", relevanceScore: 80, domainRating: 40 },
      { id: "c", relevanceScore: 80, domainRating: 70 },
      { id: "d", relevanceScore: 90, domainRating: 10 },
    ].sort(compareByRelevance);
    expect(sorted.map((o) => o.id)).toEqual(["d", "c", "a", "b"]);
  });

  it("puts op_35 first and the low-DR op_01 second in the seed data", () => {
    const sorted = [...seedRows].sort(compareByRelevance);
    expect(sorted.slice(0, 2).map((o) => o.id)).toEqual(["op_35", "op_01"]);
  });
});

describe("findDuplicateDomains", () => {
  it("finds the two hubspot pages in the seed data", () => {
    expect([...findDuplicateDomains(seedRows)]).toEqual([["blog.hubspot.com", ["op_11", "op_31"]]]);
  });

  it("ignores case and a leading www.", () => {
    const duplicates = findDuplicateDomains([
      { id: "x", domain: "Example.com" },
      { id: "y", domain: "www.example.com" },
    ]);
    expect(duplicates.get("example.com")).toEqual(["x", "y"]);
  });
});
