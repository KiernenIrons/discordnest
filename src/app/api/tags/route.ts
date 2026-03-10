export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      where: { isPredefined: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(tags);
  } catch (err) {
    console.error("[GET /api/tags]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
