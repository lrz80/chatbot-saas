export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken";

export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // ✅ Autenticación con token

    const userRes = await pool.query("SELECT tenant_id FROM users WHERE uid = $1", [uid]);
    const tenant_id = userRes.rows[0]?.tenant_id;

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    const totalRes = await pool.query(
      `SELECT COUNT(*) FROM messages WHERE tenant_id = $1`,
      [tenant_id]
    );

    const usersRes = await pool.query(
      `SELECT COUNT(DISTINCT sender) FROM messages WHERE tenant_id = $1`,
      [tenant_id]
    );

    const horaRes = await pool.query(
      `SELECT EXTRACT(HOUR FROM timestamp) AS hora, COUNT(*) 
       FROM messages 
       WHERE tenant_id = $1 
       GROUP BY hora 
       ORDER BY COUNT(*) DESC 
       LIMIT 1`,
      [tenant_id]
    );

    return NextResponse.json({
      total: parseInt(totalRes.rows[0].count),
      usuarios: parseInt(usersRes.rows[0].count),
      hora_pico: horaRes.rows[0]?.hora ?? null,
    });
  } catch (error) {
    console.error("❌ Error en /api/stats/kpis:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
