"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";

interface CharRow {
  id: string;
  name: string;
}

// Lets a player pick which of their characters they're playing at this table.
// The choice is sent over the socket and reflected in chat/dice attribution.
export function CharacterBar({ sessionId }: { sessionId: string }) {
  const [characters, setCharacters] = useState<CharRow[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => (r.ok ? r.json() : { characters: [] }))
      .then((d) => setCharacters(d.characters ?? []));

    const socket = getSocket();
    const onSet = (name: string | null) => setCurrent(name);
    socket.on("character:set", onSet);
    return () => {
      socket.off("character:set", onSet);
    };
  }, []);

  function choose(id: string) {
    setSelected(id);
    getSocket().emit("session:setCharacter", { sessionId, characterId: id || null });
  }

  return (
    <div className="mb-2 flex items-center gap-2 text-sm">
      <span className="text-neutral-500">Playing as:</span>
      <select
        className="rounded bg-neutral-900 px-2 py-1 outline-none"
        value={selected}
        onChange={(e) => choose(e.target.value)}
      >
        <option value="">(yourself)</option>
        {characters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {current && <span className="text-neutral-400">→ {current}</span>}
    </div>
  );
}
