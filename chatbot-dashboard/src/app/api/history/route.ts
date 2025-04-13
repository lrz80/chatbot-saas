export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const limit = parseInt(searchParams.get("limit") || "100");

  if (!uid) return NextResponse.json([], { status: 400 });

  // Buscar el tenant del usuario
  const userResult = await pool.query(
    "SELECT tenant_id FROM users WHERE uid = $1",
    [uid]
  );
  const tenant_id = userResult.rows[0]?.tenant_id;

  if (!tenant_id) return NextResponse.json([], { status: 404 });

  // Obtener mensajes
  const messagesRes = await pool.query(
    `SELECT id, sender, content, timestamp
     FROM messages
     WHERE tenant_id = $1
     ORDER BY timestamp DESC
     LIMIT $2`,
    [tenant_id, limit]
  );

  return NextResponse.json(messagesRes.rows);
}
