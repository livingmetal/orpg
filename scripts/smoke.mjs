// End-to-end smoke test: auth -> create session -> socket chat/dice -> DB.
// Run against a running host: `node scripts/smoke.mjs`
import path from "node:path";
import { io } from "socket.io-client";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";
const EMAIL = `smoke+${Date.now()}@test.local`;
const PASSWORD = "smoke-pass-123";

const jar = new Map();
function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}
function absorb(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
}
async function req(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { ...(opts.headers ?? {}), cookie: cookieHeader() },
    redirect: "manual",
  });
  absorb(res);
  return res;
}

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

async function main() {
  // 1. CSRF + credentials sign-in (auto-registers on first use).
  const csrf = await (await req(`${BASE}/api/auth/csrf`)).json();
  const form = new URLSearchParams({
    csrfToken: csrf.csrfToken,
    email: EMAIL,
    password: PASSWORD,
    json: "true",
    callbackUrl: BASE,
  });
  await req(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!jar.has("next-auth.session-token")) fail("no session cookie after sign-in");

  const session = await (await req(`${BASE}/api/auth/session`)).json();
  if (!session?.user?.id) fail("session has no user id");
  console.log("OK  signed in as", session.user.email, session.user.id);

  // 2. Create a game session.
  const created = await (
    await req(`${BASE}/api/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Smoke Table" }),
    })
  ).json();
  const sessionId = created?.session?.id;
  if (!sessionId) fail("session not created");
  console.log("OK  created session", sessionId);

  // 3. Connect socket with the auth cookie and exercise chat + dice.
  const socket = io(BASE, {
    extraHeaders: { cookie: cookieHeader() },
    transports: ["polling", "websocket"],
  });

  const got = { chat: 0, dice: 0 };
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("socket timeout")), 15000);
    socket.on("connect_error", (e) => reject(new Error("connect_error: " + e.message)));
    socket.on("error", (m) => console.log("    socket error event:", m));
    socket.on("chat:message", () => got.chat++);
    socket.on("dice:result", () => {
      got.dice++;
      setTimeout(() => {
        clearTimeout(timer);
        resolve();
      }, 500);
    });
    socket.on("connect", () => {
      socket.emit("session:join", sessionId);
      setTimeout(() => socket.emit("chat:send", { sessionId, content: "hello from smoke" }), 300);
      setTimeout(() => socket.emit("dice:roll", { sessionId, notation: "2d6+3" }), 700);
    });
  });
  socket.close();
  console.log(`OK  socket events: chat=${got.chat} dice=${got.dice}`);

  // 4. Confirm persistence directly in SQLite.
  const prisma = new PrismaClient({
    datasources: { db: { url: `file:${path.join(process.cwd(), "data", "orpg.db")}` } },
  });
  const chatCount = await prisma.chatMessage.count({ where: { sessionId } });
  const diceCount = await prisma.diceRoll.count({ where: { sessionId } });
  await prisma.$disconnect();

  if (chatCount < 2) fail(`expected >=2 chat rows (chat + dice log), got ${chatCount}`);
  if (diceCount < 1) fail(`expected >=1 dice row, got ${diceCount}`);
  console.log(`OK  persisted: ChatMessage=${chatCount} DiceRoll=${diceCount}`);
  console.log("\nSMOKE PASSED");
  process.exit(0);
}

main().catch((e) => fail(e.message));
