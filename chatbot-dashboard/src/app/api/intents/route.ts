import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken";

// ✅ GET: Obtener intents por usuario autenticado
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐

    const userRes = await pool.query(
      "SELECT id FROM tenants WHERE admin_uid = $1",
      [uid]
    );

    const tenantId = userRes.rows?.[0]?.id;
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    const intentsRes = await pool.query(
      "SELECT nombre, ejemplos, respuesta FROM intents WHERE tenant_id = $1",
      [tenantId]
    );

    return NextResponse.json(intentsRes.rows);
  } catch (error) {
    console.error("❌ Error GET /api/intents:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

// ✅ POST: Guardar intents por usuario autenticado
export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐
    const { intents } = await req.json();

    if (!Array.isArray(intents)) {
      return NextResponse.json({ error: "Intents inválidos" }, { status: 400 });
    }

    const userRes = await pool.query(
      "SELECT id FROM tenants WHERE admin_uid = $1",
      [uid]
    );

    const tenantId = userRes.rows?.[0]?.id;
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    // 🧹 Limpiar los intents anteriores
    await pool.query("DELETE FROM intents WHERE tenant_id = $1", [tenantId]);

    // 💾 Insertar los nuevos
    for (const intent of intents) {
      await pool.query(
        "INSERT INTO intents (tenant_id, nombre, ejemplos, respuesta) VALUES ($1, $2, $3, $4)",
        [tenantId, intent.nombre, intent.ejemplos, intent.respuesta]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error POST /api/intents:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
