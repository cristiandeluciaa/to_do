import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_PRIORITA = ["0", "1", "2", "3"];

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { titolo, descrizione, priorita, posizione, scadenze, completata } = body;

  if (!titolo && !descrizione) {
    return NextResponse.json(
      { error: "titolo o descrizione obbligatori" },
      { status: 422 }
    );
  }

  const finalPriorita = VALID_PRIORITA.includes(priorita) ? priorita : "0";

  const task = await prisma.$transaction(async (tx) => {
    let finalPosizione: number;

    if (posizione !== undefined && posizione !== null && posizione !== "") {
      // Shifta le posizioni >= posizione richiesta
      await tx.toDo.updateMany({
        where: { priorita: finalPriorita, posizione: { gte: Number(posizione) } },
        data: { posizione: { increment: 1 } },
      });
      finalPosizione = Number(posizione);
    } else {
      // Metti in fondo
      const last = await tx.toDo.aggregate({
        _max: { posizione: true },
        where: { priorita: finalPriorita },
      });
      finalPosizione = (last._max.posizione ?? -1) + 1;
    }

    return tx.toDo.create({
      data: {
        titolo: titolo ? String(titolo).toUpperCase() : "",
        descrizione: descrizione ?? null,
        priorita: finalPriorita,
        posizione: finalPosizione,
        scadenze: scadenze ?? null,
        completata: completata ?? 0,
      },
    });
  });

  return NextResponse.json({ status: "success", message: "Task added successfully", task });
}
