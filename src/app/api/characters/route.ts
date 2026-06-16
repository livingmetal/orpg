import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CreateCharacterSchema, defaultSheet } from "@/lib/character";

// GET /api/characters → the signed-in user's characters
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const characters = await prisma.character.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });
  return NextResponse.json({ characters });
}

// POST /api/characters → create a character with an initial sheet
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = CreateCharacterSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const character = await prisma.character.create({
    data: {
      name: parsed.data.name,
      ownerId: user.id,
      sheet: parsed.data.sheet ?? defaultSheet(),
    },
    select: { id: true, name: true },
  });
  return NextResponse.json({ character }, { status: 201 });
}
