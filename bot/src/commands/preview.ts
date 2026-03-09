import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { api } from "../lib/api";
import { bumpErrorEmbed } from "../lib/embeds";

export const data = new SlashCommandBuilder()
  .setName("preview")
  .setDescription("Preview how your server listing looks on DiscordNest");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.editReply("This command can only be used in a server.");
    return;
  }

  try {
    const stats = await api.stats(guildId);

    const embed = new EmbedBuilder()
      .setColor(0x7c3aed)
      .setTitle(stats.name)
      .setDescription("Here's how your server appears on DiscordNest:")
      .addFields(
        { name: "Members", value: stats.memberCount.toLocaleString(), inline: true },
        { name: "Rating", value: stats.avgRating ? `⭐ ${stats.avgRating.toFixed(1)}` : "No reviews yet", inline: true },
        { name: "Status", value: stats.isPublished ? "✅ Published" : "⚠️ Draft", inline: true },
        { name: "View Listing", value: `[Open on DiscordNest](${stats.listingUrl})` }
      )
      .setFooter({ text: "DiscordNest — /bump to move to the top!" });

    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({
      embeds: [bumpErrorEmbed("Could not load listing. Use /setup first.")],
    });
  }
}
