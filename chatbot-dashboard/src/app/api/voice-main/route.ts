// src/app/api/voice-main/route.ts
import { NextRequest } from "next/server";
import { twiml } from "twilio";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get("lang") || "es-ES";

  const formData = await req.formData();
  const to = formData.get("To")?.toString();
  const voiceNumber = to?.replace(/^tel:|^whatsapp:/, "").trim();

  const response = new twiml.VoiceResponse();

  try {
    const result = await pool.query(
      "SELECT * FROM tenants WHERE twilio_voice_number = $1",
      [voiceNumber]
    );
    const tenant = result.rows[0];

    if (!tenant) {
      response.say(
        { voice: "alice", language: language as any },
        language === "en-US"
          ? "Sorry, this number is not assigned to any business."
          : "Este número no está asignado a ningún negocio."
      );
      return new Response(response.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const voice = tenant.voice_name || "alice";

    const promptRes = await pool.query(
      `SELECT welcome_message, voice_hints FROM prompts 
       WHERE tenant_id = $1 AND canal = 'voz' AND idioma = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [tenant.id, language]
    );

    const welcomeMessage =
      promptRes.rows[0]?.welcome_message ||
      (language === "en-US"
        ? "Welcome! Please speak after the beep."
        : "Hola, gracias por llamar. Por favor diga su pregunta después del tono.");

    const voiceHints =
      promptRes.rows[0]?.voice_hints ||
      (language === "en-US"
        ? "price, appointment, hours, services, booking"
        : "precio, cita, horario, servicios, reservar");

    response.say({ voice, language: language as any }, welcomeMessage);

    response.gather({
      input: "speech" as any,
      action: "/api/voice-response",
      method: "POST",
      language: language as any,
      speechTimeout: "auto",
      hints: voiceHints,
    });    

    return new Response(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });

  } catch (error) {
    console.error("❌ Error en /api/voice-main:", error);
    response.say(
      { voice: "alice", language: language as any },
      language === "en-US"
        ? "There was an error processing your call."
        : "Hubo un error procesando la llamada."
    );
    return new Response(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
