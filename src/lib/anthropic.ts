import Anthropic from "@anthropic-ai/sdk";

// Shared Anthropic client. The assist endpoint uses this for small,
// table-side help: rules lookups, dice math explanations, NPC banter, etc.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
