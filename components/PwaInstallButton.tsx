// components/PwaInstallButton.tsx
'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault(); // stop Chrome's mini-infobar
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setVisible(false);
    setDeferredPrompt(null);
    console.log('PWA install choice:', choice.outcome);
  };

  if (!visible) return null;

  return (
    <button
      onClick={install}
      className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-cyan-600 text-white font-bold shadow-lg hover:bg-cyan-500"
    >
      Install Apex Scorecard
    </button>
  );
}
