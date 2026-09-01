import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: "cvm_004820",
    name: "BRASKEM S.A.",
    ticker: "BRASKEM",
    currency: "R$",
    periods: ["2023", "2024", "2025", "Budget 2026"],
    description: "Companhia aberta listada na CVM (BRASKEM) - Petroquímicos e Borracha carregada para análise corporativa."
  });
}
