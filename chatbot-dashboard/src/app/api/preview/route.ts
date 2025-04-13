import { NextResponse } from "next/server";
import OpenAI from "openai";
import pool from "@/lib/db";
import { promptTemplates } from "../../../utils/promptTemplates";
import { verifyUserToken } from "@/lib/verifyToken";
import type { NextRequest } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐 Verifica usuario

    const { message }: { message: string } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    // 🔍 Buscar tenant del usuario
    const userResult = await pool.query("SELECT tenant_id FROM users WHERE uid = $1", [uid]);
    const tenant_id = userResult.rows[0]?.tenant_id;

    if (!tenant_id) {
      return NextResponse.json({ error: "No se encontró el negocio." }, { status: 404 });
    }

    // ✅ Validar membresía
    const configResult = await pool.query(
      "SELECT categoria, idioma, membresia_activa FROM tenants WHERE id = $1",
      [tenant_id]
    );

    const { categoria = "otra", idioma = "es", membresia_activa } = configResult.rows[0] || {};

    if (!membresia_activa) {
      return NextResponse.json({ error: "Tu membresía no está activa." }, { status: 403 });
    }

    // 🧠 Obtener prompt personalizado
    const promptResult = await pool.query(
      "SELECT system_prompt FROM prompts WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1",
      [tenant_id]
    );

    let system_prompt = promptResult.rows[0]?.system_prompt;

    if (!system_prompt) {
      const template = promptTemplates[categoria] ?? promptTemplates["otra"];
      system_prompt = template.prompt;
    }

    // 🤖 Generar respuesta con OpenAI
    const ai = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: message },
      ],
    });

    const respuesta = ai.choices[0].message.content?.trim();
    return NextResponse.json({ response: respuesta });
  } catch (error) {
    console.error("❌ Error en POST /api/preview:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
