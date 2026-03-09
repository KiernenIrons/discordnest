import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { api } from "../lib/api";
import { setupSuccessEmbed, bumpErrorEmbed } from "../lib/embeds";

export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Connect your Discord server to its DiscordNest listing")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption((opt) =>
    opt
      .setName("bump-channel")
      .setDescription("Channel where bump reminders will be sent")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  )
  .addRoleOption((opt) =>
    opt
      .setName("bump-role")
      .setDescription("Role to ping when the bump cooldown is ready")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.editReply("This command can only be used in a server.");
    return;
  }

  const bumpChannel = interaction.options.getChannel("bump-channel");
  const bumpRole = interaction.options.getRole("bump-role");

  try {
    const result = await api.setup({
      guildId,
      bumpChannelId: bumpChannel?.id,
      bumpRoleId: bumpRole?.id,
    });

    await interaction.editReply({
      embeds: [setupSuccessEmbed(bumpChannel?.id)],
    });

    // Start bump reminder loop for this guild
    if (bumpChannel && result.success) {
      scheduleBumpReminder(guildId, bumpChannel.id, bumpRole?.id, interaction);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Setup failed.";
    await interaction.editReply({ embeds: [bumpErrorEmbed(msg)] });
  }
}

// Simple in-memory bump reminder scheduler
// In production, use a persistent job queue (e.g. BullMQ)
const reminders = new Map<string, NodeJS.Timeout>();

function scheduleBumpReminder(
  guildId: string,
  channelId: string,
  roleId: string | undefined,
  interaction: ChatInputCommandInteraction
) {
  if (reminders.has(guildId)) clearTimeout(reminders.get(guildId)!);

  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const timeout = setTimeout(async () => {
    try {
      const channel = await interaction.client.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        const mention = roleId ? `<@&${roleId}> ` : "";
        await channel.send(
          `${mention}⏰ Your server's bump cooldown is ready! Use \`/bump\` to get back to the top of DiscordNest!`
        );
      }
    } catch {
      // Channel might have been deleted — ignore
    }
    reminders.delete(guildId);
  }, TWO_HOURS);

  reminders.set(guildId, timeout);
}
