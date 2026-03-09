import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BOT_API_BASE_URL!;
const SECRET = process.env.BOT_API_SECRET!;

export const data = new SlashCommandBuilder()
  .setName("review")
  .setDescription("Leave a review for this server on DiscordNest");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: "Server-only command.", ephemeral: true });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`review-${guildId}`)
    .setTitle("Leave a Review");

  const ratingInput = new TextInputBuilder()
    .setCustomId("rating")
    .setLabel("Rating (1-5)")
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setMaxLength(1)
    .setPlaceholder("5")
    .setRequired(true);

  const bodyInput = new TextInputBuilder()
    .setCustomId("body")
    .setLabel("Your review")
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(10)
    .setMaxLength(1000)
    .setPlaceholder("Tell us what you think about this server...")
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(ratingInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(bodyInput)
  );

  await interaction.showModal(modal);
}

// Called from interactionCreate event when modal is submitted
export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.customId.replace("review-", "");
  const ratingStr = interaction.fields.getTextInputValue("rating");
  const body = interaction.fields.getTextInputValue("body");

  const rating = parseInt(ratingStr, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    await interaction.editReply("Rating must be a number between 1 and 5.");
    return;
  }

  try {
    // First get the server ID from guildId via stats
    const statsRes = await fetch(`${BASE_URL}/api/bot/stats?guildId=${guildId}`, {
      headers: { "x-bot-secret": SECRET },
    });
    if (!statsRes.ok) throw new Error("Server not found");
    const stats = await statsRes.json() as { listingUrl: string };

    // Extract server ID from listing URL
    const serverId = stats.listingUrl.split("/servers/")[1];

    // We need a user session — bot reviews use a special bot endpoint
    // For now, store review with Discord user ID as identifier
    const res = await fetch(`${BASE_URL}/api/bot/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bot-secret": SECRET,
      },
      body: JSON.stringify({
        serverId,
        discordUserId: interaction.user.id,
        rating,
        body,
      }),
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      await interaction.editReply(data.error ?? "Could not submit review.");
      return;
    }

    await interaction.editReply(
      `✅ Thanks for your review! ⭐ ${rating}/5`
    );
  } catch {
    await interaction.editReply("Failed to submit review. Please try again.");
  }
}
