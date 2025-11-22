import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // your server supabase client

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      client_id,
      phone,
      event,
      message = null,
      timestamp = null,
      meta = {},
      secret,
    } = body;

    // ✅ simple security gate
    if (secret !== process.env.WHATSAPP_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!client_id || !phone || !event) {
      return NextResponse.json(
        { error: "client_id, phone, and event are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase.from("whatsapp_events").insert({
      client_id,
      phone,
      event,
      message,
      meta: { ...meta, timestamp },
    });

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook capture failed:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
