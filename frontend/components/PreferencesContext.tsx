"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

type Language = "pt" | "en";
type Theme = "dark" | "light";

export interface ActiveCompany {
  id: string;
  name: string;
  ticker: string;
  currency: string;
  periods: string[];
  description: string;
}

export interface ActiveConnection {
  id: string;
  instrument_id: string;
  name: string;
  environment: "local" | "cloud";
  status: "connected" | "idle" | "error";
  latency_ms?: number;
  last_sync?: string;
}

export const EMPTY_ACTIVE_COMPANY: ActiveCompany = {
  id: "aguardando_upload",
  name: "Aguardando Upload ou CVM Watch",
  ticker: "",
  currency: "R$",
  periods: [],
  description: "Nenhuma empresa carregada no motor. Realize o upload de demonstrações na aba 'Visão Geral & Ingestão' ou selecione uma companhia no 'CVM Watch & Análise'."
};

export const DEFAULT_ACTIVE_COMPANY: ActiveCompany = EMPTY_ACTIVE_COMPANY;

interface PreferencesContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
  apiBaseUrl: string;
  backendOnline: boolean | null;
  checkBackendHealth: () => Promise<boolean>;
  activeCompany: ActiveCompany;
  hasActiveData: boolean;
  setHasActiveData: (val: boolean) => void;
  clearActiveCompany: () => void;
  setActiveCompany: (company: ActiveCompany) => void;
  refreshActiveCompany: () => Promise<ActiveCompany>;
  activeConnection: ActiveConnection | null;
  setActiveConnection: (conn: ActiveConnection | null) => void;
  refreshActiveConnection: () => Promise<ActiveConnection | null>;
  disconnectConnection: () => Promise<void>;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    appTitle: "HyperCube",
    appSubtitle: "Motor de cálculo reativo multidimensional (Connected Planning)",
    dataSource: "Fonte: Demonstrações Financeiras (DRE / DFC Multi-Setorial)",
    backendStatus: "FastAPI Backend: Ativo",

    // Navigation Tabs
    landingTab: "Apresentação da Plataforma",
    overviewTab: "Visão Geral & Ingestão",
    connectionsTab: "Conexões ERP & Bancos de Dados",
    connectionsHeaderTitle: "Conexões ERP & Bancos de Dados (Local & Nuvem)",
    connectionsHeaderDesc: "Conectores nativos para integração em tempo real com ERPs (SAP, Oracle, TOTVS, Dynamics) e bancos de dados corporativos.",
    economyTab: "Macroeconomia & BCB",
    planningTab: "Planejamento Conectado (N-D)",
    driversTab: "Planejamento por Drivers (Headcount & Capex)",
    dreTab: "Demonstração DRE",
    dfcTab: "Fluxo de Caixa (DFC)",
    bpTab: "Balanço Patrimonial (BP)",
    draTab: "Resultado Abrangente (DRA)",
    dmplTab: "Mutações do PL (DMPL)",
    dvaTab: "Valor Adicionado (DVA)",
    neTab: "Notas Explicativas (NE)",
    dagTab: "Grafo DAG de Dependências",
    cubeTab: "Cubo 3D OLAP Interativo",
    valuationTab: "Valuation Corporativo",
    cvmTab: "CVM Watch & Análise",
    guideTab: "Guia do Usuário & Manual",

    // Top Bar & Workspace
    collapseMenu: "Recolher Menu",
    expandMenu: "Abrir Menu",
    workspaceLabel: "Workspace Corporativo HyperCube:",
    modelConsolidated: "Modelo Financeiro Consolidado",
    backendActive: "API Backend Ativa",
    backendInactive: "API Backend Desconectada",
    aiActive: "Ativo",
    aiInactive: "Inativo",

    // View Headers
    dreHeaderTitle: "Demonstração do Resultado (DRE)",
    dreHeaderDesc: "Contas contábeis extraídas, padronizadas e consolidadas por período fiscal.",
    dfcHeaderTitle: "Demonstração do Fluxo de Caixa (DFC)",
    dfcHeaderDesc: "Visão consolidada dos fluxos operacional (FCO), investimento (FCI) e financiamento (FCF).",
    bpHeaderTitle: "Balanço Patrimonial (BP)",
    bpHeaderDesc: "Estrutura patrimonial consolidada (Ativo, Passivo e PL), análise Fleuriet, índices e simulação What-If.",
    dagHeaderTitle: "Grafo DAG de Dependências Contábeis",
    dagHeaderDesc: "Árvore de ordenação topológica e propagação reativa de fórmulas financeiras.",

    // Scenario Panel
    whatifTitle: 'Painel de Simulação "What-If"',
    inputNodeLabel: "Premissa / Nó de Entrada",
    variationLabel: "Variação (%)",
    startYearLabel: "Ano Inicial",
    endYearLabel: "Ano Final",
    runSimulation: "Executar Simulação",
    simulating: "Simulando...",
    resetSimulation: "Resetar Cenários",
    reactivityBadge: "⚡ Reatividade Hyperblock",
    affectedNodes: "Nós Afetados",
    recalcTime: "Tempo de Cálculo",

    // Options for Input Nodes
    fundingExpenseOpt: "Custos Operacionais / Captação / CMV",
    creditRiskOpt: "Provisão para Devedores / Risco de Crédito",
    creditRevOpt: "Receita Operacional Líquida / Vendas",
    adminExpenseOpt: "Despesas Pessoal e Administrativas (SG&A)",

    // DAG
    dagTitle: "Grafo de Dependência Financeira (DAG)",
    topologicalSort: "Ordenação Topológica Reativa",

    // Node Labels PT
    receita_com_operacoes_de_credito_e_repasses: "Receita Operacional Líquida / Vendas",
    receita_titulos_valores_mobiliarios: "Receita com Títulos / Complementar",
    despesas_de_captacao: "Custos Operacionais / CMV / Captação",
    provisao_para_risco_de_credito_prc: "Provisão de Risco / Perdas Estimadas",
    receita_de_dividendos_e_juros_sobre_o_capital_proprio: "Dividendos e JCP",
    resultado_com_equivalencia_patrimonial: "Equivalência Patrimonial",
    reversao_constituicao_de_provisao_para_ajuste_de_investimentos: "Reversão Ajuste Investimentos",
    resultado_com_alienacoes_de_titulos_de_renda_variavel: "Alienação Renda Variável",
    resultado_com_derivativos_renda_variavel: "Resultado com Derivativos",
    resultado_com_fundos_participacoes_societarias: "Resultado Fundos de Investimento",
    outras_rendas_despesas_sobre_participacoes_societarias: "Outras Rendas/Despesas Participações",
    despesas_pessoal_e_administrativas: "Despesas Pessoal e Admin (SG&A)",
    despesas_tributarias: "Despesas Tributárias",
    outras_despesas_liquidas: "Outras Despesas Líquidas",
    produto_da_intermediacao_financeira: "Margem / Produto Operacional Bruto",
    resultado_da_intermediacao_financeira: "Resultado Operacional Ajustado",
    resultado_com_participacoes_societarias: "Resultado Participações Societárias",
    resultado_antes_da_tributacao: "Resultado Antes da Tributação (EBT)",
    tributos_sobre_o_lucro: "Tributos sobre o Lucro",
    participacao_nos_lucros: "Participação nos Lucros",
    lucro_liquido: "Lucro Líquido / Resultado do Período",

    // KPIs & Dashboard
    prodIntermed: "Margem Operacional Bruta",
    resIntermed: "Resultado Operacional",
    resBeforeTax: "Resultado Antes Tributos (EBT)",
    netIncomeAcc: "Lucro Líquido Acumulado",
    annualChartTitle: "Evolução Anual do Lucro Líquido e Crescimento YoY (%)",
    netIncomeLegend: "Lucro Líquido (R$)",
    resIntermedLegend: "Resultado Operacional",

    // Agent Panel
    agentTitle: "Agente IA Universal — Resumo & Análise Financeira",
    agentPrompt: "Execute uma simulação 'What-If' para gerar o resumo executivo automatizado do agente IA.",
    askAgentLabel: "Pergunte ao Agente Financeiro Universal",
    askPlaceholder: "Ex: Qual o impacto da variação de vendas no resultado final?",
  },
  en: {
    appTitle: "HyperCube",
    appSubtitle: "Multidimensional Reactive Calculation Engine (Connected Planning)",
    dataSource: "Source: Financial Statements (Multi-Sector DRE / DFC)",
    backendStatus: "FastAPI Backend: Active",

    // Navigation Tabs
    landingTab: "Platform Overview",
    overviewTab: "Overview & Ingestion",
    connectionsTab: "ERP & Database Connections",
    connectionsHeaderTitle: "ERP & Database Connectors (On-Premises & Cloud)",
    connectionsHeaderDesc: "Native connectors for real-time integration with ERPs (SAP, Oracle, TOTVS, Dynamics) and corporate databases.",
    economyTab: "Macroeconomics & BCB",
    planningTab: "Connected Planning (N-D)",
    driversTab: "Driver-Based Planning (Headcount & Capex)",
    dreTab: "Income Statement (DRE)",
    dfcTab: "Cash Flow Statement (DFC)",
    bpTab: "Balance Sheet (BP)",
    draTab: "Comprehensive Income (DRA)",
    dmplTab: "Changes in Equity (DMPL)",
    dvaTab: "Added Value (DVA)",
    neTab: "Explanatory Notes (NE)",
    dagTab: "DAG Dependency Graph",
    cubeTab: "Interactive 3D OLAP Cube",
    valuationTab: "Corporate Valuation",
    cvmTab: "CVM Watch & Analysis",
    guideTab: "User Guide & Manual",

    // Top Bar & Workspace
    collapseMenu: "Collapse Menu",
    expandMenu: "Expand Menu",
    workspaceLabel: "HyperCube Corporate Workspace:",
    modelConsolidated: "Consolidated Financial Model",
    backendActive: "Backend API Active",
    backendInactive: "Backend API Disconnected",
    aiActive: "Active",
    aiInactive: "Inactive",

    // View Headers
    dreHeaderTitle: "Income Statement (DRE)",
    dreHeaderDesc: "Accounting accounts extracted, standardized and consolidated by fiscal period.",
    dfcHeaderTitle: "Cash Flow Statement (DFC)",
    dfcHeaderDesc: "Consolidated view of operating (CFO), investing (CFI), and financing (CFF) cash flows.",
    bpHeaderTitle: "Balance Sheet (BP)",
    bpHeaderDesc: "Consolidated asset/liability structure, Fleuriet working capital, ratios, and What-If simulation.",
    dagHeaderTitle: "Accounting Dependency DAG Graph",
    dagHeaderDesc: "Topological sorting tree and reactive financial formula propagation.",

    // Scenario Panel
    whatifTitle: 'What-If Scenario Simulation Panel',
    inputNodeLabel: "Assumption / Input Node",
    variationLabel: "Variation (%)",
    startYearLabel: "Start Year",
    endYearLabel: "End Year",
    runSimulation: "Run Simulation",
    simulating: "Simulating...",
    resetSimulation: "Reset Scenarios",
    reactivityBadge: "⚡ Hyperblock Reactivity",
    affectedNodes: "Affected Nodes",
    recalcTime: "Recalculation Time",

    // Options for Input Nodes
    fundingExpenseOpt: "Operating Costs / COGS / Funding",
    creditRiskOpt: "Provision for Expected Losses / Risk",
    creditRevOpt: "Net Revenue / Sales",
    adminExpenseOpt: "Personnel & Admin Expenses (SG&A)",

    // DAG
    dagTitle: "Financial Dependency Graph (DAG)",
    topologicalSort: "Reactive Topological Order",

    // Node Labels EN
    receita_com_operacoes_de_credito_e_repasses: "Net Revenue / Sales",
    receita_titulos_valores_mobiliarios: "Securities & Complementary Rev.",
    despesas_de_captacao: "Operating Costs / COGS / Funding",
    provisao_para_risco_de_credito_prc: "Provision for Losses & Risk",
    receita_de_dividendos_e_juros_sobre_o_capital_proprio: "Dividend & Equity Interest Rev.",
    resultado_com_equivalencia_patrimonial: "Equity Method Result",
    reversao_constituicao_de_provisao_para_ajuste_de_investimentos: "Investment Provision Reversal",
    resultado_com_alienacoes_de_titulos_de_renda_variavel: "Equities Disposal Result",
    resultado_com_derivativos_renda_variavel: "Derivatives Result",
    resultado_com_fundos_participacoes_societarias: "Investment Funds Result",
    outras_rendas_despesas_sobre_participacoes_societarias: "Other Equity Income/Expense",
    despesas_pessoal_e_administrativas: "Personnel & Admin Expenses (SG&A)",
    despesas_tributarias: "Tax Expenses",
    outras_despesas_liquidas: "Other Net Expenses",
    produto_da_intermediacao_financeira: "Gross Operating Margin",
    resultado_da_intermediacao_financeira: "Adjusted Operating Result",
    resultado_com_participacoes_societarias: "Equity Participations Result",
    resultado_antes_da_tributacao: "Pre-Tax Income (EBT)",
    tributos_sobre_o_lucro: "Income Taxes",
    participacao_nos_lucros: "Profit Sharing",
    lucro_liquido: "Net Income / Period Result",

    // KPIs & Dashboard
    prodIntermed: "Gross Operating Margin",
    resIntermed: "Operating Result",
    resBeforeTax: "Pre-Tax Income (EBT)",
    netIncomeAcc: "Accumulated Net Income",
    annualChartTitle: "Annual Net Income Evolution & YoY Growth (%)",
    netIncomeLegend: "Net Income (R$)",
    resIntermedLegend: "Operating Result",

    // Agent Panel
    agentTitle: "Universal AI Agent — Summary & Financial Analysis",
    agentPrompt: "Run a 'What-If' simulation to generate the AI agent's automated executive summary.",
    askAgentLabel: "Ask the Universal Financial Agent",
    askPlaceholder: "e.g. What is the impact of sales variation on net income?",
  },
};

