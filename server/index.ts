import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import next from "next";
import { Server as SocketServer } from "socket.io";
import { registerSocketHandlers } from "./socket";
import type { ClientToServerEvents, ServerToClientEvents } from "../src/types/socket";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);

// The LAN IPv4 a player on the same network would use to reach this host.
function lanAddress(): string | null {
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return null;
}

const app = next({ dev });
const handle = app.getRequestHandler();

async function main() {
  await app.prepare();

  const httpServer = createServer((req, res) => handle(req, res));

  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
  });

  registerSocketHandlers(io);

  // Bind to all interfaces so players on the LAN can connect to the host.
  httpServer.listen(port, "0.0.0.0", () => {
    const lan = lanAddress();
    console.log(`\n  ORPG host ready (${dev ? "dev" : "prod"})\n`);
    console.log(`  Local:    http://localhost:${port}`);
    if (lan) console.log(`  Network:  http://${lan}:${port}   ← share this with players`);
    console.log("");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
