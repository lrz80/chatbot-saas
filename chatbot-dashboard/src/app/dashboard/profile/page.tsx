"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { BriefcaseIcon } from "@heroicons/react/24/outline"; // ✅ NUEVO ÍCONO PRO

export default function BusinessProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const res = await fetchWithAuth("/api/settings");
        if (!res.ok) {
          console.error("❌ Error al cargar settings:", res.status);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setTenant(data);
        setLoading(false);
        setFormData({
          ...data,
          tenant_id: data.id,
        });
      } else {
        // 🔐 Redirige si no está logueado
        router.push("/login");
      }
    });    

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) alert("✅ Cambios guardados correctamente");
      else alert("❌ Error al guardar cambios");
    } catch (err) {
      console.error(err);
      alert("❌ Error en la conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center text-white">Cargando información del negocio...</p>;

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-black/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <BriefcaseIcon className="h-8 w-8 text-indigo-300" />
        <h2 className="text-2xl font-bold text-indigo-300">Perfil del Negocio</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
        {/* Campos principales */}
        {[
          { label: "Nombre del Negocio", name: "name", type: "text" },
          { label: "Horario de Atención", name: "horario_atencion", type: "text" },
          { label: "Categoría del Negocio", name: "categoria", type: "text" }
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="text-sm text-indigo-200 font-semibold">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        ))}

        {/* Email del Admin */}
        <div>
          <label className="text-sm text-indigo-200 font-semibold">Correo del Administrador</label>
          <input
            value={user?.email}
            disabled
            className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-md text-gray-400"
          />
        </div>

        {/* Twilio Info */}
        {[
          { label: "Número de Twilio", value: tenant.twilio_number },
          { label: "Número SMS de Twilio", value: tenant.twilio_sms_number || "No asignado" }
        ].map(({ label, value }, i) => (
          <div key={i}>
            <label className="text-sm text-indigo-200 font-semibold">{label}</label>
            <input
              value={value}
              readOnly
              className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-md text-gray-400"
            />
          </div>
        ))}

        {/* Selector de idioma */}
        <div>
          <label className="text-sm text-indigo-200 font-semibold">Idioma del Asistente</label>
          <select
            name="voice_language"
            value={formData.voice_language || ""}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-md text-white"
          >
            <option value="es-ES">Español</option>
            <option value="en-US">Inglés</option>
          </select>
        </div>

        {/* Datos solo lectura */}
        <div>
          <p className="text-sm text-indigo-200 font-semibold">Plan Activo</p>
          <p className="text-lg text-white">{tenant.plan}</p>
        </div>

        <div>
          <p className="text-sm text-indigo-200 font-semibold">Fecha de Registro</p>
          <p className="text-lg text-white">{new Date(tenant.fecha_registro).toLocaleDateString()}</p>
        </div>

        {/* Membresía */}
        <div className="md:col-span-2">
          <p className="text-sm text-indigo-200 font-semibold">Estado de la Membresía</p>
          {tenant.membresia_activa ? (
            <p className="text-green-400 font-semibold">
              ✅ Activa hasta {new Date(tenant.membresia_vigencia).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-red-400 font-semibold">❌ Vencida</p>
          )}
        </div>
      </div>

      {!tenant?.membresia_activa && (
        <div className="mt-4 mb-2 p-4 bg-yellow-500/20 border border-yellow-400 text-yellow-200 rounded text-center font-medium">
          🚫 Tu membresía está inactiva. <a href="/dashboard/profile?upgrade=1" className="underline">Actívala para editar tus datos.</a>
        </div>
      )}

      {/* Botón */}
      <div className="mt-6 text-right">
      <button
        onClick={handleSave}
        disabled={saving || !tenant?.membresia_activa}
        className={`px-6 py-2 rounded-md shadow-lg transition text-white
          ${saving || !tenant?.membresia_activa
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"}
  `     }
      >
        {saving ? "Guardando..." : "Guardar Cambios"}
      </button>
      </div>
    </div>
  );
}
