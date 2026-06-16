import { prisma } from "../../../src/lib/db";
import { roll } from "../../../src/lib/dice";
import type { IO, IOSocket } from "../types";

export function registerDiceHandlers(io: IO, socket: IOSocket) {
  socket.on("dice:roll", async ({ sessionId, notation }) => {
    if (!socket.rooms.has(sessionId)) {
      return socket.emit("error", "Join the session before rolling");
    }

    let result: ReturnType<typeof roll>;
    try {
      result = roll(notation);
    } catch (err) {
      return socket.emit("error", err instanceof Error ? err.message : "Invalid roll");
    }

    try {
      const breakdown = result.rolls.map((r) => r.value).join(", ");
      const mod = result.modifier ? (result.modifier > 0 ? ` +${result.modifier}` : ` ${result.modifier}`) : "";
      const logLine = `🎲 ${result.notation} → ${result.total}  [${breakdown}${mod}]`;

      // Persist the roll and a matching chat-log line in one transaction so the
      // roll shows up in session history alongside chat.
      const [diceRow, message] = await prisma.$transaction([
        prisma.diceRoll.create({
          data: {
            sessionId,
            userId: socket.data.userId,
            characterId: socket.data.characterId,
            notation: result.notation,
            results: result.rolls,
            total: result.total,
          },
        }),
        prisma.chatMessage.create({
          data: {
            sessionId,
            authorId: socket.data.userId,
            characterId: socket.data.characterId,
            kind: "DICE",
            content: logLine,
          },
        }),
      ]);

      const byName = socket.data.characterName ?? socket.data.userName;

      io.to(sessionId).emit("dice:result", {
        id: diceRow.id,
        sessionId,
        byName,
        result,
        createdAt: diceRow.createdAt.toISOString(),
      });

      io.to(sessionId).emit("chat:message", {
        id: message.id,
        sessionId,
        authorName: socket.data.userName,
        characterName: socket.data.characterName,
        kind: "DICE",
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      });
    } catch {
      socket.emit("error", "Failed to record roll");
    }
  });
}
