export const dynamic = "force-dynamic";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10).max(1000),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const reviews = await prisma.review.findMany({
    where: { serverId: params.id },
    include: { author: { select: { username: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Prevent reviewing own server
  const server = await prisma.server.findUnique({ where: { id: params.id } });
  if (server?.ownerId === user.id) {
    return NextResponse.json({ error: "Cannot review your own server" }, { status: 400 });
  }

  try {
    const review = await prisma.review.upsert({
      where: { serverId_authorId: { serverId: params.id, authorId: user.id } },
      update: parsed.data,
      create: { ...parsed.data, serverId: params.id, authorId: user.id },
    });
    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }
}
