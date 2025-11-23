// app/whatsapp-events/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WhatsAppEventsClient from "@/components/WhatsAppEventsClient";

export default async function WhatsAppEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/whatsapp-events");

  const { data: clientUser } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!clientUser?.client_id) {
    redirect("/dashboard");
  }

  // Fetch initial events
  const { data: events } = await supabase
    .from("whatsapp_events")
    .select("*")
    .eq("client_id", clientUser.client_id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 quantum-grid"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-blue-900/20"></div>

      <div className="relative z-10 px-4 py-8 sm:px-8">
        <WhatsAppEventsClient 
          initialEvents={events || []} 
          clientId={clientUser.client_id}
        />
      </div>
    </main>
  );
}
