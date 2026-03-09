import { GlassBadge } from "@/components/ui/GlassBadge";
import { GlassButton } from "@/components/ui/GlassButton";
import { formatMemberCount, formatRelativeTime } from "@/lib/utils";
import { ArrowUpCircle, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ServerCardTag {
  tag: { name: string; color?: string | null };
}

interface ServerCardProps {
  server: {
    id: string;
    name: string;
    shortDesc: string;
    iconUrl?: string | null;
    bannerUrl?: string | null;
    inviteUrl: string;
    memberCount: number;
    bumpedAt?: Date | string | null;
    tags: ServerCardTag[];
  };
}

export function ServerCard({ server }: ServerCardProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col group hover:border-white/20 transition-all duration-300">
      {/* Banner */}
      <div className="relative h-28 bg-gradient-to-br from-brand-purple/20 to-brand-blue/10 overflow-hidden">
        {server.bannerUrl ? (
          <Image
            src={server.bannerUrl}
            alt=""
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 via-transparent to-brand-blue/20" />
        )}
        {/* Icon overlapping banner */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-14 h-14 rounded-2xl border-2 border-white/15 overflow-hidden bg-zinc-900 shadow-glass">
            {server.iconUrl ? (
              <Image
                src={server.iconUrl}
                alt={server.name}
                width={56}
                height={56}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/60 to-brand-blue/40">
                <span className="text-white font-bold text-lg">
                  {server.name[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pt-8 px-4 pb-4 flex flex-col flex-1 gap-3">
        {/* Name + bump time */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/servers/${server.id}`}
            className="font-bold text-white hover:text-violet-300 transition-colors line-clamp-1 text-base"
          >
            {server.name}
          </Link>
          {server.bumpedAt && (
            <span className="text-xs text-zinc-500 shrink-0 flex items-center gap-1">
              <ArrowUpCircle size={11} />
              {formatRelativeTime(server.bumpedAt)}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed flex-1">
          {server.shortDesc}
        </p>

        {/* Tags */}
        {server.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {server.tags.slice(0, 3).map(({ tag }) => (
              <GlassBadge key={tag.name} color={tag.color ?? undefined}>
                {tag.name}
              </GlassBadge>
            ))}
            {server.tags.length > 3 && (
              <GlassBadge>+{server.tags.length - 3}</GlassBadge>
            )}
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Users size={12} />
            {formatMemberCount(server.memberCount)} members
          </span>
          <a href={server.inviteUrl} target="_blank" rel="noopener noreferrer">
            <GlassButton variant="join" size="sm">
              Join
            </GlassButton>
          </a>
        </div>
      </div>
    </div>
  );
}
