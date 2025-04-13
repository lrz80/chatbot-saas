import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken"; // ✅

export async function POST(req: NextRequest) {
  const uid = await verifyUserToken(req); // 🔐 Verifica el token

  const formData = await req.formData();

  const idioma = formData.get("idioma")?.toString() || "es-ES";
  const canal = formData.get("canal")?.toString() || "voz";
  const system_prompt = formData.get("system_prompt")?.toString() || "";
  const welcome_message = formData.get("welcome_message")?.toString() || "";
  const voice_name = formData.get("voice_name")?.toString() || "alice";
  const voice_hints = formData.get("voice_hints")?.toString() || "";
  const tenantId = formData.get("tenant_id")?.toString();

  if (!tenantId) {
    return new Response("Falta tenant_id", { status: 400 });
  }

  // ✅ Validamos que el tenant_id pertenezca al uid autenticado
  const validTenant = await pool.query(
    `SELECT id FROM tenants WHERE id = $1 AND admin_uid = $2`,
    [tenantId, uid]
  );

  if (validTenant.rowCount === 0) {
    return new Response("No autorizado para modificar este tenant", { status: 403 });
  }

  try {
    await pool.query(
      `INSERT INTO prompts (tenant_id, canal, idioma, system_prompt, welcome_message, voice_name, voice_hints)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (tenant_id, canal, idioma)
       DO UPDATE SET system_prompt = $4, welcome_message = $5, voice_name = $6, voice_hints = $7`,
      [tenantId, canal, idioma, system_prompt, welcome_message, voice_name, voice_hints]
    );

    return new Response("Configuración guardada correctamente.", { status: 200 });
  } catch (err) {
    console.error("❌ Error guardando configuración de voz:", err);
    return new Response("Error interno del servidor.", { status: 500 });
  }
}
