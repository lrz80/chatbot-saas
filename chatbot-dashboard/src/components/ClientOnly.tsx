"use client";
import { useEffect, useState } from "react";

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("🟡 ClientOnly montado");
    setMounted(true);
  }, []);

  if (!mounted) {
    console.log("🔴 No montado todavía");
    return <div className="text-white p-10">Cargando desde ClientOnly...</div>;
  }

  return <>{children}</>;
}



