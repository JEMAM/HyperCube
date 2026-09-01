"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  BarChart2, 
  Activity, 
  Network, 
  Box, 
  TrendingUp, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  Bot,
  Play,
  FileSpreadsheet,
  Database,
  BookOpen,
  Scale,
  Building2,
  Lock,
  User,
  SlidersHorizontal,
  DollarSign,
  Server,
  KeyRound,
  FileCheck,
  LogOut,
  BarChart3
} from "lucide-react";
import DynamicLogo from "./DynamicLogo";
import { usePreferences } from "./PreferencesContext";
import { useAuth } from "./AuthContext";
import CompanyBadge from "./CompanyBadge";
import ExecutivePlanningViewCard from "./ExecutivePlanningViewCard";
import ThemeLanguageToggle from "./ThemeLanguageToggle";

const MiniOlapCube = dynamic(() => import("./OlapCube3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-slate-300">
      <div className="w-8 h-8 border-2 border-anaplan-coral border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-200">Carregando Cubo OLAP 3D WebGL...</span>
    </div>
  ),
});

const MiniDagViewer = dynamic(() => import("./DagViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-slate-300">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-200">Carregando Grafo DAG Topológico...</span>
    </div>
  ),
});

export type PlatformPageMode = 
  | "OVERVIEW" 
  | "CONNECTIONS" 
  | "PLANNING" 
  | "THREE_STATEMENT"
  | "DRE" 
  | "DFC" 
  | "BP" 
  | "COMPLEMENTARY" 
  | "CUBE" 
  | "VALUATION" 
  | "CVM" 
  | "ECONOMY" 
  | "DAG"
  | "DRA"
  | "DMPL"
  | "DVA"
  | "NE"
  | "GUIDE";

interface LandingPageProps {

  onNavigate: (mode: any) => void;
  onOpenAuth?: (mode?: "login" | "register") => void;
}

