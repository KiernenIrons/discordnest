"use client";

import { GlassBadge } from "@/components/ui/GlassBadge";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
}

interface TagFilterChipsProps {
  tags: Tag[];
}

export function TagFilterChips({ tags }: TagFilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTags = searchParams.getAll("tag");

  const toggleTag = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("tag");

      if (current.includes(slug)) {
        params.delete("tag");
        current.filter((t) => t !== slug).forEach((t) => params.append("tag", t));
      } else {
        params.append("tag", slug);
      }
      params.delete("page");
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-zinc-500 mr-1">Filter:</span>
      {tags.map((tag) => (
        <GlassBadge
          key={tag.id}
          color={tag.color ?? undefined}
          active={activeTags.includes(tag.slug)}
          onClick={() => toggleTag(tag.slug)}
        >
          {tag.name}
        </GlassBadge>
      ))}
    </div>
  );
}
