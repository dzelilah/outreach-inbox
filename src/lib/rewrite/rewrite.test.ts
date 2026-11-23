import { afterEach, describe, expect, it, vi } from "vitest";
import { getRewriter } from "./index";
import { mockRewrite } from "./mock";

const input = {
  draft: 'Hi Editor 35, I enjoyed "7 Easy Ways".\nYou link to ahrefs.com. See https://example.com/stats',
  contactName: "Editor 35",
  linkingPageTitle: "7 Easy Ways to Get Your Business Found in AI Search",
  competitorLinked: "ahrefs.com",
};

describe("mockRewrite", () => {
  it("keeps the contact, page title, competitor and links", () => {
    const text = mockRewrite(input);
    expect(text).toContain("Hi Editor 35,");
    expect(text).toContain(`"${input.linkingPageTitle}"`);
    expect(text).toContain("ahrefs.com");
    expect(text).toContain("https://example.com/stats");
  });

  it("is deterministic and about 80 words", () => {
    const text = mockRewrite(input);
    expect(mockRewrite(input)).toBe(text);
    const words = text.split(/\s+/).length;
    expect(words).toBeGreaterThan(60);
    expect(words).toBeLessThan(100);
  });

  it("greets with 'there' when there is no contact", () => {
    expect(mockRewrite({ ...input, contactName: null })).toMatch(/^Hi there,/);
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
