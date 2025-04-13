"use client";
import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login"); // Redirigir a login si no hay usuario
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div>
      <h1>Panel de control</h1>
      {user && <p>Bienvenido, {user.email}</p>}
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}
