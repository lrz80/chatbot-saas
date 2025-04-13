import { NextRequest, NextResponse } from "next/server";

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!;
const META_APP_SECRET = process.env.META_APP_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_META_REDIRECT_URI!;

type FacebookPage = {
  id: string;
  name: string;
  access_token: string;
};

type EnrichedPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account: string | null;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    // 1. Intercambiar code por user_access_token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&client_secret=${META_APP_SECRET}&code=${code}`
    );

    const tokenData = await tokenRes.json();
    console.log("🔍 tokenData", tokenData);

    const userAccessToken = tokenData.access_token;

    if (!userAccessToken) {
      return NextResponse.json({ error: "No se pudo obtener el access_token" }, { status: 400 });
    }

    // 2. Obtener páginas del usuario
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    if (!pagesData?.data || pagesData.data.length === 0) {
      return NextResponse.json({ error: "No se encontraron páginas" }, { status: 404 });
    }

    const enrichedPages: EnrichedPage[] = await Promise.all(
      pagesData.data.map(async (page: FacebookPage): Promise<EnrichedPage> => {
        try {
          const igRes = await fetch(
            `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
          );
          const igData = await igRes.json();
          return {
            id: page.id,
            name: page.name,
            access_token: page.access_token,
            instagram_business_account: igData.instagram_business_account?.id || null,
          };
        } catch {
          return {
            id: page.id,
            name: page.name,
            access_token: page.access_token,
            instagram_business_account: null,
          };
        }
      })
    );

    return NextResponse.json({
      pages: enrichedPages,
      user_access_token: userAccessToken,
    });
  } catch (err) {
    console.error("❌ Error en Facebook OAuth:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
