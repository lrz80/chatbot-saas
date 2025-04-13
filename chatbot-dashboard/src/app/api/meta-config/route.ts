// src/app/api/meta-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { adminAuth } from "@/lib/firebase/admin";

// POST: Guardar configuración de Meta (Facebook + Instagram)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No autorizado (sin token)" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const firebaseUid = decoded.uid;

    const tenantRes = await pool.query(
      "SELECT id FROM tenants WHERE firebase_uid = $1",
      [firebaseUid]
    );
    const tenant = tenantRes.rows[0];

    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const {
      facebook_page_id,
      facebook_page_name,
      facebook_access_token,
      instagram_business_account_id,
      mensaje_bienvenida,
      prompt,
      hints,
    } = body;

    await pool.query(
      `UPDATE tenants
       SET facebook_page_id = $1,
           facebook_page_name = $2,
           facebook_access_token = $3,
           instagram_page_id = $1,
           instagram_business_account_id = $4,
           mensaje_bienvenida = $5,
           prompt = $6,
           hints = $7
       WHERE id = $8`,
      [
        facebook_page_id,
        facebook_page_name,
        facebook_access_token,
        instagram_business_account_id,
        mensaje_bienvenida,
        prompt,
        hints,
        tenant.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error guardando configuración Meta:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// GET: Obtener configuración de Meta
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No autorizado (sin token)" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const firebaseUid = decoded.uid;

    const tenantRes = await pool.query(
      `SELECT facebook_page_id, facebook_page_name, facebook_access_token,
              instagram_business_account_id, mensaje_bienvenida, prompt, hints
       FROM tenants
       WHERE firebase_uid = $1`,
      [firebaseUid]
    );

    const config = tenantRes.rows[0];

    if (!config) {
      return NextResponse.json({ error: "Configuración no encontrada" }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch (err) {
    console.error("❌ Error obteniendo configuración Meta:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
