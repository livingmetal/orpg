import { ChatPanel } from "@/components/chat/ChatPanel";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { StoryboardViewer } from "@/components/storyboard/StoryboardViewer";

// The live table: chat log, dice, and the GM's published storyboard.
export default async function SessionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="grid h-screen grid-cols-[1fr_320px] gap-4 p-4">
      <section className="flex min-h-0 flex-col">
        <ChatPanel sessionId={id} />
        <DiceRoller sessionId={id} />
      </section>
      <aside className="min-h-0 overflow-y-auto">
        <StoryboardViewer sessionId={id} />
      </aside>
    </main>
  );
}
