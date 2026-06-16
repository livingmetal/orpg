import { redirect } from "next/navigation";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { StoryboardViewer } from "@/components/storyboard/StoryboardViewer";
import { CharacterBar } from "@/components/session/CharacterBar";
import { getCurrentUser } from "@/lib/session";

// The live table: chat log, dice, and the GM's published storyboard.
export default async function SessionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/signin?callbackUrl=/sessions/${id}`);

  return (
    <main className="grid h-screen grid-cols-[1fr_320px] gap-4 p-4">
      <section className="flex min-h-0 flex-col">
        <CharacterBar sessionId={id} />
        <ChatPanel sessionId={id} />
        <DiceRoller sessionId={id} />
      </section>
      <aside className="min-h-0 overflow-y-auto">
        <StoryboardViewer sessionId={id} />
      </aside>
    </main>
  );
}
