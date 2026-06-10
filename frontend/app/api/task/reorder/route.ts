import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tasks } = body;

  if (!Array.isArray(tasks)) {
    return NextResponse.json({ error: "Formato non valido" }, { status: 400 });
  }

  await prisma.$transaction(
    tasks.map(({ id, posizione }: { id: number; posizione: number }) =>
      prisma.toDo.update({
        where: { id: Number(id) },
        data: { posizione: Number(posizione) },
      })
    )
  );

  const updated = await prisma.toDo.findMany({ orderBy: { posizione: "asc" } });
  return NextResponse.json(updated);
}
