import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  const userResult = await pool.query("SELECT tenant_id FROM users WHERE id = $1", [uid]);
  const tenant_id = userResult.rows[0]?.tenant_id;

  if (!tenant_id) return NextResponse.json({}, { status: 404 });

  const result = await pool.query(
    "SELECT * FROM prompts WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1",
    [tenant_id]
  );

  return NextResponse.json(result.rows[0] || {});
}

export async function POST(req: Request) {
  const body = await req.json();
  const { system_prompt, uid } = body;

  const userResult = await pool.query("SELECT tenant_id FROM users WHERE id = $1", [uid]);
  const tenant_id = userResult.rows[0]?.tenant_id;

  if (!tenant_id) return NextResponse.json({ error: "No tenant found" }, { status: 404 });

  await pool.query(
    `INSERT INTO prompts (tenant_id, system_prompt)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO UPDATE SET system_prompt = EXCLUDED.system_prompt`,
    [tenant_id, system_prompt]
  );

  return NextResponse.json({ success: true });
}
