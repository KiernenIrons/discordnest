export const dynamic = "force-dynamic";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { BumpButton } from "@/components/dashboard/BumpButton";
import { DeleteServerButton } from "@/components/dashboard/DeleteServerButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMemberCount, formatRelativeTime } from "@/lib/utils";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Edit, Plus, Server } from "lucide-react";
import { BUMP_COOLDOWN_MS } from "@/lib/constants";

export default async function ServersPage() {
  const session = await getServerSession(authOptions);
  const servers = await prisma.server.findMany({
    where: { ownerId: session!.user.id },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { bumps: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Servers</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            Manage your Discord server listings
          </p>
        </div>
        <Link href="/dashboard/servers/new">
          <GlassButton variant="primary">
            <Plus size={15} /> Add Server
          </GlassButton>
        </Link>
      </div>

      {servers.length === 0 ? (
        <GlassCard hoverable={false} className="p-12 text-center">
          <Server size={36} className="text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">No server listings yet</p>
          <p className="text-zinc-600 text-sm mt-1 mb-6">
            Create a listing to start promoting your Discord server
          </p>
          <Link href="/dashboard/servers/new">
            <GlassButton variant="primary">Add your first server</GlassButton>
          </Link>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {servers.map((server) => {
            const canBump =
              !server.bumpedAt ||
              now - new Date(server.bumpedAt).getTime() >= BUMP_COOLDOWN_MS;

            return (
              <GlassCard
                key={server.id}
                hoverable={false}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 border border-brand-purple/20 flex items-center justify-center font-bold text-white text-lg shrink-0 overflow-hidden">
                  {server.iconUrl ? (
                    <Image src={server.iconUrl} alt="" width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    server.name[0]
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm truncate">
                      {server.name}
                    </span>
                    <GlassBadge>
                      {server.isPublished ? "Published" : "Draft"}
                    </GlassBadge>
                    {server.isPremium && (
                      <GlassBadge color="#f59e0b">Premium</GlassBadge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{server.shortDesc}</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-600 mt-1">
                    <span>{formatMemberCount(server.memberCount)} members</span>
                    <span>{server._count.bumps} bumps</span>
                    <span>{server._count.reviews} reviews</span>
                    {server.bumpedAt && (
                      <span>Last bumped {formatRelativeTime(server.bumpedAt)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {canBump ? (
                    <BumpButton serverId={server.id} />
                  ) : (
                    <GlassButton variant="secondary" size="sm" disabled>
                      Bump ready soon
                    </GlassButton>
                  )}
                  <Link href={`/dashboard/servers/${server.id}/edit`}>
                    <GlassButton variant="secondary" size="sm">
                      <Edit size={13} /> Edit
                    </GlassButton>
                  </Link>
                  <DeleteServerButton serverId={server.id} serverName={server.name} />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
