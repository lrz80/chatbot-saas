// src/app/api/facebook-select-page/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    // 🔐 1. Verificar token de Firebase enviado desde el frontend
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No autorizado (sin token)" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const firebaseUid = decoded.uid;

    // 🔎 2. Buscar el tenant por Firebase UID
    const tenantRes = await pool.query(
      "SELECT id FROM tenants WHERE firebase_uid = $1",
      [firebaseUid]
    );
    const tenant = tenantRes.rows[0];

    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    // 📦 3. Guardar la página seleccionada
    const body = await req.json();
    const { page } = body;

    if (!page?.id || !page?.name || !page?.access_token) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    await pool.query(
      `UPDATE tenants
       SET facebook_page_id = $1,
           facebook_page_name = $2,
           facebook_access_token = $3
       WHERE id = $4`,
      [page.id, page.name, page.access_token, tenant.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error guardando página de Facebook:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
