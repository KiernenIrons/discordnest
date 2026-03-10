"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export function DeleteServerButton({ serverId, serverName }: { serverId: string; serverName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${serverName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/servers/${serverId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Failed to delete server");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <GlassButton
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-400 hover:text-red-300 hover:border-red-500/30"
    >
      <Trash2 size={13} />
    </GlassButton>
  );
}
