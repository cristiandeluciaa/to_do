import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import * as OTPLib from "otplib";
const authenticator = OTPLib.authenticator;
import qrcode from "qrcode";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  // Genera un nuovo secret TOTP
  const secret = authenticator.generateSecret();

  // Salva il secret (non ancora abilitato)
  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: secret, totpEnabled: false },
  });

  const otpauth = authenticator.keyuri(user.email!, "ToDo App", secret);
  const qrDataUrl = await qrcode.toDataURL(otpauth);

  return NextResponse.json({ qrDataUrl, secret });
}
