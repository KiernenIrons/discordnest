"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BumpButton({ serverId }: { serverId: string }) {
  const router = useRouter();
  const [bumping, setBumping] = useState(false);

  const handleBump = async () => {
    setBumping(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/bump`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Could not bump");
      }
    } catch {
      alert("Network error");
    } finally {
      setBumping(false);
    }
  };

  return (
    <GlassButton variant="primary" size="sm" onClick={handleBump} disabled={bumping}>
      {bumping ? "Bumping..." : "Bump"}
    </GlassButton>
  );
}
