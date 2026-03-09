"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassTextarea } from "@/components/ui/GlassTextarea";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    bio: "",
    websiteUrl: "",
    twitterHandle: "",
    githubHandle: "",
    isPublicProfile: true,
  });

  useEffect(() => {
    if (!session) return;
    fetch(`/api/users/${session.user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          bio: data.bio ?? "",
          websiteUrl: data.websiteUrl ?? "",
          twitterHandle: data.twitterHandle ?? "",
          githubHandle: data.githubHandle ?? "",
          isPublicProfile: data.isPublicProfile ?? true,
        });
      });
  }, [session]);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Customize what others see about you on DiscordNest
        </p>
      </div>

      <GlassCard hoverable={false} className="p-6 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
          <GlassTextarea
            rows={3}
            placeholder="Tell the community a bit about yourself..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Website URL
          </label>
          <GlassInput
            type="url"
            placeholder="https://yoursite.com"
            value={form.websiteUrl}
            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Twitter / X
            </label>
            <GlassInput
              placeholder="@username"
              value={form.twitterHandle}
              onChange={(e) => setForm({ ...form, twitterHandle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              GitHub
            </label>
            <GlassInput
              placeholder="username"
              value={form.githubHandle}
              onChange={(e) => setForm({ ...form, githubHandle: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.isPublicProfile}
            onClick={() => setForm({ ...form, isPublicProfile: !form.isPublicProfile })}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              form.isPublicProfile ? "bg-brand-purple" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                form.isPublicProfile ? "translate-x-5" : ""
              }`}
            />
          </button>
          <div>
            <p className="text-sm text-zinc-300 font-medium">Public profile</p>
            <p className="text-xs text-zinc-500">
              Allow others to view your DiscordNest profile page
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <GlassButton
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save changes"}
          </GlassButton>
          {success && (
            <span className="text-green-400 text-sm">Saved!</span>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
