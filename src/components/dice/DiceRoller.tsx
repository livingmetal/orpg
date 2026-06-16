"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";
import type { DiceRollPayload } from "@/types/socket";

export function DiceRoller({ sessionId }: { sessionId: string }) {
  const [notation, setNotation] = useState("1d20");
  const [last, setLast] = useState<DiceRollPayload | null>(null);

  useEffect(() => {
    const socket = getSocket();
    const onResult = (p: DiceRollPayload) => setLast(p);
    socket.on("dice:result", onResult);
    return () => {
      socket.off("dice:result", onResult);
    };
  }, []);

  function rollDice() {
    getSocket().emit("dice:roll", { sessionId, notation });
  }

  return (
    <div className="mt-2 flex items-center gap-2 rounded border border-neutral-800 p-2 text-sm">
      <input
        className="w-24 rounded bg-neutral-900 px-2 py-1 outline-none"
        value={notation}
        onChange={(e) => setNotation(e.target.value)}
        placeholder="2d6+3"
      />
      <button className="rounded bg-emerald-600 px-3 py-1" onClick={rollDice}>
        Roll
      </button>
      {last && (
        <span className="text-neutral-400">
          {last.result.notation} → <strong className="text-neutral-100">{last.result.total}</strong>
        </span>
      )}
    </div>
  );
}
