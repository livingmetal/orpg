# Roadmap

Auth and the live table (chat + dice persistence) are working; characters and
storyboards are next. Suggested build order:

## 0. Setup (done)
- [x] Project scaffold (Next.js + Socket.IO + Prisma + Anthropic)
- [x] Host/client model: `npm run host` migrates + serves, prints LAN URL
- [x] Embedded SQLite + initial migration (`prisma/migrations`)
- [x] Data model (`prisma/schema.prisma`)
- [x] Realtime contract (`src/types/socket.ts`)
- [x] Dice roller core (`src/lib/dice.ts`)

## 1. Foundation
- [x] Auth with NextAuth (credentials, JWT; auto-register on first sign-in)
- [x] Sign-in page + header auth status
- [ ] User profile (rename, avatar)

## 2. Characters
- [ ] Create / edit characters
- [ ] Character sheet form (per rule-system schema)
- [ ] Attach a character to a session and to chat/dice (`characterId`)

## 3. Sessions & storyboards
- [x] Create sessions (GM + member), list open sessions (`/api/sessions`)
- [x] Players auto-join as members on entering a session room
- [ ] Session status transitions (DRAFT → OPEN → IN_PROGRESS → CLOSED)
- [ ] Role management (GM / PLAYER / SPECTATOR)
- [ ] GM authors storyboards; publish toggles player visibility

## 4. Live table
- [x] Socket auth via NextAuth JWT (handshake cookie)
- [x] Persist + broadcast chat messages with author identity
- [x] Persist + broadcast dice rolls; dice also writes a chat-log line
- [x] Load message history on join
- [ ] Presence (who's at the table) + typing indicators

## 5. LLM assist
- [ ] Scope assist to session context (recent log, character, storyboard)
- [ ] Rate limiting + auth on `/api/llm/assist`
- [ ] In-chat assist UI (kind: LLM_ASSIST)

## 6. Polish
- [ ] Tests for dice notation + handlers
- [ ] Presence / typing indicators
- [ ] Deployment
