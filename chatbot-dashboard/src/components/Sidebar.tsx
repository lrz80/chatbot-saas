"use client";
import {
  FiHome,
  FiUser,
  FiMessageCircle,
  FiLogOut,
  FiMic,
  FiMail,
} from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import ClientOnly from "./ClientOnly";

export default function Sidebar({ user, tenant, onLogout, isOpen, onClose }: any) {
  return (
    <>
      {/* Fondo oscuro al abrir en móvil */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-[#5b21b6]/40 to-[#9333ea]/30 backdrop-blur-xl border-r border-white/10 shadow-[0_0_20px_2px_rgba(147,51,234,0.3)] text-white p-6 z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Usuario y branding */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-white/20 text-white font-bold flex items-center justify-center rounded-full text-xl shadow-inner">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm text-white/70">Bienvenido</p>
              <p className="font-semibold text-lg leading-tight">
                {tenant?.owner_name || "Usuario"}
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-6 text-purple-300">Panel AI</h2>

          <nav className="space-y-2 text-sm font-medium">
            {[
              { href: "/dashboard", icon: <FiHome />, label: "Inicio" },
              { href: "/dashboard/profile", icon: <FiUser />, label: "Perfil del Negocio" },
              { href: "/dashboard/training", icon: <FiMessageCircle />, label: "Asistente de WhatsApp" },
              { href: "/dashboard/meta-config", icon: <FaFacebookF size={16} />, label: "Facebook Messenger" },
              { href: "/dashboard/voice-config", icon: <FiMic />, label: "Asistente de Voz" },
              { href: "/dashboard/campaigns", icon: <FiMail />, label: "Campañas de Marketing" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 hover:pl-5 transition-all rounded-lg group"
              >
                <span className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Botón de cierre de sesión */}
        <div className="mt-8">
          <ClientOnly>
            <button
              onClick={onLogout}
              className="flex items-center gap-3 p-2 hover:bg-red-600/80 bg-white/5 rounded w-full text-left transition-all"
            >
              <FiLogOut />
              Cerrar sesión
            </button>
          </ClientOnly>
        </div>
      </aside>
    </>
  );
}
