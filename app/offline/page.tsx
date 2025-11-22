// app/offline/page.tsx
'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-3xl font-black mb-3">You’re Offline</h1>
        <p className="text-white/70 mb-6">
          No worries — Apex is still here. Please reconnect and your portal will resume automatically.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
          <div className="font-bold mb-2">What you can do now:</div>
          <ul className="list-disc pl-5 text-white/80 space-y-1">
            <li>Check your saved pages</li>
            <li>Reopen the app after connection</li>
            <li>Your latest portal shell is cached</li>
          </ul>
        </div>

        <button
          onClick={() => location.reload()}
          className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
