import { Client, Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export function execute(client: Client) {
  console.log(`✅ Logged in as ${client.user?.tag}`);
  client.user?.setActivity("discordnest.com | /bump");
}
