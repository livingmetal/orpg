import { CharacterSheet } from "@/components/character-sheet/CharacterSheet";

// Character list + sheet editor entry point.
// TODO: list the signed-in user's characters and link to per-character sheets.
export default function CharactersPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">Characters</h1>
      <p className="mt-2 text-neutral-400">TODO: list and create characters.</p>
      <div className="mt-6">
        <CharacterSheet />
      </div>
    </main>
  );
}