export function getApiUrl(path: string, fallbackBase?: string): string {
  const cleanPath = path.startsWith("/") ? path : "/" + path;
  if (typeof window !== "undefined") {
    const isLoopback = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!isLoopback) {
      const envApi = process.env.NEXT_PUBLIC_API_URL;
      if (envApi && envApi.startsWith("http") && !envApi.includes("localhost") && !envApi.includes("127.0.0.1")) {
        const cleanBase = envApi.endsWith("/") ? envApi.slice(0, -1) : envApi;
        return `${cleanBase}${cleanPath}`;
      }
      return cleanPath;
    }
  }

  const base = fallbackBase || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${cleanBase}${cleanPath}`;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt");
  const [theme, setTheme] = useState<Theme>("light");
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const isLoopback = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (!isLoopback) return "";
    }
    return "http://127.0.0.1:8000";
  });
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [hasActiveData, setHasActiveData] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hypercube_has_active_data") === "true";
    }
    return false;
  });

  const [activeCompany, setActiveCompanyState] = useState<ActiveCompany>(() => {
    if (typeof window !== "undefined") {
      const hasData = localStorage.getItem("hypercube_has_active_data") === "true";
      const savedStr = localStorage.getItem("hypercube_active_company");
      if (hasData && savedStr) {
        try {
          const parsed = JSON.parse(savedStr);
          if (parsed && parsed.id && parsed.id !== "aguardando_upload") {
            return parsed;
          }
        } catch {}
      }
    }
    return EMPTY_ACTIVE_COMPANY;
  });
  const [activeConnection, setActiveConnectionState] = useState<ActiveConnection | null>(null);

  const apiBaseUrlRef = useRef(apiBaseUrl);
  apiBaseUrlRef.current = apiBaseUrl;

  const consecutiveFailuresRef = useRef(0);

  const refreshActiveCompany = async (): Promise<ActiveCompany> => {
    try {
      const currentBase = apiBaseUrlRef.current;
      const url = getApiUrl("/api/active-company", currentBase);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.name && data.id && data.id !== "aguardando_upload") {
          if (typeof window !== "undefined") {
            const hasData = localStorage.getItem("hypercube_has_active_data") === "true";
            if (hasData) {
              setActiveCompanyState(data);
              localStorage.setItem("hypercube_active_company", JSON.stringify(data));
              return data;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch active company in PreferencesProvider", e);
    }
    return activeCompany;
  };

  const refreshActiveConnection = async (): Promise<ActiveConnection | null> => {
    try {
      const currentBase = apiBaseUrlRef.current;
      const url = getApiUrl("/api/connections/active", currentBase);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.active_connection) {
          setActiveConnectionState(data.active_connection);
          if (typeof window !== "undefined") {
            localStorage.setItem("hypercube_active_connection", JSON.stringify(data.active_connection));
          }
          return data.active_connection;
        }
      }
    } catch (e) {
      console.warn("Could not fetch active connection in PreferencesProvider", e);
    }
    return activeConnection;
  };

  const handleSetActiveConnection = (conn: ActiveConnection | null) => {
    setActiveConnectionState(conn);
    if (typeof window !== "undefined") {
      if (conn) {
        localStorage.setItem("hypercube_active_connection", JSON.stringify(conn));
      } else {
        localStorage.removeItem("hypercube_active_connection");
      }
      window.dispatchEvent(new CustomEvent("hypercube_connection_updated", { detail: conn }));
    }
  };

  const disconnectConnection = async () => {
    try {
      const base = apiBaseUrlRef.current || "";
      await fetch(`${base}/api/connections/disconnect`, { method: "POST" });
    } catch (e) {
      console.warn("Could not notify backend of disconnect", e);
    }
    handleSetActiveConnection(null);
    await refreshActiveCompany();
  };

  const handleSetActiveCompany = (comp: ActiveCompany) => {
    const isRealCompany = Boolean(comp && comp.id && comp.id !== "aguardando_upload");
    setActiveCompanyState(comp);
    setHasActiveData(isRealCompany);
    if (typeof window !== "undefined") {
      localStorage.setItem("hypercube_active_company", JSON.stringify(comp));
      localStorage.setItem("hypercube_has_active_data", isRealCompany ? "true" : "false");
      window.dispatchEvent(new CustomEvent("hypercube_company_updated", { detail: comp }));
    }
  };

  const clearActiveCompany = () => {
    setActiveCompanyState(EMPTY_ACTIVE_COMPANY);
    setHasActiveData(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("hypercube_active_company");
      localStorage.setItem("hypercube_has_active_data", "false");
      window.dispatchEvent(new CustomEvent("hypercube_company_updated", { detail: EMPTY_ACTIVE_COMPANY }));
    }
  };

  const checkBackendHealth = async (): Promise<boolean> => {
    const currentBase = apiBaseUrlRef.current;
    const candidates: string[] = [];

    // 1. Loopback addresses first if running locally
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLoopback = hostname === "localhost" || hostname === "127.0.0.1";
      if (isLoopback) {
        candidates.push("http://127.0.0.1:8000");
        candidates.push("http://localhost:8000");
      }
    }

    // 2. Currently configured base
    if (currentBase && currentBase !== "") {
      candidates.push(currentBase);
    }

    // 3. Fallback: Next.js internal API route (relative path "")
    candidates.push("");

    const uniqueCandidates = candidates.filter((v, i, a) => a.indexOf(v) === i);

    for (const url of uniqueCandidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        let res: Response | null = null;
        try {
          const endpoint = url === "" ? "/api/health" : `${url}/api/health`;
          res = await fetch(endpoint, { signal: controller.signal, cache: "no-store" });
        } catch {
          try {
            const rootEndpoint = url === "" ? "/" : `${url}/`;
            res = await fetch(rootEndpoint, { signal: controller.signal, cache: "no-store" });
          } catch {
            res = null;
          }
        }
        clearTimeout(timeoutId);

        if (res && res.ok) {
          consecutiveFailuresRef.current = 0;
          if (url !== currentBase) {
            setApiBaseUrl(url);
            apiBaseUrlRef.current = url;
          }
          setBackendOnline(true);
          return true;
        }
      } catch {
        // continue to next candidate
      }
    }

    // Require at least 2 consecutive failures before declaring the backend disconnected
    consecutiveFailuresRef.current += 1;
    if (consecutiveFailuresRef.current >= 2) {
      setBackendOnline(false);
    }
    return false;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("hypercube_theme") as Theme | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      }
      const savedLang = localStorage.getItem("hypercube_lang") as Language | null;
      if (savedLang === "pt" || savedLang === "en") {
        setLanguage(savedLang);
      }
      const savedCompanyStr = localStorage.getItem("hypercube_active_company");
      if (savedCompanyStr) {
        try {
          const parsed = JSON.parse(savedCompanyStr);
          if (parsed && parsed.name) {
            setActiveCompanyState(parsed);
          }
        } catch {}
      }

      const hostname = window.location.hostname;
      if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
        // Use relative path by default on remote networks to leverage Next.js proxy rewrite
        setApiBaseUrl("");
        apiBaseUrlRef.current = "";
      } else {
        setApiBaseUrl("http://127.0.0.1:8000");
        apiBaseUrlRef.current = "http://127.0.0.1:8000";
      }

      const handleCompanyEvent = (e: any) => {
        if (e?.detail && e.detail.name) {
          setActiveCompanyState(e.detail);
        } else {
          refreshActiveCompany();
        }
      };
      window.addEventListener("hypercube_company_updated", handleCompanyEvent);
      return () => {
        window.removeEventListener("hypercube_company_updated", handleCompanyEvent);
      };
    }
  }, []);

  useEffect(() => {
    checkBackendHealth().then((ok) => {
      if (ok) refreshActiveCompany();
    });
    const interval = setInterval(() => {
      checkBackendHealth().then((ok) => {
        if (ok) refreshActiveCompany();
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("hypercube_theme", newTheme);
    }
  };

  const handleSetLanguage = (newLang: Language) => {
    setLanguage(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("hypercube_lang", newLang);
      window.dispatchEvent(new CustomEvent("hypercube_lang_updated", { detail: newLang }));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    }
  }, [theme]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["pt"]?.[key] || key;
  };

  return (
    <PreferencesContext.Provider value={{ 
      language, 
      theme, 
      setLanguage: handleSetLanguage, 
      setTheme: handleSetTheme, 
      t, 
      apiBaseUrl, 
      backendOnline, 
      checkBackendHealth,
      activeCompany,
      hasActiveData,
      setHasActiveData,
      clearActiveCompany,
      setActiveCompany: handleSetActiveCompany,
      refreshActiveCompany,
      activeConnection,
      setActiveConnection: handleSetActiveConnection,
      refreshActiveConnection,
      disconnectConnection
    }}>
      <div className={theme === "dark" ? "dark bg-slate-950 text-slate-100 min-h-screen" : "light bg-slate-50 text-slate-900 min-h-screen"}>
        {children}
      </div>
    </PreferencesContext.Provider>
  );
}

const defaultContext: PreferencesContextType = {
  language: "pt",
  theme: "light",
  setLanguage: () => {},
  setTheme: () => {},
  t: (key: string) => translations["pt"][key] || key,
  apiBaseUrl: "http://localhost:8000",
  backendOnline: null,
  checkBackendHealth: async () => false,
  activeCompany: DEFAULT_ACTIVE_COMPANY,
  hasActiveData: false,
  setHasActiveData: () => {},
  clearActiveCompany: () => {},
  setActiveCompany: () => {},
  refreshActiveCompany: async () => DEFAULT_ACTIVE_COMPANY,
  activeConnection: null,
  setActiveConnection: () => {},
  refreshActiveConnection: async () => null,
  disconnectConnection: async () => {},
};

export function usePreferences() {
  const context = useContext(PreferencesContext);
  return context || defaultContext;
}
