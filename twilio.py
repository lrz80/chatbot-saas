from twilio.rest import Client
import os

twilio_client = Client(os.getenv("TWILIO_SID"), os.getenv("TWILIO_TOKEN"))

def enviar_mensaje(numero, mensaje):
    twilio_client.messages.create(
        from_=os.getenv("TWILIO_PHONE"),
        to=f"whatsapp:{numero}",
        body=mensaje
    )
