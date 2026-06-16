// Shared Socket.IO event contract between client and server.
// Keep this as the single source of truth for realtime payloads.

import type { DiceRollResult } from "@/lib/dice";

export interface ChatMessagePayload {
  id: string;
  sessionId: string;
  authorName: string | null;
  characterName: string | null;
  kind: "CHAT" | "SYSTEM" | "DICE" | "GM_NARRATION" | "LLM_ASSIST";
  content: string;
  createdAt: string;
}

export interface DiceRollPayload {
  id: string;
  sessionId: string;
  byName: string | null;
  result: DiceRollResult;
  createdAt: string;
}

// Events the client sends to the server.
export interface ClientToServerEvents {
  "session:join": (sessionId: string) => void;
  "session:leave": (sessionId: string) => void;
  "chat:send": (input: { sessionId: string; content: string }) => void;
  "dice:roll": (input: { sessionId: string; notation: string }) => void;
}

// Events the server pushes to clients.
export interface ServerToClientEvents {
  "chat:message": (payload: ChatMessagePayload) => void;
  "dice:result": (payload: DiceRollPayload) => void;
  "error": (message: string) => void;
}

// Per-connection state attached after the auth handshake.
export interface SocketData {
  userId: string;
  userName: string | null;
}
