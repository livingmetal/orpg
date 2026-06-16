# Roadmap

The repo is currently **scaffolding** — structure, config, and skeletons are in
place; most logic is stubbed with `TODO`. Suggested build order:

## 0. Setup (done)
- [x] Project scaffold (Next.js + Socket.IO + Prisma + Anthropic)
- [x] Host/client model: `npm run host` migrates + serves, prints LAN URL
- [x] Embedded SQLite + initial migration (`prisma/migrations`)
- [x] Data model (`prisma/schema.prisma`)
- [x] Realtime contract (`src/types/socket.ts`)
- [x] Dice roller core (`src/lib/dice.ts`)

## 1. Foundation
- [ ] Auth with NextAuth (sign in, session)
- [ ] User profile

## 2. Characters
- [ ] Create / edit characters
- [ ] Character sheet form (per rule-system schema)

## 3. Sessions & storyboards
- [ ] GM creates sessions, sets status (DRAFT → OPEN → IN_PROGRESS → CLOSED)
- [ ] Players join sessions, pick a character, get a role
- [ ] GM authors storyboards; publish toggles player visibility

## 4. Live table
- [ ] Persist + broadcast chat messages (replace echo stub)
- [ ] Persist + broadcast dice rolls with roller identity
- [ ] Load message history on join

## 5. LLM assist
- [ ] Scope assist to session context (recent log, character, storyboard)
- [ ] Rate limiting + auth on `/api/llm/assist`
- [ ] In-chat assist UI (kind: LLM_ASSIST)

## 6. Polish
- [ ] Tests for dice notation + handlers
- [ ] Presence / typing indicators
- [ ] Deployment
