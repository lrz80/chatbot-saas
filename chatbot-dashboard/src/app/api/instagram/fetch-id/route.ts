import { NextRequest, NextResponse } from "next/server";

type PageData = {
  id: string;
  name: string;
};

type IgResponse = {
  instagram_business_account?: {
    id: string;
  };
};

export async function POST(req: NextRequest) {
  const { access_token } = await req.json();

  // 1. Obtener páginas del usuario
  const pagesRes = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`
  );
  const pagesData = await pagesRes.json();

  if (!pagesData.data || pagesData.data.length === 0) {
    return NextResponse.json({ error: "No se encontraron páginas" }, { status: 404 });
  }

  const resultados: {
    page_id: string;
    page_name: string;
    ig_account_id: string | null;
  }[] = [];

  for (const page of pagesData.data as PageData[]) {
    const pageId = page.id;

    const igRes = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${access_token}`
    );
    const igData = (await igRes.json()) as IgResponse;

    resultados.push({
      page_id: pageId,
      page_name: page.name,
      ig_account_id: igData.instagram_business_account?.id || null,
    });
  }

  return NextResponse.json({ pages: resultados });
}

