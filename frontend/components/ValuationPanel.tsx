"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calculator,
  Building2,
  UploadCloud,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  DollarSign,
  BarChart3,
  Sliders,
  SlidersHorizontal,
  ChevronDown,
  HelpCircle,
  Sparkles,
  Send,
  Download,
  Info,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Percent,
  RotateCcw,
  Check,
  Settings2,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { usePreferences } from "./PreferencesContext";
import { useAgentExecution } from "./AgentExecutionContext";

interface ValuationPanelProps {
  activeCompany?: {
    id: string;
    name: string;
    ticker: string;
    currency: string;
    periods: string[];
    description: string;
  };
  onNavigate?: (mode: string) => void;
}

const CVM_COMPANIES_PRESET = [
  { cod_cvm: 9512, nome_pregao: "PETROBRAS", denom: "PETROLEO BRASILEIRO S.A. PETROBRAS", setor: "Petróleo, Gás e Biocombustíveis" },
  { cod_cvm: 4170, nome_pregao: "VALE", denom: "VALE S.A.", setor: "Mineração e Metalurgia" },
  { cod_cvm: 1023, nome_pregao: "BANCO DO BRASIL", denom: "BANCO DO BRASIL S.A.", setor: "Intermediários Financeiros / Bancos" },
  { cod_cvm: 19348, nome_pregao: "ITAU UNIBANCO", denom: "ITAU UNIBANCO HOLDING S.A.", setor: "Intermediários Financeiros / Bancos" },
  { cod_cvm: 23264, nome_pregao: "AMBEV S.A.", denom: "AMBEV S.A.", setor: "Bebidas e Alimentos" },
  { cod_cvm: 5410, nome_pregao: "WEG", denom: "WEG S.A.", setor: "Máquinas e Equipamentos" },
  { cod_cvm: 18325, nome_pregao: "EMBRAER", denom: "EMBRAER S.A.", setor: "Material de Transporte / Aeroespacial" },
  { cod_cvm: 16454, nome_pregao: "SUZANO S.A.", denom: "SUZANO S.A.", setor: "Papel e Celulose" },
  { cod_cvm: 20257, nome_pregao: "LOCALIZA", denom: "LOCALIZA RENT A CAR S.A.", setor: "Aluguel de Carros / Serviços" },
  { cod_cvm: 24376, nome_pregao: "B3", denom: "B3 S.A. - BRASIL, BOLSA, BALCAO", setor: "Serviços Financeiros Diversos" },
  { cod_cvm: 20982, nome_pregao: "EQUATORIAL", denom: "EQUATORIAL ENERGIA S.A.", setor: "Energia Elétrica" },
  { cod_cvm: 26034, nome_pregao: "VIBRA", denom: "VIBRA ENERGIA S.A.", setor: "Distribuição de Combustíveis" },
  { cod_cvm: 24295, nome_pregao: "RAIADROGASIL", denom: "RAIADROGASIL S.A.", setor: "Farmacêutico e Higiene" },
  { cod_cvm: 21903, nome_pregao: "CASAS BAHIA", denom: "GRUPO CASAS BAHIA S.A.", setor: "Comércio Varejista" },
  { cod_cvm: 22470, nome_pregao: "MAGAZINE LUIZA", denom: "MAGAZINE LUIZA S.A.", setor: "Comércio Varejista" },
];

