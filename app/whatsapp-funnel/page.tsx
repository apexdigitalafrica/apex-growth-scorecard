'use client';

import { useEffect, useState, useCallback } from "react";
import WhatsAppFunnelScorecard from "@/components/WhatsAppFunnelScorecard";
import { useRouter } from "next/navigation";

export default function WhatsAppFunnelPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<any>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async (cid: string) => {
    try {
      const res = await fetch("/api/whatsapp/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: cid, range: "7d" }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch funnel data: ${res.status}`);
      }

      const data = await res.json();
      setSnapshot(data);
    } catch (err) {
      console.error("Error fetching funnel data:", err);
      setError("Failed to load funnel data");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/client/context", {
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          console.log("❌ Unauthorized - redirecting to login");
          router.push("/login?next=/whatsapp-funnel");
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch context: ${res.status}`);
        }

        const ctx = await res.json();
        
        if (ctx?.client_id) {
          setClientId(ctx.client_id);
          await refreshData(ctx.client_id);
        } else {
          setError("No client linked to your account");
        }
      } catch (err) {
        console.error("Error fetching client context:", err);
        setError("Failed to load client context");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshData, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading client context…</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">{error}</div>
          <button
            onClick={() => router.push("/client-portal/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // No client state
  if (!clientId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">No client linked</div>
      </div>
    );
  }

  // Loading funnel data
  if (!snapshot) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading funnel data…</div>
      </div>
    );
  }

  // Success state
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <WhatsAppFunnelScorecard snapshot={snapshot} />
      </div>
    </main>
  );
}
