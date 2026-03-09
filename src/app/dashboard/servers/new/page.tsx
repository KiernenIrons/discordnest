export const dynamic = "force-dynamic";

import { ServerListingForm } from "@/components/dashboard/ServerListingForm";
import { prisma } from "@/lib/prisma";

export default async function NewServerPage() {
  const tags = await prisma.tag.findMany({
    where: { isPredefined: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Add Your Server</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Fill in the details below to list your Discord server on DiscordNest
        </p>
      </div>
      <ServerListingForm tags={tags} mode="create" />
    </div>
  );
}
