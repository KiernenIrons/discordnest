export const dynamic = "force-dynamic";

import { validateBotSecret } from "@/lib/bot-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (!validateBotSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guildId = req.nextUrl.searchParams.get("guildId");
  if (!guildId) {
    return NextResponse.json({ error: "guildId required" }, { status: 400 });
  }

  const server = await prisma.server.findUnique({
    where: { guildId },
    include: {
      _count: { select: { bumps: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
  });

  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const avgRating =
    server.reviews.length > 0
      ? server.reviews.reduce((s, r) => s + r.rating, 0) / server.reviews.length
      : null;

  return NextResponse.json({
    name: server.name,
    memberCount: server.memberCount,
    totalBumps: server._count.bumps,
    totalReviews: server._count.reviews,
    avgRating,
    bumpedAt: server.bumpedAt,
    isPublished: server.isPublished,
    listingUrl: `${process.env.NEXTAUTH_URL}/servers/${server.id}`,
  });
}
