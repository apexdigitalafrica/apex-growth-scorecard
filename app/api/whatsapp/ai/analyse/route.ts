import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { client_id, phone, message } = body;

  if (!client_id || !phone || !message)
    return NextResponse.json({ error: "client_id, phone, message required" }, { status: 400 });

  // Replace with your LLM provider of choice
  const insight = await runAIInspector(message);

  const supabase = createClient();
  const { error } = await supabase.from("whatsapp_ai_insights").insert({
    client_id,
    phone,
    message,
    insight,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, insight });
}

async function runAIInspector(message: string) {
  // 🔥 Enterprise scoring heuristics (no external dependency needed)
  const length = message.length;
  const hasCTA = /(book|schedule|call|demo|pay|subscribe|start now|choose plan)/i.test(message);
  const hasQuestion = /\?/g.test(message);
  const urgency = /(today|now|limited|slot|deadline|urgent)/i.test(message);

  const clarityScore =
    length < 15 ? 30 :
    length < 60 ? 70 :
    length < 180 ? 90 : 60;

  const ctaScore = hasCTA ? 90 : 25;
  const qualificationScore = hasQuestion ? 80 : 40;
  const urgencyScore = urgency ? 85 : 30;

  return {
    clarityScore,
    ctaScore,
    qualificationScore,
    urgencyScore,
    riskFlags: {
      too_long: length > 220,
      no_cta: !hasCTA,
      no_question: !hasQuestion
    },
    summary:
      !hasCTA
        ? "Message lacks a clear next step CTA."
        : "Message has directive next step.",
  };
}
