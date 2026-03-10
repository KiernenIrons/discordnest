export const dynamic = "force-dynamic";

import { authOptions } from "@/lib/auth";
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

    // Fetch real guildId + member count + icon from Discord invite
    const inviteCode = server.inviteUrl
      .replace(/https?:\/\/discord\.gg\//, "")
      .replace(/https?:\/\/discord\.com\/invite\//, "");

    const botToken = process.env.DISCORD_BOT_TOKEN;
    const discordRes = await fetch(
      `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`,
      botToken
        ? { headers: { Authorization: `Bot ${botToken}` } }
        : {}
    );

    if (!discordRes.ok) {
      const errBody = await discordRes.json().catch(() => ({})) as Record<string, unknown>;
      console.error("[sync] Discord API error", discordRes.status, errBody);
      return NextResponse.json(
        { error: `Discord returned ${discordRes.status} — the invite link may be expired or invalid.` },
        { status: 400 }
      );
    }

    const data = await discordRes.json();
    const guildId: string | undefined = data.guild?.id;
    const memberCount: number = data.approximate_member_count ?? server.memberCount;
    let iconUrl: string | null = server.iconUrl;
    if (guildId && data.guild?.icon && !server.iconUrl) {
      iconUrl = `https://cdn.discordapp.com/icons/${guildId}/${data.guild.icon}.png?size=256`;
    }

    if (!guildId) {
      return NextResponse.json({ error: "Discord did not return a guild ID for this invite." }, { status: 400 });
    }

    // Check if another listing already owns this guildId
    const conflict = await prisma.server.findUnique({ where: { guildId } });
    if (conflict && conflict.id !== server.id) {
      return NextResponse.json(
        { error: "This Discord server is already linked to another listing." },
        { status: 409 }
      );
    }

    const updated = await prisma.server.update({
      where: { id: params.id },
      data: { guildId, memberCount, ...(iconUrl !== server.iconUrl && { iconUrl }) },
    });

    return NextResponse.json({
      success: true,
      guildId: updated.guildId,
      memberCount: updated.memberCount,
      iconUrl: updated.iconUrl,
    });
  } catch (err) {
    console.error("[POST /api/servers/[id]/sync]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
