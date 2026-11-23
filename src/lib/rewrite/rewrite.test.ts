import { afterEach, describe, expect, it, vi } from "vitest";
import seedRows from "../../../data/opportunities.json";
import { getRewriter } from "./index";
import { mockRewrite, mockRewriter } from "./mock";

const input = {
  draft:
    'Hi Editor 35, I enjoyed "7 Easy Ways".\n' +
    "You link to ahrefs.com; Moonrank tracks how brands appear in ChatGPT.\n" +
    "Would you consider including it? Happy to share data your readers might find useful.",
  contactName: "Editor 35",
  linkingPageTitle: "7 Easy Ways",
  competitorLinked: "ahrefs.com",
};

describe("mockRewrite", () => {
  it("rewrites the opening and the call to action, and keeps the facts", () => {
    expect(mockRewrite(input)).toBe(
      'Hi Editor 35,\n\nYour article "7 Easy Ways" caught my eye.\n' +
        "It already links to ahrefs.com. Moonrank tracks how brands appear in ChatGPT.\n\n" +
        "Would you be open to adding Moonrank to the article? I can share data your readers might find useful.",
    );
  });

  it("keeps text and links the user added", () => {
    const draft = `${input.draft}\n\nMy own line, see https://example.com/stats`;
    expect(mockRewrite({ ...input, draft })).toBe(
      `${mockRewrite(input)}\n\nMy own line, see https://example.com/stats`,
    );
  });

  it("keeps a page title with a $ pattern as it is", () => {
    const linkingPageTitle = "Save $& more";
    const draft = input.draft.replace(input.linkingPageTitle, () => linkingPageTitle);
    expect(mockRewrite({ ...input, draft, linkingPageTitle })).toContain(`"${linkingPageTitle}" caught my eye.`);
  });

  it.each(seedRows)("rewrites every standard phrase in $id", (row) => {
    const text = mockRewrite(row);
    expect(text).toContain(`\n\nYour article "${row.linkingPageTitle}" caught my eye.`);
    expect(text).toContain(`It already links to ${row.competitorLinked}. Moonrank`);
    expect(text).toContain("Would you be open to adding Moonrank");
  });
});

describe("mockRewriter", () => {
  it("says so when there is nothing left to rewrite", async () => {
    const draft = await mockRewriter.rewrite(input);
    await expect(mockRewriter.rewrite({ ...input, draft })).rejects.toThrow("unchanged");
  });
});

describe("getRewriter", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the mock unless the Anthropic provider is chosen explicitly", () => {
    vi.stubEnv("LLM_PROVIDER", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "a-key-alone-is-not-enough");
    expect(getRewriter().name).toBe("mock");

    vi.stubEnv("LLM_PROVIDER", "anthropic");
    expect(getRewriter().name).toBe("Claude");
  });
});
