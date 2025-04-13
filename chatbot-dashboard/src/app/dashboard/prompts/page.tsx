"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchWithAuth } from "@/lib/fetchWithAuth"; // 👈 IMPORTANTE

export default function PromptsPage() {
  const [user, setUser] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        const res = await fetchWithAuth("/api/prompt");
        const data = await res.json();
        setPrompt(data?.system_prompt || "");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    await fetchWithAuth("/api/prompt", {
      method: "POST",
      body: JSON.stringify({
        system_prompt: prompt,
      }),
    });

    setSaving(false);
    alert("Prompt actualizado ✅");
  };

  if (loading) return <p>Cargando prompt...</p>;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-md p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">🧠 Configurar Prompt del Asistente</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={8}
        className="w-full p-4 rounded border border-white/20 bg-white/5 text-white placeholder-white/50 mb-4"
        placeholder="Escribe aquí el prompt personalizado del negocio..."
      />

      <button
        onClick={handleSave}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        disabled={saving}
      >
        {saving ? "Guardando..." : "Guardar Prompt"}
      </button>
    </div>
  );
}
