import { createClient } from "@/lib/supabase/server";
import type { WhatsAppFunnelSnapshot } from "@/lib/whatsappTypes";

export async function getWhatsAppSnapshot(clientId: string): Promise<WhatsAppFunnelSnapshot | null> {
  const supabase = createClient();

  // last 7 days
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data, error } = await supabase
    .from("whatsapp_events")
    .select("event, created_at")
    .eq("client_id", clientId)
    .gte("created_at", since.toISOString());

  if (error) throw error;
  if (!data) return null;

  const counts = {
    new_inbound: 0,
    first_response: 0,
    qualified: 0,
    booking: 0,
    closed_won: 0,
  };

  data.forEach((row) => {
    if (row.event in counts) counts[row.event as keyof typeof counts]++;
  });

  // Build stages from counts
  const stages = [
    { id: "new_inbound", label: "New Inbound Chats", input: counts.new_inbound, output: counts.first_response },
    { id: "first_response", label: "First Response → Active Conversation", input: counts.first_response, output: counts.qualified },
    { id: "qualified", label: "Qualified Lead", input: counts.qualified, output: counts.booking },
    { id: "booking", label: "Call / Demo Booked", input: counts.booking, output: counts.closed_won },
    { id: "closed_won", label: "Closed Won", input: counts.closed_won, output: counts.closed_won },
  ].map((s) => ({
    ...s,
    avgResponseMinutes: 0,          // we’ll compute later
    targetResponseMinutes: 5,
    targetConversion: 0.5
  }));

  return {
    id: "wa-live",
    businessName: "WhatsApp Funnel",
    periodLabel: "Last 7 Days",
    currency: "₦",
    estimatedRevenue: 0,
    stages,
  };
}