export default function LandingPage({ onNavigate, onOpenAuth }: LandingPageProps) {
  const { theme, language } = usePreferences();
  const { user, isAuthenticated, logout } = useAuth();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [dagMode, setDagMode] = useState<"DRE" | "DFC" | "BP">("DRE");
  const [activeComplementaryTab, setActiveComplementaryTab] = useState<"DRA" | "DMPL" | "DVA" | "NE">("DRA");

  const handleAccessApp = (targetMode?: PlatformPageMode | string) => {
    if (isAuthenticated) {
      onNavigate(targetMode || "PLANNING");
    } else {
      if (onOpenAuth) {
        onOpenAuth("login");
      } else {
        onNavigate(targetMode || "PLANNING");
      }
    }
  };

  const handleRegisterApp = () => {
    if (isAuthenticated) {
      onNavigate("PLANNING");
    } else if (onOpenAuth) {
      onOpenAuth("register");
    } else {
      onNavigate("PLANNING");
    }
  };

  // 12 Platform Modules definition
  const platformModules = [
    {
      id: "OVERVIEW" as const,
      number: "01",
      title: isEn ? "Overview & Statement Ingestion" : "Visão Geral & Ingestão Contábil",
      subtitle: isEn ? "AI-Powered Financial Ingestion" : "Ingestão Contábil com OCR e IA",
      icon: FileSpreadsheet,
      category: isEn ? "Core Ingestion" : "Ingestão & Dados",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: isEn
        ? "Universal ingestion pipeline supporting PDF (Docling OCR), Excel (.xlsx/.xls), CSV and TXT statements. Automatic chart of accounts canonical mapping and structural integrity checks."
        : "Pipeline universal de ingestão contábil com suporte a PDF com OCR estruturado, Excel, CSV e TXT. Mapeamento canônico automático de planos de contas e validação de consistência contábil.",
      highlights: [
        isEn ? "Docling & LLM extraction for scanned financial statements" : "Extração com Docling e IA para balanços digitalizados",
        isEn ? "Automatic canonical standardization across all corporate sectors" : "Padronização canônica multi-setorial automática",
        isEn ? "Multi-period comparison and mathematical integrity audit" : "Auditoria matemática de fechamento contábil"
      ],
      metrics: [
        { label: isEn ? "Formats" : "Formatos", val: "PDF / XLS / CSV" },
        { label: isEn ? "Accuracy" : "Acurácia", val: "99.8%" },
        { label: isEn ? "Pipeline" : "Pipeline", val: "<3.2s" }
      ]
    },
    {
      id: "CONNECTIONS" as const,
      number: "02",
      title: isEn ? "ERP & Database Connections" : "Conexões ERP & Bancos de Dados",
      subtitle: isEn ? "Native Corporate Integrations" : "Conectores Nativos em Tempo Real",
      icon: Database,
      category: isEn ? "Integrations" : "Integrações",
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      description: isEn
        ? "Real-time bi-directional connectors for SAP ERP, Oracle Financials, TOTVS Protheus, Conta Azul, PostgreSQL, Microsoft SQL Server and DuckDB analytics."
        : "Conectores nativos bi-direcionais para SAP, Oracle Financials, TOTVS Protheus, Conta Azul, PostgreSQL, Microsoft SQL Server e DuckDB analítico.",
      highlights: [
        isEn ? "Driver validation and encrypted TLS connection pooling" : "Validação de credenciais e túnel seguro criptografado TLS",
        isEn ? "Direct GL sync for immediate multi-dimensional consolidation" : "Sincronização direta de Livro Razão e Balancetes",
        isEn ? "Local and cloud connection status with real-time latency diagnostics" : "Monitoramento contínuo de latência e status"
      ],
      metrics: [
        { label: isEn ? "Connectors" : "Conectores", val: "SAP, Oracle, TOTVS" },
        { label: isEn ? "Databases" : "Bancos", val: "Postgres, MSSQL" },
        { label: isEn ? "Latency" : "Latência", val: "12ms" }
      ]
    },
    {
      id: "PLANNING" as const,
      number: "03",
      title: isEn ? "N-D Connected Planning" : "Planejamento Conectado Multidimensional (N-D)",
      subtitle: isEn ? "Enterprise Matrix Grid" : "Grade Matricial Estilo Anaplan",
      icon: Layers,
      category: isEn ? "Connected Planning" : "Planejamento",
      badgeColor: "bg-anaplan-coral/10 text-anaplan-coral border-anaplan-coral/30",
      description: isEn
        ? "Anaplan-grade multidimensional connected planning matrix. Cross-inspect dimensions (Account × Period × Scenario × Version × Cost Center) with live in-grid editing and instant write-back."
        : "Grade de planejamento multidimensional corporativa similar ao Anaplan. Cruze dimensões (Contas × Períodos × Cenários × Versões × Centros de Custo) com edição direta e recálculo reativo instantâneo.",
      highlights: [
        isEn ? "Waterfall Variance Bridge: Causal Volume, Price, COGS, Sales, and Admin decomposition" : "Ponte de Variância Waterfall: Decomposição causal Volume-Preço-Custos-SG&A",
        isEn ? "Interactive cell editing with instant dependent re-calculation and Breakback" : "Edição direta de células com recálculo reativo e Breakback proporcional",
        isEn ? "Budget versions: Base, Optimistic, Stress and Growth Factors" : "Versões orçamentárias: Base, Otimista, Estresse e Fator de Crescimento",
        isEn ? "Columnar slice & dice across organizational hierarchies" : "Fatiamento analítico por centro de custo e diretoria"
      ],
      metrics: [
        { label: isEn ? "Dimensions" : "Dimensões", val: "6D N-Dimensional" },
        { label: isEn ? "Waterfall" : "Waterfall", val: "100% Fechado" },
        { label: isEn ? "Write-back" : "Write-back", val: "<4ms" }
      ]
    },
    {
      id: "DRE" as const,
      number: "04",
      title: isEn ? "Income Statement (DRE) & What-If" : "Demonstração DRE & Motor What-If Reativo",
      subtitle: isEn ? "Reactive P&L Simulation Engine" : "Simulação Reativa de Margens e EBITDA",
      icon: BarChart2,
      category: isEn ? "Financial Statements" : "Demonstrações",
      badgeColor: "bg-anaplan-coral/10 text-anaplan-coral border-anaplan-coral/30",
      description: isEn
        ? "Dynamic Income Statement (DRE) featuring real-time What-If sensitivity shocks. Stress-test sales volumes, raw materials, or SGA overheads and track continuous propagation down to Net Income."
        : "Demonstração do Resultado do Exercício com motor de sensibilidade What-If em tempo real. Simule choques de preços, volumes, insumos ou despesas operacionais e veja o impacto instantâneo no Lucro Líquido.",
      highlights: [
        isEn ? "Full waterfall: Gross Revenue, Deductions, Net Revenue, COGS, Gross Profit, EBITDA, EBIT, EBT, Net Income" : "Cascata completa da Receita Bruta ao Lucro Líquido",
        isEn ? "Shock sliders with immediate marginal variation display" : "Simuladores de choques com cálculo marginal instantâneo",
        isEn ? "Executive AI diagnostics explaining budget variance" : "Diagnóstico executivo automatizado com IA Explicativa"
      ],
      metrics: [
        { label: isEn ? "Recalculation" : "Recálculo", val: "<10ms" },
        { label: isEn ? "Indicators" : "Margens", val: "Bruta, EBITDA, Líquida" },
        { label: isEn ? "Engine" : "Motor", val: "Rustworkx DAG" }
      ]
    },
    {
      id: "DFC" as const,
      number: "05",
      title: isEn ? "Direct Cash Flow (DFC)" : "Fluxo de Caixa Direto (DFC)",
      subtitle: isEn ? "CPC 03 Solvency Engine" : "Solvência & Conciliação CPC 03",
      icon: Activity,
      category: isEn ? "Financial Statements" : "Demonstrações",
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      description: isEn
        ? "Direct Cash Flow Statement conforming to CPC 03 / IAS 7. Models operating cash flows (OCF), investing (ICF), and financing (FCF) with continuous liquidity coverage stress testing."
        : "Demonstração do Fluxo de Caixa direto no padrão CPC 03 / IAS 7. Modela fluxos operacional (FCO), investimento (FCI) e financiamento (FCF) com diagnóstico rigoroso de solvência e cobertura de liquidez.",
      highlights: [
        isEn ? "Real-time reconciliation between Initial and Final Cash Balance" : "Reconciliação direta entre Saldo Inicial e Final de Caixa",
        isEn ? "Liquidity runway and debt service coverage diagnostic" : "Cálculo de índice de cobertura da dívida e liquidez operacional",
        isEn ? "Working capital and customer default stress scenarios" : "Cenários de estresse de inadimplência e prazos médios"
      ],
      metrics: [
        { label: isEn ? "Pillars" : "Pilares", val: "FCO, FCI, FCF" },
        { label: isEn ? "Standard" : "Norma", val: "CPC 03 / IAS 7" },
        { label: isEn ? "Runway" : "Horizonte", val: "24 meses" }
      ]
    },
    {
      id: "BP" as const,
      number: "06",
      title: isEn ? "Balance Sheet (BP)" : "Balanço Patrimonial (BP)",
      subtitle: isEn ? "Fleuriet & Dupont 3-Factor" : "Modelo Fleuriet & Decomposição Dupont",
      icon: Scale,
      category: isEn ? "Financial Statements" : "Demonstrações",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: isEn
        ? "Complete Balance Sheet adhering to CPC 26 / IFRS with strict equation closure (Total Assets = Liabilities + Equity). Features Fleuriet Working Capital (NCG, CDG, ST) and 3-Factor Dupont ROE decomposition."
        : "Balanço Patrimonial completo com fechamento contábil rigoroso (Ativo = Passivo + PL). Inclui análise de Capital de Giro pelo Modelo Fleuriet (NCG, CDG, Saldo de Tesouraria) e Decomposição Dupont em 3 Fatores.",
      highlights: [
        isEn ? "Fleuriet Model: Working Capital Need (NCG), Working Capital (CDG) and Treasury Balance (ST)" : "Modelo Fleuriet: Necessidade de Capital de Giro (NCG) e Saldo de Tesouraria",
        isEn ? "3-Factor Dupont ROE = Net Margin × Asset Turnover × Financial Leverage" : "Decomposição Dupont: Margem × Giro × Alavancagem = ROE",
        isEn ? "Liquidity ratios: Current, Quick, Cash and General Solvency" : "Índices de liquidez corrente, seca, imediata e geral"
      ],
      metrics: [
        { label: isEn ? "Equation" : "Equilíbrio", val: "Δ = 0,00" },
        { label: isEn ? "Dupont" : "Dupont", val: "ROE 3-Fatores" },
        { label: isEn ? "Model" : "Modelo", val: "Fleuriet NCG/ST" }
      ]
    },
    {
      id: "THREE_STATEMENT" as const,
      number: "07",
      title: isEn ? "Closed-Loop 3-Statement Model" : "Modelo Triangular 3-Statement (DRE ↔ DFC ↔ BP)",
      subtitle: isEn ? "Zero-Delta Unified Balance" : "Loop Contábil Fechado & Fleuriet",
      icon: Scale,
      category: isEn ? "Integrated Modeling" : "Modelagem Integrada",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: isEn
        ? "Unified real-time financial loop seamlessly synchronizing Income Statement (P&L), Cash Flow (Direct/Indirect DFC), and Balance Sheet (BP). Guarantees zero balance sheet delta (Assets = Liabilities + Equity) across all simulations with dynamic Fleuriet working capital."
        : "Loop contábil unificado em tempo real interligando DRE, Fluxo de Caixa (DFC) e Balanço Patrimonial (BP). Garante equilíbrio patrimonial com tolerância zero (Ativo = Passivo + PL) em qualquer simulação com diagnóstico dinâmico de capital de giro Fleuriet.",
      highlights: [
        isEn ? "Continuous zero-delta reconciliation guarantee: Assets = Liabilities + Equity (Δ = 0.00)" : "Garantia de reconciliação contínua: Ativo = Passivo + PL com Delta R$ 0,00 absoluto",
        isEn ? "Operational drivers simulator: DSO/PMR, DIO/PME, DPO/PMP, Capex, and Dividend Payout" : "Simulador de direcionadores: Prazos médios de giro, Capex e Payout de dividendos",
        isEn ? "Fleuriet working capital engine: NCG, CDG, Treasury Balance, and Overtrading warnings" : "Modelo Fleuriet dinâmico: NCG, CDG, Saldo de Tesouraria e alerta de Efeito Tesoura",
        isEn ? "Synchronized multi-statement tabs with audit check badges" : "Abas sincronizadas com selos de auditoria e conformidade contábil"
      ],
      metrics: [
        { label: isEn ? "Reconciliation" : "Reconciliação", val: "Δ = 0,00" },
        { label: isEn ? "Statements" : "Demonstrações", val: "DRE + DFC + BP" },
        { label: isEn ? "Speed" : "Recálculo", val: "<5ms" }
      ]
    },
    {
      id: "COMPLEMENTARY" as const,
      number: "08",

      title: isEn ? "Complementary Statements (DRA/DMPL/DVA/NE)" : "Demonstrações Complementares (DRA/DMPL/DVA/NE)",
      subtitle: isEn ? "Comprehensive IFRS Suite" : "Demonstrações Contábeis Complementares",
      icon: SlidersHorizontal,
      category: isEn ? "Financial Statements" : "Demonstrações",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      description: isEn
        ? "Suite of complementary statements: Comprehensive Income (DRA), Changes in Equity (DMPL), Value Added (DVA), and Explanatory Notes (NE) with semantic search."
        : "Conjunto completo de demonstrações obrigatórias: Resultado Abrangente (DRA), Mutações do Patrimônio Líquido (DMPL), Valor Adicionado (DVA) e Notas Explicativas (NE) com busca textual inteligente.",
      highlights: [
        isEn ? "DRA: Fair value reserves, foreign currency translation and comprehensive income" : "DRA: Ajustes de avaliação patrimonial e resultado abrangente total",
        isEn ? "DMPL: Capital reserves, profit retention and shareholder dividends tracking" : "DMPL: Evolução de reservas de capital, lucros retidos e dividendos",
        isEn ? "DVA: Wealth distribution among employees, government, debt holders and equity" : "DVA: Distribuição de riqueza (pessoal, impostos, credores e acionistas)",
        isEn ? "NE: Explanatory notes extracted with AI and search filters" : "NE: Notas explicativas estruturadas com busca por termo contábil"
      ],
      metrics: [
        { label: isEn ? "Statements" : "Demonstrações", val: "DRA, DMPL, DVA, NE" },
        { label: isEn ? "Compliance" : "Conformidade", val: "100% CPC/IFRS" },
        { label: isEn ? "Search" : "Busca", val: "Semântica" }
      ]
    },
    {
      id: "CUBE" as const,
      number: "09",
      title: isEn ? "Interactive 3D OLAP Cube" : "Cubo OLAP 3D Interativo WebGL",
      subtitle: isEn ? "Spatial WebGL Hypercube" : "Hipercubo Espacial em WebGL Three.js",
      icon: Box,
      category: isEn ? "Spatial Analytics" : "Visualização 3D",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description: isEn
        ? "True 3D spatial visualization of the corporate hypercube rendered with WebGL / Three.js. Freely rotate, inspect volumetric financial density, and perform analytical Slice & Dice operations in 3D space."
        : "Visualização tridimensional do hipercubo financeiro corporativo em WebGL / Three.js. Roteie livremente em 360°, inspecione a densidade volumétrica de valores e realize operações de Slice & Dice espacial.",
      highlights: [
        isEn ? "360-degree free rotation with smooth orbital controls" : "Rotação orbital suave em 360° e zoom interativo",
        isEn ? "Volumetric color coding reflecting monetary account magnitudes" : "Gradiente volumétrico refletindo a magnitude de cada conta",
        isEn ? "Interactive cell picking revealing account name, period and scenario" : "Clique nas faces do cubo para inspecionar valores exatos"
      ],
      metrics: [
        { label: isEn ? "Renderer" : "Renderizador", val: "Three.js WebGL" },
        { label: isEn ? "FPS" : "Desempenho", val: "60 FPS" },
        { label: isEn ? "Controls" : "Controles", val: "Orbit / Slice" }
      ]
    },
    {
      id: "VALUATION" as const,
      number: "10",
      title: isEn ? "Corporate Valuation Engine" : "Valuation Corporativo & Múltiplos",
      subtitle: isEn ? "DCF, WACC & Trading Multiples" : "Fluxo Descontado & Múltiplos de Mercado",
      icon: DollarSign,
      category: isEn ? "Strategic Finance" : "Valuation & M&A",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: isEn
        ? "Enterprise valuation workbench with Discounted Cash Flow (DCF), automated WACC computation (Ke, Kd, beta, risk premiums), perpetual Gordon Growth, and trading multiples benchmarking."
        : "Mesa de valuation corporativo com Fluxo de Caixa Descontado (DCF), cálculo automático do WACC (Ke, Kd, Beta desalavancado, prêmio de risco), crescimento perpétuo de Gordon e múltiplos de mercado.",
      highlights: [
        isEn ? "Interactive WACC calculator with debt/equity weights and tax shields" : "Calculadora dinâmica de WACC com benefício fiscal da dívida",
        isEn ? "Enterprise Value (EV) to Equity Value bridge (less net debt)" : "Ponte de Enterprise Value (EV) para Equity Value",
        isEn ? "Trading multiples matrix: EV/EBITDA, P/E, EV/Sales, and ARR" : "Matriz de múltiplos: EV/EBITDA, P/L, EV/Receita e ARR"
      ],
      metrics: [
        { label: isEn ? "Methods" : "Métodos", val: "DCF & Múltiplos" },
        { label: isEn ? "WACC Model" : "Modelo", val: "CAPM + Tax Shield" },
        { label: isEn ? "Sensitivity" : "Sensibilidade", val: "Matriz Bidimensional" }
      ]
    },
    {
      id: "CVM" as const,
      number: "11",
      title: isEn ? "CVM Watchdog & Compliance" : "Radar CVM Watch & Compliance",
      subtitle: isEn ? "B3 Regulatory Monitoring" : "Monitoramento Contínuo B3 & ITR/DFP",
      icon: Building2,
      category: isEn ? "Regulatory & Market" : "Mercado de Capitais",
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      description: isEn
        ? "Automated regulatory watchdog monitoring listed companies in B3 / CVM. Inspects quarterly ITRs, annual DFPs, independent audit opinions, and regulatory compliance flags."
        : "Monitor regulatório contínuo de companhias abertas listadas na B3 / CVM. Acompanhe a entrega de ITRs trimestrais, DFPs anuais, pareceres de auditoria independente e alertas de conformidade.",
      highlights: [
        isEn ? "Direct ingestion of public company statements from CVM Dados Abertos" : "Ingestão direta de dados oficiais da CVM Dados Abertos",
        isEn ? "Audit opinion extraction: Unqualified, Qualified or Adverse" : "Extração de parecer dos auditores independentes",
        isEn ? "Automatic peer benchmarking against sector competitors" : "Comparação automática de múltiplos com pares de mercado"
      ],
      metrics: [
        { label: isEn ? "Coverage" : "Cobertura", val: "B3 / CVM" },
        { label: isEn ? "Frequency" : "Ciclo", val: "ITR & DFP" },
        { label: isEn ? "Audit Check" : "Auditoria", val: "Big Four Standard" }
      ]
    },
    {
      id: "ECONOMY" as const,
      number: "12",
      title: isEn ? "Macroeconomy & BCB SGS" : "Macroeconomia & Banco Central (SGS BCB)",
      subtitle: isEn ? "Official Economic Timeseries" : "Indicadores SGS BCB & Atas do Copom",
      icon: TrendingUp,
      category: isEn ? "Macroeconomic Intelligence" : "Macroeconomia",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description: isEn
        ? "Direct integration with the Central Bank of Brazil (BCB SGS API) providing Selic, IPCA inflation, USD/BRL exchange rate, and AI comparative analysis of Copom minutes to calibrate financial forecasts."
        : "Integração direta com o Sistema Gerenciador de Séries Temporais do Banco Central (SGS BCB), trazendo Taxa Selic, IPCA, Câmbio PTAX USD/BRL e análise comparativa de Atas do Copom por IA.",
      highlights: [
        isEn ? "Automated sync of Selic, IPCA and FX curves for budget stress scenarios" : "Sincronização diária das curvas de juros, inflação e câmbio",
        isEn ? "Comparative semantic analyst between consecutive Copom meeting minutes" : "Analista comparativo de alterações textuais das Atas do Copom",
        isEn ? "Instant propagation of interest rate hikes into financial expenses" : "Propagação imediata de choques de juros nas despesas financeiras"
      ],
      metrics: [
        { label: isEn ? "Official Source" : "Fonte Oficial", val: "SGS Banco Central" },
        { label: isEn ? "Indicators" : "Índices", val: "Selic, IPCA, Câmbio" },
        { label: isEn ? "AI Copom" : "IA Copom", val: "Análise Semântica" }
      ]
    },
    {
      id: "DAG" as const,
      number: "13",
      title: isEn ? "Reactive Topological DAG" : "Grafo DAG Topológico Reativo",
      subtitle: isEn ? "Rustworkx Graph Architecture" : "Rede Direcionada Acíclica em Rust",
      icon: Network,
      category: isEn ? "Core Engine" : "Arquitetura",
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      description: isEn
        ? "Accounting Directed Acyclic Graph compiled with Rustworkx. Maps every dependency and arithmetic formula so that any assumption change re-evaluates only downstream affected nodes in microseconds."
        : "Grafo Direcionado Acíclico (DAG) compilado em Rustworkx de alta performance. Mapeia cada dependência e fórmula, garantindo que qualquer premissa alterada recalcule apenas os nós dependentes em microssegundos.",
      highlights: [
        isEn ? "Computational complexity reduced from O(N) full grid recalculation to O(K) topological subgraphs" : "Complexidade reduzida de O(N) para O(K) nós dependentes",
        isEn ? "Visual interactive canvas with node inspection and formula tracking" : "Canvas visual interativo com inspeção de fórmulas e nós",
        isEn ? "Universal support across DRE, DFC, Balance Sheet and custom KPIs" : "Suporte universal para DRE, DFC, Balanço e KPIs"
      ],
      metrics: [
        { label: isEn ? "Engine" : "Motor", val: "Rustworkx (Rust)" },
        { label: isEn ? "Latency" : "Tempo", val: "<1.4ms" },
        { label: isEn ? "Integrity" : "Integridade", val: "Zero-Cycle DAG" }
      ]
    }
  ];


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#071526] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-anaplan-coral selection:text-white">
      {/* Background Ambience / Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:28px_28px] dark:bg-[radial-gradient(#1e3a5f_1px,transparent_1px)]" />

      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c2340]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#14335a] transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[104px] py-2.5 flex items-center justify-between">
          {/* Brand Logo with 3D OLAP Cube (Tripled 3x Size) */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <DynamicLogo layout="horizontal" size="3x" isExpanded={true} />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <ThemeLanguageToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => onNavigate("PLANNING")}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer hover:border-anaplan-coral transition"
                >
                  <div className="w-5 h-5 rounded-full bg-anaplan-coral text-white flex items-center justify-center text-[10px] font-black">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="truncate max-w-[120px] text-slate-800 dark:text-slate-100">{user?.name}</span>
                </div>

                <button
                  onClick={() => onNavigate("PLANNING")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-anaplan-coral to-orange-500 hover:from-orange-500 hover:to-anaplan-coral text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isEn ? "Go to Workspace" : "Ir para o Aplicativo"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 transition cursor-pointer"
                  title={isEn ? "Sign Out" : "Sair"}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAccessApp()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-anaplan-coral dark:hover:text-white transition cursor-pointer"
                >
                  {isEn ? "Sign In" : "Entrar"}
                </button>
                <button
                  onClick={() => handleRegisterApp()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-anaplan-coral to-orange-500 hover:from-orange-500 hover:to-anaplan-coral text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isEn ? "Access Platform" : "Acessar o Aplicativo"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
        {/* Active Company / Context Banner */}
        <CompanyBadge variant="banner" onClick={() => onNavigate("OVERVIEW")} className="cursor-pointer" />

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-2">
          {/* Hero Left Column: Proposition & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] shadow-sm text-xs font-extrabold text-slate-700 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-anaplan-coral animate-pulse" />
              <span>HyperCube Connected Planning Engine v3.0</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              {isEn ? (
                <>
                  The decision <br />
                  infrastructure for the <br />
                  <span className="bg-gradient-to-r from-anaplan-coral via-[#ff7a59] to-[#0284c7] bg-clip-text text-transparent">
                    Agentic Enterprise.
                  </span>
                </>
              ) : (
                <>
                  A infraestrutura de <br />
                  decisão para a <br />
                  <span className="bg-gradient-to-r from-anaplan-coral via-[#ff7a59] to-[#0284c7] bg-clip-text text-transparent">
                    Empresa Agêntica.
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-100 leading-relaxed font-normal">
              {isEn ? (
                <>
                  The unified corporate planning platform where <strong className="text-slate-900 dark:text-white font-bold">Agentic AI</strong>, <strong className="text-slate-900 dark:text-white font-bold">Reactive DAG Graphs</strong>, <strong className="text-slate-900 dark:text-white font-bold">3D OLAP Cubes</strong>, and <strong className="text-slate-900 dark:text-white font-bold">12 Connected Financial Modules</strong> converge for instant strategic decision making.
                </>
              ) : (
                <>
                  A plataforma corporativa onde <strong className="text-slate-900 dark:text-white font-bold">IA Agêntica</strong>, <strong className="text-slate-900 dark:text-white font-bold">Grafos DAG Topológicos</strong>, <strong className="text-slate-900 dark:text-white font-bold">Cubos OLAP 3D</strong> e <strong className="text-slate-900 dark:text-white font-bold">12 Módulos Financeiros Integrados</strong> convergem para decisões instantâneas e sem atrito.
                </>
              )}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleRegisterApp()}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-anaplan-coral to-orange-500 hover:from-orange-500 hover:to-anaplan-coral text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>{isEn ? "Access Platform / Free Test" : "Acessar o Aplicativo / Testar Grátis"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAccessApp()}
                className="px-5 py-3.5 rounded-full bg-white dark:bg-[#0c2340] border border-slate-300 dark:border-[#14335a] hover:border-anaplan-coral text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>{isEn ? "1-Click Demo Login" : "Entrar com Conta de Teste"}</span>
              </button>
            </div>

            {/* Micro Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-100">{isEn ? "Recalculation <10ms" : "Recálculo <10ms"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-100">{isEn ? "Topological DAG" : "Grafo DAG Rust"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-100">{isEn ? "Local SQLite DB" : "SQLite Local"}</span>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Floating Live Planning View */}
          <div className="lg:col-span-6 relative">
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-tr from-anaplan-coral/20 to-sky-500/20 rounded-full blur-3xl pointer-events-none" />
              <ExecutivePlanningViewCard onNavigate={onNavigate} />
            </div>
          </div>
        </section>

        {/* SECTION HEADER: ALL 12 MODULES SCROLLING DOWN CONTINUOUSLY */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-6 border-t border-slate-200 dark:border-[#14335a]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-extrabold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>{isEn ? "Complete Platform Walkthrough" : "Conheça Todas as Páginas da Plataforma"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEn 
              ? "All 12 Modules Unified in One Architecture" 
              : "Todas as 12 Páginas e Módulos em Funcionamento"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
            {isEn
              ? "Scroll down to inspect every page of HyperCube with interactive live previews, calculation metrics, and direct access buttons."
              : "Desça a página para conferir cada um dos 12 módulos com pré-visualizações dinâmicas, métricas reais e acesso direto ao aplicativo."}
          </p>
        </div>

        {/* CONTINUOUS VERTICAL LIST: ALL 12 MODULES SCROLLING DOWN */}
        <div className="space-y-16">
          {/* 01. VISÃO GERAL & INGESTÃO */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    Ingestão & Dados
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #01 de 12
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    01. Visão Geral & Ingestão Contábil
                  </h3>
                  <p className="text-xs font-bold text-emerald-500 mt-1 uppercase tracking-wider">
                    Ingestão com OCR Docling e Inteligência Artificial
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Pipeline universal de ingestão contábil com suporte a PDF com OCR estruturado, Excel (.xlsx/.xls), CSV e TXT. Mapeamento canônico automático de planos de contas e validação de consistência contábil.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Extração com Docling e IA para balanços digitalizados</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Padronização canônica multi-setorial automática</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Auditoria matemática de fechamento contábil</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Formatos</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">PDF/XLS/CSV</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Acurácia</p>
                    <p className="text-xs font-black text-emerald-500 mt-0.5">99.8%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Tempo</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">&lt;3.2s</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("OVERVIEW")}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-anaplan-coral to-orange-500 hover:from-orange-500 hover:to-anaplan-coral text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Acessar Ingestão no Aplicativo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 text-white space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Pipeline de Ingestão Inteligente</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      Status: Pronto para Envio
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <p className="text-[10px] text-slate-400">PDF / Relatório CVM</p>
                      <p className="text-xs font-bold text-emerald-400 mt-1">Docling OCR</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <p className="text-[10px] text-slate-400">Excel / Planilhas</p>
                      <p className="text-xs font-bold text-sky-400 mt-1">Polars Engine</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <p className="text-[10px] text-slate-400">Classificação</p>
                      <p className="text-xs font-bold text-amber-400 mt-1">IA Agêntica</p>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 text-center space-y-2">
                    <FileCheck className="w-8 h-8 text-anaplan-coral mx-auto" />
                    <p className="text-xs font-bold text-white">
                      Arraste e solte demonstrações em PDF, Excel, CSV ou TXT no app
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Reconhece automaticamente DRE, DFC, Balanço Patrimonial, DRA e DVA
                    </p>
                    <button
                      onClick={() => handleAccessApp("OVERVIEW")}
                      className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow transition cursor-pointer"
                    >
                      Carregar Arquivo no Aplicativo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 02. CONEXÕES ERP & BANCOS */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-sky-500/10 text-sky-400 border-sky-500/30">
                    Integrações
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #02 de 12
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    02. Conexões ERP & Bancos de Dados
                  </h3>
                  <p className="text-xs font-bold text-sky-400 mt-1 uppercase tracking-wider">
                    Conectores Nativos em Tempo Real
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Conectores nativos bi-direcionais para SAP, Oracle Financials, TOTVS Protheus, Conta Azul, PostgreSQL, Microsoft SQL Server e DuckDB analítico com latência ultra-baixa.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Validação de credenciais e túnel seguro criptografado TLS</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Sincronização direta de Livro Razão e Balancetes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Monitoramento contínuo de latência e integridade</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">ERPs</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">SAP/Oracle/TOTVS</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Bancos</p>
                    <p className="text-xs font-black text-sky-400 mt-0.5">Postgres/MSSQL</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Latência</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">12ms</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("CONNECTIONS")}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Conectar ERP no Aplicativo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 text-white space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white">Conectores Corporativos Integrados</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                      TLS 1.3 / Encriptado
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "SAP S/4HANA & ECC", type: "ERP Corporativo Global", status: "Pronto para Conectar", lat: "14ms", color: "text-emerald-400" },
                      { name: "Oracle Financials Cloud", type: "ERP Corporativo Global", status: "Pronto para Conectar", lat: "18ms", color: "text-emerald-400" },
                      { name: "TOTVS Protheus", type: "ERP Nacional", status: "Pronto para Conectar", lat: "8ms", color: "text-emerald-400" },
                      { name: "PostgreSQL & DuckDB", type: "Banco Analítico OLAP", status: "Conexão Ativa", lat: "2ms", color: "text-sky-400" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <div className="flex items-center gap-3">
                          <Server className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs font-bold text-white">{item.name}</p>
                            <p className="text-[10px] text-slate-400">{item.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[11px] font-bold ${item.color}`}>{item.status}</span>
                          <p className="text-[9px] text-slate-400 font-mono">{item.lat}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 03. PLANEJAMENTO CONECTADO (N-D) */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-anaplan-coral/10 text-anaplan-coral border-anaplan-coral/30">
                    Connected Planning
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #03 de 12
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    03. Planejamento Conectado Multidimensional (N-D)
                  </h3>
                  <p className="text-xs font-bold text-anaplan-coral mt-1 uppercase tracking-wider">
                    Grade Matricial Estilo Anaplan com Write-Back
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Grade de planejamento multidimensional corporativa similar ao Anaplan. Cruze dimensões (Contas × Períodos × Cenários × Versões × Centros de Custo) com edição direta e recálculo reativo instantâneo.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-anaplan-coral flex-shrink-0" />
                    <span>Edição direta de células com recálculo reativo</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-anaplan-coral flex-shrink-0" />
                    <span>Versões orçamentárias: Base, Otimista, Estresse e Fator de Crescimento</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-anaplan-coral flex-shrink-0" />
                    <span>Fatiamento analítico por centro de custo e diretoria</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Dimensões</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">6D N-Dimensões</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Write-back</p>
                    <p className="text-xs font-black text-anaplan-coral mt-0.5">&lt;8ms</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Capacidade</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">10M+ células</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("PLANNING")}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-anaplan-coral to-orange-500 hover:from-orange-500 hover:to-anaplan-coral text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir Grade de Planejamento no App</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-anaplan-coral" />
                      <span className="text-xs font-bold text-white">Grade Conectada Multidimensional</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-anaplan-coral/20 text-anaplan-coral font-mono">
                      Write-Back Instantâneo
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left font-mono">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2">Conta Contábil</th>
                          <th className="py-2 text-right">Base 2025</th>
                          <th className="py-2 text-right">Orçamento 2026</th>
                          <th className="py-2 text-right">Var %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        <tr>
                          <td className="py-2 font-bold text-white">Receita Operacional Bruta</td>
                          <td className="py-2 text-right text-slate-300">R$ 1.450.000</td>
                          <td className="py-2 text-right text-emerald-400 font-bold">R$ 1.682.000</td>
                          <td className="py-2 text-right text-emerald-400">+16,0%</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-300">(-) Deduções e Impostos</td>
                          <td className="py-2 text-right text-slate-400">(R$ 246.500)</td>
                          <td className="py-2 text-right text-slate-400">(R$ 285.940)</td>
                          <td className="py-2 text-right text-slate-400">+16,0%</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-sky-300">(=) Receita Líquida</td>
                          <td className="py-2 text-right text-slate-300">R$ 1.203.500</td>
                          <td className="py-2 text-right text-sky-400 font-bold">R$ 1.396.060</td>
                          <td className="py-2 text-right text-emerald-400">+16,0%</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-anaplan-coral">(=) Lucro Líquido</td>
                          <td className="py-2 text-right text-slate-300">R$ 184.200</td>
                          <td className="py-2 text-right text-anaplan-coral font-bold">R$ 228.400</td>
                          <td className="py-2 text-right text-emerald-400">+24,0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 04. DEMONSTRAÇÃO DRE & WHAT-IF */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-anaplan-coral/10 text-anaplan-coral border-anaplan-coral/30">
                    Demonstrações
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #04 de 12
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    04. Demonstração DRE & Motor What-If Reativo
                  </h3>
                  <p className="text-xs font-bold text-anaplan-coral mt-1 uppercase tracking-wider">
                    Sensibilidade de Margens, EBITDA e Lucro Líquido
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Demonstração do Resultado do Exercício com motor de sensibilidade What-If em tempo real. Simule choques de preços, volumes, insumos ou despesas operacionais e veja o impacto instantâneo no Lucro Líquido.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-anaplan-coral flex-shrink-0" />
                    <span>Cascata completa da Receita Bruta ao Lucro Líquido</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-anaplan-coral flex-shrink-0" />
                    <span>Simuladores de choques com cálculo marginal instantâneo</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-anaplan-coral flex-shrink-0" />
                    <span>Diagnóstico executivo automatizado com IA Explicativa</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Recálculo</p>
                    <p className="text-xs font-black text-anaplan-coral mt-0.5">&lt;10ms</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Margens</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">EBITDA / Líq.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Motor</p>
                    <p className="text-xs font-black text-sky-400 mt-0.5">Rustworkx</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("DRE")}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-anaplan-coral to-orange-500 hover:from-orange-500 hover:to-anaplan-coral text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir DRE & What-If no Aplicativo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-2 shadow-2xl">
                  <ExecutivePlanningViewCard statementType="DRE" onNavigate={onNavigate} forcedDark={true} />
                </div>
              </div>
            </div>
          </section>

          {/* 05. FLUXO DE CAIXA DIRETO (DFC) */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-sky-500/10 text-sky-400 border-sky-500/30">
                    Demonstrações
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #05 de 12
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    05. Fluxo de Caixa Direto (DFC)
                  </h3>
                  <p className="text-xs font-bold text-sky-400 mt-1 uppercase tracking-wider">
                    Solvência & Conciliação CPC 03 / IAS 7
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Demonstração do Fluxo de Caixa direto no padrão CPC 03 / IAS 7. Modela fluxos operacional (FCO), investimento (FCI) e financiamento (FCF) com diagnóstico rigoroso de solvência e cobertura de liquidez.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Reconciliação direta entre Saldo Inicial e Final de Caixa</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Cálculo de índice de cobertura da dívida e liquidez operacional</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Cenários de estresse de inadimplência e prazos médios</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Pilares</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">FCO, FCI, FCF</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Norma</p>
                    <p className="text-xs font-black text-sky-400 mt-0.5">CPC 03 / IAS 7</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Horizonte</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">24 meses</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("DFC")}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir DFC no Aplicativo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-2 shadow-2xl">
                  <ExecutivePlanningViewCard statementType="DFC" onNavigate={onNavigate} forcedDark={true} />
                </div>
              </div>
            </div>
          </section>

          {/* 06. BALANÇO PATRIMONIAL (BP) */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    Demonstrações
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #06 de 12
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    06. Balanço Patrimonial (BP)
                  </h3>
                  <p className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                    CPC 26 / IFRS, Modelo Fleuriet e Dupont 3-Fatores
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Balanço Patrimonial completo com fechamento contábil rigoroso (Ativo = Passivo + PL). Inclui análise de Capital de Giro pelo Modelo Fleuriet (NCG, CDG, Saldo de Tesouraria) e Decomposição Dupont em 3 Fatores.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Modelo Fleuriet: Necessidade de Capital de Giro (NCG) e Saldo de Tesouraria</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Decomposição Dupont: Margem × Giro × Alavancagem = ROE</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Índices de liquidez corrente, seca, imediata e geral</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Equilíbrio</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">Δ = 0,00</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Dupont</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">ROE 3 Fatores</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Modelo</p>
                    <p className="text-xs font-black text-sky-400 mt-0.5">Fleuriet NCG</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("BP")}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir Balanço Patrimonial no App</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-2 shadow-2xl">
                  <ExecutivePlanningViewCard statementType="BP" onNavigate={onNavigate} forcedDark={true} />
                </div>
              </div>
            </div>
          </section>

          {/* 07. MODELO TRIANGULAR 3-STATEMENT (DRE ↔ DFC ↔ BP) */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    Modelagem Integrada
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #07 de 13
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    07. Modelo Triangular 3-Statement
                  </h3>
                  <p className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                    DRE ↔ DFC ↔ BP com Reconciliação Delta Zero & Fleuriet
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  O "Santo Graal" de FP&A corporativo: amarração matemática fechada sem circularidade entre a Demonstração do Resultado (DRE), o Fluxo de Caixa (DFC) e o Balanço Patrimonial (BP). Qualquer premissa alterada fecha o balanço com tolerância zero a descasamentos patrimoniais.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Equilíbrio contínuo: Ativo Total = Passivo Total + PL garantido (Δ = 0,00)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Simulador de direcionadores operacionais: PMR, PME, PMP, Capex e Payout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Modelo Fleuriet: NCG, CDG, Saldo de Tesouraria e Alerta de Efeito Tesoura</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Equilíbrio</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">Δ = 0,00</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Demonstrações</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">DRE+DFC+BP</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Recálculo</p>
                    <p className="text-xs font-black text-sky-400 mt-0.5">&lt;5ms</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("THREE_STATEMENT")}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir Triângulo Contábil no App</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right: Interactive 3-Statement Preview Card */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Closed-Loop 3-Statement Synchronizer</span>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      Delta Ativo - (Passivo+PL) = R$ 0,00
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">DRE (Resultado)</span>
                      <span className="text-xs font-black text-emerald-400 block mt-1">EBITDA: R$ 18,6B</span>
                      <span className="text-[10px] text-slate-300">Lucro: R$ 10,0B</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">DFC (Fluxo Caixa)</span>
                      <span className="text-xs font-black text-sky-400 block mt-1">FCO: R$ 13,7B</span>
                      <span className="text-[10px] text-slate-300">Capex: -R$ 6,8B</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">BP (Balanço)</span>
                      <span className="text-xs font-black text-purple-400 block mt-1">Ativo: R$ 91,2B</span>
                      <span className="text-[10px] text-slate-300">Passivo+PL: R$ 91,2B</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Fleuriet (Giro)</span>
                      <span className="text-xs font-black text-amber-400 block mt-1">NCG: R$ 7,1B</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Saldo Tesouraria: +</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-anaplan-coral" />
                      <span className="text-slate-300 text-[11px]">Direcionadores Operacionais Ativos:</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>PMR: 42d</span>
                      <span>PME: 86d</span>
                      <span>PMP: 66d</span>
                      <span className="text-anaplan-coral font-bold">Capex: R$ 7,2B</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 08. DEMONSTRAÇÕES COMPLEMENTARES (DRA, DMPL, DVA, NE) */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-purple-500/10 text-purple-400 border-purple-500/30">
                    Demonstrações
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #08 de 13
                  </span>
                </div>
                <div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    08. Demonstrações Complementares (DRA/DMPL/DVA/NE)
                  </h3>
                  <p className="text-xs font-bold text-purple-400 mt-1 uppercase tracking-wider">
                    Suíte Completa de Demonstrações IFRS
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Conjunto completo de demonstrações obrigatórias: Resultado Abrangente (DRA), Mutações do Patrimônio Líquido (DMPL), Valor Adicionado (DVA) e Notas Explicativas (NE) com busca textual inteligente.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>DRA: Ajustes de avaliação patrimonial e resultado abrangente</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>DMPL: Evolução de reservas de capital e dividendos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>DVA: Distribuição de riqueza (trabalho, governo, capital)</span>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("DRA")}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir Complementares no App</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Demonstrações IFRS Complementares</span>
                    </div>
                    <div className="flex gap-1">
                      {(["DRA", "DMPL", "DVA", "NE"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setActiveComplementaryTab(t)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            activeComplementaryTab === t
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeComplementaryTab === "DRA" && (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-300 font-semibold">Demonstração do Resultado Abrangente (CPC 26):</p>
                      <div className="p-3 rounded-xl bg-slate-800/80 space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between"><span>Lucro Líquido do Exercício:</span><span className="font-bold text-emerald-400">R$ 184.200</span></div>
                        <div className="flex justify-between"><span>(+) Ajustes de Avaliação Patrimonial:</span><span className="text-slate-300">R$ 12.400</span></div>
                        <div className="flex justify-between"><span>(+) Variação Cambial de Investimentos:</span><span className="text-slate-300">(R$ 3.800)</span></div>
                        <div className="flex justify-between border-t border-slate-700 pt-1 font-bold text-purple-300">
                          <span>(=) Resultado Abrangente Total:</span><span>R$ 192.800</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeComplementaryTab === "DMPL" && (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-300 font-semibold">Mutações do Patrimônio Líquido:</p>
                      <div className="p-3 rounded-xl bg-slate-800/80 space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between"><span>Saldo Inicial do PL:</span><span className="text-slate-300">R$ 1.250.000</span></div>
                        <div className="flex justify-between"><span>(+) Lucro Líquido Incorporado:</span><span className="text-emerald-400">+ R$ 184.200</span></div>
                        <div className="flex justify-between"><span>(-) Dividendos e JCP Distribuídos:</span><span className="text-rose-400">- R$ 46.050</span></div>
                        <div className="flex justify-between border-t border-slate-700 pt-1 font-bold text-purple-300">
                          <span>(=) Saldo Final do PL:</span><span>R$ 1.388.150</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeComplementaryTab === "DVA" && (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-300 font-semibold">Demonstração do Valor Adicionado:</p>
                      <div className="p-3 rounded-xl bg-slate-800/80 space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between"><span>Valor Adicionado Total a Distribuir:</span><span className="font-bold text-sky-300">R$ 890.000</span></div>
                        <div className="flex justify-between text-slate-400"><span>• Remuneração do Trabalho (Pessoal):</span><span>R$ 310.000 (34,8%)</span></div>
                        <div className="flex justify-between text-slate-400"><span>• Impostos, Taxas e Contribuições:</span><span>R$ 245.000 (27,5%)</span></div>
                        <div className="flex justify-between text-slate-400"><span>• Remuneração de Capitais Próprios:</span><span>R$ 184.200 (20,7%)</span></div>
                      </div>
                    </div>
                  )}
                  {activeComplementaryTab === "NE" && (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-300 font-semibold">Notas Explicativas com IA Semântica:</p>
                      <div className="p-3 rounded-xl bg-slate-800/80 space-y-2 text-[11px]">
                        <p className="text-slate-300 italic">"Nota 14 — Empréstimos e Financiamentos: Dívida líquida de R$ 412M com custo médio atrelado a CDI + 1.8% a.a."</p>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          <Bot className="w-3 h-3" />
                          <span>Indexado por Agente IA Semântico</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 09. CUBO OLAP 3D INTERATIVO */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all space-y-8">
            {/* Header & Description Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-[#14335a]">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-amber-500/10 text-amber-400 border-amber-500/30">
                    Visualização 3D
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #09 de 13
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    09. Cubo OLAP 3D Interativo WebGL
                  </h3>
                  <p className="text-xs font-bold text-amber-400 mt-1 uppercase tracking-wider">
                    Hipercubo Espacial em WebGL Three.js
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Visualização tridimensional do hipercubo financeiro corporativo em WebGL / Three.js. Roteie livremente em 360°, inspecione a densidade volumétrica de valores e realize operações de Slice & Dice espacial.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Rotação orbital suave em 360° e zoom interativo</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Gradiente volumétrico refletindo a magnitude de cada conta</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Clique nas faces do cubo para inspecionar valores exatos</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4 shrink-0">
                <div className="grid grid-cols-3 gap-2.5 text-center w-full max-w-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Motor 3D</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">Three.js WebGL</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">FPS</p>
                    <p className="text-xs font-black text-amber-400 mt-0.5">60 FPS</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Controle</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">Orbit / Slice</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAccessApp("CUBE")}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <span>Explorar Cubo 3D no Aplicativo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Centered 3D OLAP Cube Interactive Canvas */}
            <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 sm:p-4 shadow-2xl">
              <MiniOlapCube />
            </div>
          </section>

          {/* 10. VALUATION CORPORATIVO & MÚLTIPLOS */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    Valuation & M&A
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #10 de 13
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    10. Valuation Corporativo & Múltiplos
                  </h3>
                  <p className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                    Fluxo de Caixa Descontado (DCF), WACC e Múltiplos
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Mesa de valuation corporativo com Fluxo de Caixa Descontado (DCF), cálculo automático do WACC (Ke, Kd, Beta desalavancado, prêmio de risco), crescimento perpétuo de Gordon e múltiplos de mercado.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Calculadora dinâmica de WACC com benefício fiscal da dívida</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Ponte de Enterprise Value (EV) para Equity Value</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Matriz de múltiplos: EV/EBITDA, P/L, EV/Receita e ARR</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Métodos</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">DCF & Múltiplos</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">WACC</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">11,8% a.a.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Sensibilidade</p>
                    <p className="text-xs font-black text-sky-400 mt-0.5">Matriz WACC × g</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("VALUATION")}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir Valuation no Aplicativo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Mesa de Valuation (DCF & WACC)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      Gordon Growth / WACC 11,8%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <p className="text-[10px] text-slate-400">Enterprise Value (EV)</p>
                      <p className="text-base font-black text-emerald-400">R$ 2.840.000.000</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Múltiplo EV/EBITDA: 8,4x</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <p className="text-[10px] text-slate-400">Equity Value (Valor Justo)</p>
                      <p className="text-base font-black text-sky-400">R$ 2.428.000.000</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Preço Justo Projetado</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-xs space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-300"><span>Custo de Capital Próprio (Ke):</span><span className="font-bold">14,2%</span></div>
                    <div className="flex justify-between text-slate-300"><span>Custo da Dívida pós-IR (Kd):</span><span className="font-bold">8,5%</span></div>
                    <div className="flex justify-between text-slate-300"><span>Crescimento Perpétuo (g):</span><span className="font-bold text-emerald-400">3,5%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 11. RADAR CVM WATCHDOG */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-sky-500/10 text-sky-400 border-sky-500/30">
                    Mercado de Capitais
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #11 de 13
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    11. Radar CVM Watch & Compliance
                  </h3>
                  <p className="text-xs font-bold text-sky-400 mt-1 uppercase tracking-wider">
                    Monitoramento Contínuo B3 & Demonstrações ITR/DFP
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Monitor regulatório contínuo de companhias abertas listadas na B3 / CVM. Acompanhe a entrega de ITRs trimestrais, DFPs anuais, pareceres de auditoria independente e alertas de conformidade.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Ingestão direta de dados oficiais da CVM Dados Abertos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Extração de parecer dos auditores independentes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Comparação automática de múltiplos com pares de mercado</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Cobertura</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">B3 / CVM</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Ciclo</p>
                    <p className="text-xs font-black text-sky-400 mt-0.5">ITR & DFP</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Auditoria</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">Big Four</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("CVM")}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir Radar CVM no Aplicativo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 text-white space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white">Monitor CVM B3 & Conformidade</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                      Auditoria Sem Ressalvas
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { ticker: "VALE3", name: "Vale S.A.", report: "DFP Anual 2024", status: "Em Conformidade", audit: "PwC", color: "text-emerald-400" },
                      { ticker: "PETR4", name: "Petrobras S.A.", report: "ITR 3T24", status: "Em Conformidade", audit: "KPMG", color: "text-emerald-400" },
                      { ticker: "BBAS3", name: "Banco do Brasil S.A.", report: "DFP Anual 2024", status: "Auditado", audit: "EY", color: "text-emerald-400" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <div>
                          <span className="text-xs font-bold text-white">{item.ticker} — {item.name}</span>
                          <p className="text-[10px] text-slate-400">{item.report} • Auditor: {item.audit}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 ${item.color}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 12. MACROECONOMIA & BANCO CENTRAL */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-amber-500/10 text-amber-400 border-amber-500/30">
                    Macroeconomia
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #12 de 13
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    12. Macroeconomia & Banco Central (SGS BCB)
                  </h3>
                  <p className="text-xs font-bold text-amber-400 mt-1 uppercase tracking-wider">
                    Séries Oficiais SGS BCB & Analista IA de Atas do Copom
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Integração direta com o Sistema Gerenciador de Séries Temporais do Banco Central (SGS BCB), trazendo Taxa Selic, IPCA, Câmbio PTAX USD/BRL e análise comparativa de Atas do Copom por IA.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Sincronização diária das curvas de juros, inflação e câmbio</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Analista comparativo de alterações textuais das Atas do Copom</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Propagação imediata de choques de juros nas despesas financeiras</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Fonte</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">SGS BCB</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Índices</p>
                    <p className="text-xs font-black text-amber-400 mt-0.5">Selic/IPCA/FX</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Copom</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">IA Semântica</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp("ECONOMY")}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir Macroeconomia no App</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Séries SGS Banco Central (BCB)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                      Tempo Real
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <p className="text-[10px] text-slate-400">Selic Meta (a.a.)</p>
                      <p className="text-base font-black text-amber-400 mt-1">13,25%</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Copom BCB</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <p className="text-[10px] text-slate-400">IPCA Acum. 12m</p>
                      <p className="text-base font-black text-sky-400 mt-1">4,45%</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">IBGE Oficial</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <p className="text-[10px] text-slate-400">Câmbio USD/BRL</p>
                      <p className="text-base font-black text-emerald-400 mt-1">R$ 5,75</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">PTAX BCB</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
                    <p className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>Analista Comparativo Copom por IA</span>
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                      "Detectada modulação de tom hawkish no parágrafo 18 da Ata mais recente, sugerindo manutenção da taxa restritiva por período prolongado."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 13. GRAFO DAG TOPOLÓGICO REATIVO */}
          <section className="bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-sky-500/10 text-sky-400 border-sky-500/30">
                    Arquitetura
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    Módulo #13 de 13
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    13. Grafo DAG Topológico Reativo
                  </h3>
                  <p className="text-xs font-bold text-sky-400 mt-1 uppercase tracking-wider">
                    Rede Direcionada Acíclica em Rustworkx
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 leading-relaxed">
                  Grafo Direcionado Acíclico (DAG) compilado em Rustworkx de alta performance. Mapeia cada dependência e fórmula, garantindo que qualquer premissa alterada recalcule apenas os nós dependentes em microssegundos.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Complexidade reduzida de O(N) para O(K) nós dependentes</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Canvas visual interativo com inspeção de fórmulas e nós</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Suporte universal para DRE, DFC, Balanço e KPIs</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-[#14335a]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Motor</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">Rustworkx</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Latência</p>
                    <p className="text-xs font-black text-sky-400 mt-0.5">&lt;1.4ms</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071526] text-center border border-slate-200 dark:border-[#14335a]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Ciclos</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">Zero-Cycle DAG</p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAccessApp(dagMode)}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Abrir Grafo DAG no Aplicativo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Demonstração no Grafo:
                    </span>
                    {(["DRE", "DFC", "BP"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setDagMode(m)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          dagMode === m
                            ? "bg-sky-500 text-white shadow-md"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="h-[460px] rounded-2xl overflow-hidden border border-slate-800 relative bg-[#0b1220] shadow-inner">
                    <MiniDagViewer viewMode={dagMode} refreshKey={dagMode === "DRE" ? 1 : (dagMode === "DFC" ? 2 : 3)} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SECTION: Engine Architecture & Computational Power */}
        <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-[#14335a]">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEn ? "Engine Architecture & High-Performance Core" : "Arquitetura de Cálculo & Desempenho em Milissegundos"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              {isEn
                ? "Engineered with Rust, Python columnar analytics, and WebGL for zero-lag calculations."
                : "Construído em Rust, Polars e WebGL para recálculos contábeis sem travamentos ou latência."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-[#14335a] bg-white dark:bg-[#0c2340]/90 backdrop-blur-sm space-y-3 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-anaplan-coral/10 text-anaplan-coral flex items-center justify-center shadow-inner">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isEn ? "Rustworkx DAG Engine" : "Grafo DAG em Rustworkx"}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {isEn
                  ? "Topological calculation tree compiled in Rust. Avoids recalculating the entire grid, evaluating only affected downstream nodes in <1.4ms."
                  : "Árvore topológica contábil em Rust. Em vez de recalcular matrizes inteiras, propaga alterações somente nos nós descendentes afetados em <1.4ms."}
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 dark:border-[#14335a] bg-white dark:bg-[#0c2340]/90 backdrop-blur-sm space-y-3 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center shadow-inner">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isEn ? "Polars + Columnar DuckDB" : "Polars & DuckDB Colunar"}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {isEn
                  ? "Vectorized in-memory SIMD queries over multi-year corporate time series, with ultra-low memory footprint and instant grouping."
                  : "Consultas analíticas OLAP vetorizadas em memória SIMD sobre séries históricas corporativas, com altíssima velocidade e baixo consumo de RAM."}
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 dark:border-[#14335a] bg-white dark:bg-[#0c2340]/90 backdrop-blur-sm space-y-3 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isEn ? "Multi-Agent Executive AI" : "IA Agêntica Explicativa"}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {isEn
                  ? "Integrated financial agents (Agno) that automatically generate executive memorandums, explain marginal variances, and stress-test assumptions."
                  : "Agentes inteligentes que sintetizam memorandos executivos, explicam a causa-raiz de variações marginais e auditam o fechamento contábil."}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: Local SQLite Database & Data Privacy */}
        <section className="p-8 rounded-3xl bg-slate-100 dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <Database className="w-3.5 h-3.5" />
                <span>{isEn ? "Local SQLite Architecture (users.db)" : "Persistência no Banco Local SQLite (users.db)"}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {isEn ? "Privacy-First: Data Stays Locally in SQLite" : "Privacidade Total: Seus Dados Ficam no SQLite Local"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {isEn
                  ? "All user logins, registered accounts, passwords, and model parameters are kept in local SQLite databases (users.db & ai_settings.db). No external servers required for internal planning."
                  : "Cadastros, credenciais e parâmetros ficam salvos no banco SQLite local. Teste livremente com qualquer e-mail e senha sem restrições ou dependência de provedores externos."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleRegisterApp()}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isEn ? "Register Test Account" : "Criar Cadastro para Teste"}</span>
              </button>
              <button
                onClick={() => handleAccessApp()}
                className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 transition cursor-pointer"
              >
                {isEn ? "Login with Demo (1-Click)" : "Entrar com Demo (1-Clique)"}
              </button>
            </div>
          </div>
        </section>

        {/* GRAND FINALE SECTION: Bottom CTA Banner to Access the Application */}
        <section className="bg-gradient-to-r from-[#0c2340] via-[#14335a] to-[#0c2340] text-white rounded-3xl p-8 sm:p-14 text-center space-y-8 shadow-2xl border border-[#1e4475] relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-40 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-bold text-slate-200">
              <Sparkles className="w-4 h-4 text-anaplan-coral" />
              <span>HyperCube Connected Planning Engine v3.0</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {isEn 
                ? "Ready to Transform Your Corporate Financial Planning?" 
                : "Pronto para Transformar seu Planejamento Financeiro?"}
            </h2>

            <p className="text-xs sm:text-base text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed">
              {isEn
                ? "Access the complete connected planning platform, perform instant What-If calculations across DRE, DFC, and Balance Sheet, and explore 3D OLAP hypercubes."
                : "Acesse a plataforma completa de planejamento conectado, simule choques na DRE, DFC e Balanço Patrimonial em <10ms e tome decisões estratégicas orientadas por IA."}
            </p>

            {/* Prominent Access Button requested by user */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleRegisterApp()}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-anaplan-coral via-[#ff6a4d] to-orange-500 hover:from-orange-500 hover:to-anaplan-coral text-white text-sm font-black shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>{isEn ? "Access Platform Now (Sign In / Register)" : "Acessar o Aplicativo Agora"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleAccessApp()}
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-slate-400 hover:border-white bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>{isEn ? "1-Click Demo Login" : "Entrar com Conta de Teste"}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-300 font-medium pt-2">
              ✓ {isEn ? "Free testing enabled: Any email and password accepted." : "Acesso livre para teste: Qualquer e-mail e senha são aceitos e gravados localmente no SQLite."}
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-[#14335a] bg-white dark:bg-[#0c2340] py-8 text-slate-700 dark:text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <DynamicLogo layout="horizontal" size="3x" isExpanded={true} />
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} HyperCube Engine. Connected Planning & Reactive DAGs.
            </span>
          </div>

          <div className="flex items-center gap-6 font-bold">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-anaplan-coral transition cursor-pointer"
            >
              {isEn ? "Back to Top" : "Voltar ao Topo"}
            </button>
            <button
              onClick={() => onNavigate("GUIDE")}
              className="hover:text-anaplan-coral transition cursor-pointer"
            >
              {isEn ? "User Guide" : "Manual & Guia"}
            </button>
            <button
              onClick={() => handleRegisterApp()}
              className="text-anaplan-coral hover:underline font-black cursor-pointer"
            >
              {isEn ? "Enter App" : "Entrar no App"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
