import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import twilio from "twilio";
import pool from "@/lib/db";
import { promptTemplates } from "../../../utils/promptTemplates";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: NextRequest) {
  try {
    console.log("📩 Webhook recibido de Twilio");

    const body = await req.formData();
    const message = body.get("Body") as string;
    const from = body.get("From") as string;
    const to = body.get("To") as string;
    const canal = "whatsapp";

    console.log("From:", from);
    console.log("To:", to);
    console.log("Mensaje:", message);

    // Buscar tenant por número Twilio
    const negocio = await pool.query(
      "SELECT * FROM tenants WHERE twilio_number = $1",
      [to.replace("whatsapp:", "")]
    );

    if (negocio.rows.length === 0) {
      console.log("❌ Negocio no encontrado para el número:", to);
      return NextResponse.json({ status: "negocio_no_encontrado" });
    }

    const tenant = negocio.rows[0];

    // 🟢 Bienvenida automática si es el primer mensaje
    const yaSaludo = await pool.query(
      "SELECT * FROM clientes WHERE tenant_id = $1 AND canal = $2 AND contacto = $3",
      [tenant.id, canal, from]
    );

    if (yaSaludo.rows.length === 0) {
      const bienvenida = tenant.mensaje_bienvenida || "¡Hola! ¿En qué puedo ayudarte hoy?";

      // Enviar bienvenida
      await twilioClient.messages.create({
        body: bienvenida,
        from: to,
        to: from,
      });

      // Guardar cliente nuevo
      await pool.query(
        "INSERT INTO clientes (tenant_id, canal, contacto) VALUES ($1, $2, $3)",
        [tenant.id, canal, from]
      );

      // Guardar mensaje de bienvenida
      await pool.query(
        "INSERT INTO messages (tenant_id, sender, content, canal, timestamp) VALUES ($1, 'assistant', $2, $3, NOW())",
        [tenant.id, bienvenida, canal]
      );
    }

    // Obtener intents personalizadas del negocio
    const intentsRes = await pool.query(
      "SELECT * FROM intents WHERE tenant_id = $1",
      [tenant.id]
    );
    const intents = intentsRes.rows;

    // Buscar coincidencia en frases de ejemplo
    for (const intent of intents) {
      const match = intent.ejemplos.find((ej: string) =>
        message.toLowerCase().includes(ej.toLowerCase())
      );

      if (match) {
        console.log(`🎯 Coincidencia con intención: ${intent.nombre}`);

        // Responder directamente con la intención
        await twilioClient.messages.create({
          body: intent.respuesta,
          from: to,
          to: from,
        });

        // Guardar ambos mensajes
        await pool.query(
          `INSERT INTO messages (tenant_id, sender, content, canal, timestamp)
           VALUES ($1, 'user', $2, $3, NOW()), ($1, 'assistant', $4, $3, NOW())`,
          [tenant.id, message, canal, intent.respuesta]
        );

        return NextResponse.json({ status: "match_intent" });
      }
    }

    // Buscar prompt personalizado
    const promptRes = await pool.query(
      "SELECT * FROM prompts WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1",
      [tenant.id]
    );

    const prompt =
      promptRes.rows[0]?.system_prompt ||
      promptTemplates[tenant.categoria]?.prompt ||
      "Eres un asistente útil.";

    // Generar respuesta con OpenAI
    const ai = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
    });

    const respuesta = ai.choices[0].message.content;

    // Enviar respuesta por WhatsApp
    await twilioClient.messages.create({
      body: respuesta || "Respuesta no disponible",
      from: to,
      to: from,
    });

    // Guardar mensajes
    await pool.query(
      `INSERT INTO messages (tenant_id, sender, content, canal, timestamp)
       VALUES ($1, 'user', $2, $3, NOW()), ($1, 'assistant', $4, $3, NOW())`,
      [tenant.id, message, canal, respuesta]
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
