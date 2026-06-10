import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id obbligatorio" }, { status: 422 });
  }

  const task = await prisma.toDo.findUnique({ where: { id: Number(id) } });
  if (!task) {
    return NextResponse.json({ error: "Task non trovato" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    if (task.posizione !== null) {
      await tx.toDo.updateMany({
        where: {
          priorita: task.priorita ?? undefined,
          posizione: { gt: task.posizione },
        },
        data: { posizione: { decrement: 1 } },
      });
    }
    await tx.toDo.delete({ where: { id: Number(id) } });
  });

  return NextResponse.json({ status: "success", message: "Task deleted successfully" });
}
