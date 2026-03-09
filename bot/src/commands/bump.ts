import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { api } from "../lib/api";
import { bumpCooldownEmbed, bumpErrorEmbed, bumpSuccessEmbed } from "../lib/embeds";

export const data = new SlashCommandBuilder()
  .setName("bump")
  .setDescription("Bump your server to the top of DiscordNest!");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.editReply({ content: "This command can only be used in a server." });
    return;
  }

  try {
    const result = await api.bump(guildId, interaction.user.id);

    if (result.onCooldown) {
      await interaction.editReply({ embeds: [bumpCooldownEmbed(result)] });
    } else {
      await interaction.editReply({ embeds: [bumpSuccessEmbed(result)] });
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to bump. Is your server set up?";
    await interaction.editReply({ embeds: [bumpErrorEmbed(message)] });
  }
}
