import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STAGES = [
  { id: "new_inbound", label: "New Inbound Chats" },
  { id: "first_response", label: "First Response → Active Conversation" },
  { id: "qualified", label: "Qualified Lead" },
  { id: "booking", label: "Call / Demo Booked" },
  { id: "closed_won", label: "Closed Won" },
];

export async function POST(req: Request) {
  const { client_id, range = "7d" } = await req.json();
  if (!client_id)
    return NextResponse.json({ error: "client_id required" }, { status: 400 });

  const supabase = createClient();
  const days = range === "30d" ? 30 : 7;
  const fromDate = new Date(Date.now() - days * 86400000).toISOString();

  const { data: events, error } = await supabase
    .from("whatsapp_events")
    .select("event, phone, created_at, meta, message")
    .eq("client_id", client_id)
    .gte("created_at", fromDate)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // stage counts
  const counts: Record<string, number> = {};
  for (const s of STAGES) counts[s.id] = 0;
  for (const e of events || []) {
    if (counts[e.event] !== undefined) counts[e.event]++;
  }

  // compute stage inputs/outputs strictly sequential
  const stages = STAGES.map((stage, i) => {
    const input = i === 0 ? counts[stage.id] : counts[STAGES[i - 1].id];
    const output = counts[stage.id];

    const conversion = input > 0 ? output / input : 0;
    const dropoff = input > 0 ? (input - output) / input : 1;

    const avgResponseMinutes = avgResponse(events || [], stage.id);

    return {
      id: stage.id,
      label: stage.label,
      input,
      output,
      conversion,
      dropoff,
      avgResponseMinutes,
      targetResponseMinutes: targetResponse(stage.id),
      targetConversion: targetConv(stage.id),
    };
  });

  const estimatedRevenue = counts["closed_won"] * 250_000; // tune later

  return NextResponse.json({
    id: `wa-${client_id}-${range}`,
    client_id,
    periodLabel: `Last ${days} Days`,
    estimatedRevenue,
    currency: "₦",
    businessName: "WhatsApp Funnel",
    stages,
  });
}

function avgResponse(events: any[], stageId: string) {
  const arr = events.filter((e) => e.event === stageId && e.meta?.response_ms);
  if (!arr.length) return 0;
  return Math.round(arr.reduce((s, e) => s + e.meta.response_ms, 0) / arr.length / 60000);
}

function targetResponse(stageId: string) {
  switch (stageId) {
    case "new_inbound": return 5;
    case "first_response": return 5;
    case "qualified": return 8;
    case "booking": return 10;
    case "closed_won": return 15;
    default: return 5;
  }
}

function targetConv(stageId: string) {
  switch (stageId) {
    case "new_inbound": return 0.7;
    case "first_response": return 0.75;
    case "qualified": return 0.4;
    case "booking": return 0.45;
    case "closed_won": return 0.35;
    default: return 0.5;
  }
}
