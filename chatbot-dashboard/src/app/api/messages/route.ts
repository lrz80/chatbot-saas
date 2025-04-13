import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  const userResult = await pool.query("SELECT tenant_id FROM users WHERE uid = $1", [uid]);
  const tenant_id = userResult.rows[0]?.tenant_id;

  if (!tenant_id) return NextResponse.json([], { status: 200 });

  const messagesResult = await pool.query(
    `SELECT id, sender, content, timestamp
     FROM messages
     WHERE tenant_id = $1
     ORDER BY timestamp DESC
     LIMIT 50`,
    [tenant_id]
  );

  return NextResponse.json(messagesResult.rows);
}
