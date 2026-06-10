"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SetupMfaPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/mfa/setup").then((res) => setQrDataUrl(res.data.qrDataUrl));
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

  return (
    <div className="w-screen h-screen bg-[#0d1b2a] flex items-center justify-center">
      <div className="bg-[#1B263B] rounded-lg p-10 flex flex-col items-center gap-6 shadow-2xl w-full max-w-sm">
        <h1 className="text-white text-2xl font-bold">Configura MFA</h1>
        <p className="text-gray-400 text-sm text-center">
          Scansiona il QR code con Google Authenticator o Authy
        </p>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="QR Code MFA" className="rounded-lg w-48 h-48" />
        ) : (
          <div className="w-48 h-48 bg-[#29364e] rounded-lg animate-pulse" />
        )}
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Codice a 6 cifre"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="bg-[#29364e] text-white text-center text-xl tracking-widest rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg w-full transition"
        >
          {loading ? "Verifica..." : "Attiva MFA"}
        </button>
      </div>
    </div>
  );
}
