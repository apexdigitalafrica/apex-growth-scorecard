// app/pwa-install.tsx
"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
    console.log("PWA install choice:", choice.outcome);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]">
      <div className="bg-slate-900/95 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <span className="text-sm font-semibold">Install Apex Scorecard for a faster app experience.</span>
        <button
          onClick={install}
          className="text-sm font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500"
        >
          Install
        </button>
        <button
          onClick={() => setShow(false)}
          className="text-xs text-white/60 hover:text-white"
        >
          Later
        </button>
      </div>
    </div>
  );
}
