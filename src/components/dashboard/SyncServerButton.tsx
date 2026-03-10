"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function SyncServerButton({ serverId }: { serverId: string }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/servers/${serverId}/sync`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Sync failed");
      } else {
        setMessage(`Synced! Guild ID updated. ${data.memberCount ? `${data.memberCount} members.` : ""}`);
        router.refresh();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <GlassButton
        variant="secondary"
        size="sm"
        onClick={handleSync}
        disabled={syncing}
      >
        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
        {syncing ? "Syncing…" : "Sync with Discord"}
      </GlassButton>
      {message && (
        <p className={`text-xs ${message.startsWith("Synced") ? "text-green-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
