import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FREE_SLOT_LIMIT, SERVERS_PER_PAGE } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─── GET /api/servers ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const tags = searchParams.getAll("tag");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const skip = (page - 1) * SERVERS_PER_PAGE;

  const where = {
    isPublished: true,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { shortDesc: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(tags.length > 0 && {
      tags: { some: { tag: { slug: { in: tags } } } },
    }),
  };

  const [servers, total] = await Promise.all([
    prisma.server.findMany({
      where,
      include: {
        tags: { include: { tag: { select: { name: true, color: true } } } },
        _count: { select: { bumps: true, reviews: true } },
      },
      orderBy: [{ bumpedAt: "desc" }, { memberCount: "desc" }],
      skip,
      take: SERVERS_PER_PAGE,
    }),
    prisma.server.count({ where }),
  ]);

  return NextResponse.json({
    servers,
    total,
    page,
    totalPages: Math.ceil(total / SERVERS_PER_PAGE),
  });
}

// ─── POST /api/servers ───────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  shortDesc: z.string().min(10).max(160),
  inviteUrl: z.string().url(),
  isNsfw: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  selectedTags: z.array(z.string()).max(8).default([]),
  customTags: z.array(z.string().max(30)).max(5).default([]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, description, shortDesc, inviteUrl, isNsfw, isPublished, selectedTags, customTags } =
    parsed.data;

  // Check free slot limit
  const publishedCount = await prisma.server.count({
    where: { isPublished: true, isPremium: false },
  });

  let isPremium = false;
  if (publishedCount >= FREE_SLOT_LIMIT && isPublished) {
    // Check if user has active subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription?.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Free slots full", requiresUpgrade: true },
        { status: 402 }
      );
    }
    isPremium = true;
  }

  // Validate invite URL via Discord API
  let guildId: string | undefined;
  let memberCount = 0;
  try {
    const inviteCode = inviteUrl.replace(/https?:\/\/discord\.gg\//, "").replace(/https?:\/\/discord\.com\/invite\//, "");
    const discordRes = await fetch(
      `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`,
      {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN ?? ""}` },
      }
    );
    if (discordRes.ok) {
      const data = await discordRes.json();
      guildId = data.guild?.id;
      memberCount = data.approximate_member_count ?? 0;
    }
  } catch {
    // non-fatal — just proceed without Discord verification for now
  }

  // Resolve tag IDs from slugs
  const tagRecords = await prisma.tag.findMany({
    where: { slug: { in: selectedTags } },
  });

  // Create custom tags if they don't exist
  const customTagRecords = await Promise.all(
    customTags.map(async (name) => {
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      return prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { name, slug, isPredefined: false },
      });
    })
  );

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const server = await prisma.server.create({
    data: {
      guildId: guildId ?? `manual-${Date.now()}`,
      ownerId: user.id,
      name,
      description,
      shortDesc,
      inviteUrl,
      memberCount,
      isNsfw,
      isPublished,
      isPremium,
      tags: {
        create: [
          ...tagRecords.map((t) => ({ tagId: t.id, isCustom: false })),
          ...customTagRecords.map((t) => ({ tagId: t.id, isCustom: true })),
        ],
      },
    },
  });

  return NextResponse.json(server, { status: 201 });
}
