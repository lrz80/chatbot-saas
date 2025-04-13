"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function FacebookCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        alert("No se encontró el código de autorización.");
        return router.push("/dashboard/meta-config");
      }

      // Esperar hasta 5 segundos por auth.currentUser
      let fbUser = auth.currentUser;
      let attempts = 0;
      while (!fbUser && attempts < 10) {
        await new Promise((r) => setTimeout(r, 500));
        fbUser = auth.currentUser;
        attempts++;
      }

      // Fallback dev: login manual si no autenticado
      if (!fbUser && process.env.NODE_ENV === "development") {
        const email = prompt("🔐 Email para login Firebase:");
        const pass = prompt("🔐 Password:");
        try {
          const cred = await signInWithEmailAndPassword(auth, email!, pass!);
          fbUser = cred.user;
        } catch (err) {
          alert("⚠️ Login fallido.");
          return router.push("/dashboard/meta-config");
        }
      }

      if (!fbUser) {
        alert("⚠️ Usuario no autenticado. Inicia sesión e intenta de nuevo.");
        return router.push("/dashboard/meta-config");
      }

      try {
        const idToken = await fbUser.getIdToken();

        const res = await fetch(`/api/meta/connect?code=${code}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Error en conexión:", data);
          alert("❌ Error al conectar cuentas de Facebook/Instagram.");
          return router.push("/dashboard/meta-config");
        }

        alert("✅ Facebook e Instagram conectados correctamente.");
        router.push("/dashboard/meta-config");
      } catch (err) {
        console.error("❌ Error inesperado:", err);
        alert("❌ Falló el proceso de conexión.");
        router.push("/dashboard/meta-config");
      }
    };

    run();
  }, []);

  return (
    <div className="text-center mt-20 text-white">
      Procesando conexión automática con Facebook e Instagram...
    </div>
  );
}
