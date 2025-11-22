import WhatsAppFunnelScorecard from "@/components/WhatsAppFunnelScorecard";
import { getWhatsAppSnapshot } from "@/lib/whatsapp/getSnapshot";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function WhatsAppFunnelPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/whatsapp-funnel");

  // pull client_id from your client_users table
  const { data: clientUser } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!clientUser?.client_id) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        No client linked.
      </main>
    );
  }

  const snapshot = await getWhatsAppSnapshot(clientUser.client_id);

  if (!snapshot) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        No WhatsApp data in last 7 days yet.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <WhatsAppFunnelScorecard snapshot={snapshot} />
      </div>
    </main>
  );
}
