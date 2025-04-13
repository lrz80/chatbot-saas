"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const [form, setForm] = useState({
    name: "",
    categoria: "",
    idioma: "es",
    prompt: "Eres un asistente útil.",
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const res = await fetchWithAuth("/api/settings");
        const data = await res.json();

        setForm({
          name: data.name || "",
          categoria: data.categoria || "",
          idioma: data.idioma || "es",
          prompt: data.prompt || "Eres un asistente útil.",
        });

        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setSaving(true);
    await fetchWithAuth("/api/settings", {
      method: "POST",
      body: JSON.stringify({ ...form, uid: user.uid, onboarding_completado: true }),
    });
    setSaving(false);
    setFinished(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 2500);
  };

  if (loading) return <p className="text-center p-6">Cargando...</p>;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600">🚀 Configura tu asistente AI</h2>

      {finished ? (
        <div className="text-center">
          <p className="text-xl mb-2">🎉 ¡Tu Asistente ya está listo!</p>
          <p className="text-gray-600">Te estamos redirigiendo a tu panel...</p>
        </div>
      ) : step === 1 ? (
        <div>
          <label className="block font-medium mb-1">Nombre del negocio</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block font-medium mb-1">Categoría</label>
          <input
            type="text"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block font-medium mb-1">Idioma</label>
          <select
            name="idioma"
            value={form.idioma}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-6"
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>

          <button
            onClick={() => setStep(2)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Siguiente
          </button>
        </div>
      ) : (
        <div>
          <label className="block font-medium mb-1">🧠 Prompt del Asistente</label>
          <textarea
            name="prompt"
            value={form.prompt}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border rounded mb-4"
          />

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-indigo-600 hover:underline"
            >
              ⬅ Volver
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {saving ? "Guardando..." : "Finalizar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
