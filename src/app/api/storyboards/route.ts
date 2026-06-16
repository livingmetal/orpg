import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// GET  /api/storyboards?sessionId=...  → list storyboards for a session
//   (players see only `published: true`; the GM sees drafts too)
// POST /api/storyboards                → GM creates/updates a storyboard
export async function GET() {
  // TODO: return prisma.storyboard.findMany({ where: { sessionId, published } })
  return NextResponse.json({ storyboards: [] });
}

export async function POST() {
  // TODO: auth check (must be session GM), validate, upsert Storyboard.
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}
