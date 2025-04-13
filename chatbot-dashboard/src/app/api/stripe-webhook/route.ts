import { NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("⚠️ Error al verificar webhook:", err);
    return new Response(`Webhook Error: ${err}`, { status: 400 });
  }

  // Escuchar evento de pago exitoso
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid;

    // Buscar tenant_id por uid
    const result = await pool.query("SELECT tenant_id FROM users WHERE id = $1", [uid]);
    const tenant_id = result.rows[0]?.tenant_id;

    // Actualizar plan del negocio
    if (tenant_id) {
      await pool.query("UPDATE tenants SET plan = $1 WHERE id = $2", ["pro", tenant_id]);
      console.log(`✅ Plan actualizado para tenant: ${tenant_id}`);
    }
  }

  return NextResponse.json({ received: true });
}
