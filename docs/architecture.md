# Architecture

ORPG is a single Next.js app served by a thin custom Node server so that
Socket.IO can share the same HTTP port as the Next request handler.

## Layers

```
server/                 Custom HTTP server: Next handler + Socket.IO
  index.ts              Boots Next, attaches Socket.IO
  socket/               Realtime event handlers (chat, dice)

src/
  app/                  Next.js App Router (pages + /api route handlers)
    api/                REST-ish endpoints (sessions, characters, storyboards, llm)
    sessions/[id]/      The live table room
  components/           UI: chat, dice, character-sheet, storyboard
  lib/                  db (prisma), anthropic, dice roller, socket client
  types/                Shared contracts (Socket.IO events)

prisma/                 Data model (Postgres)
docs/                   This documentation
```

## Realtime vs request/response

- **Realtime (Socket.IO):** chat messages and dice rolls. Each `GameSession`
  is a Socket.IO room keyed by `sessionId`. Handlers persist via Prisma, then
  broadcast the saved row to the room.
- **Request/response (Next route handlers):** CRUD for sessions, characters,
  storyboards, and the LLM assist endpoint.

## LLM assist

`POST /api/llm/assist` calls the Anthropic SDK (`src/lib/anthropic.ts`) for
small, scoped help at the table: rules lookups, summarizing the log, explaining
dice math, NPC banter. Keep prompts cheap and session-scoped.

## Data model highlights

- `User` ↔ `Character` (owner) and `SessionMember` (table membership + role).
- `GameSession` has a `gm` (User), `members`, `storyboards`, `messages`, `diceRolls`.
- `Storyboard` is GM-authored with a `published` flag — drafts are GM-only.
- `Character.sheet` is JSON because sheet shape is rule-system dependent.

See [roadmap.md](roadmap.md) for the build order.
