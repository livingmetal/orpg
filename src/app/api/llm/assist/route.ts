import { NextResponse } from "next/server";
import { anthropic, DEFAULT_MODEL } from "@/lib/anthropic";

// POST /api/llm/assist
// Small table-side help: rules questions, summarizing the log, explaining a
// dice result, suggesting NPC lines. Keep prompts scoped and cheap.
export async function POST(req: Request) {
  // TODO: auth check + rate limiting + session-scoped context.
  const { prompt } = (await req.json().catch(() => ({}))) as { prompt?: string };
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");

  return NextResponse.json({ text });
}
