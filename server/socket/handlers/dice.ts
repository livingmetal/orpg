import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../../../src/types/socket";
import { roll } from "../../../src/lib/dice";

type IO = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerDiceHandlers(io: IO, socket: IOSocket) {
  socket.on("dice:roll", async ({ sessionId, notation }) => {
    try {
      const result = roll(notation);
      // TODO: persist via prisma (DiceRoll) and attach the roller's identity.
      io.to(sessionId).emit("dice:result", {
        id: crypto.randomUUID(),
        sessionId,
        byName: null,
        result,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      socket.emit("error", err instanceof Error ? err.message : "Invalid roll");
    }
  });
}
