"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { WifiOff, Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function subscribeToConnectivity(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

const getOnlineSnapshot = () => navigator.onLine;
const getServerOnlineSnapshot = () => true;

export default function PwaRegister() {
  const isOnline = useSyncExternalStore(
    subscribeToConnectivity,
    getOnlineSnapshot,
    getServerOnlineSnapshot
  );
  const isOffline = !isOnline;
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => console.warn("تعذّر تسجيل عامل الخدمة:", error));
    }

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  };

  return (
    <>
      {isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold text-label shadow-xl border border-amber-600"
        >
          <WifiOff className="w-4 h-4" aria-hidden="true" />
          <span>وضع عدم الاتصال — زادِي يعمل من التخزين المحلي ⚡</span>
        </div>
      )}

      {installEvent && !installDismissed && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl max-w-[92vw]">
          <Download
            className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0"
            aria-hidden="true"
          />
          <p className="text-body-sm font-bold text-slate-800 dark:text-slate-200">
            ثبّت «زادِي» على جهازك للوصول السريع دون إنترنت
          </p>
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-xl bg-teal-700 text-white text-label font-bold shrink-0"
          >
            تثبيت
          </button>
          <button
            onClick={() => setInstallDismissed(true)}
            aria-label="إغلاق اقتراح التثبيت"
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
