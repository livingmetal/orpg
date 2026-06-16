import { prisma } from "../../../src/lib/db";
import { assist, llmConfigured } from "../../../src/lib/llm-assist";
import { rateLimit } from "../../../src/lib/rate-limit";
import type { IO, IOSocket } from "../types";

export function registerLlmHandlers(io: IO, socket: IOSocket) {
  socket.on("llm:ask", async ({ sessionId, prompt }) => {
    const q = prompt?.trim();
    if (!q) return;
    if (!socket.rooms.has(sessionId)) {
      return socket.emit("error", "Join the session before asking the assistant");
    }
    if (!llmConfigured()) {
      return socket.emit("error", "LLM assist is not configured on this host");
    }
    if (!rateLimit(`llm:${socket.data.userId}`, 8, 60_000)) {
      return socket.emit("error", "Assistant rate limit — wait a moment");
    }

    // 1) Echo the question into the log so the whole table sees it.
    const question = await prisma.chatMessage.create({
      data: {
        sessionId,
        authorId: socket.data.userId,
        characterId: socket.data.characterId,
        kind: "CHAT",
        content: `/ai ${q}`.slice(0, 4000),
      },
    });
    io.to(sessionId).emit("chat:message", {
      id: question.id,
      sessionId,
      authorName: socket.data.userName,
      characterName: socket.data.characterName,
      kind: "CHAT",
      content: question.content,
      createdAt: question.createdAt.toISOString(),
    });

    // 2) Ask the model.
    let answer: string;
    try {
      answer = await assist({ sessionId, prompt: q });
    } catch (err) {
      return socket.emit("error", err instanceof Error ? err.message : "Assistant failed");
    }
    if (!answer) return;

    // 3) Persist + broadcast the answer.
    const reply = await prisma.chatMessage.create({
      data: { sessionId, authorId: null, kind: "LLM_ASSIST", content: answer.slice(0, 8000) },
    });
    io.to(sessionId).emit("chat:message", {
      id: reply.id,
      sessionId,
      authorName: "AI",
      characterName: null,
      kind: "LLM_ASSIST",
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
    });
  });
}
