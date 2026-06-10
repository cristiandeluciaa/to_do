import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const scadenze = req.nextUrl.searchParams.get("scadenze");

  const tasks = await prisma.toDo.findMany({
    where: scadenze ? { scadenze } : { scadenze: null },
    orderBy: [
      { completata: "asc" },
      { priorita: "asc" },
      { posizione: "asc" },
      { updated_at: "desc" },
    ],
  });

  return NextResponse.json(tasks);
}
