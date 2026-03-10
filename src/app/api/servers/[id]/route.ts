export const dynamic = "force-dynamic";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

interface Params {
  params: { id: string };
}

// ─── GET /api/servers/[id] ───────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const server = await prisma.server.findUnique({
      where: { id: params.id },
      include: {
        tags: { include: { tag: true } },
        reviews: {
          include: { author: { select: { username: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { bumps: true } },
      },
    });

    if (!server) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(server);
  } catch (err) {
    console.error("[GET /api/servers/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH /api/servers/[id] ─────────────────────────────────────────────────

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  shortDesc: z.string().min(10).max(160).optional(),
  inviteUrl: z.string().url().optional(),
  isNsfw: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  selectedTags: z.array(z.string()).max(8).optional(),
  customTags: z.array(z.string().max(30)).max(5).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const server = await prisma.server.findUnique({ where: { id: params.id } });
    if (!server) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || server.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { selectedTags, customTags, ...rest } = parsed.data;

    // Rebuild tag relations if provided
    if (selectedTags !== undefined || customTags !== undefined) {
      await prisma.serverTag.deleteMany({ where: { serverId: params.id } });

      const tagRecords = selectedTags
        ? await prisma.tag.findMany({ where: { slug: { in: selectedTags } } })
        : [];

      const customTagRecords = customTags
        ? await Promise.all(
            customTags.map(async (tagName) => {
              const slug = tagName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
              return prisma.tag.upsert({
                where: { slug },
                update: {},
                create: { name: tagName, slug, isPredefined: false },
              });
            })
          )
        : [];

      await prisma.serverTag.createMany({
        data: [
          ...tagRecords.map((t) => ({ serverId: params.id, tagId: t.id, isCustom: false })),
          ...customTagRecords.map((t) => ({ serverId: params.id, tagId: t.id, isCustom: true })),
        ],
      });
    }

    const updated = await prisma.server.update({
      where: { id: params.id },
      data: rest,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/servers/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE /api/servers/[id] ────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const server = await prisma.server.findUnique({ where: { id: params.id } });
    if (!server) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || server.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.server.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/servers/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
