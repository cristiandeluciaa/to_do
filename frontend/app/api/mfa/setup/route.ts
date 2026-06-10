import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const generated = speakeasy.generateSecret({
    name: `ToDo (${user.email})`,
    length: 20,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: generated.base32, totpEnabled: false },
  });

  const qrDataUrl = await qrcode.toDataURL(generated.otpauth_url!);

  return NextResponse.json({ qrDataUrl });
}
