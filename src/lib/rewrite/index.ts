import { anthropicRewriter } from "./anthropic";
import { mockRewriter } from "./mock";
import type { DraftRewriter } from "./types";

export type { DraftRewriter, RewriteInput } from "./types";

/**
 * The provider is chosen explicitly with LLM_PROVIDER. The mock is the default,
 * so the app runs offline and without a key. A key that happens to exist
 * (env var or `ant auth login`) never switches the real provider on by itself.
 */
export function getRewriter(): DraftRewriter {
  return process.env.LLM_PROVIDER === "anthropic" ? anthropicRewriter : mockRewriter;
}
