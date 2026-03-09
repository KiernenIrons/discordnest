import { validateBotSecret } from "@/lib/bot-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  guildId: z.string(),
  serverId: z.string().optional(), // DiscordNest server ID — if already created via dashboard
  bumpChannelId: z.string().optional(),
  logChannelId: z.string().optional(),
  bumpRoleId: z.string().optional(),
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

  const { guildId, serverId, bumpChannelId, logChannelId, bumpRoleId } = parsed.data;

  // Find the server record
  const server = await prisma.server.findFirst({
    where: serverId ? { id: serverId } : { guildId },
  });

  if (!server) {
    return NextResponse.json(
      { error: "No listing found. Create your server listing on DiscordNest first." },
      { status: 404 }
    );
  }

  const botConfig = await prisma.botConfig.upsert({
    where: { guildId },
    update: { bumpChannelId, logChannelId, bumpRoleId },
    create: {
      serverId: server.id,
      guildId,
      bumpChannelId,
      logChannelId,
      bumpRoleId,
    },
  });

  // Publish the server if not already
  if (!server.isPublished) {
    await prisma.server.update({
      where: { id: server.id },
      data: { isPublished: true, guildId },
    });
  }

  return NextResponse.json({ success: true, config: botConfig });
}
