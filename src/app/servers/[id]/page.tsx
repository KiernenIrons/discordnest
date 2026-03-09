import { GlassBadge } from "@/components/ui/GlassBadge";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatMemberCount, formatRelativeTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { ArrowUpCircle, ExternalLink, Star, Users } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const server = await prisma.server.findUnique({
    where: { id: params.id },
    select: { name: true, shortDesc: true, bannerUrl: true },
  });
  if (!server) return { title: "Server not found" };

  return {
    title: server.name,
    description: server.shortDesc,
    openGraph: {
      title: `${server.name} | DiscordNest`,
      description: server.shortDesc,
      images: server.bannerUrl ? [server.bannerUrl] : [],
    },
  };
}

export default async function ServerDetailPage({ params }: PageProps) {
  const server = await prisma.server.findUnique({
    where: { id: params.id, isPublished: true },
    include: {
      tags: {
        include: { tag: true },
      },
      reviews: {
        include: { author: { select: { username: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { bumps: true } },
    },
  });

  if (!server) notFound();

  const avgRating =
    server.reviews.length > 0
      ? (
          server.reviews.reduce((sum, r) => sum + r.rating, 0) /
          server.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden mb-6 glass">
        {server.bannerUrl ? (
          <Image src={server.bannerUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 to-brand-blue/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />

        {/* Icon */}
        <div className="absolute bottom-4 left-6 flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl border-2 border-white/20 overflow-hidden bg-zinc-900 shadow-glass">
            {server.iconUrl ? (
              <Image src={server.iconUrl} alt={server.name} width={80} height={80} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/60 to-brand-blue/40">
                <span className="text-white font-bold text-2xl">{server.name[0]}</span>
              </div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-2xl font-bold text-white">{server.name}</h1>
            <div className="flex items-center gap-3 text-sm text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {formatMemberCount(server.memberCount)} members
              </span>
              {avgRating && (
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  {avgRating}
                </span>
              )}
              {server.bumpedAt && (
                <span className="flex items-center gap-1">
                  <ArrowUpCircle size={12} />
                  {formatRelativeTime(server.bumpedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Description */}
          <GlassCard hoverable={false} className="p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              About this server
            </h2>
            <div className="server-description text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {server.description}
            </div>
          </GlassCard>

          {/* Reviews */}
          <GlassCard hoverable={false} className="p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Reviews {server.reviews.length > 0 && `(${server.reviews.length})`}
            </h2>
            {server.reviews.length === 0 ? (
              <p className="text-zinc-500 text-sm">No reviews yet. Be the first!</p>
            ) : (
              <div className="flex flex-col gap-4">
                {server.reviews.map((review) => (
                  <div key={review.id} className="border-t border-white/5 pt-4 first:border-0 first:pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      {review.author.avatarUrl ? (
                        <Image
                          src={review.author.avatarUrl}
                          alt=""
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-brand-purple/40 flex items-center justify-center text-xs text-white">
                          {review.author.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-zinc-300">
                        {review.author.username}
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-600 ml-auto">
                        {formatRelativeTime(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Join card */}
          <GlassCard hoverable={false} className="p-5 text-center">
            <p className="text-zinc-400 text-sm mb-4">
              Ready to join this community?
            </p>
            <a href={server.inviteUrl} target="_blank" rel="noopener noreferrer">
              <GlassButton variant="join" size="lg" className="w-full">
                <ExternalLink size={16} />
                Join Server
              </GlassButton>
            </a>
          </GlassCard>

          {/* Stats */}
          <GlassCard hoverable={false} className="p-5">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Stats</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Members</span>
                <span className="text-zinc-200 font-medium">{formatMemberCount(server.memberCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total bumps</span>
                <span className="text-zinc-200 font-medium">{server._count.bumps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Listed since</span>
                <span className="text-zinc-200 font-medium">{formatRelativeTime(server.createdAt)}</span>
              </div>
            </div>
          </GlassCard>

          {/* Tags */}
          {server.tags.length > 0 && (
            <GlassCard hoverable={false} className="p-5">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {server.tags.map(({ tag }) => (
                  <GlassBadge key={tag.id} color={tag.color ?? undefined}>
                    {tag.name}
                  </GlassBadge>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
