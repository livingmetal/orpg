import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../../../src/types/socket";

type IO = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerChatHandlers(io: IO, socket: IOSocket) {
  socket.on("chat:send", async ({ sessionId, content }) => {
    // TODO: authenticate the socket, resolve author/character, persist via
    // prisma (ChatMessage), then broadcast the saved row.
    // For now this just echoes to the room so the realtime path is testable.
    io.to(sessionId).emit("chat:message", {
      id: crypto.randomUUID(),
      sessionId,
      authorName: null,
      characterName: null,
      kind: "CHAT",
      content,
      createdAt: new Date().toISOString(),
    });
  });
}
