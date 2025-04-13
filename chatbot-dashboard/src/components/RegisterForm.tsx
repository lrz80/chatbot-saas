"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard/onboarding");
    } catch (error) {
      console.error("❌ Error al registrar usuario:", error);
      alert("Error al registrar usuario. Verifica el correo o contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? "Registrando..." : "Registrarme"}
        </button>
      </form>
    </div>
  );
}
