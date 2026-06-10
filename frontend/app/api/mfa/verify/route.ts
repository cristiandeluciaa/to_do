import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Codice mancante" }, { status: 422 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.totpSecret) {
    return NextResponse.json({ error: "MFA non configurato" }, { status: 400 });
  }

  const isValid = authenticator.verify({ token: code, secret: user.totpSecret });
  if (!isValid) {
    return NextResponse.json({ error: "Codice non valido" }, { status: 400 });
  }

  // Se primo accesso, abilita il TOTP
  if (!user.totpEnabled) {
    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: true },
    });
  }

  // Imposta cookie mfa_verified (30 giorni)
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set("mfa_verified", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
