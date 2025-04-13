'use client';

import { useEffect, useState } from 'react';
import { db } from "../lib/firebase";
import { collection, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase";

export default function useUserStats() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats(data.stats?.monthData || []);
      }
    }

    fetchStats();
  }, [user]);

  return { stats, loading: !stats };
}
