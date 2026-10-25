"use client";

import { useEffect, useState } from "react";
import { WifiOff, CheckCircle } from "lucide-react";

export default function PwaRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setSwRegistered(true);
        })
        .catch((err) => {
          console.warn("ServiceWorker registration failed:", err);
        });
    }

    // 2. Track Online/Offline status
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xl border border-amber-400 animate-bounce"
    >
      <WifiOff className="w-4 h-4" />
      <span>أنت الآن في وضع عدم الاتصال — زادِي يعمل محلياً بكامل ميزاته ⚡</span>
    </div>
  );
}
