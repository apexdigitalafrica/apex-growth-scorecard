import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createClient();

  const { data: rules, error: ruleErr } = await supabase
    .from("whatsapp_alert_rules")
    .select("*")
    .eq("enabled", true);

  if (ruleErr) return NextResponse.json({ error: ruleErr.message }, { status: 500 });

  for (const rule of rules || []) {
    const snapshotRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/whatsapp/funnel`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ client_id: rule.client_id, range: "7d" }),
    });
    const snapshot = await snapshotRes.json();

    const stage = snapshot.stages.find((s: any) => s.id === rule.stage);
    if (!stage) continue;

    if (stage.dropoff >= rule.dropoff_threshold) {
      await fireAlert(rule.client_id, stage);
    }
  }

  return NextResponse.json({ ok: true });
}

async function fireAlert(client_id: string, stage: any) {
  const payload = {
    client_id,
    stage: stage.id,
    dropoff: stage.dropoff,
    message: `🚨 Drop-off spike detected at ${stage.label}: ${(stage.dropoff*100).toFixed(1)}%`
  };

  // ✅ Send to Make.com webhook (then Slack/Pipedrive/Email)
  await fetch(process.env.MAKE_ALERT_WEBHOOK_URL!, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });
}
