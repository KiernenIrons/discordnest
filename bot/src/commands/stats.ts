import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { api } from "../lib/api";
import { statsEmbed, bumpErrorEmbed } from "../lib/embeds";

export const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("View your server's DiscordNest listing stats");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.editReply({ content: "This command can only be used in a server." });
    return;
  }

  try {
    const stats = await api.stats(guildId);
    await interaction.editReply({ embeds: [statsEmbed(stats)] });
  } catch {
    await interaction.editReply({
      embeds: [bumpErrorEmbed("Could not fetch stats. Make sure your server is set up with /setup.")],
    });
  }
}
