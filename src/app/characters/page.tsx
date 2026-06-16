"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface CharRow {
  id: string;
  name: string;
}

export default function CharactersPage() {
  const { data: auth } = useSession();
  const [characters, setCharacters] = useState<CharRow[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/characters");
    if (res.ok) setCharacters((await res.json()).characters ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await fetch("/api/characters", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    setName("");
    load();
  }

  if (!auth?.user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold">Characters</h1>
        <p className="mt-4 text-sm text-neutral-400">
          <Link href="/signin" className="text-sky-400 hover:underline">
            Sign in
          </Link>{" "}
          to manage characters.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">Characters</h1>

      <form className="mt-4 flex gap-2" onSubmit={create}>
        <input
          className="flex-1 rounded bg-neutral-900 px-3 py-2 text-sm outline-none"
          placeholder="New character name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="rounded bg-sky-600 px-4 text-sm disabled:opacity-50" disabled={busy}>
          Create
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {characters.map((c) => (
          <li key={c.id} className="rounded border border-neutral-800 p-3">
            <Link href={`/characters/${c.id}`} className="text-sky-400 hover:underline">
              {c.name}
            </Link>
          </li>
        ))}
        {characters.length === 0 && (
          <li className="text-sm text-neutral-500">No characters yet.</li>
        )}
      </ul>
    </main>
  );
}
