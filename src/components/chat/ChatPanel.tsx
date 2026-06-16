"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";
import type { ChatMessagePayload } from "@/types/socket";

export function ChatPanel({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const socket = getSocket();
    socket.emit("session:join", sessionId);
    const onMessage = (m: ChatMessagePayload) => setMessages((prev) => [...prev, m]);
    socket.on("chat:message", onMessage);

    return () => {
      socket.off("chat:message", onMessage);
      socket.emit("session:leave", sessionId);
    };
  }, [sessionId]);

  function send() {
    const content = draft.trim();
    if (!content) return;
    getSocket().emit("chat:send", { sessionId, content });
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded border border-neutral-800">
      <ul className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
        {messages.map((m) => (
          <li key={m.id}>
            <span className="text-neutral-500">{m.characterName ?? m.authorName ?? "—"}:</span>{" "}
            {m.content}
          </li>
        ))}
      </ul>
      <div className="flex gap-2 border-t border-neutral-800 p-2">
        <input
          className="flex-1 rounded bg-neutral-900 px-2 py-1 text-sm outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
        />
        <button className="rounded bg-sky-600 px-3 text-sm" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
