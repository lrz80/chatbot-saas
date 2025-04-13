import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { long_lived_token } = await req.json();

  if (!long_lived_token) {
    return NextResponse.json({ error: "Falta long_lived_token" }, { status: 400 });
  }

  try {
    const resPages = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${long_lived_token}`);
    const pagesData = await resPages.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.json({ error: "No se encontraron páginas" }, { status: 404 });
    }

    const pages: {
      page_id: string;
      page_name: string;
      page_access_token: string;
      instagram_business_account_id: string | null;
    }[] = [];
    

    for (const page of pagesData.data) {
      const pageId = page.id;

      const igRes = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${long_lived_token}`
      );

      const igData = await igRes.json();

      pages.push({
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
        instagram_business_account_id: igData.instagram_business_account?.id || null,
      });
    }

    return NextResponse.json({ pages });
  } catch (err) {
    console.error("❌ Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
