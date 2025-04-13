export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken";

const FREE_PLAN_LIMIT = 500;

export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // ✅ UID desde el token

    const userRes = await pool.query("SELECT tenant_id FROM users WHERE uid = $1", [uid]);
    const tenant_id = userRes.rows[0]?.tenant_id;

    if (!tenant_id) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const planRes = await pool.query("SELECT plan FROM tenants WHERE id = $1", [tenant_id]);
    const plan = planRes.rows[0]?.plan || "free";

    let used = 0;
    let limit: number | null = null;
    let porcentaje = 0;

    if (plan === "free") {
      const countRes = await pool.query(
        `SELECT COUNT(*) FROM messages 
         WHERE tenant_id = $1 AND sender = 'user' 
         AND timestamp >= date_trunc('month', CURRENT_DATE)`,
        [tenant_id]
      );

      used = parseInt(countRes.rows[0].count);
      limit = FREE_PLAN_LIMIT;
      porcentaje = Math.min(Math.round((used / limit) * 100), 100);
    }

    return NextResponse.json({ plan, used, limit, porcentaje });
  } catch (error) {
    console.error("❌ Error en /api/usage:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
