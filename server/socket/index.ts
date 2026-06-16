import { getToken } from "next-auth/jwt";
import { prisma } from "../../src/lib/db";
import type { IO } from "./types";
import { registerChatHandlers } from "./handlers/chat";
import { registerDiceHandlers } from "./handlers/dice";
import { registerLlmHandlers } from "./handlers/llm";

const HISTORY_LIMIT = 50;

// next-auth's getToken reads cookies from `req.cookies` (an object), which a
// raw Node IncomingMessage (the Socket.IO handshake) doesn't have — so parse
// the Cookie header into the shape getToken expects.
function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name) out[name] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

export function registerSocketHandlers(io: IO) {
  // Authenticate every connection using the NextAuth JWT from the handshake
  // cookie (same-origin, so cookies are sent automatically).
  io.use(async (socket, next) => {
    try {
      const headers = socket.request.headers;
      const token = await getToken({
        req: { headers, cookies: parseCookies(headers.cookie) } as never,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token?.sub) return next(new Error("unauthorized"));
      socket.data.userId = token.sub;
      socket.data.userName = (token.name as string | null) ?? null;
      socket.data.characterId = null;
      socket.data.characterName = null;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Each game session is a Socket.IO room keyed by sessionId.
    socket.on("session:join", async (sessionId) => {
      try {
        const session = await prisma.gameSession.findUnique({
          where: { id: sessionId },
          select: { id: true, gmId: true },
        });
        if (!session) return socket.emit("error", "Session not found");

        // Auto-enroll the user as a player (the GM is already a member).
        if (session.gmId !== socket.data.userId) {
          await prisma.sessionMember.upsert({
            where: { sessionId_userId: { sessionId, userId: socket.data.userId } },
            create: { sessionId, userId: socket.data.userId, role: "PLAYER" },
            update: {},
          });
        }

        // Restore the character this user last played at this table, if any.
        const member = await prisma.sessionMember.findUnique({
          where: { sessionId_userId: { sessionId, userId: socket.data.userId } },
          select: { character: { select: { id: true, name: true } } },
        });
        socket.data.characterId = member?.character?.id ?? null;
        socket.data.characterName = member?.character?.name ?? null;

        socket.join(sessionId);
        socket.emit("character:set", socket.data.characterName);

        // Send recent history to the joining client only.
        const history = await prisma.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: "desc" },
          take: HISTORY_LIMIT,
          include: {
            author: { select: { name: true } },
            character: { select: { name: true } },
          },
        });
        for (const m of history.reverse()) {
          socket.emit("chat:message", {
            id: m.id,
            sessionId: m.sessionId,
            authorName: m.author?.name ?? null,
            characterName: m.character?.name ?? null,
            kind: m.kind as never,
            content: m.content,
            createdAt: m.createdAt.toISOString(),
          });
        }
      } catch {
        socket.emit("error", "Failed to join session");
      }
    });

    socket.on("session:leave", (sessionId) => {
      socket.leave(sessionId);
    });

    // Choose (or clear) the character the user plays in this session.
    socket.on("session:setCharacter", async ({ sessionId, characterId }) => {
      try {
        if (characterId) {
          const character = await prisma.character.findUnique({
            where: { id: characterId },
            select: { id: true, name: true, ownerId: true },
          });
          if (!character || character.ownerId !== socket.data.userId) {
            return socket.emit("error", "You don't own that character");
          }
          await prisma.sessionMember.update({
            where: { sessionId_userId: { sessionId, userId: socket.data.userId } },
            data: { characterId },
          });
          socket.data.characterId = character.id;
          socket.data.characterName = character.name;
        } else {
          await prisma.sessionMember.update({
            where: { sessionId_userId: { sessionId, userId: socket.data.userId } },
            data: { characterId: null },
          });
          socket.data.characterId = null;
          socket.data.characterName = null;
        }
        socket.emit("character:set", socket.data.characterName);
      } catch {
        socket.emit("error", "Failed to set character");
      }
    });

    registerChatHandlers(io, socket);
    registerDiceHandlers(io, socket);
    registerLlmHandlers(io, socket);
  });
}
