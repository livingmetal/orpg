"use client";

// Character sheet editor. The sheet shape is rule-system dependent and stored
// as JSON (see prisma `Character.sheet`). Start generic; specialize per system.
// TODO: define a schema per supported system and render fields dynamically.
export function CharacterSheet() {
  return (
    <div className="rounded border border-neutral-800 p-4 text-sm text-neutral-400">
      TODO: character sheet form (stats, skills, inventory, notes).
    </div>
  );
}
