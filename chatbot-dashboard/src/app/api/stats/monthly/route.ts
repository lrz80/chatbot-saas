export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken"; // ✅

export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐 Verificamos token

    const { searchParams } = new URL(req.url);
    const onlyCurrentMonth = searchParams.get("month") === "current";

    const userRes = await pool.query("SELECT tenant_id FROM users WHERE uid = $1", [uid]);
    const tenant_id = userRes.rows[0]?.tenant_id;

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    const query = onlyCurrentMonth
      ? `
        SELECT DATE_TRUNC('day', timestamp) AS dia, COUNT(*) 
        FROM messages 
        WHERE tenant_id = $1 
          AND DATE_PART('month', timestamp) = DATE_PART('month', CURRENT_DATE)
          AND DATE_PART('year', timestamp) = DATE_PART('year', CURRENT_DATE)
        GROUP BY dia 
        ORDER BY dia
      `
      : `
        SELECT DATE_TRUNC('month', timestamp) AS mes, COUNT(*) 
        FROM messages 
        WHERE tenant_id = $1 
          AND DATE_PART('year', timestamp) = DATE_PART('year', CURRENT_DATE)
        GROUP BY mes 
        ORDER BY mes
      `;

    const res = await pool.query(query, [tenant_id]);

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("❌ Error en /api/stats/monthly:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
