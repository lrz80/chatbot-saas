// src/lib/firebase-config.ts

import type { ServiceAccount } from "firebase-admin";
import serviceAccount from "./firebase-service-account.json"; // Ajustá el path si es diferente

const getFirebaseConfig = (): ServiceAccount => {
  if (process.env.NODE_ENV === "production") {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    } as ServiceAccount;
  }

  return serviceAccount as ServiceAccount;
};

export default getFirebaseConfig;