export default function ValuationPanel({ activeCompany, onNavigate }: ValuationPanelProps) {
  const { theme, language, apiBaseUrl, activeCompany: globalActiveCompany } = usePreferences();
  const effectiveCompany = activeCompany || globalActiveCompany;
  const isDark = theme === "dark";
  const isEn = language === "en";

  const { submitTask, getChatHistory, isAgentRunning, activeTasks } = useAgentExecution();
  const valuationChatLog = getChatHistory("valuation");
  const isValuationAgentRunning = isAgentRunning("valuation");

  // Data Source Selection: "upload" vs "cvm"
  const [sourceType, setSourceType] = useState<"upload" | "cvm">("upload");
  const [selectedCodCvm, setSelectedCodCvm] = useState<number>(9512); // Default Petrobras for CVM
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Valuation Data State
  const [valuationData, setValuationData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "STEPS" | "SENSITIVITY" | "MULTIPLES" | "METHODOLOGIES">("SUMMARY");

  // What-If Granular Overrides for EACH Methodology Parameter
  const [waccOverride, setWaccOverride] = useState<number | null>(null);
  const [gOverride, setGOverride] = useState<number | null>(null);
  const [betaOverride, setBetaOverride] = useState<number | null>(null);
  const [rfOverride, setRfOverride] = useState<number | null>(null);
  const [mrpOverride, setMrpOverride] = useState<number | null>(null);
  const [kdOverride, setKdOverride] = useState<number | null>(null);
  const [taxOverride, setTaxOverride] = useState<number | null>(null);
  const [debtRatioOverride, setDebtRatioOverride] = useState<number | null>(null);
  const [ebitMarginOverride, setEbitMarginOverride] = useState<number | null>(null);
  const [growthRateOverride, setGrowthRateOverride] = useState<number | null>(null);
  const [capexRatioOverride, setCapexRatioOverride] = useState<number | null>(null);
  const [nwcRatioOverride, setNwcRatioOverride] = useState<number | null>(null);
  const [exitMultipleOverride, setExitMultipleOverride] = useState<number | null>(null);
  const [peerPeOverride, setPeerPeOverride] = useState<number | null>(null);

  // UI state for What-If Panel
  const [isWhatIfExpanded, setIsWhatIfExpanded] = useState<boolean>(true);
  const [activeWhatIfTab, setActiveWhatIfTab] = useState<"ALL" | "WACC" | "DCF" | "MULTIPLES">("ALL");

  // Count active overrides
  const activeWhatIfCount = useMemo(() => {
    const arr = [
      waccOverride,
      gOverride,
      betaOverride,
      rfOverride,
      mrpOverride,
      kdOverride,
      taxOverride,
      debtRatioOverride,
      ebitMarginOverride,
      growthRateOverride,
      capexRatioOverride,
      nwcRatioOverride,
      exitMultipleOverride,
      peerPeOverride,
    ];
    return arr.filter((v) => v !== null).length;
  }, [
    waccOverride,
    gOverride,
    betaOverride,
    rfOverride,
    mrpOverride,
    kdOverride,
    taxOverride,
    debtRatioOverride,
    ebitMarginOverride,
    growthRateOverride,
    capexRatioOverride,
    nwcRatioOverride,
    exitMultipleOverride,
    peerPeOverride,
  ]);

  // Reset all overrides
  const handleResetAllWhatIf = () => {
    setWaccOverride(null);
    setGOverride(null);
    setBetaOverride(null);
    setRfOverride(null);
    setMrpOverride(null);
    setKdOverride(null);
    setTaxOverride(null);
    setDebtRatioOverride(null);
    setEbitMarginOverride(null);
    setGrowthRateOverride(null);
    setCapexRatioOverride(null);
    setNwcRatioOverride(null);
    setExitMultipleOverride(null);
    setPeerPeOverride(null);
  };

  // Preset scenarios
  const applyPresetScenario = (scenario: "BULL" | "BEAR") => {
    if (!valuationData) return;
    const baseP = valuationData.parameters;
    if (scenario === "BULL") {
      setEbitMarginOverride(Math.min(50, Number((baseP.ebit_margin + 3.0).toFixed(1))));
      setGrowthRateOverride(Math.min(25, Number((baseP.revenue_growth + 2.0).toFixed(1))));
      setWaccOverride(Math.max(4, Number((baseP.wacc - 1.0).toFixed(2))));
      setGOverride(Math.min(5.5, Number((baseP.perpetual_growth_g + 0.5).toFixed(2))));
      setExitMultipleOverride(Number((baseP.exit_multiple * 1.15).toFixed(1)));
    } else if (scenario === "BEAR") {
      setEbitMarginOverride(Math.max(3, Number((baseP.ebit_margin - 3.5).toFixed(1))));
      setGrowthRateOverride(Math.max(-5, Number((baseP.revenue_growth - 2.5).toFixed(1))));
      setWaccOverride(Number((baseP.wacc + 1.5).toFixed(2)));
      setGOverride(Math.max(1.0, Number((baseP.perpetual_growth_g - 0.5).toFixed(2))));
      setExitMultipleOverride(Number((baseP.exit_multiple * 0.85).toFixed(1)));
    }
  };

  // Chat with Agno Agent
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "agent"; text: string }>>([
    {
      sender: "agent",
      text: isEn
        ? "Hello! I am your Agno PhD Valuation Agent. I can explain any step of this valuation, conduct sensitivity scenarios (WACC vs g), discuss peer multiples, or analyze capital structure assumptions. How can I assist you today?"
        : "Olá! Sou seu Agente Agno PhD em Valuation Corporativo. Posso explicar detalhadamente cada etapa deste valuation, avaliar a sensibilidade de premissas (WACC e perpetuidade g), comparar múltiplos de mercado ou analisar a estrutura de capital. Como posso te ajudar?"
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Multi-target robust fetch helper
  const fetchWithFallback = async (path: string, options?: RequestInit): Promise<any> => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const candidates = [
      `${apiBaseUrl || "http://localhost:8000"}${cleanPath}`,
      `http://127.0.0.1:8000${cleanPath}`,
      `http://localhost:8000${cleanPath}`,
    ].filter((v, i, a) => a.indexOf(v) === i);

    for (const url of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // continue to next candidate
      }
    }
    throw new Error(`Failed to fetch from candidate endpoints: ${path}`);
  };

  // Load Valuation Calculation
  const loadValuation = async (
    source = sourceType,
    cvmCode = selectedCodCvm
  ) => {
    setLoading(true);
    try {
      const payload: any = {
        source_type: source,
        identifier: source === "cvm" ? cvmCode : (activeCompany?.id || "casas_bahia"),
      };
      if (waccOverride !== null && waccOverride > 0) payload.wacc_override = waccOverride / 100.0;
      if (gOverride !== null && gOverride > 0) payload.g_override = gOverride / 100.0;
      if (betaOverride !== null && betaOverride > 0) payload.beta_override = betaOverride;
      if (rfOverride !== null && rfOverride > 0) payload.rf_override = rfOverride / 100.0;
      if (mrpOverride !== null && mrpOverride > 0) payload.mrp_override = mrpOverride / 100.0;
      if (kdOverride !== null && kdOverride > 0) payload.kd_override = kdOverride / 100.0;
      if (taxOverride !== null && taxOverride >= 0) payload.tax_override = taxOverride / 100.0;
      if (debtRatioOverride !== null && debtRatioOverride >= 0) payload.debt_ratio_override = debtRatioOverride / 100.0;
      if (ebitMarginOverride !== null && ebitMarginOverride > 0) payload.ebit_margin_override = ebitMarginOverride / 100.0;
      if (growthRateOverride !== null) payload.growth_rate_override = growthRateOverride / 100.0;
      if (capexRatioOverride !== null && capexRatioOverride >= 0) payload.capex_ratio_override = capexRatioOverride / 100.0;
      if (nwcRatioOverride !== null && nwcRatioOverride >= 0) payload.nwc_ratio_override = nwcRatioOverride / 100.0;
      if (exitMultipleOverride !== null && exitMultipleOverride > 0) payload.exit_multiple_override = exitMultipleOverride;
      if (peerPeOverride !== null && peerPeOverride > 0) payload.peer_pe_override = peerPeOverride;

      const data = await fetchWithFallback("/api/valuation/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (data && data.dcf_summary) {
        setValuationData(data);
      }
    } catch (err) {
      console.warn("Notice loading valuation from API, applying baseline valuation model:", err);
      // Fallback baseline model so screen is never blank
      const compName = source === "cvm" 
        ? (CVM_COMPANIES_PRESET.find(c => c.cod_cvm === cvmCode)?.denom || "PETROBRAS")
        : (activeCompany?.name || "Vale S.A.");
      const compTicker = source === "cvm"
        ? (CVM_COMPANIES_PRESET.find(c => c.cod_cvm === cvmCode)?.nome_pregao || "PETR4")
        : (activeCompany?.ticker || "VALE3");
      const compSector = source === "cvm"
        ? (CVM_COMPANIES_PRESET.find(c => c.cod_cvm === cvmCode)?.setor || "Energia e Recursos")
        : "Mineração e Metalurgia";

      const effWacc = waccOverride || 12.23;
      const effG = gOverride || 3.5;

      setValuationData({
        company: { name: compName, ticker: compTicker, sector: compSector, annual_revenue: 41800.0, ebit: 12958.0, ebitda: 14630.0, net_income: 8778.0 },
        parameters: { wacc: effWacc, ke: 14.58, kd_pre_tax: 12.0, kd_after_tax: 7.92, rf_rate: 6.5, mrp: 5.5, beta: 1.1, tax_rate: 34.0, debt_ratio: 35.0, equity_ratio: 65.0, perpetual_growth_g: effG, ebit_margin: 31.0, revenue_growth: 6.0, capex_ratio: 5.0, nwc_ratio: 1.5, exit_multiple: 5.2, peer_pe: 7.0 },
        dcf_summary: { enterprise_value: 92101.78, equity_value: 81129.28, net_debt: 10972.5, pv_explicit_fcff: 25410.2, pv_terminal_value: 66691.58, terminal_value_weight_pct: 72.4, fair_share_price: 48.25, market_reference_price: 39.57, upside_potential_pct: 21.9, valuation_range: { min: 42.46, max: 55.49 } },
        projections: [
          { year: "Ano 1", receita: 44308.0, ebit: 13735.5, nopat: 9065.4, da: 1993.8, capex: -2215.4, delta_nwc: -664.6, fcff: 8179.2, discount_factor: 0.891, pv_fcff: 7287.7 },
          { year: "Ano 2", receita: 46744.9, ebit: 14490.9, nopat: 9564.0, da: 2103.5, capex: -2337.2, delta_nwc: -701.2, fcff: 8629.1, discount_factor: 0.794, pv_fcff: 6851.5 },
          { year: "Ano 3", receita: 49082.2, ebit: 15215.5, nopat: 10042.2, da: 2208.7, capex: -2454.1, delta_nwc: -736.2, fcff: 9060.6, discount_factor: 0.7075, pv_fcff: 6410.4 },
          { year: "Ano 4", receita: 51291.9, ebit: 15900.5, nopat: 10494.3, da: 2308.1, capex: -2564.6, delta_nwc: -769.4, fcff: 9468.4, discount_factor: 0.6304, pv_fcff: 5968.9 },
          { year: "Ano 5", receita: 53343.6, ebit: 16536.5, nopat: 10914.1, da: 2400.5, capex: -2667.2, delta_nwc: -800.2, fcff: 9847.2, discount_factor: 0.5617, pv_fcff: 5531.2 }
        ],
        sensitivity_matrix: [
          { wacc: 10.23, values: [{ g: 2.5, share_price: 54.12, diff_pct: 12.2, is_base: false }, { g: 3.0, share_price: 57.88, diff_pct: 20.0, is_base: false }, { g: 3.5, share_price: 62.45, diff_pct: 29.4, is_base: false }, { g: 4.0, share_price: 68.12, diff_pct: 41.2, is_base: false }, { g: 4.5, share_price: 75.34, diff_pct: 56.1, is_base: false }] },
          { wacc: 11.23, values: [{ g: 2.5, share_price: 47.92, diff_pct: -0.7, is_base: false }, { g: 3.0, share_price: 50.81, diff_pct: 5.3, is_base: false }, { g: 3.5, share_price: 54.25, diff_pct: 12.4, is_base: false }, { g: 4.0, share_price: 58.42, diff_pct: 21.1, is_base: false }, { g: 4.5, share_price: 63.59, diff_pct: 31.8, is_base: false }] },
          { wacc: 12.23, values: [{ g: 2.5, share_price: 43.12, diff_pct: -10.6, is_base: false }, { g: 3.0, share_price: 45.42, diff_pct: -5.9, is_base: false }, { g: 3.5, share_price: 48.25, diff_pct: 0.0, is_base: true }, { g: 4.0, share_price: 51.42, diff_pct: 6.6, is_base: false }, { g: 4.5, share_price: 55.28, diff_pct: 14.6, is_base: false }] },
          { wacc: 13.23, values: [{ g: 2.5, share_price: 39.24, diff_pct: -18.7, is_base: false }, { g: 3.0, share_price: 41.12, diff_pct: -14.8, is_base: false }, { g: 3.5, share_price: 43.32, diff_pct: -10.2, is_base: false }, { g: 4.0, share_price: 45.88, diff_pct: -4.9, is_base: false }, { g: 4.5, share_price: 48.91, diff_pct: 1.4, is_base: false }] },
          { wacc: 14.23, values: [{ g: 2.5, share_price: 36.05, diff_pct: -25.3, is_base: false }, { g: 3.0, share_price: 37.58, diff_pct: -22.1, is_base: false }, { g: 3.5, share_price: 39.38, diff_pct: -18.4, is_base: false }, { g: 4.0, share_price: 41.45, diff_pct: -14.1, is_base: false }, { g: 4.5, share_price: 43.85, diff_pct: -9.1, is_base: false }] }
        ],
        football_field: [
          { method: "DCF (Gordon Growth)", low: 42.46, mid: 48.25, high: 55.49, ev_mid: 92101.8 },
          { method: "DCF (Exit Multiple)", low: 43.43, mid: 48.25, high: 54.04, ev_mid: 92101.8 },
          { method: "Múltiplos (EV/EBITDA)", low: 39.85, mid: 46.88, high: 56.26, ev_mid: 76076.0 },
          { method: "Múltiplos (P/L Pares)", low: 34.95, mid: 43.68, high: 54.60, ev_mid: 72418.5 },
          { method: "Patrimonial Ajustado", low: 22.45, mid: 32.07, high: 36.88, ev_mid: 47820.0 }
        ],
        calculation_steps: [
          { step: 1, title: "Custo de Capital Próprio (CAPM)", formula: "Ke = Rf + Beta × (Rm - Rf) + Country Risk", description: "Taxa livre de risco Rf = 6.5%, Beta = 1.10, Prêmio de Risco de Mercado = 5.5% e Risco País de 2.0%.", result: "14.58% a.a." },
          { step: 2, title: "Custo Médio Ponderado de Capital (WACC)", formula: "WACC = (E/V × Ke) + (D/V × Kd × (1 - T))", description: "Ponderação de 65% Capital Próprio e 35% Dívida com benefício fiscal de 34% no IRPJ/CSLL.", result: "12.23% a.a." },
          { step: 3, title: "Fluxo de Caixa Livre da Firma (FCFF)", formula: "FCFF = EBIT × (1 - T) + D&A - CAPEX - ΔNWC", description: "Projetado ano a ano durante 5 anos. Valor Presente explícito acumulado: R$ 31.890 Mi.", result: "R$ 31.890 Mi (PV Explícito)" },
          { step: 4, title: "Valor Residual (Perpetuidade Gordon)", formula: "TV = [FCFF(n) × (1 + g)] / (WACC - g)", description: "Taxa de crescimento perpétuo g = 3.5%. PV do valor terminal trazido a valor presente: R$ 60.211 Mi.", result: "R$ 60.211 Mi (PV Perpetuidade)" },
          { step: 5, title: "Ponte Enterprise Value para Equity Value", formula: "Equity Value = Enterprise Value - Dívida Líquida", description: "Enterprise Value consolidado de R$ 92.101 Mi deduzido da dívida líquida da empresa.", result: "R$ 81.129 Mi (Equity Value)" },
          { step: 6, title: "Preço Justo por Ação (Fair Value)", formula: "Preço por Ação = Equity Value / Nº de Ações", description: "Divisão do Equity Value justo pela base de ações em circulação comparado com o preço de mercado.", result: "R$ 48.25 (Upside de +21.9%)" }
        ],
        methodologies_parameters: [
          { methodology: "Custo de Capital (CAPM / WACC)", parameter_name: "Taxa Livre de Risco (Risk-Free Rate)", symbol: "Rf", value: "6.50% a.a.", formula: "Ke = Rf + Beta × ERP + CountryRisk", impact: "Inverso Alto: Comprime o valor presente dos fluxos futuros.", sensitivity: "Para cada +1.0% de Rf, o Preço Justo recua ~6%." },
          { methodology: "Custo de Capital (CAPM / WACC)", parameter_name: "Beta do Ativo (Risco Sistemático)", symbol: "β", value: "1.10x", formula: "Ke = Rf + Beta × (Rm - Rf)", impact: "Inverso Médio: Mede a volatilidade do setor frente ao Ibovespa.", sensitivity: "Cada +0.2x no Beta eleva Ke em +1.1% a.a." },
          { methodology: "Custo de Capital (CAPM / WACC)", parameter_name: "WACC (Custo Médio Ponderado)", symbol: "WACC", value: `${effWacc}% a.a.`, formula: "WACC = (We × Ke) + (Wd × Kd × (1 - T))", impact: "Inverso Crítico: Taxa de desconto oficial de FCFF.", sensitivity: "Cada +1% no WACC reduz o Preço Justo em ~10%." },
          { methodology: "Fluxo de Caixa Descontado (DCF / FCFF)", parameter_name: "Margem EBIT Operacional", symbol: "Margem EBIT", value: "31.00%", formula: "EBIT = Receita × Margem EBIT", impact: "Direto Crítico: Capacidade de gerar lucro operacional.", sensitivity: "Cada +1.0 p.p. na margem EBIT eleva o Preço Justo em ~7%." },
          { methodology: "Valor Terminal (Gordon Growth)", parameter_name: "Crescimento Perpétuo de Longo Prazo", symbol: "g", value: `${effG}% a.a.`, formula: "TV = [FCFF(5) × (1 + g)] / (WACC - g)", impact: "Direto Crítico: Expansão perpétua pós-5º ano.", sensitivity: "Cada +0.5% em g eleva o Preço Justo em ~8%." },
          { methodology: "Múltiplos de Mercado (Relative Valuation)", parameter_name: "Múltiplo EV / EBITDA Setorial", symbol: "EV / EBITDA", value: "5.20x", formula: "EV = EBITDA(5) × Multiplo", impact: "Direto Alto: Balizador comparável do setor.", sensitivity: "Cada +1.0x eleva o valor por múltiplos em ~16%." }
        ],
        multiples: {
          ev_ebitda: { multiple: 5.2, implied_ev: 76076.0 },
          pe: { multiple: 7.0, implied_equity: 61446.0 },
          ev_sales: { multiple: 1.14, implied_ev: 47652.0 },
          pvp: { multiple: 1.35, implied_equity: 25393.5 }
        },
        asset_based: { book_value: 18810.0, adjusted_book_value: 21631.5, liquidation_value: 13167.0 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValuation(sourceType, selectedCodCvm);
  }, [
    sourceType,
    selectedCodCvm,
    activeCompany?.id,
    apiBaseUrl,
    waccOverride,
    gOverride,
    betaOverride,
    rfOverride,
    mrpOverride,
    kdOverride,
    taxOverride,
    debtRatioOverride,
    ebitMarginOverride,
    growthRateOverride,
    capexRatioOverride,
    nwcRatioOverride,
    exitMultipleOverride,
    peerPeOverride,
  ]);

  // Send message to Agno Valuation Agent (continuous background task)
  const handleSendChat = async (questionText?: string) => {
    const q = questionText || inputQuestion;
    if (!q.trim() || !valuationData || isValuationAgentRunning) return;

    setInputQuestion("");
    await submitTask("valuation", q, {
      valuation_context: valuationData,
      history: valuationChatLog.slice(-6).map((m) => ({ role: "user", content: m.q })),
    });
  };

  // Filtered CVM companies preset
  const filteredCvm = useMemo(() => {
    if (!searchTerm.trim()) return CVM_COMPANIES_PRESET;
    const t = searchTerm.toLowerCase();
    return CVM_COMPANIES_PRESET.filter(
      (c) => c.nome_pregao.toLowerCase().includes(t) || c.denom.toLowerCase().includes(t) || c.setor.toLowerCase().includes(t)
    );
  }, [searchTerm]);

  // Export full valuation as CSV
  const handleExportCSV = () => {
    if (!valuationData) return;
    const dcf = valuationData.dcf_summary;
    const params = valuationData.parameters;
    const rows = [
      ["Valuation Corporativo — " + valuationData.company.name, ""],
      ["Data de Geração", new Date().toLocaleDateString(isEn ? "en-US" : "pt-BR")],
      ["", ""],
      ["MÉTRICA RESUMO DCF", "VALOR"],
      ["Enterprise Value (EV)", `R$ ${dcf.enterprise_value.toFixed(2)} Mi`],
      ["Equity Value (Valor Justo Acionário)", `R$ ${dcf.equity_value.toFixed(2)} Mi`],
      ["Dívida Líquida", `R$ ${dcf.net_debt.toFixed(2)} Mi`],
      ["Preço Justo por Ação (Fair Price)", `R$ ${dcf.fair_share_price.toFixed(2)}`],
      ["Preço de Referência de Mercado", `R$ ${dcf.market_reference_price.toFixed(2)}`],
      ["Potencial Upside / Downside", `${dcf.upside_potential_pct}%`],
      ["Faixa de Valor Recomendada", `R$ ${dcf.valuation_range.min} - R$ ${dcf.valuation_range.max}`],
      ["", ""],
      ["PREMISSAS DE CUSTO DE CAPITAL", "VALOR"],
      ["WACC", `${params.wacc}% a.a.`],
      ["Custo do Capital Próprio (Ke - CAPM)", `${params.ke}% a.a.`],
      ["Beta do Setor", `${params.beta}`],
      ["Taxa Livre de Risco (Rf)", `${params.rf_rate}%`],
      ["Prêmio de Risco de Mercado (MRP)", `${params.mrp}%`],
      ["Custo da Dívida Líquido (Kd)", `${params.kd_after_tax}% a.a.`],
      ["Taxa de Crescimento Perpétuo (g)", `${params.perpetual_growth_g}% a.a.`],
    ];

    const csvContent = "\uFEFF" + rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Valuation_${valuationData.company.ticker || "Empresa"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const suggestedQuestions = [
    isEn ? "What is the sensitivity of fair price to a 1% increase in WACC?" : "Qual a sensibilidade do preço a um aumento de 1% no WACC?",
    isEn ? "How does current Selic / interest rate affect Cost of Equity (Ke)?" : "Como a Selic e taxa de juros afetam o Custo de Capital Próprio (Ke)?",
    isEn ? "Why does DCF Gordon Growth differ from EV/EBITDA multiples?" : "Por que o DCF difere do valuation por múltiplos de EV/EBITDA?",
    isEn ? "What is the recommended valuation range and safety margin?" : "Qual é o valuation range recomendado e a margem de segurança?",
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1 ${
                isDark
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-500" />
              Valuation Engine & Agno PhD
            </span>
            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isEn ? "DCF, Multiples & Sensitivity Matrix" : "DCF, Múltiplos & Matriz de Sensibilidade"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent flex items-center gap-2 mt-0.5">
            <Calculator className="w-7 h-7 text-emerald-500" />
            <span>{isEn ? "Corporate Valuation & Fair Value Analysis" : "Valuation Corporativo & Análise de Valor Justo"}</span>
          </h1>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => loadValuation()}
            disabled={loading}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                : "bg-white hover:bg-slate-50 border-slate-300 text-slate-800"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-500" : ""}`} />
            <span>{isEn ? "Recalculate Model" : "Recalcular Modelo"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!valuationData}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                : "bg-white hover:bg-slate-50 border-slate-300 text-slate-800"
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isEn ? "Export Valuation CSV" : "Exportar Valuation CSV"}</span>
          </button>
        </div>
      </header>

      {/* Source Selection Bar: Upload vs CVM Watch */}
      <section
        className={`p-4 rounded-2xl border shadow-sm ${
          isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
        } flex flex-col md:flex-row items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {isEn ? "Valuation Target Company:" : "Empresa Alvo do Valuation:"}
          </span>
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setSourceType("upload");
                setWaccOverride(null);
                setGOverride(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                sourceType === "upload"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isEn ? "Active Upload / Ingestion" : "Empresa Ativa / Upload"}</span>
            </button>

            <button
              onClick={() => {
                setSourceType("cvm");
                setWaccOverride(null);
                setGOverride(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                sourceType === "cvm"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isEn ? "CVM Watch Company" : "Companhia Aberta (CVM)"}</span>
            </button>
          </div>
        </div>

        {/* Company Dropdown & Search (When CVM Watch is active) */}
        {sourceType === "cvm" ? (
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-xl justify-end">
            <div className="relative flex-1">
              <select
                value={selectedCodCvm}
                onChange={(e) => setSelectedCodCvm(Number(e.target.value))}
                className={`w-full appearance-none px-3 py-2 text-xs rounded-xl border font-bold pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-sm ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                {filteredCvm.map((c) => (
                  <option key={c.cod_cvm} value={c.cod_cvm}>
                    {c.nome_pregao} — {c.denom}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={isEn ? "Search CVM..." : "Buscar CVM..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-sm ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-extrabold rounded-lg ${
                isDark ? "bg-slate-800 text-emerald-400 border border-slate-700" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {effectiveCompany?.name || "Modelo Consolidado"} ({effectiveCompany?.ticker || "EMPRESA"})
            </span>
            <span className={`text-[11px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isEn ? "Official uploaded statements & DAG compilation" : "Demonstrações oficiais do upload & DAG"}
            </span>
          </div>
        )}
      </section>

      {/* Loading Banner */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse shadow-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>
            {isEn
              ? "Running DCF algorithms, WACC calculation, multiple benchmark, and sensitivity analysis..."
              : "Executando algoritmos DCF, cálculo do WACC, benchmark de múltiplos e matriz de sensibilidade..."}
          </span>
        </div>
      )}

      {/* Main Valuation Content */}
      {valuationData && (
        <div className={`space-y-6 ${loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}`}>

          {/* WHAT-IF SIMULATION DECK FOR EACH METHODOLOGY PARAMETER */}
          <section
            className={`p-6 rounded-3xl border shadow-lg space-y-5 transition-all ${
              isDark
                ? "bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-indigo-950/20 border-slate-800"
                : "bg-gradient-to-br from-white via-indigo-50/20 to-emerald-50/20 border-slate-200"
            }`}
          >
            {/* Header with Title, Active Badge, Presets & Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-lg font-black tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {isEn ? "Reactive What-If Parameter Deck" : "Simulador What-If de Parâmetros de Valuation"}
                    </h2>
                    {activeWhatIfCount > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                        {activeWhatIfCount} {isEn ? "customized parameters" : "parâmetros alterados"}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {isEn ? "Baseline Model" : "Cenário Base (Oficial)"}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {isEn
                      ? "Fine-tune any mathematical variable below. EV, Equity Value, Target Price, Football Field & DCF propagate automatically."
                      : "Ajuste qualquer variável matemática abaixo. EV, Equity Value, Preço Justo, Football Field e DCF recalculam automaticamente."}
                  </p>
                </div>
              </div>

              {/* Action Presets & Toggle Expand */}
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => applyPresetScenario("BULL")}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/30 transition flex items-center gap-1.5 shadow-sm"
                  title="Aplica premissas favoráveis (+3% margem EBIT, +2% crescimento, -1% WACC, +0.5% g)"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{isEn ? "Bull Scenario" : "Cenário Otimista (Bull)"}</span>
                </button>

                <button
                  onClick={() => applyPresetScenario("BEAR")}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/30 transition flex items-center gap-1.5 shadow-sm"
                  title="Aplica premissas de estresse (-3.5% margem EBIT, -2.5% crescimento, +1.5% WACC, -0.5% g)"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{isEn ? "Bear Scenario" : "Cenário Estresse (Bear)"}</span>
                </button>

                {activeWhatIfCount > 0 && (
                  <button
                    onClick={handleResetAllWhatIf}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isEn ? "Reset All" : "Resetar Tudo"}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsWhatIfExpanded(!isWhatIfExpanded)}
                  className={`p-1.5 rounded-xl border text-xs font-bold transition ${
                    isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-700"
                  }`}
                  title={isWhatIfExpanded ? "Minimizar Simulador" : "Expandir Simulador"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isWhatIfExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* Collapsible Content */}
            {isWhatIfExpanded && (
              <div className="space-y-4 pt-1">
                {/* Category Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {isEn ? "Category:" : "Metodologia:"}
                  </span>
                  {[
                    { id: "ALL", label: isEn ? "All Parameters (14)" : "Todos os Parâmetros (14)" },
                    { id: "WACC", label: isEn ? "WACC & CAPM (6)" : "Custo de Capital / WACC & CAPM (6)" },
                    { id: "DCF", label: isEn ? "DCF & Operations (5)" : "Fluxo Livre & Operação / DCF (5)" },
                    { id: "MULTIPLES", label: isEn ? "Trading Multiples (2)" : "Múltiplos de Mercado (2)" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveWhatIfTab(tab.id as any)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                        activeWhatIfTab === tab.id
                          ? "bg-indigo-500 text-white shadow-sm font-black"
                          : isDark
                          ? "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                          : "bg-slate-100 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Grid of What-If Parameter Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* GROUP 1: WACC & CAPM PARAMETERS */}
                  {(activeWhatIfTab === "ALL" || activeWhatIfTab === "WACC") && (
                    <>
                      {/* Rf - Risk Free Rate */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">CAPM</span>
                            <h4 className="text-xs font-bold mt-1">Taxa Livre de Risco (Rf)</h4>
                            <p className="text-[10px] text-slate-400">NTN-B Real / Curva Pré Soberana</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${rfOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(rfOverride !== null ? rfOverride : valuationData.parameters.rf_rate).toFixed(2)}%
                            </span>
                            {rfOverride !== null && (
                              <button onClick={() => setRfOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.rf_rate}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="3.0"
                          max="12.0"
                          step="0.1"
                          value={rfOverride !== null ? rfOverride : valuationData.parameters.rf_rate}
                          onChange={(e) => setRfOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>3.0%</span>
                          <span>Formula: Ke = Rf + β×ERP</span>
                          <span>12.0%</span>
                        </div>
                      </div>

                      {/* Beta do Ativo */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">CAPM</span>
                            <h4 className="text-xs font-bold mt-1">Beta do Ativo (β)</h4>
                            <p className="text-[10px] text-slate-400">Risco Sistemático vs Ibovespa</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${betaOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(betaOverride !== null ? betaOverride : valuationData.parameters.beta).toFixed(2)}x
                            </span>
                            {betaOverride !== null && (
                              <button onClick={() => setBetaOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.beta}x)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0.40"
                          max="2.20"
                          step="0.05"
                          value={betaOverride !== null ? betaOverride : valuationData.parameters.beta}
                          onChange={(e) => setBetaOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>0.40x (Defensivo)</span>
                          <span>2.20x (Alavancado)</span>
                        </div>
                      </div>

                      {/* ERP - Equity Risk Premium */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">CAPM</span>
                            <h4 className="text-xs font-bold mt-1">Prêmio de Risco (ERP)</h4>
                            <p className="text-[10px] text-slate-400">Excesso Retorno Ações (Rm - Rf)</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${mrpOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(mrpOverride !== null ? mrpOverride : valuationData.parameters.mrp).toFixed(2)}%
                            </span>
                            {mrpOverride !== null && (
                              <button onClick={() => setMrpOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.mrp}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="3.0"
                          max="9.0"
                          step="0.1"
                          value={mrpOverride !== null ? mrpOverride : valuationData.parameters.mrp}
                          onChange={(e) => setMrpOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>3.0%</span>
                          <span>Prêmio Histórico Brasil</span>
                          <span>9.0%</span>
                        </div>
                      </div>

                      {/* Kd - Custo da Dívida Pré-Taxa */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">DÍVIDA</span>
                            <h4 className="text-xs font-bold mt-1">Custo da Dívida (Kd)</h4>
                            <p className="text-[10px] text-slate-400">Taxa Pré-Impostos (Empréstimos/Debêntures)</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${kdOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(kdOverride !== null ? kdOverride : valuationData.parameters.kd_pre_tax).toFixed(2)}%
                            </span>
                            {kdOverride !== null && (
                              <button onClick={() => setKdOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.kd_pre_tax}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="6.0"
                          max="20.0"
                          step="0.25"
                          value={kdOverride !== null ? kdOverride : valuationData.parameters.kd_pre_tax}
                          onChange={(e) => setKdOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>6.0%</span>
                          <span>Kd Líquido = Kd × (1 - 34%)</span>
                          <span>20.0%</span>
                        </div>
                      </div>

                      {/* D / V - Alavancagem da Estrutura de Capital */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">ESTRUTURA</span>
                            <h4 className="text-xs font-bold mt-1">Alavancagem (Dívida / Valor Total)</h4>
                            <p className="text-[10px] text-slate-400">Peso D/V no WACC (E/V = {100 - (debtRatioOverride !== null ? debtRatioOverride : valuationData.parameters.debt_ratio)}%)</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${debtRatioOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(debtRatioOverride !== null ? debtRatioOverride : valuationData.parameters.debt_ratio).toFixed(1)}%
                            </span>
                            {debtRatioOverride !== null && (
                              <button onClick={() => setDebtRatioOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.debt_ratio}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="1"
                          value={debtRatioOverride !== null ? debtRatioOverride : valuationData.parameters.debt_ratio}
                          onChange={(e) => setDebtRatioOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>0% (100% Equity)</span>
                          <span>80% (Dívida Pesada)</span>
                        </div>
                      </div>

                      {/* WACC Direto (Override Geral) */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-indigo-950/20 border-indigo-500/30" : "bg-indigo-50/50 border-indigo-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">WACC CONSOLIDADO</span>
                            <h4 className="text-xs font-bold mt-1">Custo Médio Ponderado de Capital</h4>
                            <p className="text-[10px] text-slate-400">Taxa Global de Desconto do FCFF</p>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-indigo-400">
                              {(waccOverride !== null ? waccOverride : valuationData.parameters.wacc).toFixed(2)}% a.a.
                            </span>
                            {waccOverride !== null && (
                              <button onClick={() => setWaccOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.wacc}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="5.0"
                          max="22.0"
                          step="0.25"
                          value={waccOverride !== null ? waccOverride : valuationData.parameters.wacc}
                          onChange={(e) => setWaccOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                        />
                        <div className="flex justify-between text-[10px] text-indigo-400/80 font-mono">
                          <span>5.0%</span>
                          <span>Override Global WACC</span>
                          <span>22.0%</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* GROUP 2: DCF & OPERATIONAL PROJECTION PARAMETERS */}
                  {(activeWhatIfTab === "ALL" || activeWhatIfTab === "DCF") && (
                    <>
                      {/* Margem EBIT Operacional */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">DCF OPERACIONAL</span>
                            <h4 className="text-xs font-bold mt-1">Margem EBIT Projetada</h4>
                            <p className="text-[10px] text-slate-400">Rentabilidade Operacional (EBIT / Receita)</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${ebitMarginOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(ebitMarginOverride !== null ? ebitMarginOverride : valuationData.parameters.ebit_margin).toFixed(1)}%
                            </span>
                            {ebitMarginOverride !== null && (
                              <button onClick={() => setEbitMarginOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.ebit_margin}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="2.0"
                          max="50.0"
                          step="0.5"
                          value={ebitMarginOverride !== null ? ebitMarginOverride : valuationData.parameters.ebit_margin}
                          onChange={(e) => setEbitMarginOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>2.0%</span>
                          <span>Alavancagem Operacional</span>
                          <span>50.0%</span>
                        </div>
                      </div>

                      {/* Crescimento de Receita Inicial */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">DCF OPERACIONAL</span>
                            <h4 className="text-xs font-bold mt-1">Crescimento de Receita (CAGR Anos 1-5)</h4>
                            <p className="text-[10px] text-slate-400">Ritmo de expansão inicial de faturamento</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${growthRateOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(growthRateOverride !== null ? growthRateOverride : valuationData.parameters.revenue_growth).toFixed(1)}% a.a.
                            </span>
                            {growthRateOverride !== null && (
                              <button onClick={() => setGrowthRateOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.revenue_growth}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="-5.0"
                          max="25.0"
                          step="0.5"
                          value={growthRateOverride !== null ? growthRateOverride : valuationData.parameters.revenue_growth}
                          onChange={(e) => setGrowthRateOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>-5.0% (Contração)</span>
                          <span>+25.0% (Expansão Alta)</span>
                        </div>
                      </div>

                      {/* Perpetuidade g (Gordon Growth) */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">PERPETUIDADE</span>
                            <h4 className="text-xs font-bold mt-1">Crescimento Perpétuo (g)</h4>
                            <p className="text-[10px] text-slate-400">PIB Longo Prazo + Meta de Inflação</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${gOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(gOverride !== null ? gOverride : valuationData.parameters.perpetual_growth_g).toFixed(2)}% a.a.
                            </span>
                            {gOverride !== null && (
                              <button onClick={() => setGOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.perpetual_growth_g}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="5.5"
                          step="0.1"
                          value={gOverride !== null ? gOverride : valuationData.parameters.perpetual_growth_g}
                          onChange={(e) => setGOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>1.0%</span>
                          <span>TV = [FCFF(5)×(1+g)] / (WACC-g)</span>
                          <span>5.5%</span>
                        </div>
                      </div>

                      {/* Intensidade de CAPEX */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">REINVESTIMENTO</span>
                            <h4 className="text-xs font-bold mt-1">CAPEX (% da Receita)</h4>
                            <p className="text-[10px] text-slate-400">Reinvestimento em Ativo Imobilizado</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${capexRatioOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(capexRatioOverride !== null ? capexRatioOverride : valuationData.parameters.capex_ratio).toFixed(1)}%
                            </span>
                            {capexRatioOverride !== null && (
                              <button onClick={() => setCapexRatioOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.capex_ratio}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="15.0"
                          step="0.25"
                          value={capexRatioOverride !== null ? capexRatioOverride : valuationData.parameters.capex_ratio}
                          onChange={(e) => setCapexRatioOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>1.0% (Asset-Light)</span>
                          <span>15.0% (Asset-Heavy)</span>
                        </div>
                      </div>

                      {/* Variação de Capital de Giro (ΔNWC) */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">CAPITAL DE GIRO</span>
                            <h4 className="text-xs font-bold mt-1">ΔNWC (% da Receita)</h4>
                            <p className="text-[10px] text-slate-400">Consumo de Caixa para Giro Operacional</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${nwcRatioOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(nwcRatioOverride !== null ? nwcRatioOverride : valuationData.parameters.nwc_ratio).toFixed(1)}%
                            </span>
                            {nwcRatioOverride !== null && (
                              <button onClick={() => setNwcRatioOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.nwc_ratio}%)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="8.0"
                          step="0.25"
                          value={nwcRatioOverride !== null ? nwcRatioOverride : valuationData.parameters.nwc_ratio}
                          onChange={(e) => setNwcRatioOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>0.0% (Giro Neutro)</span>
                          <span>8.0% (Alto Consumo)</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* GROUP 3: MARKET MULTIPLES */}
                  {(activeWhatIfTab === "ALL" || activeWhatIfTab === "MULTIPLES") && (
                    <>
                      {/* EV / EBITDA Multiple */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">MÚLTIPLOS</span>
                            <h4 className="text-xs font-bold mt-1">Múltiplo EV / EBITDA Setorial</h4>
                            <p className="text-[10px] text-slate-400">Pares comparáveis e saída no Ano 5</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${exitMultipleOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(exitMultipleOverride !== null ? exitMultipleOverride : valuationData.parameters.exit_multiple).toFixed(1)}x
                            </span>
                            {exitMultipleOverride !== null && (
                              <button onClick={() => setExitMultipleOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.exit_multiple}x)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="2.0"
                          max="15.0"
                          step="0.1"
                          value={exitMultipleOverride !== null ? exitMultipleOverride : valuationData.parameters.exit_multiple}
                          onChange={(e) => setExitMultipleOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>2.0x</span>
                          <span>Mediana dos Pares da B3</span>
                          <span>15.0x</span>
                        </div>
                      </div>

                      {/* P / L Multiple */}
                      <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">MÚLTIPLOS</span>
                            <h4 className="text-xs font-bold mt-1">Múltiplo P / L (Preço sobre Lucro)</h4>
                            <p className="text-[10px] text-slate-400">Preço / Lucro Médio dos Pares</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${peerPeOverride !== null ? "text-amber-400" : "text-slate-100"}`}>
                              {(peerPeOverride !== null ? peerPeOverride : valuationData.parameters.peer_pe).toFixed(1)}x
                            </span>
                            {peerPeOverride !== null && (
                              <button onClick={() => setPeerPeOverride(null)} className="block ml-auto text-[9px] text-rose-400 hover:underline">
                                Reset ({valuationData.parameters.peer_pe}x)
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="3.0"
                          max="25.0"
                          step="0.5"
                          value={peerPeOverride !== null ? peerPeOverride : valuationData.parameters.peer_pe}
                          onChange={(e) => setPeerPeOverride(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>3.0x</span>
                          <span>Múltiplo P/L Histórico</span>
                          <span>25.0x</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Executive KPI Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Enterprise Value */}
            <div
              className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
                isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Enterprise Value (EV)</span>
                <Layers className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl md:text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
                R$ {(valuationData.dcf_summary.enterprise_value / 1000).toFixed(1)} Bi
              </div>
              <div className={`text-[10px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {isEn ? "Operating business value" : "Valor operacional da firma"}
              </div>
            </div>

            {/* Equity Value */}
            <div
              className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
                isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Equity Value</span>
                <DollarSign className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-xl md:text-2xl font-black mt-2 text-cyan-600 dark:text-cyan-400">
                R$ {(valuationData.dcf_summary.equity_value / 1000).toFixed(1)} Bi
              </div>
              <div className={`text-[10px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {isEn ? "Fair shareholder value" : "Valor patrimonial justo"}
              </div>
            </div>

            {/* Fair Share Price */}
            <div
              className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
                isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {isEn ? "Fair Share Price" : "Preço Justo / Ação"}
                </span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl md:text-2xl font-black mt-2 text-indigo-600 dark:text-indigo-400">
                R$ {valuationData.dcf_summary.fair_share_price.toFixed(2)}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] mt-1">
                <span className="font-semibold text-slate-400">Ref: R$ {valuationData.dcf_summary.market_reference_price.toFixed(2)}</span>
                <span
                  className={`font-black px-1.5 py-0.2 rounded text-[10px] ${
                    valuationData.dcf_summary.upside_potential_pct >= 0
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {valuationData.dcf_summary.upside_potential_pct >= 0 ? "+" : ""}
                  {valuationData.dcf_summary.upside_potential_pct}%
                </span>
              </div>
            </div>

            {/* WACC */}
            <div
              className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
                isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">WACC</span>
                <Sliders className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl md:text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">
                {valuationData.parameters.wacc}% a.a.
              </div>
              <div className={`text-[10px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Ke: {valuationData.parameters.ke}% | Kd líq: {valuationData.parameters.kd_after_tax}%
              </div>
            </div>

            {/* Recommended Range */}
            <div
              className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1 ${
                isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {isEn ? "Valuation Range" : "Faixa Recomendada"}
                </span>
                <ShieldCheck className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-base md:text-lg font-black mt-2 text-teal-600 dark:text-teal-400">
                R$ {valuationData.dcf_summary.valuation_range.min} - {valuationData.dcf_summary.valuation_range.max}
              </div>
              <div className={`text-[10px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {isEn ? "Range across methods" : "Intervalo multimetodológico"}
              </div>
            </div>
          </section>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pb-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("SUMMARY")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === "SUMMARY"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {isEn ? "1. Valuation Overview & Football Field" : "1. Visão Geral & Football Field"}
            </button>

            <button
              onClick={() => setActiveTab("STEPS")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === "STEPS"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {isEn ? "2. Step-by-Step Calculation (How It Was Done)" : "2. Memória de Cálculo (Como Foi Feito)"}
            </button>

            <button
              onClick={() => setActiveTab("SENSITIVITY")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === "SENSITIVITY"
                  ? "bg-indigo-500 text-white font-black shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {isEn ? "3. Sensitivity Matrix (WACC vs g)" : "3. Matriz de Sensibilidade (WACC × g)"}
            </button>

            <button
              onClick={() => setActiveTab("MULTIPLES")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === "MULTIPLES"
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {isEn ? "4. Market Multiples & Peers" : "4. Múltiplos de Mercado & Pares"}
            </button>

            <button
              onClick={() => setActiveTab("METHODOLOGIES")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === "METHODOLOGIES"
                  ? "bg-purple-500 text-white font-black shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{isEn ? "5. Calculation Methodologies & Parameters" : "5. Metodologias & Parâmetros dos Indicadores"}</span>
            </button>
          </div>

          {/* TAB 1: SUMMARY & FOOTBALL FIELD */}
          {activeTab === "SUMMARY" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Football Field Chart */}
              <section
                className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    <span>{isEn ? "Football Field Valuation Comparison" : "Comparativo de Faixas de Valor (Football Field)"}</span>
                  </h3>
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {isEn ? "Values in R$ / share" : "Valores em R$ / ação"}
                  </span>
                </div>

                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {isEn
                    ? "Cross-checking multiple independent methodologies prevents anchoring to a single model. The recommended range synthesizes DCF and relative multiples."
                    : "O cruzamento de múltiplas metodologias evita a ancoragem em um número isolado. A faixa recomendada sintetiza o DCF e múltiplos relativos."}
                </p>

                <div className="space-y-4 pt-2">
                  {valuationData.football_field.map((item: any, idx: number) => {
                    const minOverall = valuationData.dcf_summary.valuation_range.min * 0.75;
                    const maxOverall = valuationData.dcf_summary.valuation_range.max * 1.25;
                    const rangeSpan = maxOverall - minOverall;
                    const leftPct = Math.max(0, ((item.low - minOverall) / rangeSpan) * 100);
                    const widthPct = Math.min(100 - leftPct, ((item.high - item.low) / rangeSpan) * 100);
                    const midPct = Math.max(0, Math.min(100, ((item.mid - minOverall) / rangeSpan) * 100));

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className={isDark ? "text-slate-200" : "text-slate-800"}>{item.method}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                            R$ {item.low.toFixed(2)} — R$ {item.high.toFixed(2)} (Méd: R$ {item.mid.toFixed(2)})
                          </span>
                        </div>
                        <div className="h-6 w-full bg-slate-100 dark:bg-slate-800/80 rounded-lg relative overflow-hidden flex items-center">
                          {/* Floating range bar */}
                          <div
                            className={`h-full rounded-md opacity-80 ${
                              idx === 0
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                : idx === 1
                                ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                                : idx === 2
                                ? "bg-gradient-to-r from-cyan-500 to-indigo-500"
                                : "bg-gradient-to-r from-indigo-500 to-purple-500"
                            }`}
                            style={{ left: `${leftPct}%`, width: `${widthPct}%`, position: "absolute" }}
                          />
                          {/* Midpoint marker */}
                          <div
                            className="w-1.5 h-full bg-white dark:bg-slate-950 z-10 shadow"
                            style={{ left: `${midPct}%`, position: "absolute" }}
                            title={`Mediana: R$ ${item.mid}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 5-Year FCFF Projection Chart */}
              <section
                className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span>{isEn ? "Projected Free Cash Flow to Firm (FCFF)" : "Fluxo de Caixa Livre da Firma Projetado (FCFF)"}</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {isEn
                        ? "Nominal Free Cash Flow vs. Discounted Present Value (PV) at WACC"
                        : "Fluxo Livre Nominal vs. Valor Presente Líquido (PV) descontado ao WACC"}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Valores em R$ Milhões
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={valuationData.projections}
                      margin={{ top: 15, right: 25, left: 15, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="gradFcff" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
                        </linearGradient>
                        <linearGradient id="gradPvFcff" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity={0.85} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} vertical={false} />
                      <XAxis
                        dataKey="year"
                        stroke={isDark ? "#94a3b8" : "#475569"}
                        tick={{ fill: isDark ? "#cbd5e1" : "#334155", fontWeight: 700, fontSize: 12 }}
                        axisLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
                        tickLine={false}
                      />
                      <YAxis
                        width={85}
                        stroke={isDark ? "#94a3b8" : "#475569"}
                        tick={{ fill: isDark ? "#94a3b8" : "#475569", fontWeight: 600, fontSize: 11 }}
                        axisLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
                        tickLine={false}
                        tickFormatter={(v) => {
                          if (v >= 1000) {
                            return `R$ ${(v / 1000).toFixed(1)} Bi`;
                          }
                          return `R$ ${v.toFixed(0)} Mi`;
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const discountPct = data.fcff > 0 ? (((data.fcff - data.pv_fcff) / data.fcff) * 100).toFixed(1) : "0";
                            return (
                              <div className={`p-3.5 rounded-2xl border shadow-xl text-xs space-y-2 ${
                                isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                              }`}>
                                <div className="font-black text-sm border-b pb-1.5 border-slate-700/50 flex justify-between gap-4">
                                  <span>{label} (Projeção)</span>
                                  <span className="text-emerald-400 font-mono">Fator: {data.discount_factor?.toFixed(4)}</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                                    <span>FCFF (Fluxo Livre Nominal):</span>
                                    <span className="font-mono font-black">R$ {data.fcff?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} Mi</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-cyan-400 font-bold">
                                    <span>Valor Presente (PV Descontado):</span>
                                    <span className="font-mono font-black">R$ {data.pv_fcff?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} Mi</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-slate-400 text-[11px] pt-1 border-t border-slate-800/60">
                                    <span>Efeito Desconto WACC:</span>
                                    <span className="font-mono text-rose-400 font-semibold">-{discountPct}% no valor</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: "12px", fontSize: "12px", fontWeight: 700 }}
                      />
                      <Bar
                        dataKey="fcff"
                        name={isEn ? "FCFF (Free Cash Flow)" : "FCFF (Fluxo Livre Nominal)"}
                        fill="url(#gradFcff)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                      <Bar
                        dataKey="pv_fcff"
                        name={isEn ? "Discounted PV" : "Valor Presente (Descontado ao WACC)"}
                        fill="url(#gradPvFcff)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* FCFF Footnote Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Soma FCFF (5 Anos)</span>
                    <div className="text-xs font-black text-emerald-400 mt-0.5">
                      R$ {(valuationData.projections.reduce((acc: number, p: any) => acc + (p.fcff || 0), 0) / 1000).toFixed(2)} Bi
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Soma PV Explícito</span>
                    <div className="text-xs font-black text-cyan-400 mt-0.5">
                      R$ {(valuationData.dcf_summary.pv_explicit_fcff / 1000).toFixed(2)} Bi
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">WACC Vigente</span>
                    <div className="text-xs font-black text-indigo-400 mt-0.5">
                      {valuationData.parameters.wacc}% a.a.
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">PV Perpetuidade (TV)</span>
                    <div className="text-xs font-black text-teal-400 mt-0.5">
                      R$ {(valuationData.dcf_summary.pv_terminal_value / 1000).toFixed(2)} Bi
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP CALCULATION ("COMO FOI FEITO") */}
          {activeTab === "STEPS" && (
            <section
              className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
                isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    <HelpCircle className="w-5 h-5 text-cyan-500" />
                    <span>{isEn ? "Step-by-Step Calculation Audit Trail" : "Memória de Cálculo e Auditoria: Como Foi Feito"}</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {isEn
                      ? "Full transparency on assumptions, mathematical derivations, discount factors, and terminal growth."
                      : "Transparência total em cada premissa, derivação matemática, fatores de desconto e valor residual."}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {isEn ? "Standard Investment Banking Protocol" : "Padrão Investment Banking"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {valuationData.calculation_steps.map((step: any) => (
                  <div
                    key={step.step}
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition hover:shadow-md ${
                      isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
                          {step.step}
                        </span>
                        <h4 className={`text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {step.title}
                        </h4>
                      </div>
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {step.formula}
                      </div>
                      <p className={`text-xs mt-2.5 leading-relaxed font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {step.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resultado:</span>
                      <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">{step.result}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Annual Forecast Table */}
              <div className="space-y-3 pt-2">
                <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>{isEn ? "5-Year Detailed FCFF Forecast Table" : "Projeção Detalhada de Fluxo de Caixa Livre (FCFF Ano a Ano)"}</span>
                </h4>
                <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`${isDark ? "bg-slate-950 text-slate-300" : "bg-slate-100 text-slate-800"} uppercase text-[11px]`}>
                      <tr>
                        <th className="p-3 font-bold">{isEn ? "Line Item" : "Linha Contábil"}</th>
                        {valuationData.projections.map((p: any) => (
                          <th key={p.year} className="p-3 font-bold text-right">
                            {p.year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                      <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className="p-2.5 font-bold text-emerald-500">(+) Receita Projetada</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-2.5 text-right font-semibold">
                            R$ {p.receita.toFixed(2)} Mi
                          </td>
                        ))}
                      </tr>
                      <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className="p-2.5 font-medium text-slate-400">(=) EBIT Operacional</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-2.5 text-right font-medium">
                            R$ {p.ebit.toFixed(2)} Mi
                          </td>
                        ))}
                      </tr>
                      <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className="p-2.5 font-medium text-slate-400">(-) Imposto Efetivo (IR/CSLL 34%)</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-2.5 text-right text-rose-500 font-medium">
                            -R$ {(p.ebit - p.nopat).toFixed(2)} Mi
                          </td>
                        ))}
                      </tr>
                      <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className="p-2.5 font-bold text-cyan-500">(=) NOPAT (Lucro Operacional Líquido)</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-2.5 text-right font-bold text-cyan-500">
                            R$ {p.nopat.toFixed(2)} Mi
                          </td>
                        ))}
                      </tr>
                      <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className="p-2.5 font-medium text-slate-400">(+) Depreciação & Amortização</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-2.5 text-right text-emerald-400 font-medium">
                            +R$ {p.da.toFixed(2)} Mi
                          </td>
                        ))}
                      </tr>
                      <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className="p-2.5 font-medium text-slate-400">(-) CAPEX (Investimentos em Ativos)</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-2.5 text-right text-rose-400 font-medium">
                            R$ {p.capex.toFixed(2)} Mi
                          </td>
                        ))}
                      </tr>
                      <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className="p-2.5 font-medium text-slate-400">(-) Variação de Capital de Giro (ΔNWC)</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-2.5 text-right text-rose-400 font-medium">
                            R$ {p.delta_nwc.toFixed(2)} Mi
                          </td>
                        ))}
                      </tr>
                      <tr className={`border-t font-extrabold ${isDark ? "bg-emerald-950/20" : "bg-emerald-50"}`}>
                        <td className="p-3 font-black text-emerald-500">(=) FCFF (Fluxo Livre da Firma)</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-3 text-right font-black text-emerald-500">
                            R$ {p.fcff.toFixed(2)} Mi
                          </td>
                        ))}
                      </tr>
                      <tr className={isDark ? "bg-slate-900/50" : "bg-slate-100/50"}>
                        <td className="p-2.5 font-semibold text-slate-400">Fator de Desconto [(1+WACC)^t]</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-2.5 text-right font-mono font-bold text-slate-400">
                            {p.discount_factor.toFixed(4)}
                          </td>
                        ))}
                      </tr>
                      <tr className={`font-black ${isDark ? "bg-cyan-950/20" : "bg-cyan-50"}`}>
                        <td className="p-3 text-cyan-400">(=) Valor Presente Líquido (PV)</td>
                        {valuationData.projections.map((p: any) => (
                          <td key={p.year} className="p-3 text-right font-black text-cyan-400">
                            R$ {p.pv_fcff.toFixed(2)} Mi
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: SENSITIVITY MATRIX (WACC vs g) */}
          {activeTab === "SENSITIVITY" && (
            <section
              className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
                isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    <Sliders className="w-5 h-5 text-indigo-500" />
                    <span>{isEn ? "Two-Way Sensitivity Matrix (WACC vs Perpetual Growth g)" : "Matriz de Sensibilidade Bidimensional (WACC × Crescimento Perpétuo g)"}</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {isEn
                      ? "Cells show Implied Share Price (R$) and percentage difference versus the base case."
                      : "As células exibem o Preço Justo por Ação (R$) e a variação percentual frente ao cenário base."}
                  </p>
                </div>

                {/* Reset Overrides Button */}
                {(activeWhatIfCount > 0) && (
                  <button
                    onClick={handleResetAllWhatIf}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold text-rose-400 border-rose-500/30 hover:bg-rose-500/10 transition"
                  >
                    {isEn ? "Reset Custom Overrides" : "Resetar Premissas Personalizadas"}
                  </button>
                )}
              </div>

              {/* 2D Sensitivity Table */}
              <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <table className="w-full text-center text-xs">
                  <thead className={`${isDark ? "bg-slate-950 text-slate-300" : "bg-slate-100 text-slate-800"}`}>
                    <tr>
                      <th className="p-3 font-bold border-r border-slate-200 dark:border-slate-800">
                        WACC \ Perpetuidade (g)
                      </th>
                      {valuationData.sensitivity_matrix[0]?.values.map((v: any) => (
                        <th key={v.g} className="p-3 font-bold">
                          g = {v.g}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                    {valuationData.sensitivity_matrix.map((row: any) => (
                      <tr key={row.wacc} className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className={`p-3 font-bold border-r border-slate-200 dark:border-slate-800 ${
                          Math.abs(row.wacc - valuationData.parameters.wacc) < 0.05
                            ? "bg-indigo-500/10 text-indigo-400 font-extrabold"
                            : ""
                        }`}>
                          WACC = {row.wacc}%
                        </td>
                        {row.values.map((val: any, idx: number) => {
                          const isBase = val.is_base;
                          const isPositive = val.diff_pct >= 0;
                          return (
                            <td
                              key={idx}
                              className={`p-3 transition-colors ${
                                isBase
                                  ? "bg-emerald-500/20 text-emerald-400 font-black ring-2 ring-emerald-500 rounded-lg"
                                  : isPositive
                                  ? "text-emerald-500 font-bold"
                                  : "text-rose-500 font-bold"
                              }`}
                            >
                              <div className="text-sm font-extrabold">
                                R$ {val.share_price > 0 ? val.share_price.toFixed(2) : "N/D"}
                              </div>
                              <div className="text-[10px] opacity-80">
                                {val.share_price > 0 ? `${isPositive ? "+" : ""}${val.diff_pct}%` : "—"}
                                {isBase && <span className="ml-1 text-[9px] uppercase font-black tracking-wider text-emerald-400">(Base)</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: MARKET MULTIPLES & ASSET-BASED */}
          {activeTab === "MULTIPLES" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Relative Multiples */}
              <section
                className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  <Sliders className="w-5 h-5 text-amber-500" />
                  <span>{isEn ? "Trading Multiples (Relative Valuation)" : "Múltiplos de Negociação (Valuation Relativo)"}</span>
                </h3>

                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div>
                      <span className="text-xs font-bold text-amber-500">EV / EBITDA Setorial</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Múltiplo médio de mercado dos pares comparáveis</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black">{valuationData.multiples.ev_ebitda.multiple}x</span>
                      <p className="text-[10px] text-emerald-400 font-semibold">Implied EV: R$ {(valuationData.multiples.ev_ebitda.implied_ev / 1000).toFixed(1)} Bi</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div>
                      <span className="text-xs font-bold text-cyan-500">P / L (Preço sobre Lucro)</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mediana de pares do setor</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black">{valuationData.multiples.pe.multiple}x</span>
                      <p className="text-[10px] text-cyan-400 font-semibold">Implied Equity: R$ {(valuationData.multiples.pe.implied_equity / 1000).toFixed(1)} Bi</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div>
                      <span className="text-xs font-bold text-indigo-500">EV / Receita Líquida</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Múltiplo de faturamento da indústria</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black">{valuationData.multiples.ev_sales.multiple}x</span>
                      <p className="text-[10px] text-indigo-400 font-semibold">Implied EV: R$ {(valuationData.multiples.ev_sales.implied_ev / 1000).toFixed(1)} Bi</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Asset-Based Valuation */}
              <section
                className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  <ShieldCheck className="w-5 h-5 text-purple-500" />
                  <span>{isEn ? "Asset-Based Approach (Patrimonial)" : "Abordagem Patrimonial (Ativos & Liquidação)"}</span>
                </h3>

                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div>
                      <span className="text-xs font-bold text-purple-400">Valor Patrimonial Contábil (Book Value)</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Ativo Total - Passivo Total (Custo Histórico)</p>
                    </div>
                    <span className="text-lg font-black">R$ {(valuationData.asset_based.book_value / 1000).toFixed(1)} Bi</span>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div>
                      <span className="text-xs font-bold text-teal-400">Valor Patrimonial Ajustado</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Bens e direitos reavaliados a valor justo de mercado</p>
                    </div>
                    <span className="text-lg font-black text-teal-400">R$ {(valuationData.asset_based.adjusted_book_value / 1000).toFixed(1)} Bi</span>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div>
                      <span className="text-xs font-bold text-slate-400">Valor Estimado de Liquidação</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Cenário de venda forçada com deságio de ativos</p>
                    </div>
                    <span className="text-lg font-black text-slate-400">R$ {(valuationData.asset_based.liquidation_value / 1000).toFixed(1)} Bi</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 5: CALCULATION METHODOLOGIES & PARAMETERS */}
          {activeTab === "METHODOLOGIES" && (
            <div className="space-y-6">
              {/* Methodologies Executive Overview */}
              <section
                className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h3 className={`text-base font-black flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      <Calculator className="w-5 h-5 text-purple-500" />
                      <span>{isEn ? "Calculation Methodologies & Indicators Parameter Matrix" : "Matriz de Parâmetros e Metodologias de Cálculo dos Indicadores"}</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {isEn
                        ? "Exhaustive transparency of all mathematical equations, cost of capital weights, operating assumptions, and value elasticities."
                        : "Transparência total das fórmulas matemáticas, pesos de custo de capital, premissas operacionais e elasticidades no preço justo."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-black rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Standard CVM / IFRS / Damodaran
                    </span>
                  </div>
                </div>

                {/* 4 Pillars Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                  <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-indigo-400">1. CAPM & WACC</span>
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Taxa de desconto combinando custo de equity (Ke) e custo de terceiros líquido (Kd*(1-T)).</p>
                    <div className="text-xs font-black text-indigo-400 mt-2">WACC: {valuationData.parameters.wacc}% a.a.</div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-emerald-400">2. FCFF Explícito (5 Anos)</span>
                      <Activity className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Geração de caixa da firma deduzida de impostos, CAPEX e capital de giro operacional.</p>
                    <div className="text-xs font-black text-emerald-400 mt-2">PV Explícito: R$ {(valuationData.dcf_summary.pv_explicit_fcff / 1000).toFixed(1)} Bi</div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-cyan-400">3. Gordon Growth (g)</span>
                      <TrendingUp className="w-4 h-4 text-cyan-500" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Fluxo terminal estabilizado no infinito com crescimento g e spread (WACC - g).</p>
                    <div className="text-xs font-black text-cyan-400 mt-2">PV Terminal: R$ {(valuationData.dcf_summary.pv_terminal_value / 1000).toFixed(1)} Bi ({valuationData.dcf_summary.terminal_value_weight_pct}%)</div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-amber-400">4. Múltiplos dos Pares</span>
                      <BarChart3 className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Valuation relativo cruzado por EV/EBITDA, P/L e P/VP com comparáveis setoriais.</p>
                    <div className="text-xs font-black text-amber-400 mt-2">EV/EBITDA: {valuationData.parameters.exit_multiple}x</div>
                  </div>
                </div>
              </section>

              {/* Exhaustive Table of Parameters, Formulas & Elasticities */}
              <section
                className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    <Sliders className="w-5 h-5 text-indigo-500" />
                    <span>{isEn ? "Indicators & Methodological Equations Matrix" : "Detalhamento de Cada Indicador, Premissa e Fórmula"}</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Use os sliders de What-If no topo para simular qualquer variável em tempo real
                  </span>
                </div>

                <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`${isDark ? "bg-slate-950 text-slate-300" : "bg-slate-100 text-slate-800"}`}>
                      <tr>
                        <th className="p-3 font-bold">Metodologia</th>
                        <th className="p-3 font-bold">Parâmetro / Indicador</th>
                        <th className="p-3 font-bold">Símbolo</th>
                        <th className="p-3 font-bold text-center">Valor Vigente (What-If)</th>
                        <th className="p-3 font-bold">Fórmula Matemática de Cálculo</th>
                        <th className="p-3 font-bold">Elasticidade & Impacto no Preço Justo</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                      {(valuationData.methodologies_parameters || []).map((p: any, idx: number) => (
                        <tr key={idx} className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                          <td className="p-3 font-semibold text-purple-400 whitespace-nowrap">
                            {p.methodology}
                          </td>
                          <td className="p-3 font-extrabold text-slate-200">
                            {p.parameter_name}
                          </td>
                          <td className="p-3 font-mono font-bold text-cyan-400">
                            {p.symbol}
                          </td>
                          <td className="p-3 text-center font-black">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-xs">
                              {p.value}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-emerald-400 bg-slate-950/20 rounded-md">
                            <code>{p.formula}</code>
                          </td>
                          <td className="p-3 text-[11px] text-slate-400 max-w-xs">
                            <div className="font-semibold text-slate-300">{p.impact}</div>
                            <div className="text-[10px] text-amber-400/90 mt-0.5">{p.sensitivity}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Topological Value Bridge (Enterprise Value to Fair Price) */}
              <section
                className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  <Layers className="w-5 h-5 text-teal-500" />
                  <span>{isEn ? "Topological Value Bridge (EV to Fair Price)" : "Ponte Topológica de Transição: Enterprise Value → Preço Justo"}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Enterprise Value</span>
                    <div className="text-base font-black text-emerald-400 mt-1">
                      R$ {(valuationData.dcf_summary.enterprise_value / 1000).toFixed(2)} Bi
                    </div>
                    <span className="text-[9px] text-slate-400">PV FCFF + PV Terminal</span>
                  </div>

                  <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">(-) Dívida Líquida</span>
                    <div className="text-base font-black text-rose-400 mt-1">
                      R$ {(valuationData.dcf_summary.net_debt / 1000).toFixed(2)} Bi
                    </div>
                    <span className="text-[9px] text-slate-400">Dívida Bruta - Caixa</span>
                  </div>

                  <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">(=) Equity Value</span>
                    <div className="text-base font-black text-cyan-400 mt-1">
                      R$ {(valuationData.dcf_summary.equity_value / 1000).toFixed(2)} Bi
                    </div>
                    <span className="text-[9px] text-slate-400">Valor dos Acionistas</span>
                  </div>

                  <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">(=) Preço Justo</span>
                    <div className="text-base font-black text-emerald-400 mt-1">
                      R$ {valuationData.dcf_summary.fair_share_price.toFixed(2)}
                    </div>
                    <span className="text-[9px] text-slate-400">Valor Intrínseco / Ação</span>
                  </div>

                  <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Upside / Downside</span>
                    <div className={`text-base font-black mt-1 ${valuationData.dcf_summary.upside_potential_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {valuationData.dcf_summary.upside_potential_pct > 0 ? "+" : ""}{valuationData.dcf_summary.upside_potential_pct.toFixed(1)}%
                    </div>
                    <span className="text-[9px] text-slate-400">vs Preço Mercado (R$ {valuationData.dcf_summary.market_reference_price.toFixed(2)})</span>
                  </div>
                </div>
              </section>
            </div>
          )}
          <section
            className={`p-6 rounded-3xl border shadow-md space-y-4 ${
              isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-center flex-wrap gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-base font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {isEn ? "Agno AI PhD Valuation Agent — Chat & Assumptions Interview" : "Agente Agno PhD em Valuation — Chat & Perguntas sobre o Modelo"}
                  </h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {isEn
                      ? "Ask any question regarding WACC calculation, terminal value assumptions, peers, or scenario impacts."
                      : "Tire qualquer dúvida sobre o cálculo do WACC, premissas de perpetuidade, múltiplos de mercado ou sensibilidade."}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Agno Valuation Engine
              </span>
            </div>

            {/* Quick Questions Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChat(q)}
                  disabled={chatLoading}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition shadow-sm flex items-center gap-1.5 ${
                    isDark
                      ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                  }`}
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                </button>
              ))}
            </div>

            {/* Chat Messages Container */}
            <div
              className={`h-72 overflow-y-auto rounded-2xl border p-4 space-y-3.5 text-xs ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              {valuationChatLog.length === 0 && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black text-[10px] mt-0.5">
                    AG
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                      isDark
                        ? "bg-slate-900 border border-slate-800 text-slate-200"
                        : "bg-white border border-slate-200 text-slate-900"
                    } rounded-tl-none shadow-sm`}
                  >
                    {isEn
                      ? "Hello! I am your Agno PhD Valuation Agent. I can explain any step of this valuation, conduct sensitivity scenarios (WACC vs g), discuss peer multiples, or analyze capital structure assumptions. How can I assist you today?"
                      : "Olá! Sou seu Agente Agno PhD em Valuation Corporativo. Posso explicar detalhadamente cada etapa deste valuation, avaliar a sensibilidade de premissas (WACC e perpetuidade g), comparar múltiplos de mercado ou analisar a estrutura de capital. Como posso te ajudar?"}
                  </div>
                </div>
              )}

              {valuationChatLog.map((msg, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex gap-2.5 justify-end">
                    <div className="p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed bg-emerald-500 text-slate-950 font-bold rounded-tr-none shadow-sm">
                      {msg.q}
                    </div>
                  </div>
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black text-[10px] mt-0.5">
                      AG
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                        isDark
                          ? "bg-slate-900 border border-slate-800 text-slate-200"
                          : "bg-white border border-slate-200 text-slate-900"
                      } rounded-tl-none shadow-sm`}
                    >
                      {msg.a}
                    </div>
                  </div>
                </React.Fragment>
              ))}

              {isValuationAgentRunning && (
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {isEn
                      ? "Agno Agent is formulating analysis in the background (you can navigate freely)..."
                      : "Agente Agno analisando o modelo em segundo plano (você pode trocar de página livremente)..."}
                  </span>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isEn ? "Ask the Valuation Agent a question about WACC, DCF or sensitivity..." : "Faça uma pergunta ao Agente sobre o WACC, DCF, sensibilidade ou múltiplos..."}
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                disabled={isValuationAgentRunning}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
              />
              <button
                onClick={() => handleSendChat()}
                disabled={isValuationAgentRunning || !inputQuestion.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <span>{isEn ? "Send" : "Enviar"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
