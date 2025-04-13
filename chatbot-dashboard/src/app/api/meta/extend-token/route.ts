import { NextRequest, NextResponse } from "next/server";

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!;
const META_APP_SECRET = process.env.META_APP_SECRET!;

export async function POST(req: NextRequest) {
  const { user_access_token } = await req.json();

  if (!user_access_token) {
    return NextResponse.json({ error: "Falta user_access_token" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${user_access_token}`
    );

    const data = await res.json();

    if (data.access_token) {
      console.log("✅ Token extendido correctamente");
      return NextResponse.json({
        long_lived_token: data.access_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
      });
    } else {
      console.error("❌ Error al extender token:", data);
      return NextResponse.json({ error: "No se pudo extender el token", detail: data }, { status: 500 });
    }
  } catch (err) {
    console.error("❌ Error al hacer fetch:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
