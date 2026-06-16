# Roadmap

The core loop works end-to-end: auth, characters + sheets, sessions, GM
storyboards, the live table (chat/dice persisted and attributed to characters),
and in-chat LLM assist. Remaining items are profile/roles, presence, and
deployment polish.

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
- [x] Create / edit / delete characters (`/api/characters`)
- [x] Character sheet editor (generic: stats/skills/inventory/notes)
- [x] Attach a character to a session and to chat/dice (`characterId`)

## 3. Sessions & storyboards
- [x] Create sessions (GM + member), list open sessions (`/api/sessions`)
- [x] Players auto-join as members on entering a session room
- [x] GM authors storyboards; publish toggles player visibility
- [ ] Session status transitions (DRAFT → OPEN → IN_PROGRESS → CLOSED)
- [ ] Role management (GM / PLAYER / SPECTATOR)

## 4. Live table
- [x] Socket auth via NextAuth JWT (handshake cookie)
- [x] Persist + broadcast chat messages with author/character identity
- [x] Persist + broadcast dice rolls; dice also writes a chat-log line
- [x] Load message history on join
- [x] Choose the character you play (`session:setCharacter`)
- [ ] Presence (who's at the table) + typing indicators

## 5. LLM assist
- [x] Scope assist to session context (recent log + published storyboards)
- [x] Auth + rate limiting on `/api/llm/assist` and `llm:ask`
- [x] In-chat assist via `/ai <question>` (kind: LLM_ASSIST), degrades gracefully

## 6. Polish
- [x] Tests for dice notation (`src/lib/dice.test.ts`)
- [ ] User profile (rename, avatar)
- [ ] Presence / typing indicators
- [ ] Deployment
