"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface SessionRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  gm: { id: string; name: string | null };
  _count: { members: number };
}

export default function SessionsPage() {
  const { data: auth } = useSession();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    setSessions(data.sessions ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setBusy(false);
    setTitle("");
    load();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">Sessions</h1>

      {auth?.user ? (
        <form className="mt-4 flex gap-2" onSubmit={create}>
          <input
            className="flex-1 rounded bg-neutral-900 px-3 py-2 text-sm outline-none"
            placeholder="New session title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="rounded bg-sky-600 px-4 text-sm disabled:opacity-50" disabled={busy}>
            Create
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-neutral-400">
          <Link href="/signin" className="text-sky-400 hover:underline">
            Sign in
          </Link>{" "}
          to create or join a session.
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="rounded border border-neutral-800 p-3">
            <Link href={`/sessions/${s.id}`} className="font-medium text-sky-400 hover:underline">
              {s.title}
            </Link>
            <span className="ml-2 text-xs text-neutral-500">
              {s.status} · GM {s.gm.name ?? "—"} · {s._count.members} members
            </span>
          </li>
        ))}
        {sessions.length === 0 && (
          <li className="text-sm text-neutral-500">No open sessions yet.</li>
        )}
      </ul>
    </main>
  );
}
