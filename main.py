from fastapi import FastAPI, Depends
from auth import verificar_usuario
from fastapi import FastAPI, Request, Form
from fastapi import FastAPI 
import uvicorn

app = FastAPI()

@app.post("/configurar_chatbot")
def configurar_chatbot(user=Depends(verificar_usuario)):
    return {"message": f"Hola {user['email']}, tu token es válido ✅"}

@app.get("/test")
def test():
    return {"message": "🚀 FastAPI funciona en 8080 correctamente!"}

@app.get("/")  # ✅ Agregamos una ruta para la raíz "/"
def home():
    return {"message": "API funcionando en puerto 8080 🚀"}

@app.get("/protegido")
def ruta_protegida(user=Depends(verificar_usuario)):
    return {"message": f"Hola {user['email']}, tienes acceso!"}

@app.get("/usuario")
def obtener_usuario(user=Depends(verificar_usuario)):
    return {"message": f"Bienvenido, {user['email']}"}

@app.post("/suscribirse")
def suscribirse(email: str, plan: str):
    suscripcion_id = crear_suscripcion(email, plan)
    return {"message": "Suscripción creada", "id": suscripcion_id}

@app.post("/whatsapp")
async def whatsapp_webhook(body: str = Form(...), from_: str = Form(...)):
    user_id = obtener_user_id(from_)  # Verificamos quién es el dueño del número
    config = obtener_configuracion_chatbot(user_id)

    respuesta = config.get("welcome_message", "Hola, bienvenido!")

    enviar_mensaje(from_, respuesta)
    return {"message": "Mensaje enviado"}

@app.get("/")
def home():
    return {"message": "🚀 API funcionando en Railway y puerto 8080"}

if __name__ == "__main__":
    print("🚀 Iniciando API en Railway...")  # Debug para Railway
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")