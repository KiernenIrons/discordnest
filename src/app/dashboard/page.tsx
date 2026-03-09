export const dynamic = "force-dynamic";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMemberCount } from "@/lib/utils";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Plus, Server, ArrowUpCircle, Star } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: {
      servers: {
        include: {
          _count: { select: { bumps: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      subscription: true,
    },
  });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="flex items-center gap-4">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={52}
            height={52}
            className="rounded-2xl"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-brand-purple/40 flex items-center justify-center text-2xl font-bold text-white">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hey, {user.username} 👋
          </h1>
          <p className="text-zinc-400 text-sm">Welcome to your dashboard</p>
        </div>
      </div>

      {/* Subscription status */}
      {user.subscription?.status !== "ACTIVE" && (
        <GlassCard hoverable={false} className="p-5 border-brand-purple/30 bg-brand-purple/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium text-sm">Upgrade to Premium</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Keep your server listed after the 250 free slots fill up. Just $4.99/mo.
              </p>
            </div>
            <Link href="/dashboard/billing">
              <GlassButton variant="primary" size="sm">
                Upgrade
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard hoverable={false} className="p-4">
          <Server size={18} className="text-brand-purple mb-2" />
          <p className="text-2xl font-bold text-white">{user.servers.length}</p>
          <p className="text-xs text-zinc-500">Servers listed</p>
        </GlassCard>
        <GlassCard hoverable={false} className="p-4">
          <ArrowUpCircle size={18} className="text-brand-blue mb-2" />
          <p className="text-2xl font-bold text-white">
            {user.servers.reduce((sum, s) => sum + s._count.bumps, 0)}
          </p>
          <p className="text-xs text-zinc-500">Total bumps</p>
        </GlassCard>
        <GlassCard hoverable={false} className="p-4">
          <Star size={18} className="text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            {user.servers.reduce((sum, s) => sum + s._count.reviews, 0)}
          </p>
          <p className="text-xs text-zinc-500">Total reviews</p>
        </GlassCard>
      </div>

      {/* Recent servers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Your Servers</h2>
          <Link href="/dashboard/servers/new">
            <GlassButton variant="primary" size="sm">
              <Plus size={14} /> Add Server
            </GlassButton>
          </Link>
        </div>

        {user.servers.length === 0 ? (
          <GlassCard hoverable={false} className="p-10 text-center">
            <Server size={32} className="text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No servers listed yet</p>
            <p className="text-zinc-600 text-sm mt-1">
              Add your first server to start growing your community
            </p>
            <Link href="/dashboard/servers/new" className="inline-block mt-4">
              <GlassButton variant="primary">Add your server</GlassButton>
            </Link>
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-3">
            {user.servers.map((server) => (
              <GlassCard
                key={server.id}
                hoverable={false}
                className="p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-purple/30 flex items-center justify-center font-bold text-white shrink-0">
                  {server.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {server.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatMemberCount(server.memberCount)} members ·{" "}
                    {server._count.bumps} bumps ·{" "}
                    {server.isPublished ? (
                      <span className="text-green-400">Published</span>
                    ) : (
                      <span className="text-yellow-400">Draft</span>
                    )}
                  </p>
                </div>
                <Link href={`/dashboard/servers/${server.id}/edit`}>
                  <GlassButton variant="ghost" size="sm">
                    Edit
                  </GlassButton>
                </Link>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
