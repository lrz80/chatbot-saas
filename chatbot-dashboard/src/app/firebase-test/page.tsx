"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function FirebaseTest() {
  useEffect(() => {
    console.log("✅ Firebase app cargada:", auth.app.name);

    console.log("currentUser:", auth.currentUser);

    auth.onAuthStateChanged((user) => {
      console.log("✅ onAuthStateChanged:", user);
      user?.getIdToken().then((token) => {
        console.log("🔐 ID Token:", token);
      });
    });
  }, []);

  return <p className="text-white text-center">🔥 Revisa la consola para ver el estado de autenticación</p>;
}
