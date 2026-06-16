"use client";

// Shows the GM's published storyboards for a session.
// TODO: fetch /api/storyboards?sessionId=... and render published entries in order.
export function StoryboardViewer({ sessionId }: { sessionId: string }) {
  return (
    <div className="rounded border border-neutral-800 p-4 text-sm text-neutral-400">
      <h2 className="mb-2 font-semibold text-neutral-200">Storyboard</h2>
      TODO: published storyboards for session {sessionId}.
    </div>
  );
}
