import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">ORPG</h1>
      <p className="mt-2 text-neutral-400">
        Online tabletop RPG platform — realtime chat, dice, character sheets,
        GM storyboards, and LLM assist.
      </p>

      <nav className="mt-8 flex flex-col gap-3">
        <Link className="text-sky-400 hover:underline" href="/sessions">
          → Sessions (game tables)
        </Link>
        <Link className="text-sky-400 hover:underline" href="/characters">
          → Characters
        </Link>
      </nav>
    </main>
  );
}
