// Shared LLM assist used by both the socket handler and the REST route.
// Relative imports (not the @ alias) so the custom server can load it too.
import { anthropic, DEFAULT_MODEL } from "./anthropic";
import { prisma } from "./db";

const SYSTEM_PROMPT =
  "You are a concise assistant at an online tabletop RPG table. Help with rules " +
  "questions, dice math, short NPC lines, and quick summaries. Keep answers to a " +
  "few sentences. Reply in the same language as the question.";

export function llmConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Builds optional session context (published storyboards + recent log) and asks
// the model. Throws if the API key is missing so callers can degrade nicely.
export async function assist({
  sessionId,
  prompt,
}: {
  sessionId?: string;
  prompt: string;
}): Promise<string> {
  if (!llmConfigured()) {
    throw new Error("LLM not configured (set ANTHROPIC_API_KEY)");
  }

  let context = "";
  if (sessionId) {
    const [messages, storyboards] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: 15,
        include: { author: { select: { name: true } }, character: { select: { name: true } } },
      }),
      prisma.storyboard.findMany({
        where: { sessionId, published: true },
        orderBy: { order: "asc" },
        select: { title: true, body: true },
      }),
    ]);

    const log = messages
      .reverse()
      .map((m) => `${m.character?.name ?? m.author?.name ?? "system"}: ${m.content}`)
      .join("\n");
    const story = storyboards.map((s) => `## ${s.title}\n${s.body}`).join("\n\n");

    context = [
      story && `Published storyboard:\n${story}`,
      log && `Recent table log:\n${log}`,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  const userContent = context ? `${context}\n\n---\nQuestion: ${prompt}` : prompt;

  const message = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  return message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
