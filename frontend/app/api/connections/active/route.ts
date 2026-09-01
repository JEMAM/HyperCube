import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active_connection: {
      id: "conn_totvs_protheus_local",
      instrument_id: "totvs_protheus",
      name: "TOTVS Protheus (MSSQL Local ERP)",
      environment: "local",
      status: "connected",
      latency_ms: 1.45,
      last_sync: "Agora (Tempo Real)"
    }
  });
}
