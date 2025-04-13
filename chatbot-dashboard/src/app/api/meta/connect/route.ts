import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { adminAuth } from "@/lib/firebase/admin";

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!;
const META_APP_SECRET = process.env.META_APP_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_META_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const tokenHeader = req.headers.get("authorization");
  const firebaseToken = tokenHeader?.split(" ")[1];

  if (!code || !firebaseToken) {
    return NextResponse.json({ error: "Falta código o token de autenticación" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(firebaseToken);
    const firebaseUid = decoded.uid;

    // 1. Intercambiar code por user_token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&client_secret=${META_APP_SECRET}&code=${code}`
    );
    const tokenData = await tokenRes.json();
    const userToken = tokenData.access_token;
    if (!userToken) throw new Error("user_token inválido");

    // 2. Extender el token a 60 días
    const extendedRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${userToken}`
    );
    const extendedData = await extendedRes.json();
    const longToken = extendedData.access_token;
    if (!longToken) throw new Error("No se pudo extender el token");

    // 3. Obtener la página
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longToken}`
    );
    const pagesData = await pagesRes.json();
    const page = pagesData.data?.[0];
    if (!page) throw new Error("No se encontró ninguna página");

    const pageId = page.id;
    const pageAccessToken = page.access_token;
    const pageName = page.name;

    // 4. Obtener ID de Instagram
    const igRes = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${longToken}`
    );
    const igData = await igRes.json();
    const igId = igData.instagram_business_account?.id || null;

    // 5. Obtener tenant
    const tenantRes = await pool.query("SELECT id FROM tenants WHERE firebase_uid = $1", [firebaseUid]);
    const tenant = tenantRes.rows[0];
    if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });

    // 6. Guardar datos en el tenant
    await pool.query(
      `UPDATE tenants SET
        facebook_page_id = $1,
        facebook_page_name = $2,
        facebook_access_token = $3,
        instagram_business_account_id = $4
       WHERE id = $5`,
      [pageId, pageName, pageAccessToken, igId, tenant.id]
    );

    return NextResponse.json({
      success: true,
      facebook_page_id: pageId,
      facebook_page_name: pageName,
      instagram_business_account_id: igId,
    });
  } catch (err) {
    console.error("❌ Error en conexión:", err);
    return NextResponse.json({ error: "Error interno", detail: err }, { status: 500 });
  }
}
