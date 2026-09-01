"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Scale,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  PieChart,
  Activity,
  FileSpreadsheet,
  Building2,
  GitFork,
  Check,
  Download,
  Flame,
  Info,
  Gauge
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";

export default function ThreeStatementIntegrator() {
  const { theme, language, apiBaseUrl, activeCompany } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"DRE" | "DFC" | "BP" | "FLEURIET" | "DUPONT" | "BRIDGE">("DRE");
  const [modelData, setModelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Selected company inside the closed-loop engine
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("vale");

  // Operational drivers state
  const [growthPct, setGrowthPct] = useState<number>(8.5);
  const [pmrDias, setPmrDias] = useState<number>(42.0);
  const [pmeDias, setPmeDias] = useState<number>(86.0);
  const [pmpDias, setPmpDias] = useState<number>(66.0);
  const [capexVal, setCapexVal] = useState<number>(7200.0);
  const [payoutPct, setPayoutPct] = useState<number>(40.0);
  const [showDriverDrawer, setShowDriverDrawer] = useState<boolean>(true);

  // Sync with global active company if compatible
  useEffect(() => {
    if (activeCompany?.id) {
      const lower = activeCompany.id.toLowerCase();
      if (["vale", "petrobras", "klabin", "weg", "banco_do_brasil"].includes(lower)) {
        setSelectedCompanyId(lower);
      }
    }
  }, [activeCompany?.id]);

  const fetchModel = async (cid = selectedCompanyId) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/financials/3statement/model?company_id=${cid}`);
      if (res.ok) {
        const json = await res.json();
        setModelData(json);
        // Sync drivers with baseline values if available
        const bValues = json?.periods_data?.["2025"]?.values;
        if (bValues) {
          setPmrDias(bValues.pmr_dias || 42.0);
          setPmeDias(bValues.pme_dias || 86.0);
          setPmpDias(bValues.pmp_dias || 66.0);
          setCapexVal(roundVal(bValues.capex ? bValues.capex * 1.05 : 7200.0));
        }
      }
    } catch (err) {
      console.error("Failed to load 3-statement model", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (newCid: string) => {
    setSelectedCompanyId(newCid);
    fetchModel(newCid);
  };

  const executeSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/financials/3statement/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          growth_pct: growthPct,
          pmr_dias: pmrDias,
          pme_dias: pmeDias,
          pmp_dias: pmpDias,
          capex_val: capexVal,
          payout_pct: payoutPct,
          company_id: selectedCompanyId
        })
      });
      if (res.ok) {
        const json = await res.json();
        setModelData(json);
      }
    } catch (err) {
      console.error("Simulation error in 3-statement model", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleResetDrivers = () => {
    setGrowthPct(8.5);
    setPayoutPct(40.0);
    fetchModel(selectedCompanyId);
  };

  const handleExportJSON = () => {
    if (!modelData) return;
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Triangulo_Contabil_${modelData.ticker || "EMPRESA"}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchModel(selectedCompanyId);
  }, [apiBaseUrl]);

  const roundVal = (n: number) => Math.round(n * 10) / 10;

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null || isNaN(val)) return "0,0";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(val);
  };

  const formatPct = (val: number | undefined) => {
    if (val === undefined || val === null || isNaN(val)) return "0,0%";
    return `${val.toFixed(1)}%`;
  };

  const periods = modelData?.periods || ["2024", "2025", "Budget_2026"];
  const periodsData = modelData?.periods_data || {};
  const currentBudget = periodsData["Budget_2026"]?.values || {};
  const currentRecon = periodsData["Budget_2026"]?.reconciliation || {};
  const currentFleuriet = periodsData["Budget_2026"]?.fleuriet || {};
  const currentDupont = periodsData["Budget_2026"]?.dupont || {};
  const currentBridge = periodsData["Budget_2026"]?.bridge || [];

  const availableCompanies = modelData?.available_companies || [
    { id: "vale", name: "Vale S.A.", ticker: "VALE3", sector: "Mineração" },
    { id: "petrobras", name: "Petrobras S.A.", ticker: "PETR4", sector: "Petróleo & Gás" },
    { id: "klabin", name: "Klabin S.A.", ticker: "KLBN11", sector: "Papel & Celulose" },
    { id: "weg", name: "WEG S.A.", ticker: "WEGE3", sector: "Bens de Capital" },
    { id: "banco_do_brasil", name: "Banco do Brasil S.A.", ticker: "BBAS3", sector: "Bancos" }
  ];

  return (
    <div className={`rounded-2xl border transition-all ${
      isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 shadow-sm text-slate-900"
    }`}>
      {/* Top Header */}
      <div className={`p-6 border-b flex flex-wrap justify-between items-center gap-4 ${
        isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-anaplan-coral/10 text-anaplan-coral font-black">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  {isEn ? "Closed-Loop 3-Statement Model" : "O Triângulo Contábil Fechado (DRE ↔ DFC ↔ BP)"}
                </h2>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {isEn ? "Zero Delta Reconciliation" : "Conciliação Ativo = Passivo + PL"}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {isEn
                  ? `Unified mathematical loop linking Income Statement, Cash Flow, and Balance Sheet with Fleuriet Working Capital and DuPont decomposition.`
                  : `Loop matemático causal unificando DRE, Fluxo de Caixa e Balanço Patrimonial com Modelo Fleuriet, Efeito Tesoura e Decomposição DuPont.`}
              </p>
            </div>
          </div>
        </div>

        {/* Company Selector & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-slate-900/40 border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-anaplan-coral" />
            <span className="text-slate-400">{isEn ? "Company:" : "Empresa:"}</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {availableCompanies.map((c: any) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.ticker})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowDriverDrawer(!showDriverDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              showDriverDrawer
                ? "bg-anaplan-coral text-white border-anaplan-coral shadow-sm"
                : isDark
                ? "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isEn ? "Drivers & Assumptions" : "Direcionadores & Premissas"}
          </button>

          <button
            onClick={handleExportJSON}
            className={`p-1.5 rounded-lg border transition ${
              isDark ? "border-slate-800 text-slate-400 hover:text-white" : "border-slate-200 text-slate-500 hover:text-slate-900"
            }`}
            title={isEn ? "Export Model Data" : "Exportar Dados do Modelo"}
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => fetchModel(selectedCompanyId)}
            disabled={loading}
            className={`p-1.5 rounded-lg border transition ${
              isDark ? "border-slate-800 text-slate-400 hover:text-white" : "border-slate-200 text-slate-500 hover:text-slate-900"
            }`}
            title={isEn ? "Reload Model" : "Recarregar Modelo"}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-anaplan-coral" : ""}`} />
          </button>
        </div>
      </div>

      {/* Driver Simulation Control Ribbon */}
      {showDriverDrawer && (
        <div className={`p-5 border-b grid grid-cols-1 md:grid-cols-6 gap-4 text-xs ${
          isDark ? "bg-slate-950/40 border-slate-800/80" : "bg-slate-100/60 border-slate-200"
        }`}>
          <div>
            <label className="font-bold text-slate-400 block mb-1">
              {isEn ? "Revenue Growth (%)" : "Crescimento Receita (%)"}
            </label>
            <input
              type="number"
              step="0.5"
              value={growthPct}
              onChange={(e) => setGrowthPct(parseFloat(e.target.value) || 0)}
              className={`w-full px-2.5 py-1.5 rounded-lg font-mono font-bold border outline-none ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">
              {isEn ? "Rec. Days (PMR)" : "Prazo Receb. (PMR Dias)"}
            </label>
            <input
              type="number"
              step="1"
              value={pmrDias}
              onChange={(e) => setPmrDias(parseFloat(e.target.value) || 0)}
              className={`w-full px-2.5 py-1.5 rounded-lg font-mono font-bold border outline-none ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">
              {isEn ? "Inventory Days (PME)" : "Prazo Estoque (PME Dias)"}
            </label>
            <input
              type="number"
              step="1"
              value={pmeDias}
              onChange={(e) => setPmeDias(parseFloat(e.target.value) || 0)}
              className={`w-full px-2.5 py-1.5 rounded-lg font-mono font-bold border outline-none ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">
              {isEn ? "Supplier Days (PMP)" : "Prazo Fornec. (PMP Dias)"}
            </label>
            <input
              type="number"
              step="1"
              value={pmpDias}
              onChange={(e) => setPmpDias(parseFloat(e.target.value) || 0)}
              className={`w-full px-2.5 py-1.5 rounded-lg font-mono font-bold border outline-none ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">
              {isEn ? "Capex (R$ M)" : "Investimento Capex (R$ M)"}
            </label>
            <input
              type="number"
              step="100"
              value={capexVal}
              onChange={(e) => setCapexVal(parseFloat(e.target.value) || 0)}
              className={`w-full px-2.5 py-1.5 rounded-lg font-mono font-bold border outline-none ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={executeSimulation}
              disabled={simulating}
              className="flex-1 py-1.5 px-3 rounded-lg bg-anaplan-coral hover:bg-anaplan-coral/90 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {isEn ? "Propagate Loop" : "Recalcular Loop"}
            </button>
            <button
              onClick={handleResetDrivers}
              className={`p-1.5 rounded-lg border transition ${
                isDark ? "border-slate-700 text-slate-400 hover:text-white" : "border-slate-300 text-slate-600 hover:text-slate-900"
              }`}
              title={isEn ? "Reset Baseline" : "Restaurar Padrão"}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Reconciliation Card Strip */}
      <div className="p-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card DRE */}
        <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>DRE (P&L)</span>
            <span className="text-emerald-500 font-mono">Budget 2026</span>
          </div>
          <div className="mt-1">
            <span className="text-xs text-slate-400 block">{isEn ? "Net Revenue" : "Receita Líquida"}</span>
            <span className="text-sm font-extrabold font-mono">R$ {formatCurrency(currentBudget.receita_liquida)}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block">EBITDA</span>
              <span className="font-extrabold font-mono text-emerald-500">R$ {formatCurrency(currentBudget.ebitda)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">{isEn ? "Net Income" : "Lucro Líquido"}</span>
              <span className="font-extrabold font-mono text-anaplan-coral">R$ {formatCurrency(currentBudget.lucro_liquido)}</span>
            </div>
          </div>
        </div>

        {/* Card DFC */}
        <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>DFC (Cash Flow)</span>
            <span className="text-emerald-500 font-mono">Budget 2026</span>
          </div>
          <div className="mt-1">
            <span className="text-xs text-slate-400 block">{isEn ? "Operating Cash (FCO)" : "Fluxo Operacional (FCO)"}</span>
            <span className="text-sm font-extrabold font-mono text-emerald-500">R$ {formatCurrency(currentBudget.fco_total)}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block">Capex (FCI)</span>
              <span className="font-extrabold font-mono text-rose-500">R$ {formatCurrency(currentBudget.fci_capex)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">{isEn ? "Net Cash Delta" : "Variação de Caixa"}</span>
              <span className={`font-extrabold font-mono ${currentBudget.dfc_variacao_liquida_caixa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                R$ {formatCurrency(currentBudget.dfc_variacao_liquida_caixa)}
              </span>
            </div>
          </div>
        </div>

        {/* Card BP */}
        <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Balanço (BP)</span>
            <span className="text-emerald-500 font-mono">Budget 2026</span>
          </div>
          <div className="mt-1">
            <span className="text-xs text-slate-400 block">{isEn ? "Ending Cash Balance" : "Caixa & Equivalentes"}</span>
            <span className="text-sm font-extrabold font-mono text-anaplan-coral">R$ {formatCurrency(currentBudget.caixa_equivalentes)}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block">Ativo Total</span>
              <span className="font-extrabold font-mono">R$ {formatCurrency(currentBudget.ativo_total)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Passivo + PL</span>
              <span className="font-extrabold font-mono text-emerald-500">R$ {formatCurrency(currentBudget.passivo_total_pl)}</span>
            </div>
          </div>
        </div>

        {/* Card Fleuriet */}
        <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Modelo Fleuriet</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              currentFleuriet.alerta_tesoura ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {currentFleuriet.badge || "Sólida"}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xs text-slate-400 block">{isEn ? "Working Cap. Need (NCG)" : "Necessidade Cap. Giro (NCG)"}</span>
            <span className="text-sm font-extrabold font-mono">R$ {formatCurrency(currentFleuriet.ncg)}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block">CDG</span>
              <span className="font-extrabold font-mono text-emerald-500">R$ {formatCurrency(currentFleuriet.cdg)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">{isEn ? "Treasury Bal. (ST)" : "Saldo Tesouraria"}</span>
              <span className={`font-extrabold font-mono ${currentFleuriet.st >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                R$ {formatCurrency(currentFleuriet.st)}
              </span>
            </div>
          </div>
        </div>

        {/* Card DuPont */}
        <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Análise DuPont</span>
            <span className="text-anaplan-coral font-mono font-bold">ROE</span>
          </div>
          <div className="mt-1">
            <span className="text-xs text-slate-400 block">{isEn ? "Return on Equity (ROE)" : "Retorno s/ PL (ROE)"}</span>
            <span className="text-sm font-extrabold font-mono text-anaplan-coral">{formatPct(currentDupont.roe_pct)}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block">Margem Líq.</span>
              <span className="font-extrabold font-mono text-emerald-400">{formatPct(currentDupont.margem_liquida_pct)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">ROA</span>
              <span className="font-extrabold font-mono text-blue-400">{formatPct(currentDupont.roa_pct)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 border-b flex gap-2 border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("DRE")}
          className={`pb-3 pt-1 px-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
            activeTab === "DRE"
              ? "border-anaplan-coral text-anaplan-coral"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          1. DRE (Resultado)
        </button>
        <button
          onClick={() => setActiveTab("DFC")}
          className={`pb-3 pt-1 px-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
            activeTab === "DFC"
              ? "border-anaplan-coral text-anaplan-coral"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          2. DFC (Fluxo de Caixa)
        </button>
        <button
          onClick={() => setActiveTab("BP")}
          className={`pb-3 pt-1 px-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
            activeTab === "BP"
              ? "border-anaplan-coral text-anaplan-coral"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          3. Balanço (Ativo = Passivo+PL)
        </button>
        <button
          onClick={() => setActiveTab("FLEURIET")}
          className={`pb-3 pt-1 px-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
            activeTab === "FLEURIET"
              ? "border-anaplan-coral text-anaplan-coral"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          4. Fleuriet & Efeito Tesoura
        </button>
        <button
          onClick={() => setActiveTab("DUPONT")}
          className={`pb-3 pt-1 px-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
            activeTab === "DUPONT"
              ? "border-anaplan-coral text-anaplan-coral"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          5. DuPont (ROE & ROA)
        </button>
        <button
          onClick={() => setActiveTab("BRIDGE")}
          className={`pb-3 pt-1 px-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
            activeTab === "BRIDGE"
              ? "border-anaplan-coral text-anaplan-coral"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          6. Ponte Causal (Bridge DRE ↔ DFC ↔ BP)
        </button>
      </div>

      {/* Statement Tables Content */}
      <div className="p-6 overflow-x-auto">
        {/* DRE Table */}
        {activeTab === "DRE" && (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? "bg-slate-950 text-slate-200" : "bg-slate-100 text-slate-800"}`}>
                <th className="py-2.5 px-4 uppercase tracking-wider font-extrabold">Linha da DRE</th>
                {periods.map((p: string) => (
                  <th key={p} className="py-2.5 px-4 text-right font-mono font-extrabold">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
              {[
                { id: "receita_bruta", label: "(+) Receita Operacional Bruta", bold: false },
                { id: "deducoes", label: "(-) Deduções e Impostos sobre Vendas", bold: false },
                { id: "receita_liquida", label: "(=) Receita Operacional Líquida", bold: true, highlight: true },
                { id: "cpv", label: "(-) Custo das Mercadorias / CPV", bold: false },
                { id: "lucro_bruto", label: "(=) Lucro Bruto", bold: true },
                { id: "despesas_vendas", label: "(-) Despesas Comerciais e Vendas", bold: false },
                { id: "despesas_admin", label: "(-) Despesas Gerais e Administrativas (G&A)", bold: false },
                { id: "ebitda", label: "(=) EBITDA Ajustado", bold: true, highlight: true },
                { id: "depreciacao_amortizacao", label: "(-) Depreciação e Amortização", bold: false },
                { id: "ebit", label: "(=) Lucro Operacional (EBIT / LAJIR)", bold: true },
                { id: "resultado_financeiro", label: "(+/-) Resultado Financeiro Líquido", bold: false },
                { id: "ebt", label: "(=) Lucro Antes dos Tributos (LAIR / EBT)", bold: true },
                { id: "impostos_lucro", label: "(-) Provisão para IRPJ e CSLL", bold: false },
                { id: "lucro_liquido", label: "(=) Lucro / Prejuízo Líquido do Exercício", bold: true, coral: true }
              ].map((row) => (
                <tr key={row.id} className={`${row.coral ? (isDark ? "bg-anaplan-coral/20 font-black" : "bg-orange-50 font-black") : row.highlight ? (isDark ? "bg-slate-800/50 font-bold" : "bg-slate-50 font-bold") : ""}`}>
                  <td className="py-2 px-4">{row.label}</td>
                  {periods.map((p: string) => {
                    const val = periodsData[p]?.values?.[row.id] || 0;
                    return (
                      <td key={p} className={`py-2 px-4 text-right font-mono ${row.coral ? "text-anaplan-coral font-bold" : val < 0 ? "text-rose-500" : ""}`}>
                        R$ {formatCurrency(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* DFC Table */}
        {activeTab === "DFC" && (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? "bg-slate-950 text-slate-200" : "bg-slate-100 text-slate-800"}`}>
                <th className="py-2.5 px-4 uppercase tracking-wider font-extrabold">Linha do Fluxo de Caixa (Método Indireto)</th>
                {periods.map((p: string) => (
                  <th key={p} className="py-2.5 px-4 text-right font-mono font-extrabold">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
              {[
                { id: "fco_lucro_liquido", label: "Lucro Líquido do Período", bold: true },
                { id: "fco_ajustes_da", label: "(+) Ajuste de Depreciação e Amortização (Não-Caixa)", bold: false },
                { id: "fco_var_contas_receber", label: "(+/-) Variação em Contas a Receber (Clientes)", bold: false },
                { id: "fco_var_estoques", label: "(+/-) Variação em Estoques", bold: false },
                { id: "fco_var_fornecedores", label: "(+/-) Variação em Fornecedores", bold: false },
                { id: "fco_total", label: "(=) FLUXO DE CAIXA OPERACIONAL (FCO)", bold: true, highlight: true },
                { id: "fci_capex", label: "(-) Investimentos em Ativo Imobilizado (Capex)", bold: false },
                { id: "fci_outros_investimentos", label: "(-) Outros Investimentos Permanentes", bold: false },
                { id: "fci_total", label: "(=) FLUXO DE CAIXA DE INVESTIMENTOS (FCI)", bold: true, highlight: true },
                { id: "fcf_amortizacao_divida", label: "(+/-) Amortização / Captação Líquida de Dívida", bold: false },
                { id: "fcf_dividendos_pagos", label: "(-) Distribuição de Dividendos e JCP", bold: false },
                { id: "fcf_total", label: "(=) FLUXO DE CAIXA DE FINANCIAMENTOS (FCF)", bold: true, highlight: true },
                { id: "dfc_variacao_liquida_caixa", label: "(=) VARIAÇÃO LÍQUIDA DE CAIXA NO PERÍODO", bold: true, coral: true }
              ].map((row) => (
                <tr key={row.id} className={`${row.coral ? (isDark ? "bg-anaplan-coral/20 font-black" : "bg-orange-50 font-black") : row.highlight ? (isDark ? "bg-slate-800/50 font-bold" : "bg-slate-50 font-bold") : ""}`}>
                  <td className="py-2 px-4">{row.label}</td>
                  {periods.map((p: string) => {
                    const val = periodsData[p]?.values?.[row.id] || 0;
                    return (
                      <td key={p} className={`py-2 px-4 text-right font-mono ${row.coral ? "text-anaplan-coral font-bold" : val < 0 ? "text-rose-500" : ""}`}>
                        R$ {formatCurrency(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* BP Table */}
        {activeTab === "BP" && (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? "bg-slate-950 text-slate-200" : "bg-slate-100 text-slate-800"}`}>
                <th className="py-2.5 px-4 uppercase tracking-wider font-extrabold">Estrutura Patrimonial (Ativo vs Passivo)</th>
                {periods.map((p: string) => (
                  <th key={p} className="py-2.5 px-4 text-right font-mono font-extrabold">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
              {[
                { id: "caixa_equivalentes", label: "1.1.1 Caixa e Equivalentes de Caixa (Integrado DFC)", bold: false },
                { id: "contas_receber", label: "1.1.2 Contas a Receber (Clientes - PMR)", bold: false },
                { id: "estoques", label: "1.1.3 Estoques (PME)", bold: false },
                { id: "ativo_circulante", label: "1.1 ATIVO CIRCULANTE TOTAL", bold: true, highlight: true },
                { id: "imobilizado_liquido", label: "1.2.1 Imobilizado Líquido (Ativo Fixo - D&A)", bold: false },
                { id: "ativo_nao_circulante", label: "1.2 ATIVO NÃO CIRCULANTE TOTAL", bold: true, highlight: true },
                { id: "ativo_total", label: "1. ATIVO TOTAL", bold: true, coral: true },
                { id: "fornecedores", label: "2.1.1 Fornecedores a Pagar (PMP)", bold: false },
                { id: "passivo_circulante", label: "2.1 PASSIVO CIRCULANTE TOTAL", bold: true, highlight: true },
                { id: "passivo_nao_circulante", label: "2.2 PASSIVO NÃO CIRCULANTE TOTAL", bold: true, highlight: true },
                { id: "capital_social", label: "2.3.1 Capital Social", bold: false },
                { id: "lucros_prejuizos_acumulados", label: "2.3.2 Lucros Acumulados (Integrado DRE/Dividendos)", bold: false },
                { id: "patrimonio_liquido", label: "2.3 PATRIMÔNIO LÍQUIDO TOTAL", bold: true, highlight: true },
                { id: "passivo_total_pl", label: "2. PASSIVO TOTAL + PATRIMÔNIO LÍQUIDO", bold: true, coral: true }
              ].map((row) => (
                <tr key={row.id} className={`${row.coral ? (isDark ? "bg-anaplan-coral/20 font-black" : "bg-orange-50 font-black") : row.highlight ? (isDark ? "bg-slate-800/50 font-bold" : "bg-slate-50 font-bold") : ""}`}>
                  <td className="py-2 px-4">{row.label}</td>
                  {periods.map((p: string) => {
                    const val = periodsData[p]?.values?.[row.id] || 0;
                    return (
                      <td key={p} className={`py-2 px-4 text-right font-mono ${row.coral ? "text-anaplan-coral font-bold" : ""}`}>
                        R$ {formatCurrency(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Fleuriet Tab */}
        {activeTab === "FLEURIET" && (
          <div className="space-y-6">
            {/* Warning Banner if Scissors Alert */}
            {currentFleuriet.alerta_tesoura && (
              <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 flex items-start gap-3">
                <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-400">
                    {isEn ? "Warning: Scissors Effect / Overtrading Risk Detected!" : "Atenção: Risco de Efeito Tesoura / Overtrading Detectado!"}
                  </h4>
                  <p className="text-xs mt-1 text-rose-200/90 leading-relaxed">
                    {currentFleuriet.descricao}
                  </p>
                </div>
              </div>
            )}

            {/* Fleuriet Dynamic Indicators Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? "bg-slate-950 text-slate-200" : "bg-slate-100 text-slate-800"}`}>
                  <th className="py-2.5 px-4 uppercase tracking-wider font-extrabold">Indicador do Modelo Fleuriet</th>
                  {periods.map((p: string) => (
                    <th key={p} className="py-2.5 px-4 text-right font-mono font-extrabold">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                {[
                  { id: "aco", label: "(+) Ativo Circulante Operacional / Cíclico (ACO)", bold: false },
                  { id: "pco", label: "(-) Passivo Circulante Operacional / Cíclico (PCO)", bold: false },
                  { id: "ncg", label: "(=) Necessidade de Capital de Giro (NCG = ACO - PCO)", bold: true, highlight: true },
                  { id: "cdg", label: "(=) Capital de Giro / Recursos de Longo Prazo (CDG)", bold: true, highlight: true },
                  { id: "st", label: "(=) Saldo de Tesouraria (ST = CDG - NCG)", bold: true, coral: true },
                  { id: "grau_dependencia_bancaria_pct", label: "Grau de Dependência Bancária CP (% sobre ACO)", isPct: true },
                  { id: "ciclo_operacional_dias", label: "Ciclo Operacional (PMR + PME) em dias", isDays: true },
                  { id: "ciclo_financeiro_dias", label: "Ciclo Financeiro / Caixa (PMR + PME - PMP) em dias", isDays: true },
                  { id: "classificacao", label: "Diagnóstico da Estrutura Financeira (Fleuriet)", isText: true }
                ].map((row) => (
                  <tr key={row.id} className={`${row.coral ? (isDark ? "bg-anaplan-coral/20 font-black" : "bg-orange-50 font-black") : row.highlight ? (isDark ? "bg-slate-800/50 font-bold" : "bg-slate-50 font-bold") : ""}`}>
                    <td className="py-2 px-4">{row.label}</td>
                    {periods.map((p: string) => {
                      const fl = periodsData[p]?.fleuriet || {};
                      const val = fl[row.id];
                      if (row.isText) {
                        return (
                          <td key={p} className="py-2 px-4 text-right font-bold text-emerald-400">
                            {val || "Sólida"}
                          </td>
                        );
                      }
                      if (row.isPct) {
                        return (
                          <td key={p} className="py-2 px-4 text-right font-mono font-bold text-amber-400">
                            {formatPct(val)}
                          </td>
                        );
                      }
                      if (row.isDays) {
                        return (
                          <td key={p} className="py-2 px-4 text-right font-mono font-bold text-slate-300">
                            {val ? `${val} dias` : "-"}
                          </td>
                        );
                      }
                      return (
                        <td key={p} className={`py-2 px-4 text-right font-mono ${row.coral ? "text-anaplan-coral font-bold" : ""}`}>
                          R$ {formatCurrency(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Visual 6-Typology Fleuriet Matrix Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-anaplan-coral" />
                {isEn ? "Fleuriet 6-Typology Matrix (Current Position Highlighted)" : "Matriz Clássica das 6 Tipologias de Fleuriet (Posição Atual)"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { tipo: 1, title: "Tipo 1: Excelente", cond: "CDG > 0 | NCG < 0 | ST > 0", badge: "Excelente", color: "emerald", desc: "Folga máxima: NCG negativa financia o giro e gera tesouraria positiva." },
                  { tipo: 2, title: "Tipo 2: Sólida / Equilibrada", cond: "CDG > 0 | NCG > 0 | ST > 0", badge: "Sólida", color: "emerald", desc: "Estrutura clássica: CDG cobre a NCG e ainda sobra caixa de segurança." },
                  { tipo: 3, title: "Tipo 3: Insatisfatória", cond: "CDG > 0 | NCG > 0 | ST < 0", badge: "Atenção", color: "amber", desc: "Giro deficitário: CDG insuficiente, recorre a dívida bancária de curto prazo." },
                  { tipo: 4, title: "Tipo 4: Efeito Tesoura", cond: "CDG < 0 | NCG > 0 | ST < 0", badge: "Efeito Tesoura", color: "rose", desc: "Overtrading grave: Dívida de curto prazo financia imobilizado e giro." },
                  { tipo: 5, title: "Tipo 5: Muito Ruim / Crítica", cond: "CDG < 0 | NCG < 0 | ST < 0", badge: "Crítica", color: "rose", desc: "Estrutura em crise profunda: Passivo permanente insuficiente para os ativos fixos." },
                  { tipo: 6, title: "Tipo 6: Atípica / Temporária", cond: "CDG < 0 | NCG < 0 | ST > 0", badge: "Atípica", color: "blue", desc: "Atípica: CDG negativo com tesouraria positiva gerada por adiamentos." }
                ].map((quad) => {
                  const isCurrent = currentFleuriet.tipo === quad.tipo;
                  return (
                    <div
                      key={quad.tipo}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? "ring-2 ring-anaplan-coral bg-anaplan-coral/10 border-anaplan-coral shadow-md"
                          : isDark
                          ? "bg-slate-950/40 border-slate-800"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-xs">{quad.title}</span>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-anaplan-coral text-white">
                            Atual
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 block mb-1.5">{quad.cond}</span>
                      <p className="text-[11px] text-slate-400 leading-snug">{quad.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* DuPont Tab */}
        {activeTab === "DUPONT" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-anaplan-coral/30 bg-anaplan-coral/10 text-xs">
              <h4 className="font-bold text-anaplan-coral text-sm mb-1">
                Decomposição DuPont de 3 Fatores: Como a Empresa Gera Retorno s/ PL (ROE)
              </h4>
              <p className="text-slate-300 leading-relaxed">
                A fórmula Dupont decomposta estabelece que:{" "}
                <span className="font-mono font-bold text-white">ROE = Margem Líquida (%) × Giro do Ativo (x) × Alavancagem Financeira (x)</span>.
                Isso revela se a rentabilidade vem de margens elevadas, alta rotação de ativos ou alavancagem de capital de terceiros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Margem Líquida */}
              <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fator 1: Eficiência</span>
                <h5 className="font-bold text-sm">Margem Líquida</h5>
                <span className="text-2xl font-black font-mono text-emerald-400 block mt-2">
                  {formatPct(currentDupont.margem_liquida_pct)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">Lucro Líquido / Receita Líquida</span>
              </div>

              {/* Giro do Ativo */}
              <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fator 2: Produtividade</span>
                <h5 className="font-bold text-sm">Giro do Ativo</h5>
                <span className="text-2xl font-black font-mono text-blue-400 block mt-2">
                  {currentDupont.giro_ativo ? `${currentDupont.giro_ativo.toFixed(2)}x` : "0,0x"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">Receita Líquida / Ativo Total</span>
              </div>

              {/* Alavancagem Financeira */}
              <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fator 3: Estrutura</span>
                <h5 className="font-bold text-sm">Alavancagem (Multiplicador)</h5>
                <span className="text-2xl font-black font-mono text-amber-400 block mt-2">
                  {currentDupont.alavancagem_financeira ? `${currentDupont.alavancagem_financeira.toFixed(2)}x` : "0,0x"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">Ativo Total / Patrimônio Líquido</span>
              </div>

              {/* ROE Resultado */}
              <div className={`p-4 rounded-xl border ${isDark ? "bg-anaplan-coral/10 border-anaplan-coral/40" : "bg-orange-50 border-orange-200"}`}>
                <span className="text-[10px] uppercase font-bold text-anaplan-coral block mb-1">Resultado Dupont</span>
                <h5 className="font-bold text-sm">ROE (Budget 2026)</h5>
                <span className="text-2xl font-black font-mono text-anaplan-coral block mt-2">
                  {formatPct(currentDupont.roe_pct)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">ROA: {formatPct(currentDupont.roa_pct)}</span>
              </div>
            </div>

            {/* DuPont Historical Evolution Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? "bg-slate-950 text-slate-200" : "bg-slate-100 text-slate-800"}`}>
                  <th className="py-2.5 px-4 uppercase tracking-wider font-extrabold">Alavanca DuPont</th>
                  {periods.map((p: string) => (
                    <th key={p} className="py-2.5 px-4 text-right font-mono font-extrabold">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                {[
                  { id: "margem_liquida_pct", label: "(1) Margem Líquida (%)", isPct: true },
                  { id: "giro_ativo", label: "(2) Giro do Ativo (x)", isMult: true },
                  { id: "roa_pct", label: "(=) ROA - Retorno sobre o Ativo Total (%)", isPct: true, highlight: true },
                  { id: "alavancagem_financeira", label: "(3) Multiplicador de Alavancagem Financeira (x)", isMult: true },
                  { id: "roe_pct", label: "(=) ROE - Retorno sobre o Patrimônio Líquido (%)", isPct: true, coral: true }
                ].map((row) => (
                  <tr key={row.id} className={`${row.coral ? (isDark ? "bg-anaplan-coral/20 font-black" : "bg-orange-50 font-black") : row.highlight ? (isDark ? "bg-slate-800/50 font-bold" : "bg-slate-50 font-bold") : ""}`}>
                    <td className="py-2 px-4">{row.label}</td>
                    {periods.map((p: string) => {
                      const dup = periodsData[p]?.dupont || {};
                      const val = dup[row.id];
                      return (
                        <td key={p} className={`py-2 px-4 text-right font-mono ${row.coral ? "text-anaplan-coral font-bold" : ""}`}>
                          {row.isPct ? formatPct(val) : row.isMult ? `${val?.toFixed(2)}x` : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bridge Tab (Waterfall Causal) */}
        {activeTab === "BRIDGE" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
              <h4 className="font-bold text-blue-400 text-sm mb-1">
                Ponte Causal Completa: Como o Lucro Líquido da DRE se Transforma no Caixa Final do Balanço
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Esta cascata matemática rastreia as 12 etapas de conciliação causal direta entre DRE, DFC e Balanço Patrimonial para o Budget 2026,
                sem perdas contábeis e com fechamento exato de caixa.
              </p>
            </div>

            <div className="space-y-2">
              {currentBridge.map((item: any) => {
                const isBase = item.type === "base";
                const isSubtotal = item.type === "subtotal";
                const isTotal = item.type === "total";
                const isSummary = item.type === "summary";
                const isNegative = item.type === "negative" || item.amount < 0;

                return (
                  <div
                    key={item.step}
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs transition ${
                      isTotal
                        ? "bg-anaplan-coral/20 border-anaplan-coral font-black"
                        : isSubtotal || isSummary
                        ? "bg-slate-800/60 border-slate-700 font-bold"
                        : isDark
                        ? "bg-slate-950/40 border-slate-800/80"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px] font-bold">
                        {item.step}
                      </span>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold mr-2">[{item.category}]</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${
                        isTotal
                          ? "text-anaplan-coral text-sm"
                          : isNegative
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }`}>
                        R$ {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Guarantee Banner */}
      <div className={`p-4 border-t flex flex-wrap items-center justify-between text-xs ${
        isDark ? "bg-slate-950/90 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="font-bold">
            {isEn
              ? `Reconciliation Guarantee: Ativo Total = Passivo Total + PL (Continuous Zero Delta across all simulations for ${modelData?.company_name || "Company"}).`
              : `Garantia de Conciliação: Ativo Total = Passivo Total + PL (Delta Zero absoluto preservado em todas as simulações para ${modelData?.company_name || "Empresa"}).`}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span>Delta 2024: R$ {formatCurrency(periodsData["2024"]?.reconciliation?.delta || 0)}</span>
          <span>Delta 2025: R$ {formatCurrency(periodsData["2025"]?.reconciliation?.delta || 0)}</span>
          <span className="text-emerald-500 font-bold">Delta Budget: R$ {formatCurrency(periodsData["Budget_2026"]?.reconciliation?.delta || 0)}</span>
        </div>
      </div>
    </div>
  );
}
