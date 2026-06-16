import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// GET /api/sessions → list OPEN/IN_PROGRESS sessions plus any the caller runs.
export async function GET() {
  const user = await getCurrentUser();

  const sessions = await prisma.gameSession.findMany({
    where: user
      ? { OR: [{ status: { in: ["OPEN", "IN_PROGRESS"] } }, { gmId: user.id }] }
      : { status: { in: ["OPEN", "IN_PROGRESS"] } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      gm: { select: { id: true, name: true } },
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json({ sessions });
}

const CreateSession = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
});

// POST /api/sessions → create a session; the caller becomes the GM + a member.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = CreateSession.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const session = await prisma.gameSession.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: "OPEN",
      gmId: user.id,
      members: { create: { userId: user.id, role: "GM" } },
    },
    select: { id: true, title: true, status: true },
  });

  return NextResponse.json({ session }, { status: 201 });
}
