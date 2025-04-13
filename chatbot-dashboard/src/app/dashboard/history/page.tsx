"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { format } from "date-fns";
import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/fetchWithAuth";


export default function MessageHistory() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canal, setCanal] = useState(""); // "" = todos los canales
  const [conteo, setConteo] = useState<{ whatsapp: number; facebook: number; voice: number }>({
    whatsapp: 0,
    facebook: 0,
    voice: 0,
  });  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const res = await fetchWithAuth(`/api/messages?canal=${canal}`);
        const data = await res.json();
        setMessages(data);
        setLoading(false);

        // Calcular conteo de mensajes por canal
        const whatsappCount = data.filter((m: any) => m.canal === "whatsapp").length;
        const facebookCount = data.filter((m: any) => m.canal === "facebook").length;
        const voiceCount = data.filter((m: any) => m.canal === "voice").length;

        setConteo({ whatsapp: whatsappCount, facebook: facebookCount, voice: voiceCount });
      }
    });
    return () => unsubscribe();
  }, [canal]);

  return (
    <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-md p-8">
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-md p-8">
  
        <h2 className="text-3xl font-bold mb-6 text-indigo-300">🕓 Historial de Interacciones</h2>
  
        <div className="mb-4 text-sm text-white/70">
          📲 WhatsApp ({conteo.whatsapp}) | 💬 Facebook ({conteo.facebook}) | 📞 Voz ({conteo.voice})
        </div>
  
        <div className="mb-6">
          <label className="text-sm font-medium text-white mr-2">Filtrar por canal:</label>
          <div className="inline-flex items-center bg-white/10 border border-white/30 rounded">
            <select
              value={canal}
              onChange={(e) => setCanal(e.target.value)}
              className="bg-transparent text-white px-4 py-2 rounded appearance-none focus:outline-none"
            >
              <option value="">🌐 Todos</option>
              <option value="whatsapp">📲 WhatsApp</option>
              <option value="facebook">💬 Facebook</option>
              <option value="voice">📞 Voz</option>
            </select>
          </div>
        </div>
  
        {loading ? (
          <p className="text-center text-white/60">Cargando mensajes...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-white/50">No hay mensajes recientes.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-xl shadow text-sm ${
                    msg.sender === "user"
                      ? "bg-white/20 text-white"
                      : "bg-indigo-500/70 text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs mt-1 text-right text-white/70">
                  {msg.canal?.toUpperCase() || "WHATSAPP"} • {format(new Date(msg.timestamp), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );  
}
