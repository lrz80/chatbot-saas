// src/app/api/voice-response/route.ts
import { NextRequest } from "next/server";
import { twiml } from "twilio";
import { OpenAI } from "openai";
import pool from "@/lib/db";
import { promptTemplates } from "@/utils/promptTemplates";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const to = formData.get("To")?.toString() ?? "";
  const speech = formData.get("SpeechResult")?.toString() ?? "No entendí.";

  const voiceResponse = new twiml.VoiceResponse();

  try {
    const voiceNumber = to.replace(/^tel:|^whatsapp:/, "").trim();

    const result = await pool.query(
      "SELECT * FROM tenants WHERE twilio_voice_number = $1",
      [voiceNumber]
    );

    const tenant = result.rows[0];

    if (!tenant) {
      voiceResponse.say(
        { voice: "alice" as any, language: "es-ES" as any },
        "Lo sentimos, este número no está asignado."
      );
      return new Response(voiceResponse.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const voice = tenant.voice_name ?? "alice";
    const language = tenant.voice_language ?? "es-ES";

    const mensajesError = {
      "es-ES": {
        fallback: "Hubo un error al procesar la llamada.",
      },
      "en-US": {
        fallback: "There was an error processing the call.",
      },
    };

    const msgError = mensajesError[language] || mensajesError["es-ES"];

    // Prompt personalizado
    const promptResult = await pool.query(
      `SELECT system_prompt, welcome_message FROM prompts 
       WHERE tenant_id = $1 AND canal = 'voz' AND idioma = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [tenant.id, language]
    );

    const systemPrompt =
      promptResult.rows[0]?.system_prompt ??
      promptTemplates[tenant.categoria]?.prompt ??
      (language === "en-US"
        ? "You are a helpful assistant who responds clearly by voice."
        : "Eres un asistente útil que responde con voz clara y concisa.");

    const welcomeMessage = promptResult.rows[0]?.welcome_message;

    if (welcomeMessage) {
      voiceResponse.say({ voice: voice as any, language: language as any }, welcomeMessage);
    }

    const ai = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: speech },
      ],
    });

    const respuesta = ai.choices[0].message.content ?? msgError.fallback;

    voiceResponse.say({ voice: voice as any, language: language as any }, respuesta);

    await pool.query(
      "INSERT INTO messages (tenant_id, sender, content, canal) VALUES ($1, $2, $3, $4), ($1, $5, $6, $4)",
      [tenant.id, "user", speech, "voice", "assistant", respuesta]
    );

    return new Response(voiceResponse.toString(), {
      headers: { "Content-Type": "text/xml" },
    });

  } catch (error) {
    console.error("❌ Error en /api/voice-response:", error);
    voiceResponse.say(
      { voice: "alice" as any, language: "es-ES" as any },
      "Error interno en el sistema."
    );
    return new Response(voiceResponse.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
