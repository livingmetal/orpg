import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// GET /api/storyboards?sessionId=...
// Players see published entries; the GM also sees drafts. Response includes
// `isGm` so the client can show the authoring UI.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    select: { gmId: true },
  });
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  const isGm = session.gmId === user.id;
  const storyboards = await prisma.storyboard.findMany({
    where: { sessionId, ...(isGm ? {} : { published: true }) },
    orderBy: { order: "asc" },
    select: { id: true, title: true, body: true, order: true, published: true },
  });

  return NextResponse.json({ isGm, storyboards });
}

const CreateStoryboard = z.object({
  sessionId: z.string().min(1),
  title: z.string().min(1).max(200),
  body: z.string().max(20000).default(""),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

// POST /api/storyboards → GM creates a storyboard (draft by default)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = CreateStoryboard.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const session = await prisma.gameSession.findUnique({
    where: { id: parsed.data.sessionId },
    select: { gmId: true },
  });
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (session.gmId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const storyboard = await prisma.storyboard.create({
    data: {
      sessionId: parsed.data.sessionId,
      title: parsed.data.title,
      body: parsed.data.body,
      order: parsed.data.order ?? 0,
      published: parsed.data.published ?? false,
    },
    select: { id: true, title: true, published: true, order: true, body: true },
  });
  return NextResponse.json({ storyboard }, { status: 201 });
}
