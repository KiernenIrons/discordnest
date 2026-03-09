"use client";

import { GlassInput } from "@/components/ui/GlassInput";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`/?${params.toString()}`);
    },
    [value, router, searchParams]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <GlassInput
        icon={<Search size={16} />}
        type="search"
        placeholder="Search servers, categories, tags..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-12 text-base rounded-2xl border-white/15 bg-white/7 focus:bg-white/10"
      />
    </form>
  );
}
