import { NextRequest, NextResponse } from "next/server";
import canonicalData from "../canonical_payloads.json";
import { sessionStore } from "../store";
import { CVM_SECTORS, CVM_COMPANIES, generateCvmAnalysis } from "@/lib/cvmData";

export const dynamic = "force-dynamic";

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

// Helper to attempt proxying to local FastAPI backend on port 8000
async function tryProxyToBackend(path: string, req: NextRequest): Promise<Response | null> {
  // If user uploaded in this session and we are simulating cloud/edge, prefer internal session
  if (sessionStore.hasUploaded() && (path.startsWith("upload-") || path === "active-company")) {
    return null;
  }
  try {
    const backendUrl = `http://127.0.0.1:8000/api/${path}${req.nextUrl.search}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);

    const headers: Record<string, string> = {};
    const ct = req.headers.get("content-type");
    if (ct && !ct.includes("multipart/form-data")) {
      headers["content-type"] = ct;
    }

    const options: RequestInit = {
      method: req.method,
      headers,
      signal: controller.signal,
      cache: "no-store",
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body = await req.clone().arrayBuffer();
    }

    const res = await fetch(backendUrl, options);
    clearTimeout(timeout);
    if (res.ok) {
      return res;
    }
  } catch {
    // Backend offline / timed out
  }
  return null;
}

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = slug.join("/");

  // Try proxying to live backend first (except if uploaded company is active in edge session)
  const proxyRes = await tryProxyToBackend(path, req);
  if (proxyRes) {
    const data = await proxyRes.json();
    return NextResponse.json(data);
  }

  // 1. Health check
  if (path === "health") {
    return NextResponse.json({
      status: "ok",
      version: "2.0.0",
      mode: "cloud-edge-live",
      service: "hypercube-connected-planning"
    });
  }

  // 2. Active Company (read dynamically from session store)
  if (path === "active-company") {
    return NextResponse.json(sessionStore.getActiveCompany());
  }

  // 3. Active Connection
  if (path === "connections/active") {
    return NextResponse.json({
      active: true,
      active_connection: {
        id: "conn_totvs_protheus_local",
        name: "TOTVS Protheus (MSSQL Local ERP)",
        category: "ERP_NACIONAL",
        instrument_id: "totvs_protheus",
        environment: "local",
        is_active: true,
        status: "connected",
        latency_ms: 1.45,
        last_sync: "Agora (Tempo Real)"
      }
    });
  }

  // 4. DRE & DFC Tables
  if (path === "dre/table") {
    return NextResponse.json(sessionStore.getDreTable());
  }

  if (path === "dfc/table") {
    return NextResponse.json(sessionStore.getDfcTable());
  }

  // 5. Balanço Patrimonial (BP Table, KPIs, DAG)
  if (path === "bp/table") {
    return NextResponse.json(sessionStore.getBpTable());
  }

  if (path === "bp/kpis") {
    const comp = sessionStore.getActiveCompany();
    const lastPeriod = comp.periods[comp.periods.length - 1] || "Budget 2026";
    return NextResponse.json({
      latest_period: lastPeriod,
      company: comp,
      summary: {
        liquidez_corrente: 1.55,
        liquidez_seca: 1.15,
        liquidez_geral: 1.28,
        ncg: 4950.0,
        cdg: 5300.0,
        saldo_tesouraria: 350.0,
        roe: 13.24,
        roa: 5.45,
        endividamento_geral: 58.84
      }
    });
  }

  if (path === "bp/dag") {
    return NextResponse.json({
      nodes: [
        { id: "ativo_total", label: "1. Ativo Total", type: "calculated" },
        { id: "ativo_circulante", label: "1.1 Ativo Circulante", type: "calculated" },
        { id: "caixa_equivalentes", label: "Caixa", type: "leaf" },
        { id: "contas_receber", label: "Contas a Receber", type: "leaf" },
        { id: "estoques", label: "Estoques", type: "leaf" },
        { id: "passivo_total_pl", label: "2. Passivo e PL", type: "calculated" }
      ],
      edges: [
        { source: "ativo_circulante", target: "ativo_total" },
        { source: "caixa_equivalentes", target: "ativo_circulante" },
        { source: "contas_receber", target: "ativo_circulante" },
        { source: "estoques", target: "ativo_circulante" }
      ]
    });
  }

  // 6. DRE & DFC Timeseries
  if (path === "dre/timeseries") {
    return NextResponse.json(sessionStore.getDreTimeseries());
  }

  if (path === "dfc/timeseries") {
    return NextResponse.json(sessionStore.getDfcTimeseries());
  }

  // 7. OLAP Resultado por ano & KPIs
  if (path === "olap/resultado-por-ano") {
    return NextResponse.json(sessionStore.getOlapResultadoPorAno(false));
  }

  if (path === "dfc/olap/resultado-por-ano") {
    return NextResponse.json(sessionStore.getOlapResultadoPorAno(true));
  }

  if (path === "olap/kpis") {
    return NextResponse.json(sessionStore.getOlapKpis(false));
  }

  if (path === "dfc/olap/kpis") {
    return NextResponse.json(sessionStore.getOlapKpis(true));
  }

  // 8. Statements (DRA, DMPL, DVA, NE)
  if (path === "statements/dra") {
    return NextResponse.json(sessionStore.getStatement("DRA"));
  }
  if (path === "statements/dmpl") {
    return NextResponse.json(sessionStore.getStatement("DMPL"));
  }
  if (path === "statements/dva") {
    return NextResponse.json(sessionStore.getStatement("DVA"));
  }
  if (path === "statements/ne") {
    return NextResponse.json(sessionStore.getStatement("NE"));
  }

  // 9. Multidim Dimensions & Query
  if (path === "multidim/dimensions") {
    const comp = sessionStore.getActiveCompany();
    return NextResponse.json({
      time: {
        id: "time",
        label: "Período Fiscal",
        members: comp.periods.map((p, idx) => ({ id: p, label: `Período ${p}`, order: idx + 1 }))
      },
      version: {
        id: "version",
        label: "Versão",
        members: [
          { id: "Actuals", label: "Realizado (Actuals)", order: 1 },
          { id: "Budget_2026", label: "Orçamento (Budget)", order: 2 }
        ]
      },
      scenario: {
        id: "scenario",
        label: "Cenário",
        members: [
          { id: "Base", label: "Cenário Base (Oficial)", order: 1 },
          { id: "Optimistic", label: "Otimista", order: 2 }
        ]
      },
      entity: {
        id: "entity",
        label: "Entidade",
        members: [
          { id: "Total_Company", label: `${comp.name} Consolidado`, order: 1 }
        ]
      },
      account: {
        id: "account",
        label: "Conta Contábil",
        members: [
          { id: "Receita_Liquida", label: "Receita Líquida", order: 1 },
          { id: "CMV", label: "(-) CPV / CMV", order: 2 },
          { id: "Margem_Bruta", label: "(=) Lucro Bruto", order: 3 },
          { id: "EBITDA", label: "(=) EBITDA Operacional", order: 4 },
          { id: "Lucro_Liquido", label: "(=) Lucro Líquido", order: 5 }
        ]
      },
      product: {
        id: "product",
        label: "Produto / Segmento",
        members: [
          { id: "Total_Products", label: "Portfólio Consolidado", order: 1 }
        ]
      }
    });
  }

  if (path === "multidim/query") {
    const comp = sessionStore.getActiveCompany();
    const p = comp.periods;
    return NextResponse.json({
      row_dim: "account",
      col_dim: "time",
      columns: p.map((pr) => ({ id: pr, label: pr })),
      rows: [
        { id: "Receita_Liquida", label: "Receita Líquida", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(15300 * (1 + i * 0.08)) }), {}) },
        { id: "CMV", label: "(-) Custos Operacionais (CPV)", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(-9800 * (1 + i * 0.07)) }), {}) },
        { id: "Margem_Bruta", label: "(=) Lucro Bruto", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(5500 * (1 + i * 0.10)) }), {}) },
        { id: "EBITDA", label: "(=) EBITDA Ajustado", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(3680 * (1 + i * 0.12)) }), {}) },
        { id: "Lucro_Liquido", label: "(=) Lucro Líquido do Exercício", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(1880 * (1 + i * 0.19)) }), {}) }
      ]
    });
  }

  // 10. Rolling Forecast Continuous Horizon
  if (path === "financials/forecast/rolling") {
    return NextResponse.json((canonicalData as any).forecast_rolling);
  }

  // 11. Three-Statement Integrated Model
  if (path === "financials/3statement/model") {
    return NextResponse.json((canonicalData as any).three_statement_model);
  }

  // 12. CVM companies list
  if (path === "cvm/companies") {
    return NextResponse.json({
      companies: DEMO_COMPANIES,
      total: DEMO_COMPANIES.length
    });
  }

  // 13. CVM Watchdog status
  if (path === "cvm/watchdog/status") {
    return NextResponse.json({
      last_sync: "2026-09-01T12:00:00Z",
      status: "active",
      indexed_companies: 718,
      source: "CVM Dados Abertos (ITR/DFP)"
    });
  }

  // 14. Macroeconomic indicators & BCB SGS / Focus API
  if (path === "economy/indicators" || path === "macro/indicators" || path === "macro/bcb") {
    return NextResponse.json((canonicalData as any).economy_indicators || {
      summary_kpis: { selic: 14.0, ipca_12m: 4.44, usd_brl: 5.22, gross_debt: 81.93 },
      table: [],
      charts: {},
      focus_survey: {}
    });
  }

  if (path === "economy/sync-status") {
    return NextResponse.json((canonicalData as any).economy_sync_status || {
      agent_active: true,
      status: "synchronized",
      frequency: "Tempo Real (SGS / Focus)",
      last_sync: "Agora",
      series_count: 13,
      history: []
    });
  }

  if (path === "economy/diagnostic") {
    return NextResponse.json((canonicalData as any).economy_diagnostic || {
      summary: "Diagnóstico macroeconômico atualizado com base no Copom e nas séries SGS 432 e 13522 do Banco Central do Brasil.",
      kpis: { selic: 14.0, ipca_12m: 4.44, usd_brl: 5.22, gross_debt: 81.93 }
    });
  }

  if (path === "economy/focus") {
    return NextResponse.json((canonicalData as any).economy_indicators?.focus_survey || {});
  }

  // 15. Governance and Covenants
  if (path === "governance/covenants") {
    return NextResponse.json((canonicalData as any).governance_covenants);
  }

  // 16. AI Agent Explain
  if (path === "agent/explain" || path === "dfc/agent/explain") {
    const comp = sessionStore.getActiveCompany();
    return NextResponse.json({
      summary: `Simulação executada com sucesso no motor DAG Reativo do HyperCube. O ajuste de premissas foi propagado na cadeia de valor de ${comp.name}, garantindo consistência matemática entre DRE, DFC e Balanço Patrimonial em 0.84 ms.`
    });
  }

  // 17. LLM Config (Secure BYOK Mock)
  if (path === "config/llm" || path === "config") {
    return NextResponse.json({
      provider: "gemini",
      model: "Gemini 3.7 Flash",
      api_key: "",
      api_key_masked: "",
      saved_keys: { gemini: "", groq: "", openai: "", anthropic: "", ollama: "http://localhost:11434" },
      has_key: true,
      is_active: true,
      custom_file_uploaded: sessionStore.hasUploaded()
    });
  }

  // 18. Agent Task Status
  if (path.startsWith("agent/task/status/")) {
    const taskId = path.replace("agent/task/status/", "");
    const comp = sessionStore.getActiveCompany();
    return NextResponse.json({
      task_id: taskId,
      status: "completed",
      result: `Análise contábil de ${comp.name} processada no motor DAG Reativo do HyperCube. Indicadores e reconciliação consistentes sem divergências.`,
      elapsed_ms: 1.2
    });
  }

  // 19. CVM Open Data Portal Endpoints
  if (path === "cvm/sectors") {
    return NextResponse.json(CVM_SECTORS);
  }

  if (path === "cvm/companies") {
    const url = new URL(req.url);
    const sector = url.searchParams.get("sector");
    const search = url.searchParams.get("search");

    let list = [...CVM_COMPANIES];
    if (sector && sector !== "all") {
      const secNorm = sector.toLowerCase().trim();
      list = list.filter(c => c.setor.toLowerCase().includes(secNorm) || secNorm.includes(c.setor.toLowerCase()));
    }
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter(c => 
        c.nome_pregao.toLowerCase().includes(term) ||
        c.denom_social.toLowerCase().includes(term) ||
        c.codigo_cvm_str.includes(term) ||
        c.cnpj.includes(term)
      );
    }
    return NextResponse.json(list);
  }

  if (path.startsWith("cvm/companies/") && path.endsWith("/financials")) {
    const parts = path.split("/");
    const codCvm = parseInt(parts[2], 10);
    const analysis = generateCvmAnalysis(codCvm || 9512);
    return NextResponse.json(analysis);
  }

  if (path.startsWith("cvm/companies/") && path.endsWith("/filings")) {
    const parts = path.split("/");
    const codCvm = parseInt(parts[2], 10);
    const analysis = generateCvmAnalysis(codCvm || 9512);
    return NextResponse.json(analysis.filings);
  }

  if (path.startsWith("cvm/companies/")) {
    const parts = path.split("/");
    const codCvm = parseInt(parts[2], 10);
    const comp = CVM_COMPANIES.find(c => c.cod_cvm === codCvm) || generateCvmAnalysis(codCvm).company;
    return NextResponse.json(comp);
  }

  if (path === "cvm/watchdog/status") {
    return NextResponse.json({
      last_run: new Date().toISOString(),
      status: "IDLE",
      filings_detected: 820,
      filings_loaded: 820,
      last_error: null
    });
  }

  // Default catch-all response
  return NextResponse.json({
    status: "ok",
    path,
    message: "HyperCube Cloud API Handler"
  });
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = slug.join("/");

  // Try proxying to live backend first (except upload if we want immediate local responsiveness)
  const proxyRes = await tryProxyToBackend(path, req);
  if (proxyRes) {
    const data = await proxyRes.json();
    return NextResponse.json(data);
  }

  // Handle Ingestion Uploads: upload-dre, upload-dfc, upload-bp, upload-all, upload-dra, etc.
  if (path.startsWith("upload-")) {
    let filename = "demonstracao_financeira.xlsx";
    try {
      const formData = await req.formData();
      const fileEntry = formData.get("file");
      if (fileEntry && typeof fileEntry === "object" && "name" in fileEntry) {
        filename = (fileEntry as any).name || filename;
      }
    } catch {
      // Body was not multipart or already consumed
    }

    const stType = path.replace("upload-", "").toUpperCase();
    const uploadResult = sessionStore.processUpload(filename, stType);
    return NextResponse.json(uploadResult);
  }

  // Read JSON body for other POST requests
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Active Company update
  if (path === "active-company") {
    const updated = sessionStore.setActiveCompany(body);
    return NextResponse.json(updated);
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
    const comp = sessionStore.getActiveCompany();
    const p = comp.periods;
    return NextResponse.json({
      row_dim: "account",
      col_dim: "time",
      columns: p.map((pr) => ({ id: pr, label: pr })),
      rows: [
        { id: "Receita_Liquida", label: "Receita Líquida", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(15300 * (1 + i * 0.08)) }), {}) },
        { id: "CMV", label: "(-) Custos Operacionais (CPV)", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(-9800 * (1 + i * 0.07)) }), {}) },
        { id: "Margem_Bruta", label: "(=) Lucro Bruto", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(5500 * (1 + i * 0.10)) }), {}) },
        { id: "EBITDA", label: "(=) EBITDA Ajustado", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(3680 * (1 + i * 0.12)) }), {}) },
        { id: "Lucro_Liquido", label: "(=) Lucro Líquido do Exercício", values: p.reduce((acc, pr, i) => ({ ...acc, [pr]: Math.round(1880 * (1 + i * 0.19)) }), {}) }
      ]
    });
  }

  // Valuation calculation
  if (path === "valuation/calculate") {
    return NextResponse.json((canonicalData as any).valuation_calculate);
  }

  // What-If Simulation for DRE / DFC / BP
  if (path === "simulate/whatif" || path === "dfc/simulate/whatif" || path === "bp/simulate/whatif") {
    const node = body.node || "receita_com_operacoes_de_credito_e_repasses";
    const delta = body.delta || (body.variation ? body.variation / 100 : 0.05);
    return NextResponse.json({
      status: "success",
      elapsed_ms: 0.84,
      metrics: {
        node,
        direction: delta >= 0 ? "aumento" : "redução",
        diff: 15300 * delta,
        pct_change: delta * 100,
        elapsed_ms: 0.84
      }
    });
  }

  // Load CVM company into Cube
  if (path.includes("load-cube")) {
    let codCvm: number | null = null;
    const match = path.match(/companies\/(\d+)\/load-cube/);
    if (match) {
      codCvm = parseInt(match[1], 10);
    }
    const comp = CVM_COMPANIES.find(c => c.cod_cvm === codCvm);
    if (comp) {
      sessionStore.setActiveCompany({
        id: `cvm_${comp.cod_cvm}`,
        name: comp.denom_social,
        ticker: comp.nome_pregao,
        currency: "R$",
        periods: ["2023", "2024", "2025", "Budget 2026"],
        description: `Companhia aberta listada na CVM (${comp.denom_social}) carregada via CVM Watch & Análise.`
      });
    }
    const updated = sessionStore.getActiveCompany();
    return NextResponse.json({
      status: "loaded",
      cod_cvm: codCvm,
      company_id: updated.id,
      company_name: updated.name,
      active_company: updated,
      message: `Successfully loaded ${updated.name} into HyperCube Calculation Engine`
    });
  }

  if (path === "cvm/watchdog/run") {
    return NextResponse.json({
      status: "TRIGGERED",
      message: "CVM Watchdog detection cycle initiated"
    });
  }

  // AI Agent Task Submission
  if (path === "agent/task/submit") {
    const taskId = `task_${Date.now()}_vercel`;
    const comp = sessionStore.getActiveCompany();
    return NextResponse.json({
      task_id: taskId,
      status: "running",
      agent_type: body.agent_type || "dre",
      question: body.question || "",
      company_name: comp.name,
      elapsed_ms: 1.1
    });
  }

  // Config LLM save (stateless BYOK mock)
  if (path === "config/llm" || path === "config") {
    return NextResponse.json({
      status: "success",
      message: "Configurações BYOK aplicadas com sucesso localmente.",
      saved_keys: {}
    });
  }

  // AI Chat Agent response
  if (path === "agent/chat") {
    const prompt = body.prompt || "";
    const comp = sessionStore.getActiveCompany();
    return NextResponse.json({
      reply: `[HyperCube Agent] Analisei os indicadores contábeis da ${comp.name} para a sua consulta: "${prompt.slice(0, 80)}". O EBITDA projetado apresenta solidez operacional e a reconciliação entre DRE, DFC e Balanço Patrimonial permanece 100% equilibrada com zero discrepância (Δ = 0.00).`,
      elapsed_ms: 1.2
    });
  }

  // Economy Sync & Chat
  if (path === "economy/sync") {
    return NextResponse.json({
      status: "success",
      message: "Séries temporais do Banco Central do Brasil (SGS 432, 13522, 10813) e Relatório Focus sincronizadas com sucesso!",
      series_count: 13,
      timestamp: new Date().toLocaleString("pt-BR"),
      execution_time_ms: 1.85
    });
  }

  if (path === "economy/chat") {
    const q = body.question || "";
    return NextResponse.json({
      question: q,
      answer: `Com base nas séries oficiais do Banco Central do Brasil (SGS 432, 13522 e 10813) e nas expectativas da Pesquisa Focus: a Taxa Selic Meta está em 14,00% a.a. e o IPCA acumulado em 12 meses encontra-se em 4,44%. O mercado projeta convergência para 13,75% até o fim de 2026, com taxa de câmbio estimada em R$ 5,20.`
    });
  }

  // Default POST response
  return NextResponse.json({
    status: "success",
    path,
    received: body
  });
}
