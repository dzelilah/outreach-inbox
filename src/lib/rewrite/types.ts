/** What a rewriter gets: the draft plus the facts it must keep. */
export type RewriteInput = {
  draft: string;
  contactName: string | null;
  linkingPageTitle: string;
  competitorLinked: string;
};

/** One way to rewrite a draft. The mock and the optional Anthropic provider both implement it. */
export interface DraftRewriter {
  /** Shown on the button, so the user knows what does the rewriting. */
  name: string;
  /** Returns the rewritten draft, or throws an Error with a message for the user. */
  rewrite(input: RewriteInput): Promise<string>;
}
