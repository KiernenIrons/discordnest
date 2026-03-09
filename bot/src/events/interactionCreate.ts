import { Collection, Events, Interaction } from "discord.js";
import type { Command } from "../index";
import { handleModalSubmit } from "../commands/review";

export const name = Events.InteractionCreate;

export async function execute(
  interaction: Interaction,
  commands: Collection<string, Command>
) {
  // Handle modal submissions
  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("review-")) {
      await handleModalSubmit(interaction);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const replyFn = interaction.replied || interaction.deferred
      ? interaction.followUp.bind(interaction)
      : interaction.reply.bind(interaction);
    await replyFn({ content: "There was an error running this command.", ephemeral: true });
  }
}
