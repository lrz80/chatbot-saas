"use client";

import { useState } from "react";
import { SiGmail } from "react-icons/si";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import TrainingHelp from "@/components/TrainingHelp";

const SEGMENTOS = [
  { id: "cliente", label: "Cliente" },
  { id: "nuevos", label: "Nuevos" },
  { id: "leads", label: "Leads" },
  { id: "otros", label: "Otros" },
];

export default function CampaignsClient() {
  const [form, setForm] = useState<{
    nombre: string;
    canal: string;
    contenido: string;
    fecha_envio: string;
    imagen: File | null;
    segmentos: string[];
  }>({
    nombre: "",
    canal: "whatsapp",
    contenido: "",
    fecha_envio: "",
    imagen: null,
    segmentos: [],
  });

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showSegmentos, setShowSegmentos] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      setForm((prev) => ({ ...prev, imagen: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleSegmento = (id: string) => {
    setForm((prev) => ({
      ...prev,
      segmentos: prev.segmentos.includes(id)
        ? prev.segmentos.filter((s) => s !== id)
        : [...prev.segmentos, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.contenido || !form.fecha_envio || form.segmentos.length === 0) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === "segmentos") {
        data.append("segmentos", JSON.stringify(val));
      } else if (key === "imagen" && val) {
        data.append("imagen", val as File);
      } else {
        data.append(key, val as string);
      }
    });

    const res = await fetchWithAuth("/api/campaigns", {
      method: "POST",
      body: data,
    });

    if (res.ok) {
      const nueva = await res.json();
      setCampaigns((prev) => [nueva, ...prev]);
      setForm({
        nombre: "",
        canal: "whatsapp",
        contenido: "",
        fecha_envio: "",
        imagen: null,
        segmentos: [],
      });
      alert("✅ Campaña guardada");
    } else {
      alert("❌ Error al guardar");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <SiGmail className="text-[#D14836]" size={28} />
        Crear nueva campaña
      </h2>

      <TrainingHelp context="campaign" />

      <label className="block mb-2 font-medium">📝 Nombre de la campaña</label>
      <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        className="w-full mb-4 p-2 rounded bg-white/10 border border-white/20"
      />

      <label className="block mb-2 font-medium">📲 Canal</label>
      <select
        name="canal"
        value={form.canal}
        onChange={handleChange}
        className="w-full mb-4 p-2 rounded bg-white/10 border border-white/20"
      >
        <option value="whatsapp">WhatsApp</option>
        <option value="sms">SMS</option>
        <option value="email">Correo Electrónico</option>
      </select>

      <label className="block mb-2 font-medium">💬 Contenido del mensaje</label>
      <textarea
        name="contenido"
        value={form.contenido}
        onChange={handleChange}
        rows={4}
        className="w-full mb-4 p-2 rounded bg-white/10 border border-white/20"
      />

      <label className="block mb-2 font-medium">🖼️ Imagen (opcional)</label>
      <input
        name="imagen"
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="mb-4"
      />

      <label className="block mb-2 font-medium">📅 Fecha y hora de envío</label>
      <input
        name="fecha_envio"
        type="datetime-local"
        value={form.fecha_envio}
        onChange={handleChange}
        className="w-full mb-6 p-2 rounded bg-white/10 border border-white/20"
      />

      <div className="mb-6">
        <button
          onClick={() => setShowSegmentos((s) => !s)}
          className="mb-2 text-indigo-300 underline hover:text-indigo-400"
        >
          {showSegmentos ? "🔽 Ocultar segmentos" : "▶️ Elegir segmentos"}
        </button>
        {showSegmentos && (
          <div className="grid grid-cols-2 gap-2 border border-white/10 bg-white/5 rounded p-4">
            {SEGMENTOS.map((seg) => (
              <label key={seg.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.segmentos.includes(seg.id)}
                  onChange={() => toggleSegmento(seg.id)}
                />
                {seg.label}
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 font-semibold"
      >
        Programar campaña
      </button>

      <hr className="my-10 border-white/20" />

      <h2 className="text-xl font-bold mb-4">📊 Estadísticas de campañas enviadas</h2>

      {campaigns.length === 0 ? (
        <p className="text-white/70">Aún no se han enviado campañas.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full table-auto bg-white/5 border border-white/10 rounded-lg text-white">
            <thead>
              <tr className="text-left text-white/80 bg-white/10">
                <th className="p-3">📝 Nombre</th>
                <th className="p-3">📲 Canal</th>
                <th className="p-3">📅 Fecha</th>
                <th className="p-3">👥 Segmentos</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t border-white/10 hover:bg-white/10">
                  <td className="p-3">{c.nombre}</td>
                  <td className="p-3 capitalize">{c.canal}</td>
                  <td className="p-3">{new Date(c.fecha_envio).toLocaleString()}</td>
                  <td className="p-3">{c.segmentos?.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
