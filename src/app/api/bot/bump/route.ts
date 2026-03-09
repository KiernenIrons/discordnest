export const dynamic = "force-dynamic";

import { validateBotSecret } from "@/lib/bot-auth";
import { BUMP_COOLDOWN_MS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  guildId: z.string(),
  bumpedByDiscordId: z.string(),
});

export async function POST(req: NextRequest) {
  if (!validateBotSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { guildId, bumpedByDiscordId } = parsed.data;

  const server = await prisma.server.findUnique({ where: { guildId } });
  if (!server) {
    return NextResponse.json(
      { error: "Server not found. Use /setup to register your server first." },
      { status: 404 }
    );
  }

  if (!server.isPublished) {
    return NextResponse.json(
      { error: "Server is not published yet." },
      { status: 400 }
    );
  }

  // Check cooldown
  if (server.bumpedAt) {
    const elapsed = Date.now() - new Date(server.bumpedAt).getTime();
    if (elapsed < BUMP_COOLDOWN_MS) {
      const nextBumpAt = new Date(new Date(server.bumpedAt).getTime() + BUMP_COOLDOWN_MS);
      const remainingMs = nextBumpAt.getTime() - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60_000);
      return NextResponse.json(
        {
          success: false,
          onCooldown: true,
          nextBumpAt: nextBumpAt.toISOString(),
          remainingMinutes: remainingMins,
        },
        { status: 429 }
      );
    }
  }

  const now = new Date();
  await Promise.all([
    prisma.server.update({ where: { id: server.id }, data: { bumpedAt: now } }),
    prisma.bumpHistory.create({
      data: { serverId: server.id, bumpedById: bumpedByDiscordId, source: "BOT" },
    }),
  ]);

  const nextBumpAt = new Date(now.getTime() + BUMP_COOLDOWN_MS);
  return NextResponse.json({
    success: true,
    serverName: server.name,
    bumpedAt: now.toISOString(),
    nextBumpAt: nextBumpAt.toISOString(),
  });
}
