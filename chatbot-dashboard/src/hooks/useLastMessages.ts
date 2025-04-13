import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export default function useLastMessages(limit = 3) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const res = await fetch(`/api/history?uid=${user.uid}&limit=${limit}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data);
      setLoading(false);
    });

    return () => unsub();
  }, [limit]);

  return { messages, loading };
}
