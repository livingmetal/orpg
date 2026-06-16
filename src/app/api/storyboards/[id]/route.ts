import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

// Returns the storyboard if the caller is the GM of its session, else null.
async function gmStoryboard(id: string, userId: string) {
  const storyboard = await prisma.storyboard.findUnique({
    where: { id },
    include: { session: { select: { gmId: true } } },
  });
  if (!storyboard || storyboard.session.gmId !== userId) return null;
  return storyboard;
}

const UpdateStoryboard = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(20000).optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

// PATCH /api/storyboards/:id → GM edits / publishes
export async function PATCH(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await gmStoryboard(id, user.id))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const parsed = UpdateStoryboard.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const storyboard = await prisma.storyboard.update({
    where: { id },
    data: parsed.data,
    select: { id: true, title: true, body: true, order: true, published: true },
  });
  return NextResponse.json({ storyboard });
}

// DELETE /api/storyboards/:id → GM only
export async function DELETE(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await gmStoryboard(id, user.id))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await prisma.storyboard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
