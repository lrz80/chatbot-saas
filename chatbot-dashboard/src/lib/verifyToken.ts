import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin"; // asegúrate de tener esta ruta bien

export async function verifyUserToken(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new Error("missing_token");
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded || !decoded.uid) {
      throw new Error("invalid_token");
    }

    return decoded.uid;
  } catch (error) {
    console.error("❌ Error verificando token:", error);
    throw new Error("invalid_token");
  }
}
