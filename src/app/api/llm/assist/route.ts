import { NextResponse } from "next/server";
import { assist, llmConfigured } from "@/lib/llm-assist";
import { getCurrentUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

// POST /api/llm/assist  { prompt, sessionId? }
// Small table-side help: rules questions, summaries, dice math, NPC lines.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!llmConfigured()) {
    return NextResponse.json({ error: "LLM not configured" }, { status: 503 });
  }
  if (!rateLimit(`llm:${user.id}`, 8, 60_000)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as { prompt?: string; sessionId?: string };
  if (!body.prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

  try {
    const text = await assist({ prompt: body.prompt, sessionId: body.sessionId });
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "assist failed" },
      { status: 500 },
    );
  }
}
