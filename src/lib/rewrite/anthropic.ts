import Anthropic from "@anthropic-ai/sdk";
import type { DraftRewriter, RewriteInput } from "./types";

const SYSTEM_PROMPT = `You rewrite short link-building outreach emails for Moonrank, a platform that shows brands how they appear in AI search (ChatGPT, Perplexity, Gemini).

Keep every name, page title, competitor and link from the draft, and do not add facts, numbers or offers that are not in it. Make the opening tighter and end with one clear call to action. Keep it to about 80 words.

Reply with the email body only: no subject line, no notes before or after it.`;

function buildPrompt({ draft, contactName, linkingPageTitle, competitorLinked }: RewriteInput) {
  return [
    `Contact: ${contactName ?? "unknown, greet them as \"there\""}`,
    `Page title: ${linkingPageTitle}`,
    `Competitor the page links to: ${competitorLinked}`,
    "",
    "<draft>",
    draft,
    "</draft>",
  ].join("\n");
}

/**
 * Optional provider, used only when LLM_PROVIDER=anthropic. It is the only
 * code that sends data out: the draft, page title, competitor and contact name.
 */
export const anthropicRewriter: DraftRewriter = {
  name: "Claude",
  async rewrite(input) {
    // Created per call, so nothing touches the network or credentials unless this provider is used.
    const client = new Anthropic();
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5",
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPrompt(input) }],
      });
    } catch (error) {
      // Most specific first; every other failure gets a general message.
      if (error instanceof Anthropic.AuthenticationError) {
        throw new Error("The Anthropic API key is missing or invalid. Check ANTHROPIC_API_KEY in .env.");
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new Error("The Anthropic API is rate limiting requests. Try again in a minute.");
      }
      if (error instanceof Anthropic.APIConnectionError) {
        throw new Error("Could not reach the Anthropic API. Check the network connection.");
      }
      if (error instanceof Anthropic.APIError) {
        throw new Error(`The Anthropic API returned an error (${error.status}). Try again later.`);
      }
      throw new Error("The rewrite failed. Check the Anthropic settings in .env.");
    }

    // Claude can decline a request; then there is no draft to use.
    if (response.stop_reason === "refusal") {
      throw new Error("Claude declined to rewrite this draft. Edit it by hand instead.");
    }
    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    if (!text) throw new Error("Claude returned an empty draft. Try again.");
    return text;
  },
};
