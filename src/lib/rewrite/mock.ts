import type { DraftRewriter, RewriteInput } from "./types";

/**
 * Rewrites a draft with a fixed template, without any network call. The same
 * input always gives the same text: a tighter opening, the same contact, page
 * title, competitor and links, one clear call to action, about 80 words.
 */
export function mockRewrite({ draft, contactName, linkingPageTitle, competitorLinked }: RewriteInput) {
  const links = draft.match(/https?:\/\/\S+/g) ?? [];
  return [
    `Hi ${contactName ?? "there"},`,
    `Your article "${linkingPageTitle}" is a clear guide, and I noticed it links to ${competitorLinked}.`,
    "Moonrank shows brands how they appear in AI answers from ChatGPT, Perplexity and Gemini, so it could be a useful addition for your readers.",
    ...(links.length > 0 ? [`For reference: ${links.join(" ")}`] : []),
    "Would you be open to adding Moonrank to the article? I can send a short summary or data you are welcome to quote.",
    "Thanks!",
  ].join("\n\n");
}

export const mockRewriter: DraftRewriter = {
  name: "mock",
  rewrite: async (input) => mockRewrite(input),
};
