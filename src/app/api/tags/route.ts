import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const tags = await prisma.tag.findMany({
    where: { isPredefined: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(tags);
}
