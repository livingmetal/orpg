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
    // "/ai <question>" routes to the LLM assistant instead of plain chat.
    const ai = content.match(/^\/(ai|gm)\s+(.+)/is);
    if (ai) {
      getSocket().emit("llm:ask", { sessionId, prompt: ai[2] });
    } else {
      getSocket().emit("chat:send", { sessionId, content });
    }
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded border border-neutral-800">
      <ul className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
        {messages.map((m) => {
          const who = m.kind === "LLM_ASSIST" ? "AI" : m.characterName ?? m.authorName ?? "—";
          const whoColor =
            m.kind === "LLM_ASSIST"
              ? "text-purple-400"
              : m.kind === "DICE"
                ? "text-emerald-400"
                : "text-neutral-500";
          return (
            <li key={m.id} className={m.kind === "LLM_ASSIST" ? "text-purple-200" : undefined}>
              <span className={whoColor}>{who}:</span>{" "}
              <span className="whitespace-pre-wrap">{m.content}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2 border-t border-neutral-800 p-2">
        <input
          className="flex-1 rounded bg-neutral-900 px-2 py-1 text-sm outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…  (try /ai <question>)"
        />
        <button className="rounded bg-sky-600 px-3 text-sm" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
