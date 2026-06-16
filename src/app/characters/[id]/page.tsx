"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CharacterSheet } from "@/components/character-sheet/CharacterSheet";
import { SheetSchema, defaultSheet, type Sheet } from "@/lib/character";

export default function CharacterEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/characters/${id}`);
      if (!res.ok) return setStatus("notfound");
      const { character } = await res.json();
      setName(character.name);
      const parsed = SheetSchema.safeParse(character.sheet);
      setSheet(parsed.success ? parsed.data : defaultSheet());
      setStatus("ready");
    })();
  }, [id]);

  async function save(data: { name: string; sheet: Sheet }) {
    await fetch(`/api/characters/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async function remove() {
    if (!confirm("Delete this character?")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    router.push("/characters");
  }

  if (status === "loading") return <main className="p-12 text-neutral-400">Loading…</main>;
  if (status === "notfound") return <main className="p-12 text-neutral-400">Not found.</main>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Character sheet</h1>
        <button className="text-sm text-neutral-500 hover:text-red-400" onClick={remove}>
          Delete
        </button>
      </div>
      {sheet && <CharacterSheet name={name} sheet={sheet} onSave={save} />}
    </main>
  );
}
