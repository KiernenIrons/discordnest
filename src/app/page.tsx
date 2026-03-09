import { SearchBar } from "@/components/home/SearchBar";
import { TagFilterChips } from "@/components/home/TagFilterChips";
import { ServerCard } from "@/components/server/ServerCard";
import { ServerCardSkeleton } from "@/components/server/ServerCardSkeleton";
import { SERVERS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";

interface HomeProps {
  searchParams: {
    q?: string;
    tag?: string | string[];
    page?: string;
  };
}

async function ServerGrid({
  q,
  tags,
  page,
}: {
  q?: string;
  tags: string[];
  page: number;
}) {
  const skip = (page - 1) * SERVERS_PER_PAGE;

  const where = {
    isPublished: true,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { shortDesc: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(tags.length > 0 && {
      tags: {
        some: {
          tag: { slug: { in: tags } },
        },
      },
    }),
  };

  const [servers, total] = await Promise.all([
    prisma.server.findMany({
      where,
      include: {
        tags: {
          include: { tag: { select: { name: true, color: true } } },
        },
      },
      orderBy: [{ bumpedAt: "desc" }, { memberCount: "desc" }],
      skip,
      take: SERVERS_PER_PAGE,
    }),
    prisma.server.count({ where }),
  ]);

  const totalPages = Math.ceil(total / SERVERS_PER_PAGE);

  if (servers.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-5xl">🔍</div>
        <p className="text-zinc-400 text-lg">No servers found</p>
        <p className="text-zinc-600 text-sm">
          {q ? `No results for "${q}"` : "Be the first to add your server!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="col-span-full flex items-center justify-center gap-3 mt-8">
          {page > 1 && (
            <Link
              href={`/?page=${page - 1}${q ? `&q=${q}` : ""}${tags.map((t) => `&tag=${t}`).join("")}`}
            >
              <GlassButton variant="secondary" size="sm">
                <ChevronLeft size={14} /> Previous
              </GlassButton>
            </Link>
          )}
          <span className="text-zinc-400 text-sm">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/?page=${page + 1}${q ? `&q=${q}` : ""}${tags.map((t) => `&tag=${t}`).join("")}`}
            >
              <GlassButton variant="secondary" size="sm">
                Next <ChevronRight size={14} />
              </GlassButton>
            </Link>
          )}
        </div>
      )}
    </>
  );
}

function ServerGridSkeleton() {
  return (
    <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ServerCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: HomeProps) {
  const q = searchParams.q;
  const rawTags = searchParams.tag;
  const tags = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const allTags = await prisma.tag.findMany({
    where: { isPredefined: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6 border-brand-purple/20">
          <Zap size={13} className="text-brand-purple" />
          The best place to grow your Discord server
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Find your next
          <br />
          <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
            Discord community
          </span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
          Browse thousands of servers across every category. Join the ones you love or promote your own.
        </p>
        <div className="flex justify-center">
          <SearchBar />
        </div>
      </div>

      {/* Tag filter */}
      <div className="mb-8">
        <Suspense>
          <TagFilterChips tags={allTags} />
        </Suspense>
      </div>

      {/* Server grid */}
      <Suspense fallback={<ServerGridSkeleton />}>
        <ServerGrid q={q} tags={tags} page={page} />
      </Suspense>
    </div>
  );
}
