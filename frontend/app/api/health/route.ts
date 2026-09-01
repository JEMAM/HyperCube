import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "2.0.0",
    mode: "cloud-edge-live",
    service: "hypercube-connected-planning"
  });
}
