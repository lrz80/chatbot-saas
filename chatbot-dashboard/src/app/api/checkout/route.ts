import Stripe from "stripe";
import { NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/verifyToken"; // ✅ Seguridad Firebase
import type { NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUserToken(req); // 🔐 Usuario autenticado
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "priceId requerido" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?canceled=1`,
      metadata: { uid }, // ✅ uid autenticado
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("🚨 Error creando sesión de Stripe:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}
