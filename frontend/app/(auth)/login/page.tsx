"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  return (
    <div className="w-screen h-screen bg-[#0d1b2a] flex items-center justify-center">
      <div className="bg-[#1B263B] rounded-lg p-10 flex flex-col items-center gap-6 shadow-2xl w-full max-w-sm">
        <h1 className="text-white text-3xl font-bold tracking-widest">TODO</h1>
        <p className="text-gray-400 text-sm">Accedi per continuare</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/verify-mfa" })}
          className="flex items-center gap-3 bg-white text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition w-full justify-center"
        >
          <FcGoogle size={22} />
          Accedi con Google
        </button>
      </div>
    </div>
  );
}
