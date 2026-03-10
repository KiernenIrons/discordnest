"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassTextarea } from "@/components/ui/GlassTextarea";
import { MAX_CUSTOM_TAGS, DESCRIPTION_MAX, SHORT_DESC_MAX } from "@/lib/constants";
import { useUploadThing } from "@/lib/uploadthing-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
}

interface ExistingServer {
  id: string;
  name: string;
  description: string;
  shortDesc: string;
  inviteUrl: string;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  isNsfw: boolean;
  isPublished: boolean;
  selectedTags: string[];
  customTags?: string[];
}

interface ServerListingFormProps {
  tags: Tag[];
  mode: "create" | "edit";
  server?: ExistingServer;
}

export function ServerListingForm({ tags, mode, server }: ServerListingFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState("");
  const [customTags, setCustomTags] = useState<string[]>(server?.customTags ?? []);
  const [iconUrl, setIconUrl] = useState<string | null>(server?.iconUrl ?? null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(server?.bannerUrl ?? null);

  const { startUpload: startIconUpload, isUploading: iconUploading } = useUploadThing("serverIcon", {
    onClientUploadComplete: (res) => { if (res[0]) setIconUrl(res[0].url); },
  });
  const { startUpload: startBannerUpload, isUploading: bannerUploading } = useUploadThing("serverBanner", {
    onClientUploadComplete: (res) => { if (res[0]) setBannerUrl(res[0].url); },
  });

  // In edit mode, only keep slugs that belong to the predefined tag list
  const predefinedSlugs = new Set(tags.map((t) => t.slug));
  const initialSelected = (server?.selectedTags ?? []).filter((s) => predefinedSlugs.has(s));

  const [form, setForm] = useState({
    name: server?.name ?? "",
    description: server?.description ?? "",
    shortDesc: server?.shortDesc ?? "",
    inviteUrl: server?.inviteUrl ?? "",
    isNsfw: server?.isNsfw ?? false,
    isPublished: server?.isPublished ?? false,
    selectedTags: initialSelected,
  });

  const toggleTag = (slug: string) => {
    setForm((f) => ({
      ...f,
      selectedTags: f.selectedTags.includes(slug)
        ? f.selectedTags.filter((t) => t !== slug)
        : [...f.selectedTags, slug],
    }));
  };

  const addCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed || customTags.length >= MAX_CUSTOM_TAGS) return;
    if (!customTags.includes(trimmed)) {
      setCustomTags([...customTags, trimmed]);
    }
    setCustomTagInput("");
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const endpoint =
        mode === "create" ? "/api/servers" : `/api/servers/${server!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, customTags, iconUrl, bannerUrl }),
      });

      if (res.status === 402) {
        const data = await res.json();
        if (data.requiresUpgrade) {
          setError(
            "The free 250 server slots are full. Please upgrade to Premium to list your server."
          );
          setSubmitting(false);
          return;
        }
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push("/dashboard/servers");
      router.refresh();
    } catch {
      setError("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <GlassCard hoverable={false} className="p-6 flex flex-col gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Server Name <span className="text-red-400">*</span>
          </label>
          <GlassInput
            required
            placeholder="My Awesome Server"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Invite URL */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Discord Invite Link <span className="text-red-400">*</span>
          </label>
          <GlassInput
            required
            type="url"
            placeholder="https://discord.gg/yourserver"
            value={form.inviteUrl}
            onChange={(e) => setForm({ ...form, inviteUrl: e.target.value })}
          />
          <p className="text-xs text-zinc-600 mt-1">
            Make sure your invite link doesn&apos;t expire
          </p>
        </div>

        {/* Images */}
        <div className="flex gap-4">
          {/* Server icon */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Server Icon
            </label>
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={iconUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) startIconUpload([file]);
                }}
              />
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/15 hover:border-brand-purple/50 transition-colors flex items-center justify-center overflow-hidden bg-white/5">
                {iconUrl ? (
                  <Image src={iconUrl} alt="icon" width={80} height={80} className="w-full h-full object-cover" />
                ) : iconUploading ? (
                  <span className="text-xs text-zinc-500">Uploading…</span>
                ) : (
                  <ImageIcon size={24} className="text-zinc-600" />
                )}
              </div>
            </label>
            <p className="text-xs text-zinc-600 mt-1">Max 2MB</p>
          </div>

          {/* Server banner */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Banner Image
            </label>
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={bannerUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) startBannerUpload([file]);
                }}
              />
              <div className="h-20 rounded-xl border-2 border-dashed border-white/15 hover:border-brand-purple/50 transition-colors flex items-center justify-center overflow-hidden bg-white/5 gap-2">
                {bannerUrl ? (
                  <Image src={bannerUrl} alt="banner" width={400} height={80} className="w-full h-full object-cover" />
                ) : bannerUploading ? (
                  <span className="text-xs text-zinc-500">Uploading…</span>
                ) : (
                  <>
                    <Upload size={16} className="text-zinc-600" />
                    <span className="text-xs text-zinc-600">Upload a banner (recommended: 1200×400)</span>
                  </>
                )}
              </div>
            </label>
            <p className="text-xs text-zinc-600 mt-1">Max 4MB</p>
          </div>
        </div>

        {/* Short description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Short Description <span className="text-red-400">*</span>
          </label>
          <GlassInput
            required
            placeholder="A brief description shown on server cards (max 160 chars)"
            maxLength={SHORT_DESC_MAX}
            value={form.shortDesc}
            onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
          />
          <p className="text-xs text-zinc-600 mt-1">
            {form.shortDesc.length}/{SHORT_DESC_MAX}
          </p>
        </div>

        {/* Full description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Full Description <span className="text-red-400">*</span>
          </label>
          <GlassTextarea
            required
            rows={6}
            placeholder="Tell people about your server — what makes it special, your rules, what kind of community you're building..."
            maxLength={DESCRIPTION_MAX}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <p className="text-xs text-zinc-600 mt-1">
            {form.description.length}/{DESCRIPTION_MAX}
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Categories / Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <GlassBadge
                key={tag.id}
                color={tag.color ?? undefined}
                active={form.selectedTags.includes(tag.slug)}
                onClick={() => toggleTag(tag.slug)}
              >
                {tag.name}
              </GlassBadge>
            ))}
          </div>

          {/* Custom tags */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">
              Custom tags ({customTags.length}/{MAX_CUSTOM_TAGS})
            </p>
            <div className="flex gap-2">
              <GlassInput
                placeholder="Add a custom tag..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                disabled={customTags.length >= MAX_CUSTOM_TAGS}
              />
              <GlassButton
                type="button"
                variant="secondary"
                size="md"
                onClick={addCustomTag}
                disabled={customTags.length >= MAX_CUSTOM_TAGS}
              >
                <Plus size={15} />
              </GlassButton>
            </div>
            {customTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {customTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-zinc-300"
                  >
                    {t}
                    <button type="button" onClick={() => removeCustomTag(t)}>
                      <X size={10} className="text-zinc-500 hover:text-zinc-200" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isNsfw}
              onChange={(e) => setForm({ ...form, isNsfw: e.target.checked })}
              className="w-4 h-4 rounded accent-brand-purple"
            />
            <div>
              <p className="text-sm text-zinc-300 font-medium">18+ / NSFW content</p>
              <p className="text-xs text-zinc-500">
                Mark if your server contains adult content (will be filtered by default)
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 rounded accent-brand-purple"
            />
            <div>
              <p className="text-sm text-zinc-300 font-medium">Publish immediately</p>
              <p className="text-xs text-zinc-500">
                Make your server visible on the home page right away
              </p>
            </div>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <GlassButton variant="primary" type="submit" disabled={submitting} size="lg">
            {submitting
              ? "Saving..."
              : mode === "create"
              ? "Add Server"
              : "Save Changes"}
          </GlassButton>
          <GlassButton
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.back()}
          >
            Cancel
          </GlassButton>
        </div>
      </GlassCard>
    </form>
  );
}
