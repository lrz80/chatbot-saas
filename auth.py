import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import HTTPException, Header
import os, json

# Cargar Firebase desde variable de entorno
firebase_credentials_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
if not firebase_credentials_json:
    raise ValueError("Faltan credenciales de Firebase")

firebase_credentials = json.loads(firebase_credentials_json)
cred = credentials.Certificate(firebase_credentials)
firebase_admin.initialize_app(cred)

# Middleware para validar token
def verificar_usuario(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token malformado")
    token = authorization.split(" ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")



