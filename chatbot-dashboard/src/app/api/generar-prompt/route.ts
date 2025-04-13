import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { verifyUserToken } from "@/lib/verifyToken"; // ✅ Helper común

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    await verifyUserToken(req); // 🔐 Solo validamos, sin guardar uid

    const { descripcion, informacion, idioma } = await req.json();

    if (!descripcion) {
      return NextResponse.json({ error: "Falta la descripción" }, { status: 400 });
    }

    const idiomaLabel =
      idioma === "en"
        ? "Generate the system prompt in English."
        : idioma === "pt"
        ? "Gere o prompt do sistema em português."
        : idioma === "fr"
        ? "Générez le prompt système en français."
        : "Genera el prompt del sistema en español."; // default

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Eres un generador experto de prompts de sistema para asistentes virtuales basados en IA (como ChatGPT).
Tu tarea es crear prompts claros y bien estructurados que le indiquen al modelo cómo comportarse en un entorno de atención al cliente.

🔹 El formato debe ser directo, comenzando con "Eres un asistente virtual para..."
🔹 El contenido debe indicar:
- Tipo de negocio
- Qué tareas debe realizar el asistente (responder preguntas, agendar, resolver dudas)
- El tono de respuesta (amable, profesional, breve, etc.)
- Acciones sugeridas (guiar al cliente a reservar, dejar su contacto, etc.)

❌ No generes textos publicitarios o en tono de redes sociales.
✅ Devuelve únicamente el prompt de sistema, sin introducciones ni explicaciones.

${idiomaLabel}
        `.trim(),
        },
        {
          role: "user",
          content: `Quiero un asistente que haga lo siguiente: ${descripcion}

Información importante que el asistente debe tener en cuenta para responder correctamente:
${informacion || "No se proporcionó información adicional."}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const prompt = completion.choices[0].message.content?.trim();
    return NextResponse.json({ prompt });
  } catch (err) {
    console.error("❌ Error en /api/generar-prompt:", err);
    return NextResponse.json({ error: "Error al generar el prompt" }, { status: 500 });
  }
}
