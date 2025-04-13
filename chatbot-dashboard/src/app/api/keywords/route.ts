export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyUserToken } from "@/lib/verifyToken";
import type { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐 token seguro

    // Obtener tenant_id
    const userResult = await pool.query("SELECT tenant_id FROM users WHERE uid = $1", [uid]);
    const tenant_id = userResult.rows[0]?.tenant_id;

    if (!tenant_id) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });

    const result = await pool.query(
      `SELECT content FROM messages WHERE tenant_id = $1 AND sender = 'user'`,
      [tenant_id]
    );

    const allText = result.rows.map((r) => r.content).join(" ").toLowerCase();

    const stopwords = [
      "el", "la", "los", "las", "un", "una", "que", "y", "de", "en", "a", "por",
      "para", "con", "es", "al", "lo", "del", "se", "me", "mi", "tu", "te", "su"
    ];

    const words = allText
      .replace(/[.,!?¿¡()"]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.includes(w));

    const frequency: Record<string, number> = {};

    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }

    const top = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return NextResponse.json({ keywords: top });
  } catch (error: any) {
    console.error("❌ Error en GET /api/keywords:", error?.message || error);
  
    return NextResponse.json(
      {
        error: error?.message === "missing_token" ? "Falta token" : "Token inválido",
      },
      {
        status: error?.message === "missing_token" ? 401 : 403,
      }
    );
  }  
}
