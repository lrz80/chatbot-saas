/// <reference types="react" />
'use client';

import React, { JSX } from "react";
import HeroSection from "@/components/HeroSection";
import Marquee from "react-fast-marquee";
import {
  FaRobot,
  FaChartBar,
  FaWhatsapp,
  FaFacebookMessenger,
  FaInstagram,
  FaMicrophoneAlt,
  FaBullhorn,
} from "react-icons/fa";

// 🔥 Features con estilos y descripciones más claras
const features = [
  {
    icon: <FaRobot size={28} className="text-purple-400 drop-shadow" />,
    title: "Atención 24/7",
    description:
      "Ofrece atención constante con respuestas automáticas, incluso cuando no estás disponible. Tu negocio siempre conectado.",
  },
  {
    icon: <FaChartBar size={28} className="text-purple-300 drop-shadow" />,
    title: "Estadísticas en tiempo real",
    description:
      "Visualiza métricas, interacciones y rendimiento en tiempo real desde tu panel centralizado.",
  },
  {
    icon: <FaWhatsapp size={28} className="text-green-400 drop-shadow" />,
    title: "WhatsApp Integrado",
    description:
      "Responde automáticamente en WhatsApp con flujos inteligentes sin perder tiempo.",
  },
  {
    icon: <FaFacebookMessenger size={28} className="text-blue-400 drop-shadow" />,
    title: "Facebook Messenger",
    description:
      "Conecta tu página y automatiza respuestas con IA las 24 horas del día.",
  },
  {
    icon: <FaInstagram size={28} className="text-pink-400 drop-shadow" />,
    title: "Instagram DM",
    description:
      "Automatiza respuestas a mensajes directos en Instagram para atender consultas frecuentes.",
  },
  {
    icon: <FaMicrophoneAlt size={28} className="text-indigo-400 drop-shadow" />,
    title: "Asistente de Voz AI",
    description:
      "Atiende llamadas entrantes con voz natural y profesional, disponible 24/7.",
  },
  {
    icon: <FaBullhorn size={28} className="text-yellow-400 drop-shadow" />,
    title: "Campañas de Marketing",
    description:
      "Lanza campañas masivas automatizadas con promociones personalizadas.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0a1e] text-white">
      <HeroSection />

      {/* 🔁 Carrusel animado */}
      <section className="py-20 bg-[#0f0a1e] backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          ¿Qué puedes hacer con nuestro Asistente Virtual?
        </h2>
        <Marquee pauseOnHover speed={40} gradient={false}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </Marquee>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-indigo-950/40 text-center backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4 text-white">¿Listo para comenzar?</h2>
        <p className="mb-6 text-white/80 max-w-xl mx-auto">
          Activa tu membresía y desbloquea el potencial completo de tu Asistente Virtual para optimizar la atención al cliente de tu negocio.
        </p>
        <a href="/login">
          <button className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition">
            Accede al Panel
          </button>
        </a>
      </section>
    </div>
  );
}

// 🧩 Componente de Feature
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: JSX.Element;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-start bg-white/10 border border-white/10 backdrop-blur-md px-6 py-5 rounded-xl shadow-md hover:shadow-lg min-w-[260px] mx-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
      {icon}
      <h3 className="text-base font-semibold mt-2 text-center text-white">{title}</h3>
      <p className="text-sm text-white/70 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {description}
      </p>
    </div>
  );
}
