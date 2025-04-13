import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import OpenAI from "openai";
import { promptTemplates } from "@/utils/promptTemplates";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!;
const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN!;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook de Meta verificado correctamente");
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Verificación fallida", { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("📩 Webhook recibido:", JSON.stringify(body, null, 2));

  const entry = body.entry?.[0];
  const isInstagram = body.object === "instagram";
  const messaging = entry?.messaging?.[0];

  // 🛡️ Ignorar mensajes automáticos (eco del bot)
  if (messaging?.message?.is_echo) {
    console.log("🪞 Mensaje echo, ignorado.");
    return NextResponse.json({ status: "echo_ignored" });
  }

  const senderId = messaging?.sender?.id;
  const pageId = entry?.id;
  const messageText = messaging?.message?.text;
  const canal = isInstagram ? "instagram" : "facebook";

  console.log("📨 Canal:", canal);
  console.log("🆔 Sender ID:", senderId);
  console.log("📄 Page ID:", pageId);
  console.log("💬 Texto:", messageText);

  if (!senderId || !pageId || !messageText) {
    return NextResponse.json({ status: "ignored" });
  }

  const tenantQuery = canal === "facebook"
    ? "SELECT * FROM tenants WHERE facebook_page_id = $1"
    : "SELECT * FROM tenants WHERE instagram_business_account_id = $1";

  const result = await pool.query(tenantQuery, [pageId]);
  const tenant = result.rows[0];

  if (!tenant) {
    console.log("⚠️ Página no asociada a ningún tenant:", pageId);
    return NextResponse.json({ status: "tenant_not_found" });
  }

  const clienteRes = await pool.query(
    "SELECT * FROM clientes WHERE tenant_id = $1 AND canal = $2 AND contacto = $3",
    [tenant.id, canal, senderId]
  );

  if (clienteRes.rows.length === 0) {
    const bienvenida = tenant.mensaje_bienvenida || "¡Hola! ¿En qué puedo ayudarte hoy?";
    console.log(`📨 Enviando mensaje por ${canal} a ${senderId}...`);
    await responderMeta(canal, senderId, bienvenida, tenant.facebook_page_id);
    await pool.query(
      "INSERT INTO clientes (tenant_id, canal, contacto) VALUES ($1, $2, $3)",
      [tenant.id, canal, senderId]
    );
    await pool.query(
      `INSERT INTO messages (tenant_id, sender, content, canal, timestamp)
       VALUES ($1, 'assistant', $2, $3, NOW())`,
      [tenant.id, bienvenida, canal]
    );
  }

  const lowerMsg = messageText.toLowerCase();

  if (lowerMsg.includes("dónde están") || lowerMsg.includes("ubicación") || lowerMsg.includes("cómo llegar")) {
    const respuesta = `📍 Nuestra dirección es: ${tenant.direccion || "no configurada aún"}`;
    await responderMeta(canal, senderId, respuesta, tenant.facebook_page_id);
    await guardarMensajes(tenant.id, messageText, respuesta, canal);
    return NextResponse.json({ status: "respuesta_direccion" });
  }

  if (lowerMsg.includes("horario") || lowerMsg.includes("hora abren") || lowerMsg.includes("hora cierran") || lowerMsg.includes("a qué hora")) {
    const respuesta = `⏰ Nuestro horario de atención es: ${tenant.horario_atencion || "no configurado aún"}`;
    await responderMeta(canal, senderId, respuesta, tenant.facebook_page_id);
    await guardarMensajes(tenant.id, messageText, respuesta, canal);
    return NextResponse.json({ status: "respuesta_horario" });
  }

  const intentsRes = await pool.query("SELECT * FROM intents WHERE tenant_id = $1", [tenant.id]);
  const intents = intentsRes.rows;

  for (const intent of intents) {
    const match = intent.ejemplos.find((ej: string) => lowerMsg.includes(ej.toLowerCase()));
    if (match) {
      await responderMeta(canal, senderId, intent.respuesta, tenant.facebook_page_id);
      await guardarMensajes(tenant.id, messageText, intent.respuesta, canal);
      return NextResponse.json({ status: "match_intent" });
    }
  }

  const promptRes = await pool.query(
    "SELECT * FROM prompts WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1",
    [tenant.id]
  );

  const prompt =
    promptRes.rows[0]?.system_prompt ||
    promptTemplates[tenant.categoria]?.prompt ||
    "Eres un asistente útil.";

  const ai = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: messageText },
    ],
  });

  const respuesta = ai.choices[0].message.content!;
  await responderMeta(canal, senderId, respuesta, tenant.facebook_page_id);
  await guardarMensajes(tenant.id, messageText, respuesta, canal);

  return NextResponse.json({ status: "ok" });
}

// 👉 Responder para Facebook o Instagram
async function responderMeta(canal: string, userId: string, text: string, pageId: string) {
  const endpoint =
    canal === "facebook"
      ? `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`
      : `https://graph.facebook.com/v18.0/${pageId}/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const payload = {
    recipient: { id: userId },
    message: { text },
    messaging_type: "RESPONSE",
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  console.log(`📤 Respuesta ${canal}:`, JSON.stringify(json, null, 2));
}

// 👉 Guardar mensajes por canal
async function guardarMensajes(tenantId: string, pregunta: string, respuesta: string, canal: string) {
  await pool.query(
    `INSERT INTO messages (tenant_id, sender, content, canal, timestamp)
     VALUES ($1, 'user', $2, $4, NOW()), ($1, 'assistant', $3, $4, NOW())`,
    [tenantId, pregunta, respuesta, canal]
  );
}
