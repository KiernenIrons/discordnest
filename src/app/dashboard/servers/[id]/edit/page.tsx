export const dynamic = "force-dynamic";

import { ServerListingForm } from "@/components/dashboard/ServerListingForm";
import { SyncServerButton } from "@/components/dashboard/SyncServerButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function EditServerPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const [server, tags] = await Promise.all([
    prisma.server.findUnique({
      where: { id: params.id },
      include: {
        tags: { include: { tag: true } },
      },
    }),
    prisma.tag.findMany({
      where: { isPredefined: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!server) notFound();
  if (server.ownerId !== session!.user.id) redirect("/dashboard/servers");

  const needsSync = server.guildId.startsWith("manual-");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit {server.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">Update your server listing</p>
        </div>
        <div className="shrink-0 pt-1">
          {needsSync ? (
            <div className="flex flex-col gap-1">
              <SyncServerButton serverId={server.id} />
              <p className="text-xs text-yellow-400/80">
                Discord not linked — sync to enable /bump in your server
              </p>
            </div>
          ) : (
            <SyncServerButton serverId={server.id} />
          )}
        </div>
      </div>
      <ServerListingForm
        tags={tags}
        mode="edit"
        server={{
          id: server.id,
          name: server.name,
          description: server.description,
          shortDesc: server.shortDesc,
          inviteUrl: server.inviteUrl,
          iconUrl: server.iconUrl,
          bannerUrl: server.bannerUrl,
          isNsfw: server.isNsfw,
          isPublished: server.isPublished,
          selectedTags: server.tags
            .filter((st) => st.tag.isPredefined)
            .map((st) => st.tag.slug),
          customTags: server.tags
            .filter((st) => !st.tag.isPredefined)
            .map((st) => st.tag.name),
        }}
      />
    </div>
  );
}
