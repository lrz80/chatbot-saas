import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken";

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐 Seguridad total

    const { canal, asunto, contenido, imagen_url, fecha_programada } = await req.json();

    if (!canal || !contenido || !fecha_programada) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const tenantRes = await pool.query("SELECT id FROM tenants WHERE admin_uid = $1", [uid]);
    const tenant = tenantRes.rows[0];

    if (!tenant) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    await pool.query(
      `INSERT INTO campaigns (tenant_id, canal, asunto, contenido, imagen_url, fecha_programada)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        tenant.id,
        canal,
        asunto || null,
        contenido,
        imagen_url || null,
        fecha_programada,
      ]
    );

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("❌ Error al guardar campaña:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
