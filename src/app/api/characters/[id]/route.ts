import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { UpdateCharacterSchema } from "@/lib/character";

type Params = { params: Promise<{ id: string }> };

async function ownedCharacter(id: string, userId: string) {
  const character = await prisma.character.findUnique({ where: { id } });
  if (!character || character.ownerId !== userId) return null;
  return character;
}

// GET /api/characters/:id → full character (owner only)
export async function GET(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  const character = await ownedCharacter(id, user.id);
  if (!character) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ character });
}

// PATCH /api/characters/:id → update name and/or sheet (owner only)
export async function PATCH(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await ownedCharacter(id, user.id))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const parsed = UpdateCharacterSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const character = await prisma.character.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.sheet !== undefined ? { sheet: parsed.data.sheet } : {}),
    },
    select: { id: true, name: true },
  });
  return NextResponse.json({ character });
}

// DELETE /api/characters/:id (owner only)
export async function DELETE(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await ownedCharacter(id, user.id))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await prisma.character.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
