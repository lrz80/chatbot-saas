"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return router.push("/login");
      setUser(user);
    });
    return () => unsub();
  }, [router]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setLoading(true);
    setInput("");

    const res = await fetch("/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: input }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.respuesta }]);
    setLoading(false);
  };
  const handleRegenerate = async () => {
    const lastUserMsg = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "user");
  
    if (!lastUserMsg) return;
  
    setLoading(true);
  
    const res = await fetch("/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: lastUserMsg.content }),
    });
  
    const data = await res.json();
  
    setMessages((prev) => [...prev, { role: "assistant", content: data.respuesta }]);
    setLoading(false);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-indigo-600 mb-4">💬 Vista previa del Asistente</h2>

      <div className="bg-gray-50 p-4 rounded h-80 overflow-y-auto flex flex-col gap-3 mb-4">
        {messages.length === 0 && <p className="text-gray-400 text-sm">Escribe un mensaje para iniciar la prueba.</p>}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-3 rounded-lg text-sm ${
              msg.role === "user"
                ? "bg-indigo-100 self-end text-right"
                : "bg-green-100 self-start text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <p className="text-gray-500 text-sm">⏳ Generando respuesta...</p>}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe algo..."
          className="flex-1 border p-3 rounded"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Enviar
        </button>
        <button
          onClick={handleRegenerate}
          disabled={loading || messages.length === 0}
          className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          🔁 
        </button>
      </div>
    </div>
  );
}
