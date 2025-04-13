"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { TenantContext } from "@/context/TenantContext";
import MobileMenuButton from "@/components/MobileMenuButton";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const res = await fetchWithAuth(`/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setTenant(data);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar fijo */}
      <Sidebar
        user={user}
        tenant={tenant}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenido principal */}
      <TenantContext.Provider value={tenant}>
        <div className="flex-1 lg:ml-72">
          {/* Header para móvil */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
          <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <p className="text-white text-lg font-semibold">Panel AI</p>
          </div>

          <main className="p-6">{children}</main>
        </div>
      </TenantContext.Provider>
    </div>
  );
}
