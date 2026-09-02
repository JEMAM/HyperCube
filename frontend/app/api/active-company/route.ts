import { NextRequest, NextResponse } from "next/server";
import { sessionStore } from "../store";

export const dynamic = "force-dynamic";

export async function GET() {
  // If a custom upload already happened in this session, prioritize it
  if (sessionStore.hasUploaded()) {
    return NextResponse.json(sessionStore.getActiveCompany());
  }

  // Try fetching from local FastAPI backend if running on 8000
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);
    const res = await fetch("http://127.0.0.1:8000/api/active-company", {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Backend offline / serverless
  }

  return NextResponse.json(sessionStore.getActiveCompany());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = sessionStore.setActiveCompany(body);

    // Forward to FastAPI backend if available
    try {
      await fetch("http://127.0.0.1:8000/api/active-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {}

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update active company" }, { status: 400 });
  }
}
