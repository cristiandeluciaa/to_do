"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function VerifyMfaPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Controlla se l'utente ha già il TOTP configurato
    axios.get("/api/mfa/setup/status").then((res) => {
      if (!res.data.totpEnabled) setNeedsSetup(true);
    }).catch(() => {});
  }, []);

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/mfa/verify", { code });
      router.push("/");
    } catch {
      setError("Codice non valido. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  if (needsSetup) {
    router.push("/setup-mfa");
    return null;
  }

  return (
    <div className="w-screen h-screen bg-[#0d1b2a] flex items-center justify-center">
      <div className="bg-[#1B263B] rounded-lg p-10 flex flex-col items-center gap-6 shadow-2xl w-full max-w-sm">
        <h1 className="text-white text-2xl font-bold">Verifica MFA</h1>
        <p className="text-gray-400 text-sm text-center">
          Inserisci il codice dall&apos;app Authenticator
        </p>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          autoFocus
          className="bg-[#29364e] text-white text-center text-3xl tracking-widest rounded-lg px-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg w-full transition"
        >
          {loading ? "Verifica..." : "Entra"}
        </button>
      </div>
    </div>
  );
}
