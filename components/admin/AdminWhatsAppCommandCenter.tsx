'use client';

import { useEffect, useState } from "react";
import { BarChart3, Users, Activity } from "lucide-react";

export default function AdminWhatsAppCommandCenter() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then(r => r.json())
      .then(setClients);
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    fetch("/api/whatsapp/funnel", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ client_id: selectedClient, range: "30d" })
    })
      .then(r => r.json())
      .then(setSnapshot);
  }, [selectedClient]);

  return (
    <div className="space-y-8 text-white">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-black flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          WhatsApp Intelligence Command Center
        </h1>
        <div className="text-sm text-white/60">Admin-Only</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total Clients" value={clients.length} icon={Users} />
        <Stat label="Realtime Monitoring" value="ON" icon={Activity} />
        <Stat label="Range" value="Last 30d" icon={BarChart3} />
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <label className="text-sm font-bold text-white/80">Select Client</label>
        <select
          className="mt-2 w-full p-3 rounded-xl bg-slate-900 border border-white/10"
          onChange={(e) => setSelectedClient(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Choose client</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.company_name}
            </option>
          ))}
        </select>
      </section>

      {snapshot && (
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-black">{snapshot.client_id}</h2>
          <pre className="text-xs text-white/70 overflow-auto">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
      <div className="p-2 rounded-xl bg-cyan-500/20"><Icon className="w-5 h-5 text-cyan-300" /></div>
      <div>
        <div className="text-sm text-white/60">{label}</div>
        <div className="text-2xl font-black">{value}</div>
      </div>
    </div>
  );
}
