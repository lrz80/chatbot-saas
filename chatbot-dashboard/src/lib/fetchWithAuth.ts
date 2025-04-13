// src/lib/fetchWithAuth.ts
import { getIdToken } from "firebase/auth";
import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const token = await getIdToken(user);

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return res;
}
