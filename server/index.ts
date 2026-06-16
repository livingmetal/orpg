import { createServer } from "node:http";
import next from "next";
import { Server as SocketServer } from "socket.io";
import { registerSocketHandlers } from "./socket";
import type { ClientToServerEvents, ServerToClientEvents } from "../src/types/socket";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

async function main() {
  await app.prepare();

  const httpServer = createServer((req, res) => handle(req, res));

  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
  });

  registerSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(`> ORPG ready on http://localhost:${port} (${dev ? "dev" : "prod"})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
