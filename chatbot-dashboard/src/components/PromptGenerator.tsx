"use client";

import { useState } from "react";
import { Sparkles, Info } from "lucide-react";
import { getAuth } from "firebase/auth"; // 👈 Importamos el Auth de Firebase

interface PromptGeneratorProps {
  informacion: string;
  idioma: string;
  membresiaActiva: boolean;
  onPromptGenerated: (prompt: string) => void;
}

export default function PromptGenerator({
  informacion,
  idioma,
  membresiaActiva,
  onPromptGenerated,
}: PromptGeneratorProps) {
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!membresiaActiva) {
      alert("Debes activar tu membresía para generar prompts.");
      return;
    }

    if (!descripcion.trim()) {
      alert("Por favor describe qué debe hacer el asistente.");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Debes iniciar sesión para generar prompts.");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const res = await fetch("/api/generar-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 👈 Token enviado
        },
        body: JSON.stringify({ descripcion, informacion, idioma }),
      });

      const data = await res.json();
      if (data.prompt) {
        onPromptGenerated(data.prompt);
      } else {
        alert("No se pudo generar el prompt.");
      }
    } catch (err) {
      console.error("Error generando prompt:", err);
      alert("Hubo un error al generar el prompt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <label className="block font-medium mb-1 flex items-center gap-2">
        <Sparkles size={18} className="text-purple-300" />
        ¿Qué debe hacer tu asistente?
      </label>
      <textarea
        placeholder="Ej: Atiende clientes, agenda citas, responde dudas sobre mis servicios..."
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={3}
        className="w-full p-3 border rounded mb-4 bg-white/10 border-white/20 text-white placeholder-white/50"
      />

      <label className="block font-medium mb-1 flex items-center gap-2">
        <Info size={18} className="text-teal-300" />
        Información que el Asistente debe conocer
      </label>
      <textarea
        value={informacion}
        readOnly
        rows={5}
        className="w-full p-3 border rounded mb-4 bg-white/10 border-white/20 text-white opacity-60 cursor-not-allowed"
        placeholder="Información del negocio cargada desde configuración..."
      />

      <button
        onClick={handleGenerate}
        disabled={!membresiaActiva || loading}
        className={`mt-2 px-4 py-2 rounded font-semibold ${
          membresiaActiva
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : "bg-gray-600 text-white/50 cursor-not-allowed"
        }`}
      >
        {loading ? "Generando..." : "Generar Prompt"}
      </button>
    </div>
  );
}
