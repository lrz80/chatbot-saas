"use client";

import "@/lib/firebase"; // 👈 ESTE
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function FirebaseTokenTest() {
  const [token, setToken] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken(true);
        setToken(idToken);
        console.log("🟢 TOKEN:", idToken);

        try {
          const res = await fetch("/api/meta-config", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          const data = await res.json();
          console.log("🔄 Respuesta del backend:", data);
          setResponse(data);
        } catch (error) {
          console.error("❌ Error al llamar al backend:", error);
        }
      } else {
        console.warn("⚠️ Usuario no autenticado");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="text-white p-8">
      <h1 className="text-xl font-bold mb-4">🔍 Test Firebase + Backend</h1>
      {token ? (
        <>
          <p><strong>Token parcial:</strong> {token.slice(0, 40)}...</p>
          <pre className="bg-white/10 p-4 mt-4 rounded text-xs">
            {JSON.stringify(response, null, 2)}
          </pre>
        </>
      ) : (
        <p>⏳ Esperando autenticación...</p>
      )}
    </div>
  );
}
