import { NextRequest, NextResponse } from "next/server";
import canonicalData from "../canonical_payloads.json";

export const dynamic = "force-dynamic";

// Fallback in-memory dataset for seamless Vercel / Cloud Demo
const DEMO_ACTIVE_COMPANY = {
  id: "cvm_004820",
  name: "BRASKEM S.A.",
  ticker: "BRASKEM",
  currency: "R$",
  periods: ["2023", "2024", "2025", "Budget 2026"],
  description: "Companhia aberta listada na CVM (BRASKEM) - Petroquímicos e Borracha."
};

const DEMO_COMPANIES = [
  {
    cod_cvm: 4820,
    nome_pregao: "BRASKEM",
    denom_social: "BRASKEM S.A.",
    cnpj: "42.150.391/0001-70",
    setor: "Petroquímicos e Borracha",
    situacao: "FASE OPERACIONAL",
    uf: "BA",
    has_statements: true,
    years_available: [2023, 2024, 2025]
  },
  {
    cod_cvm: 4170,
    nome_pregao: "VALE",
    denom_social: "VALE S.A.",
    cnpj: "33.592.510/0001-54",
    setor: "Mineração",
    situacao: "FASE OPERACIONAL",
    uf: "RJ",
    has_statements: true,
    years_available: [2023, 2024, 2025]
  },
  {
    cod_cvm: 9512,
    nome_pregao: "PETROBRAS",
    denom_social: "PETRÓLEO BRASILEIRO S.A. PETROBRAS",
    cnpj: "33.000.167/0001-01",
    setor: "Petróleo e Gás",
    situacao: "FASE OPERACIONAL",
    uf: "RJ",
    has_statements: true,
    years_available: [2023, 2024, 2025]
  },
  {
    cod_cvm: 1023,
    nome_pregao: "BANCO DO BRASIL",
    denom_social: "BANCO DO BRASIL S.A.",
    cnpj: "00.000.000/0001-91",
    setor: "Intermediação Financeira",
    situacao: "FASE OPERACIONAL",
    uf: "DF",
    has_statements: true,
    years_available: [2023, 2024, 2025]
  }
];

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = slug.join("/");

  // 1. Health check
  if (path === "health") {
    return NextResponse.json({
      status: "ok",
      version: "2.0.0",
      mode: "cloud-edge-live",
      service: "hypercube-connected-planning"
    });
  }

  // 2. Active Company
  if (path === "active-company") {
    return NextResponse.json(DEMO_ACTIVE_COMPANY);
  }

  // 3. Active Connection
  if (path === "connections/active") {
    return NextResponse.json({
      active: true,
      active_connection: {
        id: "conn_protheus_demo",
        name: "TOTVS Protheus (MSSQL Local ERP)",
        category: "ERP_NACIONAL",
        instrument_id: "totvs_protheus",
        environment: "local",
        is_active: true,
        status: "connected",
        last_sync: "2026-09-01T21:00:00Z"
      }
    });
  }

  // 4. Rolling Forecast Continuous Horizon
  if (path === "financials/forecast/rolling") {
    return NextResponse.json((canonicalData as any).forecast_rolling);
  }

  // 5. Three-Statement Integrated Model
  if (path === "financials/3statement/model") {
    return NextResponse.json((canonicalData as any).three_statement_model);
  }

  // 6. Multidim Dimensions & Cube
  if (path === "multidim/dimensions") {
    return NextResponse.json((canonicalData as any).multidim_dimensions);
  }

  if (path === "multidim/query") {
    return NextResponse.json((canonicalData as any).multidim_query);
  }

  // 7. Balanço Patrimonial (BP Table)
  if (path === "bp/table") {
    return NextResponse.json((canonicalData as any).bp_table);
  }

  // 8. DRE & DFC Timeseries
  if (path === "dre/timeseries") {
    return NextResponse.json((canonicalData as any).dre_timeseries);
  }

  if (path === "dfc/timeseries") {
    return NextResponse.json((canonicalData as any).dfc_timeseries);
  }

  // 9. CVM companies list
  if (path === "cvm/companies") {
    return NextResponse.json({
      companies: DEMO_COMPANIES,
      total: DEMO_COMPANIES.length
    });
  }

  // 10. CVM Watchdog status
  if (path === "cvm/watchdog/status") {
    return NextResponse.json({
      last_sync: "2026-09-01T12:00:00Z",
      status: "active",
      indexed_companies: 718,
      source: "CVM Dados Abertos (ITR/DFP)"
    });
  }

  // 11. Macroeconomic indicators (BCB SGS API)
  if (path === "macro/indicators" || path === "macro/bcb") {
    return NextResponse.json({
      selic: { value: 10.75, date: "01/09/2026", unit: "% a.a." },
      ipca: { value: 4.12, date: "08/2026", unit: "% a.a." },
      cambio_usd: { value: 5.48, date: "01/09/2026", unit: "R$/USD" },
      pib_proj: { value: 2.30, date: "2026", unit: "%" },
      source: "Banco Central do Brasil (SGS/Focus)"
    });
  }

  // 12. Governance and Covenants
  if (path === "governance/covenants") {
    return NextResponse.json((canonicalData as any).governance_covenants);
  }

  // 13. AI Agent Explain
  if (path === "agent/explain") {
    return NextResponse.json({
      summary: "Simulação executada com sucesso no motor DAG Reativo do HyperCube. O ajuste de premissas foi propagado na cadeia de valor da BRASKEM S.A., garantindo consistência matemática entre DRE, DFC e Balanço Patrimonial em 0.84 ms."
    });
  }

  // 14. LLM Config
  if (path === "config/llm") {
    return NextResponse.json({
      provider: "gemini",
      model: "Gemini 3.7 Flash",
      api_key: "",
      saved_keys: { gemini: "", groq: "", openai: "", anthropic: "", ollama: "http://localhost:11434" },
      has_key: true,
      is_active: true,
      custom_file_uploaded: false
    });
  }

  // Default catch-all response
  return NextResponse.json({
    status: "ok",
    path,
    message: "HyperCube Cloud API Mock Handler"
  });
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = slug.join("/");
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Monte Carlo Simulation
  if (path === "financials/forecast/monte-carlo") {
    return NextResponse.json((canonicalData as any).monte_carlo);
  }

  // Three Statement Simulation
  if (path === "financials/3statement/simulate") {
    return NextResponse.json((canonicalData as any).three_statement_model);
  }

  // Multidim query
  if (path === "multidim/query") {
    return NextResponse.json((canonicalData as any).multidim_query);
  }

  // What-If Simulation for DRE / DFC
  if (path === "simulate/whatif" || path === "dfc/simulate/whatif") {
    const node = body.node || "receita_com_operacoes_de_credito_e_repasses";
    const delta = body.delta || 0.05;
    return NextResponse.json({
      status: "success",
      elapsed_ms: 0.84,
      metrics: {
        node,
        direction: delta >= 0 ? "aumento" : "redução",
        diff: 14560 * delta,
        pct_change: delta * 100,
        elapsed_ms: 0.84
      }
    });
  }

  // Load CVM company into Cube
  if (path.includes("load-cube")) {
    return NextResponse.json({
      status: "success",
      message: "BRASKEM S.A. carregada com sucesso no HyperCube Engine.",
      company: DEMO_ACTIVE_COMPANY
    });
  }

  // AI Chat Agent response
  if (path === "agent/chat") {
    const prompt = body.prompt || "";
    return NextResponse.json({
      reply: `[HyperCube Agent] Analisei os indicadores contábeis da BRASKEM S.A. para a sua consulta: "${prompt.slice(0, 80)}". O EBITDA projetado para 2026 apresenta resiliência sob volatilidade estocástica e a reconciliação entre DRE, DFC e Balanço Patrimonial permanece 100% equilibrada com zero discrepância (Δ = 0.00).`,
      elapsed_ms: 1.2
    });
  }

  // Default POST response
  return NextResponse.json({
    status: "success",
    path,
    received: body
  });
}
