// Dummy admin exports to avoid build errors in frontend

export const db = {};
export const admin = {};
export const adminAuth = {
    verifyIdToken: async (token: string) => {
      return { uid: 'dummy-uid-from-token' }; // ahora acepta un argumento
    },
  };
  
