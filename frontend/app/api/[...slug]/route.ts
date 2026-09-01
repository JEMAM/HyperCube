import { NextRequest, NextResponse } from "next/server";

// Fallback in-memory dataset for seamless Vercel / Cloud Demo
const DEMO_ACTIVE_COMPANY = {
  id: "cvm_004820",
  name: "BRASKEM S.A.",
  ticker: "BRASKEM",
  currency: "R$",
  periods: ["2023", "2024", "2025", "Budget 2026"],
  description: "Companhia aberta listada na CVM (BRASKEM) - Petroquímicos e Borracha."
};

const DEMO_DRE_KPIS = {
  Total_Produto_Intermediacao: 14560.0,
  Total_Resultado_Intermediacao: 5824.0,
  Total_Resultado_Antes_Tributacao: 3057.6,
  Total_Lucro_Liquido: 2074.8
};

const DEMO_DRE_ANNUAL = [
  {
    ano: 2023,
    produto_intermediacao: 13800.0,
    resultado_intermediacao: 5520.0,
    resultado_antes_tributacao: 2898.0,
    lucro_liquido: 1960.0,
    lucro_liquido_prev_year: 0.0,
    yoy_growth_pct: 0.0
  },
  {
    ano: 2024,
    produto_intermediacao: 14560.0,
    resultado_intermediacao: 5824.0,
    resultado_antes_tributacao: 3057.6,
    lucro_liquido: 2074.8,
    lucro_liquido_prev_year: 1960.0,
    yoy_growth_pct: 5.86
  },
  {
    ano: 2025,
    produto_intermediacao: 15430.0,
    resultado_intermediacao: 6172.0,
    resultado_antes_tributacao: 3240.3,
    lucro_liquido: 2198.5,
    lucro_liquido_prev_year: 2074.8,
    yoy_growth_pct: 5.96
  }
];

const DEMO_DFC_KPIS = {
  Total_FCO: 11850.2,
  Total_FCI: -7140.0,
  Total_FCF: -4213.1,
  Total_Variacao_Liquida: 497.1,
  Saldo_Final_Atual: 4052.9
};

const DEMO_DFC_ANNUAL = [
  {
    ano: 2023,
    fco: 10500.0,
    fci: -6200.0,
    fcf: -3900.0,
    variacao_liquida: 400.0,
    saldo_final: 3555.8,
    yoy_growth_pct: 0.0
  },
  {
    ano: 2024,
    fco: 11850.2,
    fci: -7140.0,
    fcf: -4213.1,
    variacao_liquida: 497.1,
    saldo_final: 4052.9,
    yoy_growth_pct: 12.86
  },
  {
    ano: 2025,
    fco: 12900.0,
    fci: -7600.0,
    fcf: -4500.0,
    variacao_liquida: 800.0,
    saldo_final: 4852.9,
    yoy_growth_pct: 8.86
  }
];

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

  // 3. Active ERP Connection
  if (path === "connections/active") {
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

  if (path === "connections") {
    return NextResponse.json([
      {
        id: "conn_totvs_protheus_local",
        name: "TOTVS Protheus (MSSQL Local ERP)",
        status: "connected",
        environment: "local",
        latency_ms: 1.45,
        last_sync: "Agora (Tempo Real)"
      }
    ]);
  }

  // 4. DRE OLAP endpoints
  if (path === "olap/kpis") {
    return NextResponse.json(DEMO_DRE_KPIS);
  }

  if (path === "olap/resultado-por-ano") {
    return NextResponse.json(DEMO_DRE_ANNUAL);
  }

  // 5. DFC OLAP endpoints
  if (path === "dfc/olap/kpis") {
    return NextResponse.json(DEMO_DFC_KPIS);
  }

  if (path === "dfc/olap/resultado-por-ano") {
    return NextResponse.json(DEMO_DFC_ANNUAL);
  }

  // 6. CVM companies list
  if (path === "cvm/companies") {
    return NextResponse.json({
      companies: DEMO_COMPANIES,
      total: DEMO_COMPANIES.length
    });
  }

  // 7. CVM Watchdog status
  if (path === "cvm/watchdog/status") {
    return NextResponse.json({
      last_sync: "2026-09-01T12:00:00Z",
      status: "active",
      indexed_companies: 718,
      source: "CVM Dados Abertos (ITR/DFP)"
    });
  }

  // 8. Macroeconomic indicators (BCB SGS API)
  if (path === "macro/indicators" || path === "macro/bcb") {
    return NextResponse.json({
      selic: { value: 10.75, date: "01/09/2026", unit: "% a.a." },
      ipca: { value: 4.12, date: "08/2026", unit: "% a.a." },
      cambio_usd: { value: 5.48, date: "01/09/2026", unit: "R$/USD" },
      pib_proj: { value: 2.30, date: "2026", unit: "%" },
      source: "Banco Central do Brasil (SGS/Focus)"
    });
  }

  // 9. Governance and Covenants
  if (path === "governance/covenants") {
    return NextResponse.json({
      status: "compliant",
      covenants: [
        { name: "Dívida Líquida / EBITDA", current: 1.85, max: 3.50, status: "OK" },
        { name: "Cobertura de Juros (ICR)", current: 4.20, min: 2.00, status: "OK" }
      ]
    });
  }

  // 10. AI Agent Explain
  if (path === "agent/explain") {
    return NextResponse.json({
      summary: "Simulação executada com sucesso no motor DAG Reativo do HyperCube. O ajuste de premissas foi propagado na cadeia de valor da BRASKEM S.A., garantindo consistência matemática entre DRE, DFC e Balanço Patrimonial em 0.84 ms."
    });
  }

  // 11. LLM Config
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

  // AI Agent Ask
  if (path === "agent/ask") {
    return NextResponse.json({
      answer: "A análise financeira da **BRASKEM S.A.** indica uma margem bruta de 40.0% e margem EBIT de 21.0%, com forte geração de caixa operacional (FCO de R$ 11,85 Bi). A estrutura de capital permanece sólida com cobertura de juros adequada e liquidez corrente compatível com o ciclo petroquímico global."
    });
  }

  // LLM Config update
  if (path === "config/llm") {
    return NextResponse.json({
      status: "success",
      message: `Configuração atualizada para ${body.model || "Gemini 3.7 Flash"}.`,
      has_key: true,
      is_active: true
    });
  }

  return NextResponse.json({
    status: "success",
    path,
    received: body
  });
}
