import type { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../../src/types/socket";
import { registerChatHandlers } from "./handlers/chat";
import { registerDiceHandlers } from "./handlers/dice";

type IO = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(io: IO) {
  io.on("connection", (socket) => {
    // Each game session is a Socket.IO room keyed by sessionId.
    socket.on("session:join", (sessionId) => {
      socket.join(sessionId);
    });
    socket.on("session:leave", (sessionId) => {
      socket.leave(sessionId);
    });

    registerChatHandlers(io, socket);
    registerDiceHandlers(io, socket);
  });
}
