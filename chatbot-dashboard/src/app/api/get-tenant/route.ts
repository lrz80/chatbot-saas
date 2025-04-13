export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();

  if (!uid) {
    return new Response("UID requerido", { status: 400 });
  }

  try {
    const result = await pool.query(
      "SELECT tenant_id FROM users WHERE uid = $1",
      [uid]
    );

    if (!result.rows[0]) {
      return new Response("Usuario no encontrado", { status: 404 });
    }

    return Response.json({ tenant_id: result.rows[0].tenant_id });
  } catch (error) {
    console.error("Error al obtener tenant_id:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}
