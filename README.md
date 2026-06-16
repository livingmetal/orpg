# ORPG

[한국어](README.ko.md) · English

An **online tabletop RPG** platform — the online version of a TRPG table.
Players join sessions, chat in character, roll dice, and fill out character
sheets ahead of time. Game Masters author storyboards and publish them to a
session. An LLM helps with small things at the table: rules questions, dice
math, and light NPC banter.

> Status: **scaffolding**. Structure, config, and skeletons are in place; most
> logic is stubbed with `TODO`. See [docs/roadmap.md](docs/roadmap.md).

## Features (planned)

- 🗨️ **Realtime chat** per game session (Socket.IO rooms)
- 🎲 **Dice** with standard notation (`2d6+3`, `1d20`, `1d100-5`)
- 📜 **Character sheets** authored in advance (rule-system flexible)
- 📖 **GM storyboards** — drafted privately, published to the session
- 🤖 **LLM assist** for rules lookups, log summaries, and NPC lines

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS
- [Socket.IO](https://socket.io/) over a thin custom Node server
- [Prisma](https://www.prisma.io/) + PostgreSQL
- [Anthropic SDK](https://docs.anthropic.com/) for LLM assist

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env          # then fill in DATABASE_URL, ANTHROPIC_API_KEY, ...

# 3. Set up the database
npm run db:generate
npm run db:migrate

# 4. Run the dev server (Next + Socket.IO on one port)
npm run dev                   # http://localhost:3000
```

## Project layout

```
server/      Custom HTTP server (Next handler + Socket.IO realtime handlers)
src/app/     Pages and /api route handlers
src/components/  UI: chat, dice, character-sheet, storyboard
src/lib/     prisma client, anthropic client, dice roller, socket client
src/types/   Shared Socket.IO event contract
prisma/      Data model
docs/        Architecture & roadmap
```

See [docs/architecture.md](docs/architecture.md) for details.

## License

[MIT](LICENSE)
