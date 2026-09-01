"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Play,
  Layers,
  Sparkles,
  BarChart3,
  Sliders,
  Calendar,
  DollarSign,
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { usePreferences, getApiUrl } from "./PreferencesContext";

interface RollingQuarter {
  quarter_id: string;
  year: number;
  quarter_num: number;
  label: string;
  period_type: string;
  is_actual: boolean;
  revenue: number;
  cogs: number;
  gross_profit: number;
  opex_sales: number;
  opex_admin: number;
  ebitda: number;
  ebitda_margin_pct: number;
  depreciation: number;
  ebit: number;
  financial_result: number;
  ebt: number;
  taxes: number;
  net_income: number;
  net_margin_pct: number;
  capex: number;
  fco: number;
  fci: number;
  fcf: number;
  cash_delta: number;
  cash_start: number;
  cash_end: number;
  debt_total: number;
  net_debt: number;
  leverage_ratio: number;
  working_capital_ncg: number;
}

export default function RollingForecastMonteCarlo() {
  const { theme, language, apiBaseUrl } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [selectedCompany, setSelectedCompany] = useState<string>("klabin");
  const [activeTab, setActiveTab] = useState<"ROLLING" | "PARAMS" | "FANCHART" | "RISK">("ROLLING");
  const [fanMetric, setFanMetric] = useState<"ebitda" | "ending_cash">("ebitda");

  // Simulation parameters
  const [iterations, setIterations] = useState<number>(3000);
  const [revVolatility, setRevVolatility] = useState<number>(8.0);
  const [cogsInflation, setCogsInflation] = useState<number>(5.0);
  const [selicShockBps, setSelicShockBps] = useState<number>(150);
  const [capexUncertainty, setCapexUncertainty] = useState<number>(10.0);
  const [covenantLimit, setCovenantLimit] = useState<number>(3.5);

  // Data states
  const [rollingData, setRollingData] = useState<any>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const companiesList = [
    { id: "klabin", name: "Klabin S.A.", ticker: "KLBN11", sector: "Papel & Celulose" },
    { id: "vale", name: "Vale S.A.", ticker: "VALE3", sector: "Mineração" },
    { id: "petrobras", name: "Petrobras", ticker: "PETR4", sector: "Óleo & Gás" },
    { id: "weg", name: "WEG S.A.", ticker: "WEGE3", sector: "Bens de Capital" },
    { id: "banco_do_brasil", name: "Banco do Brasil", ticker: "BBAS3", sector: "Financeiro" }
  ];

  // Fetch initial rolling forecast and trigger baseline Monte Carlo
  const loadForecastData = async (comp: string) => {
    setLoading(true);
    setError(null);
    try {
      const rfUrl = getApiUrl(`/api/financials/forecast/rolling?company_id=${encodeURIComponent(comp)}`, apiBaseUrl);
      const rfRes = await fetch(rfUrl);
      if (!rfRes.ok) throw new Error("Erro ao carregar previsão contínua");
      const rfJson = await rfRes.json();
      setRollingData(rfJson);

      // Trigger initial Monte Carlo
      const mcUrl = getApiUrl("/api/financials/forecast/monte-carlo", apiBaseUrl);
      const mcRes = await fetch(mcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: comp,
          iterations,
          revenue_volatility_pct: revVolatility,
          cogs_inflation_mode_pct: cogsInflation,
          selic_shock_bps_std: selicShockBps,
          capex_uncertainty_pct: capexUncertainty,
          covenant_leverage_limit: covenantLimit
        })
      });
      if (mcRes.ok) {
        const mcJson = await mcRes.json();
        setSimulationResult(mcJson);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecastData(selectedCompany);
  }, [selectedCompany]);

  // Run Monte Carlo simulation with current parameters
  const runMonteCarlo = async () => {
    setSimulating(true);
    setError(null);
    try {
      const mcUrl = getApiUrl("/api/financials/forecast/monte-carlo", apiBaseUrl);
      const mcRes = await fetch(mcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: selectedCompany,
          iterations,
          revenue_volatility_pct: revVolatility,
          cogs_inflation_mode_pct: cogsInflation,
          selic_shock_bps_std: selicShockBps,
          capex_uncertainty_pct: capexUncertainty,
          covenant_leverage_limit: covenantLimit
        })
      });
      if (!mcRes.ok) throw new Error("Erro na simulação estocástica");
      const mcJson = await mcRes.json();
      setSimulationResult(mcJson);
    } catch (err: any) {
      setError(err.message || "Erro na execução da simulação");
    } finally {
      setSimulating(false);
    }
  };

  const fmtCurrency = (v: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(v);
  };

  const fmtNumber = (v: number) => {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 1
    }).format(v);
  };

  return (
    <div className="w-full space-y-5 font-sans animate-in fade-in duration-300">
      {/* Top Header Card - Stitch Dark Fintech Style */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#131b2e] border border-[#222a3d] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-sky-500 via-indigo-600 to-emerald-400 rounded-2xl text-white shadow-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{isEn ? "Continuous Rolling Forecast & Monte Carlo" : "Previsão Contínua & Simulação de Monte Carlo"}</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-mono font-bold border border-sky-500/30">
                  Etapa 4
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEn
                ? "8-Quarter continuous rolling model with vectorized stochastic risk quantification (NumPy)."
                : "Modelo deslizante de 8 trimestres com quantificação estocástica de risco vetorizada (NumPy)."}
            </p>
          </div>
        </div>

        {/* Company and Iterations Controls */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* Company Selector */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-[#0b1326] border border-[#222a3d] text-white focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
          >
            {companiesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.ticker})
              </option>
            ))}
          </select>

          {/* Iterations Selector */}
          <div className="flex items-center bg-[#0b1326] p-1 rounded-xl border border-[#222a3d]">
            {[1000, 3000, 5000, 10000].map((it) => (
              <button
                key={it}
                onClick={() => setIterations(it)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                  iterations === it
                    ? "bg-sky-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {it >= 1000 ? `${it / 1000}k` : it}
              </button>
            ))}
          </div>

          {/* Run Button */}
          <button
            onClick={runMonteCarlo}
            disabled={simulating || loading}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 flex items-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${simulating ? "animate-spin" : "fill-current"}`} />
            <span>{simulating ? (isEn ? "Running..." : "Simulando...") : (isEn ? "Run Monte Carlo" : "Executar Monte Carlo")}</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon - Bloomberg Terminal Metrics */}
      {simulationResult && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* VaR 95% EBITDA */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] shadow-sm flex flex-col justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>VaR 95% (EBITDA)</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="mt-2">
              <span className="text-lg sm:text-xl font-black text-amber-300 font-mono tabular-nums">
                {fmtCurrency(simulationResult.risk_metrics.var_95_ebitda)}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                {isEn ? "Max expected EBITDA shortfall (P5)" : "Perda máxima esperada em 95% dos casos"}
              </span>
            </div>
          </div>

          {/* VaR 95% Cash */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] shadow-sm flex flex-col justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>VaR 95% (Caixa)</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </span>
            <div className="mt-2">
              <span className="text-lg sm:text-xl font-black text-rose-300 font-mono tabular-nums">
                {fmtCurrency(simulationResult.risk_metrics.var_95_cash)}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                {isEn ? "Maximum liquidity draw at 95% conf." : "Risco máximo de queima de liquidez"}
              </span>
            </div>
          </div>

          {/* Prob. Cash < 0 */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] shadow-sm flex flex-col justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>P(Caixa &lt; R$ 150M)</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="mt-2">
              <span className={`text-lg sm:text-xl font-black font-mono tabular-nums ${
                simulationResult.risk_metrics.prob_cash_negative_pct > 5 ? "text-rose-400" : "text-emerald-400"
              }`}>
                {fmtNumber(simulationResult.risk_metrics.prob_cash_negative_pct)}%
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                {simulationResult.risk_metrics.prob_cash_negative_pct === 0
                  ? (isEn ? "Zero liquidity default risk" : "Risco de insolvência nulo")
                  : (isEn ? "Probability of liquidity distress" : "Probabilidade de estresse de caixa")}
              </span>
            </div>
          </div>

          {/* Prob. Covenant Breach */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] shadow-sm flex flex-col justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>P(Dívida/EBITDA &gt; {covenantLimit}x)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            </span>
            <div className="mt-2">
              <span className={`text-lg sm:text-xl font-black font-mono tabular-nums ${
                simulationResult.risk_metrics.prob_covenant_breach_pct > 10 ? "text-amber-400" : "text-sky-300"
              }`}>
                {fmtNumber(simulationResult.risk_metrics.prob_covenant_breach_pct)}%
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                {isEn ? "Covenant leverage breach risk" : "Risco de quebra de covenant"}
              </span>
            </div>
          </div>

          {/* Median EBITDA (P50) */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>EBITDA Mediano (P50)</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="mt-2">
              <span className="text-lg sm:text-xl font-black text-emerald-300 font-mono tabular-nums">
                {fmtCurrency(simulationResult.risk_metrics.median_ebitda)}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                {isEn ? "Center of stochastic distribution" : "Centro da distribuição estocástica"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#131b2e] border border-[#222a3d] w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab("ROLLING")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "ROLLING"
              ? "bg-sky-500 text-slate-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isEn ? "1. Rolling Forecast (8 Quarters)" : "1. Rolling Forecast (8 Trimestres)"}</span>
        </button>

        <button
          onClick={() => setActiveTab("PARAMS")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "PARAMS"
              ? "bg-sky-500 text-slate-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isEn ? "2. Stochastic Parameters" : "2. Parametrização Estocástica"}</span>
        </button>

        <button
          onClick={() => setActiveTab("FANCHART")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "FANCHART"
              ? "bg-sky-500 text-slate-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isEn ? "3. Fan Chart & Histograms" : "3. Fan Chart & Histograma"}</span>
        </button>

        <button
          onClick={() => setActiveTab("RISK")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "RISK"
              ? "bg-sky-500 text-slate-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isEn ? "4. Risk Matrix & Covenants" : "4. Matriz de Risco & Covenants"}</span>
        </button>
      </div>

      {/* TAB 1: ROLLING FORECAST 8 QUARTERS */}
      {activeTab === "ROLLING" && rollingData && (
        <div className="space-y-5">
          {/* Visual Cut-off Line & Summary Banner */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {isEn
                    ? "Continuous Timeline: 4 Actuals Quarters (2025) → 4 Forecast Quarters (2026)"
                    : "Linha Temporal Contínua: 4 Trimestres Realizados (2025) → 4 Trimestres Projetados (2026)"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isEn
                    ? "Cut-off point at Q4 2025. Ending cash automatically rolls over as beginning cash."
                    : "Ponto de corte em Q4 2025. O saldo de caixa final rola automaticamente como caixa inicial do próximo trimestre."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="w-3 h-3 rounded bg-slate-700 inline-block" />
                <span className="text-slate-300 font-bold">Realizado (Actuals)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="w-3 h-3 rounded bg-sky-500 inline-block" />
                <span className="text-sky-300 font-bold">Projetado (Forecast)</span>
              </div>
            </div>
          </div>

          {/* High-Density 8-Quarter Financial Table (Stitch Style) */}
          <div className="rounded-3xl bg-[#131b2e] border border-[#222a3d] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#222a3d] flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>Demonstrativo de Previsão Contínua (Rolling Horizon)</span>
                <span className="text-[10px] text-slate-400 font-normal">Valores em R$ Milhões</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono tabular-nums">
                <thead>
                  <tr className="bg-[#0b1326] text-slate-400 border-b border-[#222a3d]">
                    <th className="py-3 px-4 text-xs font-bold text-slate-200 sticky left-0 bg-[#0b1326] min-w-[220px]">
                      Linha Contábil / Trimestre
                    </th>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <th
                        key={q.quarter_id}
                        className={`py-3 px-3.5 text-center min-w-[110px] ${
                          q.is_actual ? "bg-slate-900/60 text-slate-300" : "bg-sky-950/20 text-sky-300"
                        }`}
                      >
                        <span className="block font-black text-xs">{q.label}</span>
                        <span
                          className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase ${
                            q.is_actual
                              ? "bg-slate-800 text-slate-400"
                              : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          }`}
                        >
                          {q.period_type}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222a3d]/60 text-slate-300">
                  {/* Receita Líquida */}
                  <tr className="hover:bg-slate-800/40 font-bold text-white">
                    <td className="py-2.5 px-4 sticky left-0 bg-[#131b2e]">Receita Líquida de Vendas</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2.5 px-3.5 text-right font-bold text-slate-100">
                        {fmtNumber(q.revenue)}
                      </td>
                    ))}
                  </tr>

                  {/* CPV / Custos */}
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-4 sticky left-0 bg-[#131b2e]">(-) Custos dos Produtos Vendidos (CPV)</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2 px-3.5 text-right text-rose-400/90">
                        -{fmtNumber(q.cogs)}
                      </td>
                    ))}
                  </tr>

                  {/* Lucro Bruto */}
                  <tr className="hover:bg-slate-800/40 bg-slate-900/30 font-semibold text-slate-200">
                    <td className="py-2.5 px-4 sticky left-0 bg-[#131b2e]">(=) Lucro Bruto</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2.5 px-3.5 text-right">
                        {fmtNumber(q.gross_profit)}
                      </td>
                    ))}
                  </tr>

                  {/* EBITDA */}
                  <tr className="hover:bg-emerald-950/20 bg-emerald-950/10 font-black text-emerald-300 border-y border-emerald-500/30">
                    <td className="py-2.5 px-4 sticky left-0 bg-[#131b2e]">(=) EBITDA Operacional</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2.5 px-3.5 text-right font-black">
                        {fmtNumber(q.ebitda)}
                      </td>
                    ))}
                  </tr>

                  {/* Margem EBITDA */}
                  <tr className="hover:bg-slate-800/40 text-[11px] text-slate-400">
                    <td className="py-1.5 px-4 sticky left-0 bg-[#131b2e] italic">Margem EBITDA %</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-1.5 px-3.5 text-right text-sky-400">
                        {q.ebitda_margin_pct}%
                      </td>
                    ))}
                  </tr>

                  {/* D&A */}
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-4 sticky left-0 bg-[#131b2e]">(-) Depreciação e Amortização</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2 px-3.5 text-right">
                        -{fmtNumber(q.depreciation)}
                      </td>
                    ))}
                  </tr>

                  {/* Res. Financeiro */}
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-4 sticky left-0 bg-[#131b2e]">Resultado Financeiro Líquido</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className={`py-2 px-3.5 text-right ${q.financial_result < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {fmtNumber(q.financial_result)}
                      </td>
                    ))}
                  </tr>

                  {/* Lucro Líquido */}
                  <tr className="hover:bg-slate-800/40 font-bold text-white bg-slate-900/40">
                    <td className="py-2.5 px-4 sticky left-0 bg-[#131b2e]">(=) Lucro Líquido do Período</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2.5 px-3.5 text-right font-bold text-emerald-300">
                        {fmtNumber(q.net_income)}
                      </td>
                    ))}
                  </tr>

                  {/* Capex */}
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-4 sticky left-0 bg-[#131b2e]">(-) Capex de Investimento (FCI)</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2 px-3.5 text-right text-rose-400">
                        -{fmtNumber(q.capex)}
                      </td>
                    ))}
                  </tr>

                  {/* Fluxo de Caixa Operacional (FCO) */}
                  <tr className="hover:bg-slate-800/40 text-slate-300">
                    <td className="py-2 px-4 sticky left-0 bg-[#131b2e]">(+) FCO (Geração Operacional)</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2 px-3.5 text-right text-emerald-400">
                        {fmtNumber(q.fco)}
                      </td>
                    ))}
                  </tr>

                  {/* Caixa Inicial */}
                  <tr className="hover:bg-slate-800/40 text-[11px] text-slate-400 bg-[#0b1326]/40">
                    <td className="py-2 px-4 sticky left-0 bg-[#131b2e]">Caixa Inicial do Trimestre</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2 px-3.5 text-right text-slate-300">
                        {fmtNumber(q.cash_start)}
                      </td>
                    ))}
                  </tr>

                  {/* Caixa Final */}
                  <tr className="hover:bg-sky-950/20 bg-sky-950/10 font-black text-sky-300 border-t border-sky-500/30">
                    <td className="py-2.5 px-4 sticky left-0 bg-[#131b2e]">(=) Saldo Final de Caixa (DFC)</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2.5 px-3.5 text-right font-black">
                        {fmtNumber(q.cash_end)}
                      </td>
                    ))}
                  </tr>

                  {/* Alavancagem Dívida/EBITDA */}
                  <tr className="hover:bg-slate-800/40 text-[11px] text-slate-400">
                    <td className="py-2 px-4 sticky left-0 bg-[#131b2e] font-semibold">Alavancagem (Dív. Líq / EBITDA)</td>
                    {rollingData.timeline.map((q: RollingQuarter) => (
                      <td key={q.quarter_id} className="py-2 px-3.5 text-right font-bold text-amber-300">
                        {q.leverage_ratio}x
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCHASTIC PARAMETERS */}
      {activeTab === "PARAMS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sliders Card */}
          <div className="p-6 rounded-3xl bg-[#131b2e] border border-[#222a3d] shadow-2xl space-y-5">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-[#222a3d]">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Parametrização das Distribuições de Incerteza</span>
            </h3>

            {/* Revenue Volatility */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-200">Volatilidade de Receita / Vendas (σ)</label>
                <span className="font-mono text-sky-400 font-black">± {revVolatility}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={revVolatility}
                onChange={(e) => setRevVolatility(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <p className="text-[10.5px] text-slate-400">
                Distribuição Normal N(1.0, σ²). Simula oscilações de volume físico de vendas e preços de mercado.
              </p>
            </div>

            {/* COGS Inflation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-200">Inflação de Custos Fabris (CPV / Insumos)</label>
                <span className="font-mono text-rose-400 font-black">Moda: {cogsInflation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={cogsInflation}
                onChange={(e) => setCogsInflation(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[10.5px] text-slate-400">
                Distribuição Triangular [Min, Moda, Max]. Simula choques em matérias-primas, energia e logística.
              </p>
            </div>

            {/* Selic Shock */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-200">Choque de Taxa Selic / Spread de Juros</label>
                <span className="font-mono text-amber-400 font-black">± {selicShockBps} bps</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="25"
                value={selicShockBps}
                onChange={(e) => setSelicShockBps(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10.5px] text-slate-400">
                Impacta despesas com juros da dívida corporativa e remuneração das aplicações de caixa.
              </p>
            </div>

            {/* Capex Uncertainty */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-200">Incerteza de Desembolso de Capex</label>
                <span className="font-mono text-emerald-400 font-black">± {capexUncertainty}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={capexUncertainty}
                onChange={(e) => setCapexUncertainty(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10.5px] text-slate-400">
                Simula atrasos de entrega ou estouros orçamentários de projetos de engenharia e expansão.
              </p>
            </div>

            {/* Covenant Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-200">Limite de Covenant Bancário (Dív. Líquida / EBITDA)</label>
                <span className="font-mono text-sky-400 font-black">{covenantLimit}x</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="5.0"
                step="0.25"
                value={covenantLimit}
                onChange={(e) => setCovenantLimit(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <button
              onClick={runMonteCarlo}
              disabled={simulating}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${simulating ? "animate-spin" : ""}`} />
              <span>{simulating ? "Recalculando Universo Estocástico..." : "Aplicar Parâmetros e Recalcular Monte Carlo"}</span>
            </button>
          </div>

          {/* Educational / Mathematical Rigor Card */}
          <div className="p-6 rounded-3xl bg-[#131b2e] border border-[#222a3d] shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-[#222a3d]">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Metodologia Estocástica & Vetorização NumPy</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              O simulador estocástico do <strong>HyperCube</strong> abandona projeções lineares determinísticas (Melhor/Pior Cenário) em favor da modelagem de risco empírica por distribuições contínuas de probabilidade.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0b1326] border border-[#222a3d]">
                <span className="font-bold text-sky-400 block mb-1">1. Vetorização N-Dimensional</span>
                <p className="text-slate-400 text-[11px]">
                  Ao invés de loops lentos em Python, toda a propagação causal das 8 contas financeiras é calculada em matrizes NumPy (N × 4), processando 10.000 iterações em menos de 150 milissegundos.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0b1326] border border-[#222a3d]">
                <span className="font-bold text-amber-400 block mb-1">2. Value-at-Risk (VaR 95% Paramétrico e Empírico)</span>
                <p className="text-slate-400 text-[11px]">
                  Quantifica a perda máxima de EBITDA no percentil 5% da cauda esquerda: VaR 95% = Baseline - P5%. Utilizado por diretorias financeiras para dimensionamento de linhas de crédito e hedge cambial.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0b1326] border border-[#222a3d]">
                <span className="font-bold text-emerald-400 block mb-1">3. Covenants e Liquidez Fleuriet</span>
                <p className="text-slate-400 text-[11px]">
                  Monitora a fração de trajetórias que ultrapassam o limite de alavancagem bancária (Dívida Líquida / EBITDA &gt; 3,5x) ou causam esgotamento do Saldo de Tesouraria (ST &lt; 0).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAN CHART & HISTOGRAM */}
      {activeTab === "FANCHART" && simulationResult && (
        <div className="space-y-5">
          {/* Fan Chart View */}
          <div className="p-6 rounded-3xl bg-[#131b2e] border border-[#222a3d] shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#222a3d]">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>Fan Chart (Gráfico em Leque de Trajetória Temporal)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Faixas de dispersão estatística de 8 trimestres: P10-P90 (80% conf.) e P25-P75 (50% conf.).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFanMetric("ebitda")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    fanMetric === "ebitda"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "bg-[#0b1326] text-slate-400 border border-[#222a3d]"
                  }`}
                >
                  EBITDA
                </button>
                <button
                  onClick={() => setFanMetric("ending_cash")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    fanMetric === "ending_cash"
                      ? "bg-sky-500 text-slate-950 font-black shadow-sm"
                      : "bg-[#0b1326] text-slate-400 border border-[#222a3d]"
                  }`}
                >
                  Saldo de Caixa
                </button>
              </div>
            </div>

            {/* Fan Chart SVG Graphic */}
            <div className="w-full bg-[#0b1326] p-4 rounded-2xl border border-[#222a3d]">
              {(() => {
                const trajectory = simulationResult.fan_charts[fanMetric];
                const allVals = trajectory.flatMap((t: any) => [t.p10, t.p50, t.p90]);
                const minVal = Math.min(...allVals) * 0.85;
                const maxVal = Math.max(...allVals) * 1.15;
                const width = 800;
                const height = 280;
                const padLeft = 70;
                const padRight = 30;
                const padTop = 20;
                const padBottom = 40;

                const getX = (idx: number) => padLeft + (idx * (width - padLeft - padRight)) / (trajectory.length - 1);
                const getY = (val: number) => height - padBottom - ((val - minVal) / (maxVal - minVal)) * (height - padTop - padBottom);

                // Build P10-P90 area polygon
                const topPoints = trajectory.map((t: any, idx: number) => `${getX(idx)},${getY(t.p90)}`).join(" ");
                const bottomPoints = trajectory.slice().reverse().map((t: any, idx: number) => `${getX(trajectory.length - 1 - idx)},${getY(t.p10)}`).join(" ");
                const area80 = `${topPoints} ${bottomPoints}`;

                // Build P25-P75 area polygon
                const topPoints50 = trajectory.map((t: any, idx: number) => `${getX(idx)},${getY(t.p75)}`).join(" ");
                const bottomPoints50 = trajectory.slice().reverse().map((t: any, idx: number) => `${getX(trajectory.length - 1 - idx)},${getY(t.p25)}`).join(" ");
                const area50 = `${topPoints50} ${bottomPoints50}`;

                // Build median line
                const medianLine = trajectory.map((t: any, idx: number) => `${getX(idx)},${getY(t.p50)}`).join(" ");

                return (
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-xs">
                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                      const v = minVal + ratio * (maxVal - minVal);
                      const y = getY(v);
                      return (
                        <g key={ratio}>
                          <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#222a3d" strokeDasharray="3 3" />
                          <text x={padLeft - 10} y={y + 4} textAnchor="end" fill="#64748b" className="text-[10px] font-mono">
                            {intToM(v)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Cut-off vertical line at Q4 2025 (index 3) */}
                    <line
                      x1={getX(3)}
                      y1={padTop}
                      x2={getX(3)}
                      y2={height - padBottom}
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <text x={getX(3)} y={padTop - 5} textAnchor="middle" fill="#38bdf8" className="text-[9px] font-bold font-mono">
                      Corte Temporal (Actuals → Forecast)
                    </text>

                    {/* Outer Band 80% (P10 - P90) */}
                    <polygon points={area80} fill={fanMetric === "ebitda" ? "rgba(44, 203, 99, 0.15)" : "rgba(56, 189, 248, 0.15)"} />

                    {/* Inner Band 50% (P25 - P75) */}
                    <polygon points={area50} fill={fanMetric === "ebitda" ? "rgba(44, 203, 99, 0.3)" : "rgba(56, 189, 248, 0.3)"} />

                    {/* Median Line (P50) */}
                    <polyline
                      points={medianLine}
                      fill="none"
                      stroke={fanMetric === "ebitda" ? "#52e87c" : "#38bdf8"}
                      strokeWidth="3"
                    />

                    {/* Data Points */}
                    {trajectory.map((t: any, idx: number) => {
                      const x = getX(idx);
                      const y = getY(t.p50);
                      return (
                        <g key={t.quarter_id}>
                          <circle cx={x} cy={y} r="4" fill={t.period_type === "ACTUAL" ? "#94a3b8" : "#52e87c"} stroke="#0b1326" strokeWidth="2" />
                          <text x={x} y={height - padBottom + 18} textAnchor="middle" fill={t.period_type === "ACTUAL" ? "#94a3b8" : "#38bdf8"} className="text-[10px] font-bold font-mono">
                            {t.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block" />
                <span>Faixa de 80% Confiança (P10 - P90)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/40 inline-block" />
                <span>Faixa de 50% Confiança (P25 - P75)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 bg-emerald-400 inline-block" />
                <span className="text-white font-bold">Mediana (P50)</span>
              </div>
            </div>
          </div>

          {/* Histogram Frequency & Density Distribution */}
          <div className="p-6 rounded-3xl bg-[#131b2e] border border-[#222a3d] shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-[#222a3d]">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Histograma de Densidade de Probabilidade — EBITDA 2026 ({simulationResult.iterations} iterações)</span>
            </h3>

            {/* Histogram Bars Graphic */}
            <div className="w-full bg-[#0b1326] p-4 rounded-2xl border border-[#222a3d] overflow-x-auto">
              {(() => {
                const hist = simulationResult.histograms.ebitda;
                const maxCount = Math.max(...hist.bins.map((b: any) => b.count));
                const baseline = simulationResult.distributions.ebitda.baseline;

                return (
                  <div className="flex items-end gap-1.5 h-48 pt-4 pb-2 px-2 min-w-[600px]">
                    {hist.bins.map((b: any, idx: number) => {
                      const barHeightPct = maxCount > 0 ? (b.count / maxCount) * 100 : 0;
                      const isNearBaseline = Math.abs(b.midpoint - baseline) < hist.bin_width;

                      return (
                        <div
                          key={b.bin_index}
                          className="flex-1 flex flex-col items-center h-full justify-end group relative"
                        >
                          {/* Tooltip on hover */}
                          <div className="hidden group-hover:block absolute bottom-full mb-2 z-10 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-white whitespace-nowrap shadow-xl">
                            <span className="block font-bold">R$ {fmtNumber(b.midpoint)} M</span>
                            <span className="text-slate-400">{b.count} iterações ({(b.probability * 100).toFixed(1)}%)</span>
                            <span className="block text-sky-400 font-mono">CDF: {(b.cumulative_probability * 100).toFixed(1)}%</span>
                          </div>

                          <div
                            style={{ height: `${barHeightPct}%` }}
                            className={`w-full rounded-t-md transition-all duration-200 ${
                              isNearBaseline
                                ? "bg-sky-400 shadow-md shadow-sky-500/20"
                                : "bg-emerald-500/70 hover:bg-emerald-400"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2 pt-2 border-t border-[#222a3d]">
                <span>Min: R$ {fmtNumber(simulationResult.distributions.ebitda.min)} M</span>
                <span className="text-sky-400 font-bold">Meta/Base: R$ {fmtNumber(simulationResult.distributions.ebitda.baseline)} M</span>
                <span>Max: R$ {fmtNumber(simulationResult.distributions.ebitda.max)} M</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RISK MATRIX & COVENANTS */}
      {activeTab === "RISK" && simulationResult && (
        <div className="space-y-5">
          {/* Percentiles Table */}
          <div className="rounded-3xl bg-[#131b2e] border border-[#222a3d] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-[#222a3d]">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Matriz Completa de Percentis e Dispersão Estocástica</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono tabular-nums text-left">
                <thead>
                  <tr className="bg-[#0b1326] text-slate-400 border-b border-[#222a3d]">
                    <th className="py-2.5 px-4 font-bold text-slate-200">Métrica Financeira</th>
                    <th className="py-2.5 px-3 text-right">P1% (Pior)</th>
                    <th className="py-2.5 px-3 text-right text-rose-400 font-bold">P5% (VaR 95%)</th>
                    <th className="py-2.5 px-3 text-right">P10%</th>
                    <th className="py-2.5 px-3 text-right">P25%</th>
                    <th className="py-2.5 px-3 text-right text-sky-400 font-black">P50% (Mediana)</th>
                    <th className="py-2.5 px-3 text-right">P75%</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">P90%</th>
                    <th className="py-2.5 px-3 text-right">P99% (Melhor)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222a3d]/60 text-slate-300">
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-white">Receita Líquida (R$ M)</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.revenue.percentiles.p1)}</td>
                    <td className="py-2.5 px-3 text-right text-rose-400 font-bold">{fmtNumber(simulationResult.distributions.revenue.percentiles.p5)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.revenue.percentiles.p10)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.revenue.percentiles.p25)}</td>
                    <td className="py-2.5 px-3 text-right text-sky-400 font-black">{fmtNumber(simulationResult.distributions.revenue.percentiles.p50)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.revenue.percentiles.p75)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{fmtNumber(simulationResult.distributions.revenue.percentiles.p90)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.revenue.percentiles.p99)}</td>
                  </tr>

                  <tr className="hover:bg-emerald-950/20 font-semibold text-emerald-300 bg-emerald-950/10">
                    <td className="py-2.5 px-4 font-bold">EBITDA Operacional (R$ M)</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ebitda.percentiles.p1)}</td>
                    <td className="py-2.5 px-3 text-right text-rose-400 font-bold">{fmtNumber(simulationResult.distributions.ebitda.percentiles.p5)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ebitda.percentiles.p10)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ebitda.percentiles.p25)}</td>
                    <td className="py-2.5 px-3 text-right text-sky-400 font-black">{fmtNumber(simulationResult.distributions.ebitda.percentiles.p50)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ebitda.percentiles.p75)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{fmtNumber(simulationResult.distributions.ebitda.percentiles.p90)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ebitda.percentiles.p99)}</td>
                  </tr>

                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-white">Lucro Líquido (R$ M)</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.net_income.percentiles.p1)}</td>
                    <td className="py-2.5 px-3 text-right text-rose-400 font-bold">{fmtNumber(simulationResult.distributions.net_income.percentiles.p5)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.net_income.percentiles.p10)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.net_income.percentiles.p25)}</td>
                    <td className="py-2.5 px-3 text-right text-sky-400 font-black">{fmtNumber(simulationResult.distributions.net_income.percentiles.p50)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.net_income.percentiles.p75)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{fmtNumber(simulationResult.distributions.net_income.percentiles.p90)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.net_income.percentiles.p99)}</td>
                  </tr>

                  <tr className="hover:bg-sky-950/20 font-semibold text-sky-300 bg-sky-950/10">
                    <td className="py-2.5 px-4 font-bold">Saldo Final de Caixa (R$ M)</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ending_cash.percentiles.p1)}</td>
                    <td className="py-2.5 px-3 text-right text-rose-400 font-bold">{fmtNumber(simulationResult.distributions.ending_cash.percentiles.p5)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ending_cash.percentiles.p10)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ending_cash.percentiles.p25)}</td>
                    <td className="py-2.5 px-3 text-right text-sky-400 font-black">{fmtNumber(simulationResult.distributions.ending_cash.percentiles.p50)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ending_cash.percentiles.p75)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{fmtNumber(simulationResult.distributions.ending_cash.percentiles.p90)}</td>
                    <td className="py-2.5 px-3 text-right">{fmtNumber(simulationResult.distributions.ending_cash.percentiles.p99)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Stress Testing & Fleuriet Liquidity Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-3xl bg-[#131b2e] border border-[#222a3d] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Diagnóstico de Solvência & Covenants</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h4>
              <p className="text-xs text-slate-300">
                Alavancagem Mediana em <strong>{simulationResult.risk_metrics.median_leverage}x</strong> Dívida Líquida / EBITDA.
              </p>
              <div className="p-3 rounded-2xl bg-[#0b1326] border border-[#222a3d] flex items-center justify-between">
                <span className="text-xs text-slate-400">Probabilidade de Quebra (&gt; {covenantLimit}x)</span>
                <span className={`text-sm font-black font-mono ${
                  simulationResult.risk_metrics.prob_covenant_breach_pct > 10 ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {fmtNumber(simulationResult.risk_metrics.prob_covenant_breach_pct)}%
                </span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#131b2e] border border-[#222a3d] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Value at Risk (VaR 95% e 99%)</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#0b1326] border border-[#222a3d]">
                  <span className="text-[10px] text-slate-400 block">VaR 95% (EBITDA)</span>
                  <span className="text-base font-black text-amber-300 font-mono">
                    {fmtCurrency(simulationResult.risk_metrics.var_95_ebitda)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#0b1326] border border-[#222a3d]">
                  <span className="text-[10px] text-slate-400 block">VaR 99% (EBITDA)</span>
                  <span className="text-base font-black text-rose-300 font-mono">
                    {fmtCurrency(simulationResult.risk_metrics.var_99_ebitda)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function intToM(val: number): string {
  if (Math.abs(val) >= 1000) {
    return `${(val / 1000).toFixed(1)}k`;
  }
  return `${Math.round(val)}`;
}
