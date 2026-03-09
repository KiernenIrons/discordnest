import { EmbedBuilder } from "discord.js";
import type { BumpResult, ServerStats } from "./api";

const BRAND_COLOR = 0x7c3aed;
const SUCCESS_COLOR = 0x10b981;
const ERROR_COLOR = 0xef4444;
const WARN_COLOR = 0xf59e0b;

export function bumpSuccessEmbed(result: BumpResult): EmbedBuilder {
  const nextBump = result.nextBumpAt ? new Date(result.nextBumpAt) : null;
  return new EmbedBuilder()
    .setColor(SUCCESS_COLOR)
    .setTitle("🚀 Server Bumped!")
    .setDescription(
      `**${result.serverName}** has been bumped to the top of DiscordNest!`
    )
    .addFields({
      name: "Next bump available",
      value: nextBump ? `<t:${Math.floor(nextBump.getTime() / 1000)}:R>` : "In 2 hours",
      inline: true,
    })
    .setFooter({ text: "DiscordNest — Grow your community" })
    .setTimestamp();
}

export function bumpCooldownEmbed(result: BumpResult): EmbedBuilder {
  const nextBump = result.nextBumpAt ? new Date(result.nextBumpAt) : null;
  return new EmbedBuilder()
    .setColor(WARN_COLOR)
    .setTitle("⏳ Bump Cooldown")
    .setDescription("Your server was recently bumped. Please wait before bumping again.")
    .addFields({
      name: "Next bump available",
      value: nextBump ? `<t:${Math.floor(nextBump.getTime() / 1000)}:R>` : `In ${result.remainingMinutes} minutes`,
      inline: true,
    })
    .setFooter({ text: "DiscordNest" });
}

export function bumpErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ERROR_COLOR)
    .setTitle("❌ Bump Failed")
    .setDescription(message)
    .setFooter({ text: "DiscordNest" });
}

export function statsEmbed(stats: ServerStats): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(`📊 Stats — ${stats.name}`)
    .addFields(
      { name: "Members", value: stats.memberCount.toLocaleString(), inline: true },
      { name: "Total Bumps", value: stats.totalBumps.toLocaleString(), inline: true },
      { name: "Reviews", value: stats.totalReviews.toLocaleString(), inline: true }
    );

  if (stats.avgRating !== null) {
    embed.addFields({
      name: "Rating",
      value: `⭐ ${stats.avgRating.toFixed(1)} / 5`,
      inline: true,
    });
  }

  if (stats.bumpedAt) {
    const ts = Math.floor(new Date(stats.bumpedAt).getTime() / 1000);
    embed.addFields({ name: "Last Bumped", value: `<t:${ts}:R>`, inline: true });
  }

  embed
    .addFields({ name: "Listing", value: `[View on DiscordNest](${stats.listingUrl})`, inline: false })
    .setFooter({ text: "DiscordNest" })
    .setTimestamp();

  return embed;
}

export function setupSuccessEmbed(bumpChannelId?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(SUCCESS_COLOR)
    .setTitle("✅ Setup Complete!")
    .setDescription("Your server is now configured with DiscordNest.")
    .addFields(
      ...(bumpChannelId
        ? [{ name: "Bump Reminders", value: `<#${bumpChannelId}>`, inline: true }]
        : [])
    )
    .setFooter({ text: "Use /bump to boost your listing · DiscordNest" });
}
