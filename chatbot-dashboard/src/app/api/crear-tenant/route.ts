import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { verifyUserToken } from "@/lib/verifyToken";

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐 UID real del usuario autenticado

    // Verificar si el tenant ya existe para este UID
    const existing = await pool.query("SELECT * FROM tenants WHERE admin_uid = $1", [uid]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ status: "ya_existe" });
    }

    // Crear nuevo tenant
    await pool.query(
      `INSERT INTO tenants (id, admin_uid, created_at, membresia_activa)
       VALUES ($1, $2, NOW(), false)`,
      [uuidv4(), uid]
    );

    return NextResponse.json({ status: "creado" });
  } catch (err) {
    console.error("❌ Error creando tenant:", err);
    return NextResponse.json({ error: "No autorizado o error interno" }, { status: 401 });
  }
}
