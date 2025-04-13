"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { toast } from "react-toastify";

type MetaConfig = {
  facebook_page_id: string;
  facebook_page_name: string;
  facebook_access_token: string;
  instagram_business_account_id?: string;
  mensaje_bienvenida: string;
  prompt: string;
  hints: string;
};

export function useMetaConfig() {
  const [config, setConfig] = useState<MetaConfig>({
    facebook_page_id: "",
    facebook_page_name: "",
    facebook_access_token: "",
    instagram_business_account_id: "",
    mensaje_bienvenida: "",
    prompt: "Eres un asistente útil.",
    hints: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async (user: User) => {
    try {
      const token = await user.getIdToken(true);
      console.log("✅ TOKEN:", token);

      const res = await fetch("/api/meta-config", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setConfig({
          facebook_page_id: data.facebook_page_id || "",
          facebook_page_name: data.facebook_page_name || "",
          facebook_access_token: data.facebook_access_token || "",
          instagram_business_account_id: data.instagram_business_account_id || "",
          mensaje_bienvenida: data.mensaje_bienvenida || "",
          prompt: data.prompt || "Eres un asistente útil.",
          hints: data.hints || "",
        });
      } else {
        setError(data.error || "Error al cargar configuración");
        toast.error(data.error || "❌ No se pudo cargar la configuración");
      }
    } catch (err) {
      console.error("❌ Error de red:", err);
      toast.error("❌ Error al conectar");
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("🟢 Usuario autenticado:", user.email);
        fetchConfig(user);
      } else {
        console.warn("⚠️ Usuario no autenticado");
        toast.warning("⚠️ No estás autenticado");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const user = getAuth().currentUser;
      if (!user) {
        toast.error("⚠️ No estás autenticado");
        setSaving(false);
        return;
      }

      const token = await user.getIdToken(true);

      const res = await fetch("/api/meta-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Configuración guardada");
      } else {
        toast.error(data.error || "❌ Error al guardar");
      }
    } catch (err) {
      console.error("❌ Error al guardar:", err);
      toast.error("❌ Error de red");
    } finally {
      setSaving(false);
    }
  };

  return {
    config,
    setConfig,
    saveConfig,
    refreshConfig: () => {
      const user = getAuth().currentUser;
      if (!user) return;
      fetchConfig(user);
    },    
    loading,
    saving,
    error,
  };
}
