export const dynamic = "force-dynamic";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FREE_SLOT_LIMIT, SERVERS_PER_PAGE } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─── GET /api/servers ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
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
  } catch (err) {
    console.error("[GET /api/servers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/servers ───────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  shortDesc: z.string().min(10).max(160),
  inviteUrl: z.string().url(),
  isNsfw: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  selectedTags: z.array(z.string()).max(15).default([]),
  customTags: z.array(z.string().max(30)).max(5).default([]),
  iconUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const first = Object.entries(fields).find(([, v]) => v?.length)?.[0];
      const msg = first ? `${first}: ${fields[first]?.[0]}` : "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { name, description, shortDesc, inviteUrl, isNsfw, isPublished, selectedTags, customTags, iconUrl: formIconUrl, bannerUrl: formBannerUrl } =
      parsed.data;

    // Check free slot limit
    const publishedCount = await prisma.server.count({
      where: { isPublished: true, isPremium: false },
    });

    let isPremium = false;
    if (publishedCount >= FREE_SLOT_LIMIT && isPublished) {
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

    // Validate invite URL via Discord API (non-fatal) + auto-fetch icon
    let guildId: string | undefined;
    let memberCount = 0;
    let discordIconUrl: string | null = null;
    try {
      const inviteCode = inviteUrl
        .replace(/https?:\/\/discord\.gg\//, "")
        .replace(/https?:\/\/discord\.com\/invite\//, "");
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
        if (guildId && data.guild?.icon) {
          discordIconUrl = `https://cdn.discordapp.com/icons/${guildId}/${data.guild.icon}.png?size=256`;
        }
      }
    } catch {
      // non-fatal
    }

    // Resolve tag IDs from slugs
    const tagRecords = await prisma.tag.findMany({
      where: { slug: { in: selectedTags } },
    });

    // Create custom tags if they don't exist
    const customTagRecords = await Promise.all(
      customTags.map(async (tagName) => {
        const slug = tagName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        return prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name: tagName, slug, isPredefined: false },
        });
      })
    );

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Deduplicate — a custom tag name matching a predefined slug returns the same DB row
    const tagMap = new Map<string, { tagId: string; isCustom: boolean }>();
    tagRecords.forEach((t) => tagMap.set(t.id, { tagId: t.id, isCustom: false }));
    customTagRecords.forEach((t) => tagMap.set(t.id, { tagId: t.id, isCustom: true }));

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
        // User-uploaded icon takes priority; fall back to Discord's icon
        iconUrl: formIconUrl ?? discordIconUrl,
        bannerUrl: formBannerUrl ?? null,
        tags: {
          create: Array.from(tagMap.values()),
        },
      },
    });

    return NextResponse.json(server, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/servers]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
