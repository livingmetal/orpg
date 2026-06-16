import { z } from "zod";

// A deliberately generic character sheet. Real TRPG systems differ a lot, so
// stats/skills are open key→number maps; specialize per system later.
export const SheetSchema = z.object({
  system: z.string().max(60).default("generic"),
  stats: z.record(z.string(), z.number()).default({}),
  skills: z.record(z.string(), z.number()).default({}),
  inventory: z.array(z.string().max(200)).default([]),
  notes: z.string().max(5000).default(""),
});

export type Sheet = z.infer<typeof SheetSchema>;

export function defaultSheet(): Sheet {
  return { system: "generic", stats: {}, skills: {}, inventory: [], notes: "" };
}

export const CreateCharacterSchema = z.object({
  name: z.string().min(1).max(80),
  sheet: SheetSchema.optional(),
});

export const UpdateCharacterSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  sheet: SheetSchema.optional(),
});
