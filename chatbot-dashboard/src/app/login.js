"use client";

import { useState } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // 🔐 Obtener token real
      const token = await user.getIdToken();
      console.log("✅ TOKEN Firebase:", token);
  
      // 🛰️ Validar token con backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
  
      const contentType = res.headers.get("content-type");
      const raw = await res.text();
  
      console.log("📦 Respuesta cruda:", raw);
  
      if (!res.ok) {
        throw new Error("Token inválido o error del servidor");
      }
  
      const data = JSON.parse(raw);
      console.log("🟢 Validado:", data);
  
      // 🚀 Redirigir
      router.push("/dashboard");
  
    } catch (err) {
      console.error("❌ Error login:", err);
      setError("Error al iniciar sesión. Verifica credenciales o conexión.");
    }
  };  
  
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Iniciar Sesión</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button onClick={handleLogin}>Ingresar</button>
        </div>
    </div>
  );
}
