import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email guilds" } },
      profile(profile) {
        const avatarUrl = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${Number(profile.discriminator) % 5}.png`;

        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: avatarUrl,
          discordId: profile.id,
          username: profile.username,
          discriminator: profile.discriminator ?? "0",
          avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.discordId = (user as { discordId?: string }).discordId ?? "";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Sync Discord-specific fields into our User record on first login
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: "discord" },
      });
      if (!account) return;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          discordId: account.providerAccountId,
          avatarUrl: user.image ?? undefined,
          username: user.name ?? "Unknown",
        },
      });
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "database",
  },
};
