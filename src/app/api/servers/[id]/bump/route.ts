export const dynamic = "force-dynamic";

import { authOptions } from "@/lib/auth";
import { BUMP_COOLDOWN_MS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const server = await prisma.server.findUnique({ where: { id: params.id } });
    if (!server) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || server.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!server.isPublished) {
      return NextResponse.json(
        { error: "Only published servers can be bumped. Use /setup in your Discord server to publish." },
        { status: 400 }
      );
    }

    // Check cooldown
    if (server.bumpedAt) {
      const elapsed = Date.now() - new Date(server.bumpedAt).getTime();
      if (elapsed < BUMP_COOLDOWN_MS) {
        const nextBumpAt = new Date(new Date(server.bumpedAt).getTime() + BUMP_COOLDOWN_MS);
        return NextResponse.json(
          { error: "Cooldown active", nextBumpAt: nextBumpAt.toISOString() },
          { status: 429 }
        );
      }
    }

    const now = new Date();
    await Promise.all([
      prisma.server.update({ where: { id: params.id }, data: { bumpedAt: now } }),
      prisma.bumpHistory.create({
        data: { serverId: params.id, bumpedById: user.discordId, source: "DASHBOARD" },
      }),
    ]);

    const nextBumpAt = new Date(now.getTime() + BUMP_COOLDOWN_MS);
    return NextResponse.json({ success: true, bumpedAt: now.toISOString(), nextBumpAt: nextBumpAt.toISOString() });
  } catch (err) {
    console.error("[POST /api/servers/[id]/bump]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
