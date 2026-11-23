import type { DraftRewriter, RewriteInput } from "./types";

/**
 * Rewrites a draft without any network call, by replacing the standard phrases
 * of the seed drafts: a tighter opening and one clear call to action. All other
 * text, such as names, links and the user's own edits, stays as it is.
 */
export function mockRewrite({ draft, linkingPageTitle, competitorLinked }: RewriteInput) {
  const phrases = [
    [` I enjoyed "${linkingPageTitle}".`, `\n\nYour article "${linkingPageTitle}" caught my eye.`],
    [`You link to ${competitorLinked}; Moonrank`, `It already links to ${competitorLinked}. Moonrank`],
    [
      "Would you consider including it? Happy to share data your readers might find useful.",
      "\nWould you be open to adding Moonrank to the article? I can share data your readers might find useful.",
    ],
  ];
  // The replacement is a function so that a "$" in a page title is not read as a replace() pattern.
  return phrases.reduce((text, [from, to]) => text.replace(from, () => to), draft);
}

export const mockRewriter: DraftRewriter = {
  name: "mock",
  async rewrite(input) {
    const text = mockRewrite(input);
    if (text === input.draft) {
      throw new Error("The mock found no standard phrases left to rewrite, so the draft is unchanged.");
    }
    return text;
  },
};
