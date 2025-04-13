export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken"; // ✅ Importamos el helper

// ✅ GET: Obtener configuración del negocio del usuario autenticado
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐 Verificamos el token

    const negocioRes = await pool.query("SELECT * FROM tenants WHERE admin_uid = $1", [uid]);
    const negocio = negocioRes.rows[0];

    if (!negocio) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const userRes = await pool.query("SELECT owner_name FROM users WHERE uid = $1", [uid]);
    const user = userRes.rows[0];

    const responseData = {
      ...negocio,
      owner_name: user?.owner_name || "",
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Error en GET /api/settings:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

// ✅ PUT: Guardar cambios del perfil del negocio (autenticado)
export async function PUT(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐 Autenticación

    const data = await req.json();
    const {
      tenant_id,
      name,
      voice_language,
      voice_name,
      categoria,
      horario_atencion,
    } = data;

    if (!tenant_id) {
      return NextResponse.json({ error: "Falta tenant_id" }, { status: 400 });
    }

    // ❗ Opcional: validar que el tenant_id pertenece a este uid
    const validTenant = await pool.query(
      `SELECT id FROM tenants WHERE id = $1 AND admin_uid = $2`,
      [tenant_id, uid]
    );

    if (validTenant.rowCount === 0) {
      return NextResponse.json({ error: "No autorizado para modificar este negocio" }, { status: 403 });
    }

    await pool.query(
      `UPDATE tenants SET
        name = $1,
        voice_language = $2,
        voice_name = $3,
        categoria = $4,
        horario_atencion = $5
      WHERE id = $6`,
      [name, voice_language, voice_name, categoria, horario_atencion, tenant_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error en PUT /api/settings:", error);
    return NextResponse.json({ error: "Error al guardar cambios" }, { status: 500 });
  }
}
