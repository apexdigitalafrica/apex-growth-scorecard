// app/api/client/context/route.ts
import { NextResponse } from "next/server";
import { getClientContext } from "@/lib/getClientContext";

export async function GET() {
  const ctx = await getClientContext();

  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(ctx);
}
