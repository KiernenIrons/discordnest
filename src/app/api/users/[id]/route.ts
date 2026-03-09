import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  bio: z.string().max(500).optional(),
  websiteUrl: z.string().url().or(z.literal("")).optional(),
  twitterHandle: z.string().max(50).optional(),
  githubHandle: z.string().max(50).optional(),
  isPublicProfile: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      websiteUrl: true,
      twitterHandle: true,
      githubHandle: true,
      isPublicProfile: true,
      createdAt: true,
      servers: {
        where: { isPublished: true },
        select: { id: true, name: true, shortDesc: true, memberCount: true },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If profile is private, only return basic info unless it's the owner
  // (owner check handled client-side or add session check here)
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
