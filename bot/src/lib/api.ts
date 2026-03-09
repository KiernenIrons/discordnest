import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BOT_API_BASE_URL!;
const SECRET = process.env.BOT_API_SECRET!;

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-bot-secret": SECRET,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error(data.error ?? "API error"), {
      status: res.status,
      data,
    });
  }

  return res.json();
}

export interface BumpResult {
  success: boolean;
  onCooldown?: boolean;
  serverName?: string;
  bumpedAt?: string;
  nextBumpAt?: string;
  remainingMinutes?: number;
  error?: string;
}

export interface ServerStats {
  name: string;
  memberCount: number;
  totalBumps: number;
  totalReviews: number;
  avgRating: number | null;
  bumpedAt: string | null;
  isPublished: boolean;
  listingUrl: string;
}

export interface SetupResult {
  success: boolean;
  config: { bumpChannelId?: string; logChannelId?: string };
}

export const api = {
  bump: (guildId: string, bumpedByDiscordId: string) =>
    apiFetch<BumpResult>("/api/bot/bump", {
      method: "POST",
      body: JSON.stringify({ guildId, bumpedByDiscordId }),
    }),

  stats: (guildId: string) =>
    apiFetch<ServerStats>(`/api/bot/stats?guildId=${guildId}`),

  setup: (payload: {
    guildId: string;
    bumpChannelId?: string;
    logChannelId?: string;
    bumpRoleId?: string;
  }) =>
    apiFetch<SetupResult>("/api/bot/setup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
