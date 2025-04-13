"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { auth } from "@/lib/firebase";

function PageContent() {
  const [pages, setPages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      toast.error("Código de Facebook no encontrado.");
      return;
    }

    const fetchPages = async () => {
      const res = await fetch(`/api/facebook-auth?code=${code}`);
      const data = await res.json();

      if (res.ok) {
        setPages(data.pages || []);
      } else {
        toast.error("Error al obtener páginas de Facebook");
        router.push("/dashboard/meta-config");
      }
    };

    fetchPages();
  }, [code, router]);

  const handleConfirm = async () => {
    if (!selected) {
      toast.warning("Seleccioná una página para continuar");
      return;
    }

    try {
      const user = auth.currentUser;
      const token = user && (await user.getIdToken());

      const res = await fetch("/api/facebook-select-page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ page: selected }),
      });

      if (res.ok) {
        toast.success("✅ Página conectada correctamente");
        router.push("/dashboard/meta-config");
      } else {
        toast.error("❌ No se pudo guardar la página");
      }
    } catch (error) {
      console.error("❌ Error al confirmar selección:", error);
      toast.error("Ocurrió un error inesperado.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/10 border border-white/20 backdrop-blur-md p-8 mt-10 rounded-xl text-white">
      <h2 className="text-2xl font-bold mb-6">Seleccioná tu página de Facebook</h2>

      {pages.length === 0 ? (
        <p className="text-gray-400">Cargando páginas...</p>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <label
              key={page.id}
              className={`flex items-center gap-3 p-3 rounded cursor-pointer border transition-all ${
                selected?.id === page.id
                  ? "bg-blue-600 border-blue-400"
                  : "bg-white/5 border-white/20 hover:bg-white/10"
              }`}
            >
              <input
                type="radio"
                name="page"
                className="accent-blue-500"
                onChange={() => setSelected(page)}
                checked={selected?.id === page.id}
              />
              <span>{page.name}</span>
            </label>
          ))}

          <button
            onClick={handleConfirm}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Confirmar selección
          </button>
        </div>
      )}
    </div>
  );
}

export default function FacebookSelectPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Cargando selector...</div>}>
      <PageContent />
    </Suspense>
  );
}
