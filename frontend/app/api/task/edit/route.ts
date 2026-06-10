import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, titolo, descrizione, priorita, posizione, scadenze, completata } = body;

  if (!id) {
    return NextResponse.json({ error: "id obbligatorio" }, { status: 422 });
  }

  const task = await prisma.toDo.findUnique({ where: { id: Number(id) } });
  if (!task) {
    return NextResponse.json({ error: "Task non trovato" }, { status: 404 });
  }

  const finalPriorita = priorita ?? task.priorita;
  const newPos = posizione !== undefined && posizione !== "" ? Number(posizione) : task.posizione;
  const newCompletata = completata !== undefined ? Number(completata) : task.completata;

  const updated = await prisma.$transaction(async (tx) => {
    // Gestione posizione solo se non completato
    if (task.completata !== 1 && newCompletata !== 1) {
      if (newPos !== null && task.posizione !== null && newPos !== task.posizione) {
        if (newPos < task.posizione) {
          await tx.toDo.updateMany({
            where: {
              priorita: finalPriorita,
              posizione: { gte: newPos, lt: task.posizione },
            },
            data: { posizione: { increment: 1 } },
          });
        } else {
          await tx.toDo.updateMany({
            where: {
              priorita: finalPriorita,
              posizione: { lte: newPos, gt: task.posizione },
            },
            data: { posizione: { decrement: 1 } },
          });
        }
      } else if (newPos !== null && task.posizione === null) {
        await tx.toDo.updateMany({
          where: { priorita: finalPriorita, posizione: { gte: newPos } },
          data: { posizione: { increment: 1 } },
        });
      }
    }

    // Se completato → metti in fondo
    let finalPosizione = newPos;
    if (newCompletata === 1) {
      const last = await tx.toDo.aggregate({
        _max: { posizione: true },
        where: { priorita: task.priorita ?? undefined, completata: 0 },
      });
      finalPosizione = (last._max.posizione ?? -1) + 1;
    }

    return tx.toDo.update({
      where: { id: Number(id) },
      data: {
        titolo: titolo !== undefined ? String(titolo).toUpperCase() : task.titolo,
        descrizione: descrizione !== undefined ? descrizione : task.descrizione,
        priorita: finalPriorita,
        posizione: finalPosizione,
        scadenze: scadenze !== undefined ? scadenze : task.scadenze,
        completata: newCompletata,
      },
    });
  });

  return NextResponse.json({ status: "success", message: "Task edited successfully", task: updated });
}
