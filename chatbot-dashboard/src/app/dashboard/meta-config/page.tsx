"use client";

import { useEffect } from "react";
import { useTenant } from "@/context/TenantContext";
import { FaFacebookF } from "react-icons/fa";
import { useMetaConfig } from "@/hooks/useMetaConfig";
import TrainingHelp from "@/components/TrainingHelp";


const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_META_REDIRECT_URI!;

export default function MetaConfigPage() {
  const tenant = useTenant();

  const {
    config,
    setConfig,
    saveConfig,
    refreshConfig,
    loading,
    saving,
    error,
  } = useMetaConfig();

  const estadoFacebook =
    config.facebook_page_id && config.facebook_access_token
      ? "✅ Conectado a Facebook"
      : "❌ No conectado a Facebook";

  const estadoInstagram =
    config.instagram_business_account_id
      ? "✅ Conectado a Instagram"
      : "❌ No conectado a Instagram";

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=pages_messaging,pages_read_engagement,pages_manage_metadata,pages_show_list,pages_manage_posts,instagram_basic,instagram_manage_messages&response_type=code&state=${tenant?.id}`;

  useEffect(() => {
    const obtenerIGId = async () => {
      if (config.facebook_access_token && !config.instagram_business_account_id) {
        try {
          const res = await fetch("/api/instagram/fetch-id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: config.facebook_access_token }),
          });

          const data = await res.json();

          const page = data.pages?.find((p: any) => p.page_id === config.facebook_page_id);

          if (page?.ig_account_id) {
            setConfig({
              ...config,
              instagram_business_account_id: page.ig_account_id,
            });
          }
        } catch (err) {
          console.error("❌ Error obteniendo IG ID:", err);
        }
      }
    };

    obtenerIGId();
  }, [config.facebook_access_token, config.facebook_page_id]);

  if (loading) return <p className="text-white text-center">Cargando configuración...</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-md p-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaFacebookF className="text-[#1877F2]" size={28} />
        Configuración de Facebook e Instagram
      </h1>
      <TrainingHelp context="meta" />
      <a
        href={authUrl}
        className="inline-block mb-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      >
        Conectar con Facebook e Instagram
      </a>

      <div className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">📘 Nombre de la Página</label>
          <input
            type="text"
            name="facebook_page_name"
            value={config.facebook_page_name}
            readOnly
            className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">🆔 Page ID</label>
          <input
            type="text"
            name="facebook_page_id"
            value={config.facebook_page_id}
            readOnly
            className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">📸 Instagram Business ID</label>
          <input
            type="text"
            name="instagram_business_account_id"
            value={config.instagram_business_account_id || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white"
            placeholder="Ej: 1784..."
          />
        </div>

        {!config.facebook_access_token && (
          <div>
            <label className="block font-semibold mb-1">🔐 Access Token</label>
            <input
              type="password"
              name="facebook_access_token"
              value={config.facebook_access_token}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-white/5 border border-white/20"
              placeholder="EAAG..."
            />
          </div>
        )}

        <div>
          <label className="block font-semibold mb-1">👋 Mensaje de bienvenida</label>
          <input
            type="text"
            name="mensaje_bienvenida"
            value={config.mensaje_bienvenida}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white/5 border border-white/20"
            placeholder="¡Hola! ¿En qué puedo ayudarte hoy?"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">🧠 Prompt del sistema</label>
          <textarea
            name="prompt"
            value={config.prompt}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded bg-white/5 border border-white/20"
            placeholder="Eres un asistente útil..."
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">💡 Hints (palabras clave)</label>
          <input
            type="text"
            name="hints"
            value={config.hints}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white/5 border border-white/20"
            placeholder="precio, cita, horario..."
          />
        </div>

        <div className="mt-6 space-y-1 text-sm">
          <p><strong>Estado Facebook:</strong> {estadoFacebook}</p>
          <p><strong>Estado Instagram:</strong> {estadoInstagram}</p>
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          {saving ? "Guardando..." : "Guardar Configuración"}
        </button>
      </div>
    </div>
  );
}
