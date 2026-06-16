import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// GET  /api/characters  → list the signed-in user's characters
// POST /api/characters  → create a character with an initial sheet
export async function GET() {
  // TODO: return prisma.character.findMany({ where: { ownerId } })
  return NextResponse.json({ characters: [] });
}

export async function POST() {
  // TODO: auth check, validate body with zod, create Character.
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}
