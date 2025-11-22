// app/pwa-updater.tsx
"use client";

import { useEffect, useState } from "react";

export default function PWAUpdater() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShow(true);
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShow(true);
          }
        });
      });
    });
  }, []);

  const reloadToUpdate = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    setShow(false);
    window.location.reload();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999]">
      <div className="backdrop-blur-xl bg-slate-900/90 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <span className="text-sm font-semibold">New update available.</span>
        <button
          onClick={reloadToUpdate}
          className="text-sm font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
