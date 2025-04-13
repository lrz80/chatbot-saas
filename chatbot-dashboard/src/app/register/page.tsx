"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setDoc(doc(db, "usuarios", cred.user.uid), {
        uid: cred.user.uid,
        ...formData,
        creado: new Date(),
        rol: "usuario",
        activo: true,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Error al crear la cuenta. Verifica los datos.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md space-y-4 text-white"
      >
        <h2 className="text-2xl font-bold text-center text-purple-400">Crear cuenta</h2>

        {error && (
          <p className="text-red-400 bg-red-950 border border-red-600 p-2 rounded text-sm text-center">
            {error}
          </p>
        )}

        <div className="flex gap-4">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-white/10 placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            name="apellido"
            type="text"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-white/10 placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-white/10 placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <input
          name="telefono"
          type="tel"
          placeholder="Número de teléfono (ej: +14120000000)"
          value={formData.telefono}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-white/10 placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <input
          name="password"
          type="password"
          placeholder="Contraseña segura"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-white/10 placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold transition duration-200"
        >
          Registrarse
        </button>

        <p className="text-center text-sm text-white/60 mt-2">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-purple-400 hover:text-purple-300 underline">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  );
}
