import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken";

// ✅ GET: Listar preguntas frecuentes del usuario autenticado
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req);

    const userResult = await pool.query("SELECT tenant_id FROM users WHERE uid = $1", [uid]);
    const tenant_id = userResult.rows[0]?.tenant_id;

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    const faqs = await pool.query(
      "SELECT id, pregunta, respuesta FROM faq WHERE tenant_id = $1 ORDER BY id DESC",
      [tenant_id]
    );

    return NextResponse.json(faqs.rows);
  } catch (error) {
    console.error("❌ Error GET /api/faq:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

// ✅ POST: Guardar nueva pregunta frecuente
export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req);
    const { pregunta, respuesta } = await req.json();

    if (!pregunta || !respuesta) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const userResult = await pool.query("SELECT tenant_id FROM users WHERE uid = $1", [uid]);
    const tenant_id = userResult.rows[0]?.tenant_id;

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    await pool.query(
      "INSERT INTO faq (tenant_id, pregunta, respuesta) VALUES ($1, $2, $3)",
      [tenant_id, pregunta.trim(), respuesta.trim()]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error POST /api/faq:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ✅ DELETE: Borrar una pregunta si pertenece al usuario autenticado
export async function DELETE(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
    }

    // 🛡 Verificamos que ese FAQ le pertenece al usuario
    const result = await pool.query(
      `SELECT f.id FROM faq f
       JOIN users u ON f.tenant_id = u.tenant_id
       WHERE f.id = $1 AND u.uid = $2`,
      [id, uid]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "No autorizado para borrar esta pregunta" }, { status: 403 });
    }

    await pool.query("DELETE FROM faq WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error DELETE /api/faq:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
