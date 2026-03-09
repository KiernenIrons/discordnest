import * as dotenv from "dotenv";
dotenv.config();

import { Client, Collection, GatewayIntentBits, Interaction, SlashCommandBuilder } from "discord.js";
import * as bumpCmd from "./commands/bump";
import * as statsCmd from "./commands/stats";
import * as setupCmd from "./commands/setup";
import * as previewCmd from "./commands/preview";
import * as reviewCmd from "./commands/review";
import * as readyEvent from "./events/ready";
import * as interactionCreateEvent from "./events/interactionCreate";

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: never) => Promise<void>;
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = new Collection<string, Command>();

const allCommands: Command[] = [bumpCmd, statsCmd, setupCmd, previewCmd, reviewCmd];
for (const cmd of allCommands) {
  commands.set(cmd.data.name, cmd);
}

// Register events
client.once(readyEvent.name, (...args) => readyEvent.execute(...(args as [Client])));
client.on(interactionCreateEvent.name, (interaction: Interaction) =>
  interactionCreateEvent.execute(interaction, commands)
);

client.login(process.env.DISCORD_BOT_TOKEN);
