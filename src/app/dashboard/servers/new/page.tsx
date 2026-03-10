export const dynamic = "force-dynamic";

import { ServerListingForm } from "@/components/dashboard/ServerListingForm";
import { prisma } from "@/lib/prisma";
import { ExternalLink, Bot } from "lucide-react";

export default async function NewServerPage() {
  const tags = await prisma.tag.findMany({
    where: { isPredefined: true },
    orderBy: { name: "asc" },
  });

  const clientId = process.env.DISCORD_CLIENT_ID ?? "";
  const botInviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot+applications.commands&permissions=412317240384`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Add Your Server</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Fill in the details below to list your Discord server on DiscordNest
        </p>
      </div>

      {/* Bot invite callout */}
      <div className="rounded-xl bg-brand-purple/10 border border-brand-purple/25 p-4 flex gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center">
          <Bot size={20} className="text-brand-purple" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-0.5">
            Add Nest Bot to your server first
          </p>
          <p className="text-xs text-zinc-400 mb-3">
            The bot auto-syncs your member count, enables the{" "}
            <span className="text-zinc-300 font-mono">/bump</span> command, and pings your
            channel when the cooldown resets.
          </p>
          <a
            href={botInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-purple hover:text-violet-300 transition-colors"
          >
            <ExternalLink size={13} />
            Invite Nest Bot to your server
          </a>
        </div>
      </div>

      <ServerListingForm tags={tags} mode="create" />
    </div>
  );
}
