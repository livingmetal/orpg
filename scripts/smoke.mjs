// End-to-end smoke test: auth -> character -> session -> storyboard ->
// socket chat/dice (in character) -> LLM graceful degradation -> DB checks.
// Run against a running host: `node scripts/smoke.mjs`
import path from "node:path";
import { io } from "socket.io-client";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";
const EMAIL = `smoke+${Date.now()}@test.local`;
const PASSWORD = "smoke-pass-123";

const jar = new Map();
const cookieHeader = () => [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
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
const json = (url, method, body) =>
  req(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

async function main() {
  // 1. Sign in (auto-registers).
  const csrf = await (await req(`${BASE}/api/auth/csrf`)).json();
  await req(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrfToken: csrf.csrfToken,
      email: EMAIL,
      password: PASSWORD,
      json: "true",
      callbackUrl: BASE,
    }).toString(),
  });
  const session = await (await req(`${BASE}/api/auth/session`)).json();
  if (!session?.user?.id) fail("no session user");
  console.log("OK  signed in", session.user.email);

  // 2. Create a character.
  const charRes = await (await json(`${BASE}/api/characters`, "POST", { name: "Aria the Bold" })).json();
  const charId = charRes?.character?.id;
  if (!charId) fail("character not created");
  console.log("OK  character", charId);

  // 3. Create a session (caller is GM).
  const sRes = await (await json(`${BASE}/api/sessions`, "POST", { title: "Smoke Table" })).json();
  const sessionId = sRes?.session?.id;
  if (!sessionId) fail("session not created");
  console.log("OK  session", sessionId);

  // 4. Create + publish a storyboard, then confirm visibility.
  const sb = await (
    await json(`${BASE}/api/storyboards`, "POST", { sessionId, title: "Act I", body: "A dark inn." })
  ).json();
  const sbId = sb?.storyboard?.id;
  if (!sbId) fail("storyboard not created");
  await json(`${BASE}/api/storyboards/${sbId}`, "PATCH", { published: true });
  const sbList = await (await req(`${BASE}/api/storyboards?sessionId=${sessionId}`)).json();
  if (!sbList.isGm) fail("creator should be GM");
  if (!sbList.storyboards.some((s) => s.id === sbId && s.published)) fail("published storyboard missing");
  console.log("OK  storyboard published");

  // 5. Socket: join, pick character, chat, dice, and ask the LLM.
  const socket = io(BASE, { extraHeaders: { cookie: cookieHeader() }, transports: ["polling", "websocket"] });
  const got = { chat: 0, dice: 0, charSet: null, errors: [], llmReply: false };

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("socket timeout")), 20000);
    const llmDone = () => got.llmReply || got.errors.length >= 1;
    const maybeDone = () => {
      if (got.chat >= 2 && got.dice >= 1 && llmDone()) {
        clearTimeout(timer);
        setTimeout(resolve, 300);
      }
    };
    socket.on("connect_error", (e) => reject(new Error("connect_error: " + e.message)));
    socket.on("error", (m) => {
      got.errors.push(m);
      maybeDone();
    });
    socket.on("character:set", (name) => (got.charSet = name));
    socket.on("chat:message", (m) => {
      got.chat++;
      if (m?.kind === "LLM_ASSIST") got.llmReply = true;
      maybeDone();
    });
    socket.on("dice:result", () => {
      got.dice++;
      maybeDone();
    });
    socket.on("connect", () => {
      socket.emit("session:join", sessionId);
      setTimeout(() => socket.emit("session:setCharacter", { sessionId, characterId: charId }), 300);
      setTimeout(() => socket.emit("chat:send", { sessionId, content: "I draw my blade." }), 700);
      setTimeout(() => socket.emit("dice:roll", { sessionId, notation: "2d6+3" }), 1100);
      setTimeout(() => socket.emit("llm:ask", { sessionId, prompt: "what's my total?" }), 1500);
    });
  });
  socket.close();
  if (got.charSet !== "Aria the Bold") fail(`character:set was ${got.charSet}`);
  // The LLM path must produce *some* outcome (a reply with a real key, or a
  // graceful error otherwise) without crashing the server.
  if (!(got.llmReply || got.errors.length >= 1)) fail("LLM path produced no reply and no error");
  const llmOutcome = got.llmReply ? "reply" : "graceful-error";
  console.log(`OK  socket: chat=${got.chat} dice=${got.dice} charSet="${got.charSet}" llm=${llmOutcome}`);

  // 6. Confirm persistence + character attribution.
  const prisma = new PrismaClient({
    datasources: { db: { url: `file:${path.join(process.cwd(), "data", "orpg.db")}` } },
  });
  const chatCount = await prisma.chatMessage.count({ where: { sessionId } });
  const diceCount = await prisma.diceRoll.count({ where: { sessionId } });
  const inChar = await prisma.chatMessage.count({ where: { sessionId, characterId: charId } });
  await prisma.$disconnect();

  if (chatCount < 2) fail(`chat rows ${chatCount} < 2`);
  if (diceCount < 1) fail(`dice rows ${diceCount} < 1`);
  if (inChar < 1) fail("no message attributed to the character");
  console.log(`OK  persisted: chat=${chatCount} dice=${diceCount} attributedToCharacter=${inChar}`);
  console.log("\nSMOKE PASSED");
  process.exit(0);
}

main().catch((e) => fail(e.message));
