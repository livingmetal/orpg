# ORPG

[한국어](README.ko.md) · English

An **online tabletop RPG** platform — the online version of a TRPG table.
Players join sessions, chat in character, roll dice, and fill out character
sheets ahead of time. Game Masters author storyboards and publish them to a
session. An LLM helps with small things at the table: rules questions, dice
math, and light NPC banter.

**Self-hosted model.** One person runs the **host** program; it starts the web
server, the realtime layer, and an embedded SQLite database in a single
process. Everyone else is a **client** — they just open a browser at the host's
address. No separate database server to install or run.

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
- [Prisma](https://www.prisma.io/) + **SQLite** (embedded — no DB server)
- [Anthropic SDK](https://docs.anthropic.com/) for LLM assist

## Host & client

- **Host** (the GM, or whoever runs the table): runs the host program. On
  startup it applies database migrations (creating `data/orpg.db` if missing),
  then serves the app and prints both a `Local` and a `Network` URL.
- **Client** (players): open a browser at the host's **Network** URL — e.g.
  `http://192.168.x.x:3000`. Nothing to install.

## Running the host

### One-click (Windows)

Double-click **`ORPG-Host.exe`** in the project root. It opens a console,
installs deps and builds on first run if needed, then starts the host and keeps
the window open. Close the window to stop. (`ORPG-Host.exe` is a tiny ~4.5 KB
launcher for `host.cmd` — you can also just double-click `host.cmd` directly.)

To rebuild the launcher from source: `scripts\build-launcher.cmd`
(uses the C# compiler bundled with the .NET Framework — no extra tooling).

### From a terminal

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env          # ANTHROPIC_API_KEY, NEXTAUTH_SECRET, ...
                              # DATABASE_URL already points at the embedded SQLite file

# 3. Build, then run the host (migrations + server start automatically)
npm run build
npm run host                  # prints Local + Network URLs; DB is created on first run
```

For development with hot reload (also migrates on start):

```bash
npm run dev
```

## Project layout

```
server/      Host program: Next handler + Socket.IO realtime handlers
src/app/     Pages and /api route handlers
src/components/  UI: chat, dice, character-sheet, storyboard
src/lib/     prisma client, anthropic client, dice roller, socket client
src/types/   Shared Socket.IO event contract
prisma/      Data model + migrations
data/        Embedded SQLite database lives here at runtime (gitignored)
docs/        Architecture & roadmap
```

See [docs/architecture.md](docs/architecture.md) for details.

## License

[MIT](LICENSE)
