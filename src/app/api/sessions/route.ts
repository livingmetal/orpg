import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// GET  /api/sessions  → list sessions
// POST /api/sessions  → create a session (GM only)
export async function GET() {
  // TODO: return prisma.gameSession.findMany({ where: { status: "OPEN" } })
  return NextResponse.json({ sessions: [] });
}

export async function POST() {
  // TODO: auth check, validate body with zod, create GameSession + GM membership.
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}
