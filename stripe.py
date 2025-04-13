import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def crear_suscripcion(email, plan):
    cliente = stripe.Customer.create(email=email)
    suscripcion = stripe.Subscription.create(
        customer=cliente.id,
        items=[{"price": os.getenv(f"STRIPE_PLAN_{plan.upper()}")}]
    )
    return suscripcion.id
