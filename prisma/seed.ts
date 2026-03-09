import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PREDEFINED_TAGS = [
  { name: "Gaming", slug: "gaming", color: "#7c3aed" },
  { name: "Music", slug: "music", color: "#ec4899" },
  { name: "Anime", slug: "anime", color: "#f59e0b" },
  { name: "Programming", slug: "programming", color: "#10b981" },
  { name: "Art", slug: "art", color: "#f97316" },
  { name: "Social", slug: "social", color: "#3b82f6" },
  { name: "LGBTQ+", slug: "lgbtq", color: "#a855f7" },
  { name: "Roleplay", slug: "roleplay", color: "#6366f1" },
  { name: "Sports", slug: "sports", color: "#22c55e" },
  { name: "Education", slug: "education", color: "#0ea5e9" },
  { name: "Tech", slug: "tech", color: "#64748b" },
  { name: "Creative", slug: "creative", color: "#d946ef" },
  { name: "Chill", slug: "chill", color: "#8b5cf6" },
  { name: "18+", slug: "18plus", color: "#ef4444" },
  { name: "Movies & TV", slug: "movies-tv", color: "#f43f5e" },
];

async function main() {
  console.log("Seeding predefined tags...");

  for (const tag of PREDEFINED_TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: { ...tag, isPredefined: true },
    });
  }

  console.log(`✓ Seeded ${PREDEFINED_TAGS.length} tags`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
