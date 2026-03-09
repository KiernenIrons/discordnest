export const dynamic = "force-dynamic";

import { ServerListingForm } from "@/components/dashboard/ServerListingForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function EditServerPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const [server, tags] = await Promise.all([
    prisma.server.findUnique({
      where: { id: params.id },
      include: {
        tags: { include: { tag: true } },
      },
    }),
    prisma.tag.findMany({
      where: { isPredefined: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!server) notFound();
  if (server.ownerId !== session!.user.id) redirect("/dashboard/servers");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit {server.name}</h1>
        <p className="text-zinc-400 text-sm mt-1">Update your server listing</p>
      </div>
      <ServerListingForm
        tags={tags}
        mode="edit"
        server={{
          id: server.id,
          name: server.name,
          description: server.description,
          shortDesc: server.shortDesc,
          inviteUrl: server.inviteUrl,
          iconUrl: server.iconUrl,
          bannerUrl: server.bannerUrl,
          isNsfw: server.isNsfw,
          isPublished: server.isPublished,
          selectedTags: server.tags.map((st) => st.tag.slug),
        }}
      />
    </div>
  );
}
