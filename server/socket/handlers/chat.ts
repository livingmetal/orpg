import { prisma } from "../../../src/lib/db";
import type { IO, IOSocket } from "../types";

export function registerChatHandlers(io: IO, socket: IOSocket) {
  socket.on("chat:send", async ({ sessionId, content }) => {
    const text = content?.trim();
    if (!text) return;
    if (!socket.rooms.has(sessionId)) {
      return socket.emit("error", "Join the session before sending messages");
    }

    try {
      const message = await prisma.chatMessage.create({
        data: {
          sessionId,
          authorId: socket.data.userId,
          kind: "CHAT",
          content: text.slice(0, 4000),
        },
        include: { character: { select: { name: true } } },
      });

      io.to(sessionId).emit("chat:message", {
        id: message.id,
        sessionId,
        authorName: socket.data.userName,
        characterName: message.character?.name ?? null,
        kind: "CHAT",
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      });
    } catch {
      socket.emit("error", "Failed to send message");
    }
  });
}
