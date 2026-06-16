"use client";

import { useEffect, useState } from "react";

interface Storyboard {
  id: string;
  title: string;
  body: string;
  order: number;
  published: boolean;
}

export function StoryboardViewer({ sessionId }: { sessionId: string }) {
  const [isGm, setIsGm] = useState(false);
  const [items, setItems] = useState<Storyboard[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function load() {
    const res = await fetch(`/api/storyboards?sessionId=${sessionId}`);
    if (!res.ok) return;
    const data = await res.json();
    setIsGm(data.isGm);
    setItems(data.storyboards ?? []);
  }

  useEffect(() => {
    load();
  }, [sessionId]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/storyboards", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, title, body }),
    });
    setTitle("");
    setBody("");
    load();
  }

  async function patch(id: string, data: Partial<Storyboard>) {
    await fetch(`/api/storyboards/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/storyboards/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="rounded border border-neutral-800 p-4 text-sm">
      <h2 className="mb-3 font-semibold text-neutral-200">Storyboard</h2>

      <ul className="space-y-3">
        {items.map((s) => (
          <li key={s.id} className="rounded bg-neutral-900 p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-100">{s.title}</span>
              {isGm && (
                <span className="flex items-center gap-2 text-xs">
                  <button
                    className={s.published ? "text-emerald-400" : "text-neutral-500"}
                    onClick={() => patch(s.id, { published: !s.published })}
                  >
                    {s.published ? "Published" : "Draft"}
                  </button>
                  <button className="text-neutral-500 hover:text-red-400" onClick={() => remove(s.id)}>
                    ✕
                  </button>
                </span>
              )}
            </div>
            {s.body && <p className="mt-1 whitespace-pre-wrap text-neutral-300">{s.body}</p>}
          </li>
        ))}
        {items.length === 0 && <li className="text-neutral-500">No storyboards yet.</li>}
      </ul>

      {isGm && (
        <form className="mt-4 flex flex-col gap-2 border-t border-neutral-800 pt-3" onSubmit={create}>
          <input
            className="rounded bg-neutral-900 px-2 py-1 outline-none"
            placeholder="Storyboard title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="h-20 rounded bg-neutral-900 px-2 py-1 outline-none"
            placeholder="Scene / notes… (players see it once published)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button className="self-end rounded bg-sky-600 px-3 py-1 text-xs">Add</button>
        </form>
      )}
    </div>
  );
}
