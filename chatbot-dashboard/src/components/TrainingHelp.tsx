// src/components/TrainingHelp.tsx
"use client";

import { useState } from "react";
import {
  FaRobot,
  FaFacebookF,
  FaInstagram,
  FaMicrophoneAlt,
  FaBullhorn,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

interface Props {
  context: "training" | "meta" | "voice" | "campaign";
}

export default function TrainingHelp({ context }: Props) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  const contextTitles: Record<Props["context"], string> = {
    training: "¿Cómo entrenar tu asistente?",
    meta: "¿Cómo funciona la integración con Facebook e Instagram?",
    voice: "¿Cómo configurar tu asistente por voz?",
    campaign: "¿Cómo crear una campaña automatizada?",
  };

  return (
    <div className="mb-6">
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full bg-white/10 text-white px-4 py-3 rounded-md font-semibold hover:bg-white/20 transition border border-white/20"
      >
        <span className="flex items-center gap-2">
          {context === "training" && <FaRobot className="text-indigo-400" />}
          {context === "meta" && <FaFacebookF className="text-[#1877F2]" />}
          {context === "voice" && <FaMicrophoneAlt className="text-purple-400" />}
          {context === "campaign" && <FaBullhorn className="text-pink-400" />}
          {contextTitles[context]}
        </span>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {open && (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white space-y-3">
          {context === "training" && (
            <ul className="list-disc list-inside space-y-2">
              <li><strong>¿Qué debe hacer tu asistente?</strong> Describe sus funciones principales.</li>
              <li><strong>Información que el Asistente debe conocer:</strong> servicios, precios, links, etc.</li>
              <li><strong>Prompt del sistema:</strong><br />
                Define el comportamiento del Asistente. Ejemplo: <em>“Eres un asistente amable, claro y profesional.”</em><br />
                Puedes escribir tu propio prompt o generarlo automáticamente con la ayuda de <strong>Amy</strong>,
                usando la información de <em>¿Qué debe hacer tu asistente?</em> e <em>Información que el Asistente debe conocer</em>.
                </li>
              <li><strong>Mensaje de bienvenida:</strong> El primer mensaje que ve el usuario.</li>
              <li><strong>Información del negocio:</strong> Datos esenciales que el Asistente puede usar.</li>
              <li><strong>Preguntas frecuentes:</strong> Respuestas automáticas a dudas comunes.</li>
              <li><strong>Entrenamiento por intención:</strong> Enséñale a responder frases específicas.</li>
              <li><strong>Vista previa:</strong> Prueba el comportamiento del Asistente en tiempo real.</li>
            </ul>
          )}

          {context === "meta" && (
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Conexión:</strong> Vincula tu página de Facebook e Instagram Business.</li>
              <li><strong>Mensaje de bienvenida:</strong> Respuesta automática al iniciar conversación.</li>
              <li><strong>Prompt del sistema:</strong> Instrucción que el Asistente usa para saber cómo debe hablar, qué información tiene sobre tu negocio (horario, servicios, tono de atención) y cómo responder a tus clientes.</li>
              <li><strong>Palabras clave:</strong> Ayudan al Asistente a reconocer temas importantes.</li>
            </ul>
          )}

          {context === "voice" && (
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Idioma:</strong> Idioma principal para llamadas.</li>
              <li><strong>Prompt del sistema:</strong> Instrucción que el Asistente usa para saber cómo debe hablar, qué información tiene sobre tu negocio (horario, servicios, tono de atención) y cómo responder a tus clientes.</li>
              <li><strong>Mensaje de bienvenida:</strong> Introducción cuando el usuario llama.</li>
              <li><strong>Voz de Twilio:</strong> Selección de voz que se usará en las llamadas.</li>
              <li><strong>Hints:</strong> Palabras clave que debe entender con claridad.</li>
              <li><strong>Vista previa:</strong> Llamada de prueba para escuchar la voz.</li>
            </ul>
          )}

          {context === "campaign" && (
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Nombre:</strong> Identifica tu campaña fácilmente.</li>
              <li><strong>Segmentación:</strong> A quién se le enviará (clientes, nuevos, etc.).</li>
              <li><strong>Canal:</strong> WhatsApp, Email o SMS.</li>
              <li><strong>Mensaje:</strong> Contenido que se enviará automáticamente.</li>
              <li><strong>Horario:</strong> Define cuándo lanzar la campaña.</li>
              <li><strong>Estadísticas:</strong> Visualiza resultados y conversiones.</li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
