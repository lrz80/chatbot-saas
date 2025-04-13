"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirige al panel de control
    } catch (error) {
      setError("Error al registrarse");
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Registrarse</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}