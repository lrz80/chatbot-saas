import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken";

// ✅ Obtener historial de mensajes autenticado
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐

    const result = await pool.query("SELECT tenant_id FROM users WHERE uid = $1", [uid]);
    const tenant_id = result.rows[0]?.tenant_id;

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    const calls = await pool.query(
      `SELECT * FROM messages 
       WHERE tenant_id = $1 
       AND sender IN ('user', 'assistant')
       AND content IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 100`,
      [tenant_id]
    );

    return NextResponse.json(calls.rows);
  } catch (error) {
    console.error("❌ Error en GET /api/history:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

