import * as dotenv from "dotenv";
dotenv.config();

import { REST, Routes } from "discord.js";
import * as bumpCmd from "./commands/bump";
import * as statsCmd from "./commands/stats";
import * as setupCmd from "./commands/setup";
import * as previewCmd from "./commands/preview";
import * as reviewCmd from "./commands/review";

const commands = [bumpCmd, statsCmd, setupCmd, previewCmd, reviewCmd].map((c) =>
  c.data.toJSON()
);

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

(async () => {
  try {
    console.log(`Registering ${commands.length} slash commands...`);
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
      { body: commands }
    );
    console.log("✅ Slash commands registered globally.");
  } catch (error) {
    console.error(error);
  }
})();
