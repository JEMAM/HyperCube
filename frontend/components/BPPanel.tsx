"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  TrendingUp,
  RefreshCw,
  Download,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle,
  Sliders,
  ShieldCheck,
  Zap,
  DollarSign,
  Clock,
  Percent,
  BarChart3,
  Divide,
  Calculator,
  ChevronRight,
  BookOpen,
  Bot
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import DagViewer from "./DagViewer";
import BPAgentPanel from "./BPAgentPanel";

interface BPPanelProps {
  activeCompany?: any;
  onNavigate?: (mode: string) => void;
}

export default function BPPanel({ activeCompany, onNavigate }: BPPanelProps) {
  const { theme, language, apiBaseUrl, activeCompany: globalActiveCompany } = usePreferences();
  const effectiveCompany = activeCompany || globalActiveCompany;
  const isDark = theme === "dark";
  const isEn = language === "en";

  // Tab State
  const [activeTab, setActiveTab] = useState<"indices" | "table" | "fleuriet" | "dupont" | "dag" | "chat">("indices");

  // Data States
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [kpisData, setKpisData] = useState<any>(null);
  const [dagData, setDagData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Budget 2026");
  const [bpAgentSummary, setBpAgentSummary] = useState<string>("");

  // What-If Simulation State
  const [simNode, setSimNode] = useState<string>("contas_receber");
  const [simVariation, setSimVariation] = useState<number>(10.0);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [lastSimResult, setLastSimResult] = useState<any>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [tblRes, kpiRes, dagRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/bp/table`),
        fetch(`${apiBaseUrl}/api/bp/kpis`),
        fetch(`${apiBaseUrl}/api/bp/dag`),
      ]);

      if (tblRes.ok) {
        const tblJson = await tblRes.json();
        setTableData(tblJson.rows || []);
      }
      if (kpiRes.ok) {
        const kpiJson = await kpiRes.json();
        setKpisData(kpiJson);
        if (kpiJson.latest_period) {
          setSelectedPeriod(kpiJson.latest_period);
        }
      }
      if (dagRes.ok) {
        const dagJson = await dagRes.json();
        setDagData(dagJson);
      }
    } catch (err) {
      console.warn("Could not fetch BP data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [apiBaseUrl]);

  const handleRunWhatIf = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bp/simulate/whatif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node: simNode,
          variation_pct: simVariation,
          period: selectedPeriod,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setLastSimResult(result);
        const [tblRes, kpiRes, explainRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/bp/table`),
          fetch(`${apiBaseUrl}/api/bp/kpis`),
          fetch(`${apiBaseUrl}/api/bp/agent/explain`),
        ]);
        if (tblRes.ok) setTableData((await tblRes.json()).rows || []);
        if (kpiRes.ok) setKpisData(await kpiRes.json());
        if (explainRes.ok) setBpAgentSummary((await explainRes.json()).summary || "");
      }
    } catch (e) {
      console.error("Error executing BP simulation", e);
    } finally {
      setSimulating(false);
    }
  };

  const handleResetSimulation = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/bp/simulate/reset`, { method: "POST" });
      setLastSimResult(null);
      setSimVariation(0);
      fetchAllData();
      const explainRes = await fetch(`${apiBaseUrl}/api/bp/agent/explain`);
      if (explainRes.ok) setBpAgentSummary((await explainRes.json()).summary || "");
    } catch (e) {
      console.error("Error resetting BP simulation", e);
    }
  };

  const handleExportCSV = () => {
    if (!tableData.length) return;
    const periods = ["2024", "2025", "Budget 2026"];
    let csv = "Codigo,Conta," + periods.map(p => `${p} (Valor),${p} AV(%),${p} AH(%)`).join(",") + "\n";

    tableData.forEach(row => {
      let line = `"${row.code}","${row.name}"`;
      periods.forEach(p => {
        const pData = row.periods[p] || { value: 0, av_pct: 0, ah_pct: 0 };
        line += `,${pData.value},${pData.av_pct}%,${pData.ah_pct}%`;
      });
      csv += line + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Balanco_Patrimonial_${activeCompany?.ticker || "EMPRESA"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentKPIs = kpisData?.by_period?.[selectedPeriod] || kpisData?.summary;
  const compName = effectiveCompany?.name || kpisData?.company?.name || "Empresa Ativa";
  const compTicker = effectiveCompany?.ticker || kpisData?.company?.ticker || "EMPRESA";
  const compCurrency = effectiveCompany?.currency || "R$ Milhões";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Bar */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl transition ${
        isDark ? "bg-[#0b1329]/95 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff5722] to-[#f59e0b] flex items-center justify-center text-white shadow-md shadow-orange-950/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {isEn ? "Balance Sheet (BP) — Complete Analysis" : "Balanço Patrimonial (BP) — Análise Completa"}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isDark ? "bg-orange-500/15 text-[#ff5722] border border-orange-500/30" : "bg-orange-100 text-[#d84315] border border-orange-300"
                }`}>
                  {compTicker}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isDark ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : "bg-sky-100 text-sky-800 border border-sky-300"
                }`}>
                  IFRS / CPC 26
                </span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <strong className={isDark ? "text-slate-100" : "text-slate-900"}>{compName}</strong> • {compCurrency} • {isEn ? "Fundamental Equation: Assets = Liabilities + Equity" : "Equação Fundamental: Ativo Total = Passivo Total + Patrimônio Líquido"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Selector */}
          <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
            isDark ? "bg-[#070e1b] border-slate-700" : "bg-slate-100 border-slate-300 shadow-inner"
          }`}>
            {["2024", "2025", "Budget 2026"].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedPeriod === p
                    ? "bg-[#ff5722] text-white shadow-sm font-black"
                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-700 hover:text-slate-950 font-semibold"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              isDark ? "border-slate-700 hover:bg-slate-800 text-slate-200" : "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm"
            }`}
            title="Exportar CSV"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isEn ? "Export CSV" : "Exportar CSV"}</span>
          </button>

          <button
            onClick={handleResetSimulation}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              isDark ? "border-slate-700 hover:bg-slate-800 text-slate-200" : "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm"
            }`}
            title="Resetar Simulação"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#ff5722]" />
            <span>{isEn ? "Reset" : "Restaurar"}</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Liquidez Corrente */}
        <div className={`p-4 rounded-2xl border shadow-sm space-y-1.5 transition ${
          isDark ? "bg-[#0b1329] border-slate-800" : "bg-white border-slate-200 shadow"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {isEn ? "Current Ratio" : "Liquidez Corrente"}
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-sans">
            {currentKPIs?.liquidez?.corrente || "1.66"}x
          </p>
          <p className={`text-[11px] font-semibold leading-tight ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {isEn ? "Quick: " : "Seca: "}<span className="font-bold text-sky-600 dark:text-sky-400">{currentKPIs?.liquidez?.seca || "1.05"}x</span> • {isEn ? "Cash: " : "Imed: "}{currentKPIs?.liquidez?.imediata || "0.45"}x
          </p>
        </div>

        {/* Card 2: Fleuriet ST */}
        <div className={`p-4 rounded-2xl border shadow-sm space-y-1.5 transition ${
          isDark ? "bg-[#0b1329] border-slate-800" : "bg-white border-slate-200 shadow"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {isEn ? "Fleuriet Treasury (ST)" : "Saldo Tesouraria (ST)"}
            </span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
              isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}>
              {currentKPIs?.fleuriet?.badge || "Sólida"}
            </span>
          </div>
          <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-sans">
            R$ {Number(currentKPIs?.fleuriet?.st || 4600).toLocaleString("pt-BR")} M
          </p>
          <p className={`text-[11px] font-medium leading-tight ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {isEn ? "CDG covers NCG with cash surplus" : "CDG cobre a NCG com sobra"}
          </p>
        </div>

        {/* Card 3: NCG */}
        <div className={`p-4 rounded-2xl border shadow-sm space-y-1.5 transition ${
          isDark ? "bg-[#0b1329] border-slate-800" : "bg-white border-slate-200 shadow"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {isEn ? "Working Capital Need" : "Necess. Giro (NCG)"}
            </span>
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-black tracking-tight text-sky-600 dark:text-sky-400 font-sans">
            R$ {Number(currentKPIs?.fleuriet?.ncg || 3250).toLocaleString("pt-BR")} M
          </p>
          <p className={`text-[11px] font-medium leading-tight ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            ACO (R$ {Number(currentKPIs?.fleuriet?.aco || 13910).toLocaleString("pt-BR")}) - PCO
          </p>
        </div>

        {/* Card 4: Endividamento Geral */}
        <div className={`p-4 rounded-2xl border shadow-sm space-y-1.5 transition ${
          isDark ? "bg-[#0b1329] border-slate-800" : "bg-white border-slate-200 shadow"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {isEn ? "Indebtedness" : "Endividamento Geral"}
            </span>
            <ShieldCheck className="w-4 h-4 text-[#ff5722]" />
          </div>
          <p className={`text-2xl font-black tracking-tight font-sans ${isDark ? "text-white" : "text-slate-900"}`}>
            {currentKPIs?.endividamento?.geral_pct || "51.8"}%
          </p>
          <p className={`text-[11px] font-medium leading-tight ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            CP: <strong>{currentKPIs?.endividamento?.composicao_curto_prazo_pct || "22.4"}%</strong> • LP: <strong>{currentKPIs?.endividamento?.composicao_longo_prazo_pct || "77.6"}%</strong>
          </p>
        </div>

        {/* Card 5: Dupont ROE */}
        <div className={`p-4 rounded-2xl border shadow-sm space-y-1.5 transition ${
          isDark ? "bg-[#0b1329] border-slate-800" : "bg-white border-slate-200 shadow"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {isEn ? "Dupont ROE" : "ROE (Dupont)"}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-sans">
            {currentKPIs?.dupont_rentabilidade?.roe || "21.69"}%
          </p>
          <p className={`text-[11px] font-medium leading-tight ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            ROA: <strong>{currentKPIs?.dupont_rentabilidade?.roa || "11.16"}%</strong> • ROIC: <strong>{currentKPIs?.dupont_rentabilidade?.roic || "14.2"}%</strong>
          </p>
        </div>

        {/* Card 6: Ciclo Financeiro */}
        <div className={`p-4 rounded-2xl border shadow-sm space-y-1.5 transition ${
          isDark ? "bg-[#0b1329] border-slate-800" : "bg-white border-slate-200 shadow"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {isEn ? "Cash Cycle" : "Ciclo Financeiro"}
            </span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400 font-sans">
            {currentKPIs?.atividade?.ciclo_financeiro_dias || "56.2"} d
          </p>
          <p className={`text-[11px] font-medium leading-tight ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            PME {currentKPIs?.atividade?.pme_dias || "83"}d + PMR {currentKPIs?.atividade?.pmr_dias || "43"}d - PMP
          </p>
        </div>
      </div>

      {/* 3. Reactive What-If Simulation Strip */}
      <div className={`p-5 rounded-3xl border shadow-xl backdrop-blur-xl transition ${
        isDark ? "bg-[#081024] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#ff5722]" />
              <h3 className={`text-sm font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {isEn ? "Reactive Balance Sheet What-If Simulator" : "Simulador What-If Reativo de Balanço Patrimonial"}
              </h3>
              {lastSimResult && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                  isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}>
                  <Zap className="w-3.5 h-3.5" />
                  {lastSimResult.elapsed_ms} ms • {lastSimResult.affected_nodes_count} {isEn ? "nodes recalculated" : "nós recalculados"}
                </span>
              )}
            </div>
            <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {isEn
                ? "Apply percentage shocks to working capital, debts or inventories and watch instantaneous topological DAG propagation."
                : "Aplique choques percentuais em contas a receber, estoques ou dívidas e veja o recálculo em cascata na liquidez e NCG."}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap w-full lg:w-auto">
            {/* Target Account */}
            <div className="flex flex-col gap-1 min-w-[270px]">
              <label className={`text-[11px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {isEn ? "Balance Sheet Account" : "Conta Patrimonial"}
              </label>
              <select
                value={simNode}
                onChange={(e) => setSimNode(e.target.value)}
                className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#ff5722] cursor-pointer w-full ${
                  isDark ? "bg-[#050b18] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900 shadow-sm"
                }`}
              >
                <optgroup label={isEn ? "Current Assets (AC)" : "Ativo Circulante (AC)"}>
                  <option value="contas_receber">{isEn ? "Accounts Receivable (Receivables)" : "Contas a Receber (Clientes)"}</option>
                  <option value="estoques">{isEn ? "Inventories" : "Estoques"}</option>
                  <option value="caixa_equivalentes">{isEn ? "Cash & Equivalents" : "Caixa e Equivalentes"}</option>
                  <option value="aplicacoes_financeiras">{isEn ? "Short-Term Investments" : "Aplicações Financeiras CP"}</option>
                  <option value="outros_ativos_circulantes">{isEn ? "Other Current Assets" : "Outros Ativos Circulantes"}</option>
                </optgroup>
                <optgroup label={isEn ? "Non-Current Assets (ANC)" : "Ativo Não Circulante (ANC)"}>
                  <option value="imobilizado_liquido">{isEn ? "Net Fixed Assets (Capex)" : "Imobilizado Líquido (Capex)"}</option>
                  <option value="intangivel_liquido">{isEn ? "Intangibles / Patents" : "Intangível Líquido"}</option>
                  <option value="realizavel_longo_prazo">{isEn ? "Long-Term Receivables (RLP)" : "Realizável a Longo Prazo"}</option>
                  <option value="investimentos">{isEn ? "Investments in Affiliates" : "Investimentos Permanentes"}</option>
                </optgroup>
                <optgroup label={isEn ? "Current Liabilities (PC)" : "Passivo Circulante (PC)"}>
                  <option value="fornecedores">{isEn ? "Suppliers" : "Fornecedores a Pagar"}</option>
                  <option value="emprestimos_curto_prazo">{isEn ? "Short-Term Bank Debt" : "Empréstimos CP (Dívida Bancária CP)"}</option>
                  <option value="obrigacoes_fiscais_sociais">{isEn ? "Taxes & Labor Obligations" : "Obrigações Sociais e Fiscais"}</option>
                  <option value="outros_passivos_circulantes">{isEn ? "Other Current Liabilities" : "Outros Passivos Circulantes"}</option>
                </optgroup>
                <optgroup label={isEn ? "Non-Current Liabilities (PNC)" : "Passivo Não Circulante (PNC)"}>
                  <option value="emprestimos_longo_prazo">{isEn ? "Long-Term Bank Debt" : "Empréstimos LP (Financiamentos LP)"}</option>
                  <option value="provisoes_contingencias">{isEn ? "Provisions & Contingencies" : "Provisões e Contingências"}</option>
                  <option value="outros_passivos_nao_circulantes">{isEn ? "Other Long-Term Liabilities" : "Outros Passivos LP"}</option>
                </optgroup>
                <optgroup label={isEn ? "Shareholders' Equity (PL)" : "Patrimônio Líquido (PL)"}>
                  <option value="capital_social">{isEn ? "Paid-in Capital" : "Capital Social Realizado"}</option>
                  <option value="reservas_capital_lucros">{isEn ? "Capital & Profit Reserves" : "Reservas de Capital e Lucros"}</option>
                  <option value="lucros_prejuizos_acumulados">{isEn ? "Retained Earnings / Losses" : "Lucros / Prejuízos Acumulados"}</option>
                </optgroup>
              </select>
            </div>

            {/* Slider */}
            <div className="space-y-1 min-w-[200px]">
              <div className="flex justify-between text-[11px] font-bold">
                <span className={isDark ? "text-slate-300" : "text-slate-700"}>{isEn ? "Shock Variation" : "Variação do Choque"}</span>
                <span className={simVariation >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-[#d84315] dark:text-[#ff5722]"}>
                  {simVariation > 0 ? `+${simVariation}%` : `${simVariation}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={simVariation}
                onChange={(e) => setSimVariation(Number(e.target.value))}
                className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#ff5722]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2 pt-4 lg:pt-0">
              <button
                onClick={handleRunWhatIf}
                disabled={simulating}
                className="px-4 py-2 rounded-xl bg-[#ff5722] hover:bg-[#e04515] active:scale-95 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-orange-950/30 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{simulating ? (isEn ? "Calculating..." : "Calculando...") : (isEn ? "Simulate Shock" : "Simular Choque")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Balance Sheet AI Agent Chat Panel (Skill: analise-balanco-patrimonial) */}
      <BPAgentPanel
        summary={bpAgentSummary}
        onRefreshSummary={async () => {
          const res = await fetch(`${apiBaseUrl}/api/bp/agent/explain`);
          if (res.ok) {
            const d = await res.json();
            setBpAgentSummary(d.summary || "");
          }
        }}
      />

      {/* 5. Sub-Navigation Tabs */}
      <div className={`flex items-center gap-2 border-b pb-2 flex-wrap ${isDark ? "border-slate-800" : "border-slate-300"}`}>
        <button
          onClick={() => setActiveTab("indices")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === "indices"
              ? "bg-[#ff5722] text-white shadow-md"
              : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/60"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{isEn ? "1. Complete Financial Ratios (8 Groups)" : "1. Painel Completo de Índices (8 Grupos)"}</span>
        </button>

        <button
          onClick={() => setActiveTab("table")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === "table"
              ? "bg-[#ff5722] text-white shadow-md"
              : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/60"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isEn ? "2. Balance Sheet Table (AV / AH)" : "2. Tabela do BP (AV / AH)"}</span>
        </button>

        <button
          onClick={() => setActiveTab("fleuriet")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === "fleuriet"
              ? "bg-[#ff5722] text-white shadow-md"
              : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/60"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>{isEn ? "3. Fleuriet Working Capital Model" : "3. Modelo Fleuriet (Capital de Giro)"}</span>
        </button>

        <button
          onClick={() => setActiveTab("dupont")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === "dupont"
              ? "bg-[#ff5722] text-white shadow-md"
              : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/60"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{isEn ? "4. Dupont & Activity Cycles" : "4. Decomposição Dupont & Ciclos"}</span>
        </button>

        <button
          onClick={() => setActiveTab("dag")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === "dag"
              ? "bg-[#ff5722] text-white shadow-md"
              : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/60"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isEn ? "5. Balance Sheet DAG Tree" : "5. Grafo DAG Patrimonial"}</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === "chat"
              ? "bg-[#ff5722] text-white shadow-md"
              : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/60"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>{isEn ? "6. BP AI Agent Chat" : "6. Chat Agente IA (analise-balanco-patrimonial)"}</span>
        </button>
      </div>

      {/* 5. TAB 1: Complete 8 Financial Groups Dashboard (User Explicit Request) */}
      {activeTab === "indices" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* GROUP 1: LIQUIDEZ */}
            <div className={`p-5 rounded-3xl border shadow-lg space-y-3 transition ${
              isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                    1. Índices de Liquidez
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  Curto & Longo Prazo
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Liquidez Corrente</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Ativo Circ. / Passivo Circ.</p>
                  </div>
                  <span className="text-base font-black font-sans text-emerald-600 dark:text-emerald-400">
                    {currentKPIs?.liquidez?.corrente}x
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Liquidez Seca</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"} `}>(Ativo Circ. - Estoques) / PC</p>
                  </div>
                  <span className="text-base font-black font-sans text-sky-600 dark:text-sky-400">
                    {currentKPIs?.liquidez?.seca}x
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Liquidez Imediata</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Disponibilidades / PC</p>
                  </div>
                  <span className="text-base font-black font-sans text-amber-600 dark:text-amber-400">
                    {currentKPIs?.liquidez?.imediata}x
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Liquidez Geral</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>(AC + RLP) / (PC + ELP)</p>
                  </div>
                  <span className={`text-base font-black font-sans ${isDark ? "text-purple-400" : "text-purple-700"}`}>
                    {currentKPIs?.liquidez?.geral}x
                  </span>
                </div>
              </div>
            </div>

            {/* GROUP 2: ENDIVIDAMENTO E ESTRUTURA DE CAPITAL */}
            <div className={`p-5 rounded-3xl border shadow-lg space-y-3 transition ${
              isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5722]" />
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-[#ff5722]" : "text-[#d84315]"}`}>
                    2. Estrutura de Capital
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-400">
                  Endividamento
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Endividamento Geral</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>(PC + PNC) / Ativo Total</p>
                  </div>
                  <span className="text-base font-black font-sans text-[#d84315] dark:text-[#ff5722]">
                    {currentKPIs?.endividamento?.geral_pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Composição Dívida CP</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>PC / Passivo Total</p>
                  </div>
                  <span className="text-base font-black font-sans text-sky-600 dark:text-sky-400">
                    {currentKPIs?.endividamento?.composicao_curto_prazo_pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Debt-to-Equity</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Passivo Total / PL</p>
                  </div>
                  <span className="text-base font-black font-sans text-purple-600 dark:text-purple-400">
                    {currentKPIs?.endividamento?.debt_to_equity}x
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Imobilização do PL</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Ativo Permanente / PL</p>
                  </div>
                  <span className="text-sm font-black font-sans text-amber-600 dark:text-amber-400">
                    {currentKPIs?.endividamento?.imobilizacao_pl_pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Imob. Recursos NC</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Perm. / (PL + PNC)</p>
                  </div>
                  <span className="text-sm font-black font-sans text-emerald-600 dark:text-emerald-400">
                    {currentKPIs?.endividamento?.imobilizacao_recursos_nc_pct}%
                  </span>
                </div>
              </div>
            </div>

            {/* GROUP 3: RENTABILIDADE */}
            <div className={`p-5 rounded-3xl border shadow-lg space-y-3 transition ${
              isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-purple-400" : "text-purple-800"}`}>
                    3. Índices de Rentabilidade
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-400">
                  Margens & Retorno
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Margem Bruta</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Lucro Bruto / Receita</p>
                  </div>
                  <span className="text-base font-black font-sans text-emerald-600 dark:text-emerald-400">
                    {currentKPIs?.dupont_rentabilidade?.margem_bruta_pct || "44.0"}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Margem EBIT / Operacional</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>EBIT / Receita</p>
                  </div>
                  <span className="text-base font-black font-sans text-sky-600 dark:text-sky-400">
                    {currentKPIs?.dupont_rentabilidade?.margem_ebit_pct || "31.0"}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Margem Líquida</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Lucro Líquido / Receita</p>
                  </div>
                  <span className="text-base font-black font-sans text-emerald-600 dark:text-emerald-400">
                    {currentKPIs?.dupont_rentabilidade?.margem_liquida_pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>ROA (Return on Assets)</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Lucro Líq. / Ativo Total</p>
                  </div>
                  <span className="text-base font-black font-sans text-amber-600 dark:text-amber-400">
                    {currentKPIs?.dupont_rentabilidade?.roa}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>ROI / ROIC</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>EBIT(1-IR) / Invested Cap.</p>
                  </div>
                  <span className="text-base font-black font-sans text-purple-600 dark:text-purple-400">
                    {currentKPIs?.dupont_rentabilidade?.roic}%
                  </span>
                </div>
              </div>
            </div>

            {/* GROUP 4: ATIVIDADE E EFICIÊNCIA */}
            <div className={`p-5 rounded-3xl border shadow-lg space-y-3 transition ${
              isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-amber-400" : "text-amber-800"}`}>
                    4. Atividade & Prazos
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  Dias & Giro
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>PME — Estocagem</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>(Estoques / CMV) × 360</p>
                  </div>
                  <span className="text-base font-black font-sans text-amber-600 dark:text-amber-400">
                    {currentKPIs?.atividade?.pme_dias} d
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Giro de Estoque</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>CMV / Estoques</p>
                  </div>
                  <span className="text-base font-black font-sans text-sky-600 dark:text-sky-400">
                    {currentKPIs?.atividade?.giro_estoque || "4.32"}x
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>PMR — Recebimento</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>(Clientes / Receita) × 360</p>
                  </div>
                  <span className="text-base font-black font-sans text-sky-600 dark:text-sky-400">
                    {currentKPIs?.atividade?.pmr_dias} d
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>PMP — Pagamento</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>(Fornec. / Compras) × 360</p>
                  </div>
                  <span className="text-base font-black font-sans text-emerald-600 dark:text-emerald-400">
                    {currentKPIs?.atividade?.pmp_dias} d
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Ciclo Operacional</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>PME + PMR</p>
                  </div>
                  <span className={`text-sm font-black font-sans ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                    {currentKPIs?.atividade?.ciclo_operacional_dias} d
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECOND ROW OF GROUPS: 5 to 8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* GROUP 5: CAPITAL DE GIRO FLEURIET */}
            <div className={`p-5 rounded-3xl border shadow-lg space-y-3 transition ${
              isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                    5. Modelo Fleuriet
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  {currentKPIs?.fleuriet?.badge || "Sólida"}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Necess. Giro (NCG)</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>ACO − PCO</p>
                  </div>
                  <span className="text-base font-black font-sans text-sky-600 dark:text-sky-400">
                    R$ {Number(currentKPIs?.fleuriet?.ncg).toLocaleString("pt-BR")} M
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Capital de Giro (CDG)</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>PNC − ANC (Recursos LP)</p>
                  </div>
                  <span className="text-base font-black font-sans text-purple-600 dark:text-purple-400">
                    R$ {Number(currentKPIs?.fleuriet?.cdg).toLocaleString("pt-BR")} M
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Saldo Tesouraria (ST)</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>CDG − NCG = ACF − PCF</p>
                  </div>
                  <span className="text-base font-black font-sans text-emerald-600 dark:text-emerald-400">
                    R$ {Number(currentKPIs?.fleuriet?.st).toLocaleString("pt-BR")} M
                  </span>
                </div>
              </div>
            </div>

            {/* GROUP 6: ANÁLISE DUPONT */}
            <div className={`p-5 rounded-3xl border shadow-lg space-y-3 transition ${
              isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-purple-400" : "text-purple-800"}`}>
                    6. Decomposição Dupont
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-400">
                  ROE 3 Fatores
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>1. Margem Líquida</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Lucro Líq. / Receita</p>
                  </div>
                  <span className="text-base font-black font-sans text-sky-600 dark:text-sky-400">
                    {currentKPIs?.dupont_rentabilidade?.margem_liquida_pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>2. Giro do Ativo</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Receita / Ativo Total</p>
                  </div>
                  <span className="text-base font-black font-sans text-amber-600 dark:text-amber-400">
                    {currentKPIs?.dupont_rentabilidade?.giro_ativo}x
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>3. Alavancagem Fin.</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Ativo Total / PL</p>
                  </div>
                  <span className="text-base font-black font-sans text-purple-600 dark:text-purple-400">
                    {currentKPIs?.dupont_rentabilidade?.alavancagem_financeira}x
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isDark ? "bg-[#070e1b] border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800 font-black"
                }`}>
                  <span className="text-[11px] font-bold">ROE Resultante</span>
                  <span className="text-base font-black font-sans">{currentKPIs?.dupont_rentabilidade?.roe}%</span>
                </div>
              </div>
            </div>

            {/* GROUP 7: COBERTURA DE DÍVIDA E EBITDA */}
            <div className={`p-5 rounded-3xl border shadow-lg space-y-3 transition ${
              isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-sky-400" : "text-sky-800"}`}>
                    7. Cobertura & EBITDA
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-400">
                  Solvência Operacional
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>EBITDA Gerado</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>EBIT + Depreciação</p>
                  </div>
                  <span className="text-base font-black font-sans text-emerald-600 dark:text-emerald-400">
                    R$ {Number(currentKPIs?.cobertura_ebitda?.ebitda || 20150).toLocaleString("pt-BR")} M
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Dívida Líquida / EBITDA</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>(Dívida - Caixa) / EBITDA</p>
                  </div>
                  <span className="text-base font-black font-sans text-sky-600 dark:text-sky-400">
                    {currentKPIs?.cobertura_ebitda?.divida_liquida_ebitda}x
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Cobertura de Juros</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>EBIT / Despesas Fin.</p>
                  </div>
                  <span className="text-base font-black font-sans text-amber-600 dark:text-amber-400">
                    {currentKPIs?.cobertura_ebitda?.cobertura_juros || "7.18"}x
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Dívida Bruta Total</p>
                    <p className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>Empréstimos CP + LP</p>
                  </div>
                  <span className={`text-sm font-black font-sans ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                    R$ {Number(currentKPIs?.endividamento?.divida_bruta || 21900).toLocaleString("pt-BR")} M
                  </span>
                </div>
              </div>
            </div>

            {/* GROUP 8: ANÁLISE VERTICAL E HORIZONTAL */}
            <div className={`p-5 rounded-3xl border shadow-lg space-y-3 transition ${
              isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-blue-400" : "text-blue-800"}`}>
                    8. Análise AV / AH
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-400">
                  Estrutura & Evolução
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="space-y-1 p-2 rounded-xl bg-slate-100 dark:bg-[#070e1b] border border-slate-200 dark:border-slate-800">
                  <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Análise Vertical (AV)</p>
                  <p className={`text-[10.5px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    AV = (Conta / Ativo Total) × 100
                  </p>
                  <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Mede o peso estrutural de cada ativo ou exigível.
                  </p>
                </div>

                <div className="space-y-1 p-2 rounded-xl bg-slate-100 dark:bg-[#070e1b] border border-slate-200 dark:border-slate-800">
                  <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Análise Horizontal (AH)</p>
                  <p className={`text-[10.5px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    AH = [(Atual / Base) − 1] × 100
                  </p>
                  <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Mede o ritmo de crescimento temporal vs base 2024.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 2: Structured Balance Sheet Table (AV / AH) */}
      {activeTab === "table" && (
        <div className={`rounded-3xl border shadow-xl overflow-hidden backdrop-blur-xl transition ${
          isDark ? "bg-[#0b1329]/95 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-200 bg-slate-50"}`}>
            <div>
              <h3 className={`text-sm font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {isEn ? "Official Statement of Financial Position (Balance Sheet)" : "Balanço Patrimonial Consolidado (CPC 26 / IFRS)"}
              </h3>
              <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                AV = {isEn ? "Vertical Analysis (% of Total Assets)" : "Análise Vertical (% do Ativo Total)"} • AH = {isEn ? "Horizontal Analysis (% vs 2024 Base)" : "Análise Horizontal (% vs Base 2024)"}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
              isDark ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-sky-100 text-sky-800 border-sky-300 font-black"
            }`}>
              {compCurrency}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? "border-slate-800 bg-[#070e1b]" : "border-slate-300 bg-slate-100 text-slate-900 font-black"}`}>
                  <th className="py-3 px-4 font-black w-24">Código</th>
                  <th className="py-3 px-4 font-black min-w-[260px]">Conta Contábil</th>
                  {["2024", "2025", "Budget 2026"].map(p => (
                    <th key={p} colSpan={3} className={`py-3 px-4 font-black text-center border-l ${isDark ? "border-slate-800" : "border-slate-300"}`}>
                      {p}
                    </th>
                  ))}
                </tr>
                <tr className={`border-b text-[10.5px] ${isDark ? "border-slate-800/80 bg-[#050b18] text-slate-300" : "border-slate-300 bg-slate-200/80 text-slate-800 font-bold"}`}>
                  <th className="py-1 px-4"></th>
                  <th className="py-1 px-4"></th>
                  {["2024", "2025", "Budget 2026"].map(p => (
                    <React.Fragment key={`${p}-sub`}>
                      <th className={`py-1.5 px-2 text-right border-l font-bold ${isDark ? "border-slate-800 text-slate-300" : "border-slate-300 text-slate-800"}`}>Valor</th>
                      <th className="py-1.5 px-2 text-right font-bold">AV (%)</th>
                      <th className="py-1.5 px-2 text-right font-bold">AH (%)</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-200"}`}>
                {tableData.map((row) => {
                  const isTopHeader = row.level === 0;
                  const isSubHeader = row.level === 1;

                  return (
                    <tr
                      key={row.id}
                      className={`transition ${
                        isTopHeader
                          ? isDark ? "bg-[#0e1b38] font-black text-white" : "bg-slate-200/90 font-black text-slate-950"
                          : isSubHeader
                          ? isDark ? "bg-[#09152b] font-bold text-sky-200" : "bg-sky-50/80 font-black text-sky-950"
                          : isDark ? "hover:bg-slate-800/40 text-slate-200" : "hover:bg-slate-50 text-slate-900 font-semibold"
                      }`}
                    >
                      <td className={`py-2.5 px-4 font-mono font-bold ${
                        isTopHeader ? "text-[#ff5722]" : isSubHeader ? "text-sky-600 dark:text-sky-400 font-bold" : isDark ? "text-slate-400" : "text-slate-700"
                      }`}>
                        {row.code}
                      </td>
                      <td className="py-2.5 px-4" style={{ paddingLeft: `${row.level * 16 + 16}px` }}>
                        <span className={isTopHeader ? "text-sm font-black" : isSubHeader ? "font-bold" : ""}>{row.name}</span>
                      </td>

                      {["2024", "2025", "Budget 2026"].map(p => {
                        const pData = row.periods[p] || { value: 0, av_pct: 0, ah_pct: 0 };
                        return (
                          <React.Fragment key={`${row.id}-${p}`}>
                            <td className={`py-2.5 px-2 text-right font-mono font-bold border-l ${
                              isDark ? "border-slate-800 text-white" : "border-slate-300 text-slate-950"
                            }`}>
                              {Number(pData.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`py-2.5 px-2 text-right font-mono text-[11px] font-bold ${
                              isTopHeader
                                ? isDark ? "text-white" : "text-slate-900"
                                : isDark ? "text-slate-300" : "text-slate-700"
                            }`}>
                              {pData.av_pct.toFixed(1)}%
                            </td>
                            <td className={`py-2.5 px-2 text-right font-mono text-[11px] font-black ${
                              pData.ah_pct > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : pData.ah_pct < 0
                                ? "text-[#d84315] dark:text-[#ff5722]"
                                : isDark ? "text-slate-400" : "text-slate-600"
                            }`}>
                              {p === "2024" ? "-" : `${pData.ah_pct > 0 ? "+" : ""}${pData.ah_pct.toFixed(1)}%`}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 3: Fleuriet Working Capital Model */}
      {activeTab === "fleuriet" && (
        <div className="space-y-6">
          {/* Executive Diagnosis Banner */}
          <div className={`p-6 rounded-3xl border shadow-xl flex items-start gap-4 ${
            isDark ? "bg-[#0b1329] border-emerald-500/30 text-white" : "bg-emerald-50 border-emerald-300 text-slate-900 shadow-md"
          }`}>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-base font-black tracking-tight ${isDark ? "text-emerald-400" : "text-emerald-900"}`}>
                  {isEn ? "Fleuriet Classification: SÓLIDA" : "Classificação Fleuriet: ESTRUTURA SÓLIDA"}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-200 text-emerald-900 font-bold"
                }`}>
                  CDG {">"} NCG • ST {">"} 0
                </span>
              </div>
              <p className={`text-xs leading-relaxed font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {isEn
                  ? "The company's long-term capital surplus (CDG) completely finances its operating working capital needs (NCG), leaving a comfortable positive cash treasury balance (ST). There is no dependence on expensive short-term bank debt to sustain operations."
                  : "A empresa possui Capital de Giro (CDG) de longo prazo superior à Necessidade de Capital de Giro (NCG), gerando folga de tesouraria (ST positivo). A operação não depende de endividamento bancário de curto prazo (efeito tesoura) para se sustentar."}
              </p>
            </div>
          </div>

          {/* Fleuriet Triple Dimension Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dimension 1: NCG */}
            <div className={`p-5 rounded-3xl border shadow-xl space-y-3 ${
              isDark ? "bg-[#081024] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-sky-400" : "text-sky-800"}`}>
                  {isEn ? "Operating Need (NCG)" : "1. Necessidade de Capital de Giro (NCG)"}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-400">
                  ACO − PCO
                </span>
              </div>
              <p className="text-3xl font-black text-sky-600 dark:text-sky-400 font-sans">
                R$ {Number(currentKPIs?.fleuriet?.ncg || 3250).toLocaleString("pt-BR")} M
              </p>
              <div className={`space-y-1.5 text-xs border-t pt-2.5 font-medium ${isDark ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-800"}`}>
                <div className="flex justify-between">
                  <span>Ativo Circulante Operacional (ACO):</span>
                  <strong className={isDark ? "text-white" : "text-slate-950"}>R$ {Number(currentKPIs?.fleuriet?.aco || 13910).toLocaleString("pt-BR")} M</strong>
                </div>
                <div className="flex justify-between">
                  <span>Passivo Circulante Operacional (PCO):</span>
                  <strong className={isDark ? "text-white" : "text-slate-950"}>R$ {Number(currentKPIs?.fleuriet?.pco || 10660).toLocaleString("pt-BR")} M</strong>
                </div>
              </div>
            </div>

            {/* Dimension 2: CDG */}
            <div className={`p-5 rounded-3xl border shadow-xl space-y-3 ${
              isDark ? "bg-[#081024] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-purple-400" : "text-purple-800"}`}>
                  {isEn ? "Long-Term Working Capital (CDG)" : "2. Capital de Giro de LP (CDG)"}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-400">
                  PNC − ANC
                </span>
              </div>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 font-sans">
                R$ {Number(currentKPIs?.fleuriet?.cdg || 7850).toLocaleString("pt-BR")} M
              </p>
              <div className={`space-y-1.5 text-xs border-t pt-2.5 font-medium ${isDark ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-800"}`}>
                <div className="flex justify-between">
                  <span>Recursos Não Correntes (PL + ELP):</span>
                  <strong className={isDark ? "text-white" : "text-slate-950"}>R$ {Number(currentKPIs?.fleuriet?.pnc || 84450).toLocaleString("pt-BR")} M</strong>
                </div>
                <div className="flex justify-between">
                  <span>Ativo Permanente / Não Circulante (ANC):</span>
                  <strong className={isDark ? "text-white" : "text-slate-950"}>R$ {Number(currentKPIs?.fleuriet?.anc || 76600).toLocaleString("pt-BR")} M</strong>
                </div>
              </div>
            </div>

            {/* Dimension 3: ST */}
            <div className={`p-5 rounded-3xl border shadow-xl space-y-3 ${
              isDark ? "bg-[#081024] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                  {isEn ? "Treasury Balance (ST)" : "3. Saldo de Tesouraria (ST)"}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  CDG − NCG
                </span>
              </div>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
                R$ {Number(currentKPIs?.fleuriet?.st || 4600).toLocaleString("pt-BR")} M
              </p>
              <div className={`space-y-1.5 text-xs border-t pt-2.5 font-medium ${isDark ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-800"}`}>
                <div className="flex justify-between">
                  <span>Ativo Circulante Financeiro (ACF):</span>
                  <strong className={isDark ? "text-white" : "text-slate-950"}>R$ {Number(currentKPIs?.fleuriet?.acf || 6700).toLocaleString("pt-BR")} M</strong>
                </div>
                <div className="flex justify-between">
                  <span>Passivo Circulante Financeiro (PCF):</span>
                  <strong className={isDark ? "text-white" : "text-slate-950"}>R$ {Number(currentKPIs?.fleuriet?.pcf || 2100).toLocaleString("pt-BR")} M</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 4: Dupont Analysis & Activity Cycles */}
      {activeTab === "dupont" && (
        <div className="space-y-6">
          {/* Dupont 3-Factor Formula Card */}
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
          }`}>
            <div>
              <h3 className={`text-base font-black tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                <TrendingUp className="w-5 h-5 text-[#ff5722]" />
                <span>{isEn ? "Dupont 3-Factor ROE Decomposition" : "Decomposição Dupont do ROE em 3 Fatores"}</span>
              </h3>
              <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                ROE = {isEn ? "Net Margin (Profitability) × Asset Turnover (Efficiency) × Financial Leverage Multiplier (Capital Structure)" : "Margem Líquida (Lucratividade) × Giro do Ativo (Eficiência) × Alavancagem Financeira (Estrutura de Capital)"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
              {/* Factor 1: Margem Líquida */}
              <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                isDark ? "bg-[#070e1b] border-slate-800" : "bg-slate-50 border-slate-300 shadow-sm"
              }`}>
                <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}>1. Margem Líquida</span>
                <p className="text-2xl font-black text-sky-600 dark:text-sky-400 font-sans">
                  {currentKPIs?.dupont_rentabilidade?.margem_liquida_pct || "21.61"}%
                </p>
                <p className={`text-[10.5px] font-mono font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>Lucro Líquido / Receita</p>
              </div>

              {/* Multiplier Icon 1 */}
              <div className={`flex justify-center text-2xl font-black ${isDark ? "text-slate-400" : "text-slate-500"}`}>×</div>

              {/* Factor 2: Giro do Ativo */}
              <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                isDark ? "bg-[#070e1b] border-slate-800" : "bg-slate-50 border-slate-300 shadow-sm"
              }`}>
                <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}>2. Giro do Ativo</span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-sans">
                  {currentKPIs?.dupont_rentabilidade?.giro_ativo || "0.52"}x
                </p>
                <p className={`text-[10.5px] font-mono font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>Receita / Ativo Total</p>
              </div>

              {/* Multiplier Icon 2 */}
              <div className={`flex justify-center text-2xl font-black ${isDark ? "text-slate-400" : "text-slate-500"}`}>×</div>

              {/* Factor 3: Alavancagem */}
              <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                isDark ? "bg-[#070e1b] border-slate-800" : "bg-slate-50 border-slate-300 shadow-sm"
              }`}>
                <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}>3. Alavancagem</span>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-sans">
                  {currentKPIs?.dupont_rentabilidade?.alavancagem_financeira || "1.94"}x
                </p>
                <p className={`text-[10.5px] font-mono font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>Ativo Total / PL</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? "bg-[#050b18] border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-900"
            }`}>
              <span className="text-xs font-bold">{isEn ? "Resulting Return on Equity (ROE):" : "Retorno sobre o Patrimônio Líquido (ROE Resultante):"}</span>
              <span className="text-2xl font-black font-sans">{currentKPIs?.dupont_rentabilidade?.roe || "21.69"}%</span>
            </div>
          </div>

          {/* Activity / Days Rulers */}
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
          }`}>
            <div>
              <h3 className={`text-base font-black tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                <Clock className="w-5 h-5 text-amber-500" />
                <span>{isEn ? "Operating & Cash Conversion Cycles (Days)" : "Prazos Médios e Ciclo de Caixa (dias)"}</span>
              </h3>
              <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {isEn ? "Time elapsed from raw material purchase to final customer cash collection." : "Tempo decorrido da compra de insumos até o recebimento financeiro das vendas."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#070e1b] border-slate-800" : "bg-slate-50 border-slate-300"}`}>
                <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}>PME (Estocagem)</span>
                <p className={`text-2xl font-black font-sans ${isDark ? "text-white" : "text-slate-900"}`}>{currentKPIs?.atividade?.pme_dias || "83.2"} dias</p>
                <p className={`text-[10.5px] font-medium mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Tempo médio do produto em estoque</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#070e1b] border-slate-800" : "bg-slate-50 border-slate-300"}`}>
                <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}>PMR (Recebimento)</span>
                <p className="text-2xl font-black text-sky-600 dark:text-sky-400 font-sans">{currentKPIs?.atividade?.pmr_dias || "43.2"} dias</p>
                <p className={`text-[10.5px] font-medium mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Prazo concedido aos clientes</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#070e1b] border-slate-800" : "bg-slate-50 border-slate-300"}`}>
                <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}>PMP (Pagamento)</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">{currentKPIs?.atividade?.pmp_dias || "70.3"} dias</p>
                <p className={`text-[10.5px] font-medium mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Prazo obtido com fornecedores</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB 5: Balance Sheet DAG Tree */}
      {activeTab === "dag" && (
        <div className="space-y-6">
          <div className="h-[680px] w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            <DagViewer viewMode="BP" companyName={compName} />
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
          }`}>
            <div>
              <h3 className={`text-base font-black tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                <Scale className="w-5 h-5 text-[#ff5722]" />
                <span>{isEn ? "Balance Sheet Topological Architecture Reference" : "Arquitetura e Agrupamentos Topológicos do BP"}</span>
              </h3>
              <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {isEn ? "Directed Acyclic Graph ensuring instantaneous mathematical consistency across assets, liabilities, and equity." : "Grafo direcionado acíclico garantindo consistência matemática e propagação instantânea entre Ativo, Passivo e PL."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ativo Nodes */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-[#081024] border-sky-500/30" : "bg-sky-50 border-sky-300"}`}>
                <h4 className="text-xs font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider">1. Nós do Ativo</h4>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center justify-between p-2 rounded-xl bg-sky-500/10 font-black text-sky-800 dark:text-sky-300">
                    <span>1. ATIVO TOTAL</span>
                    <span className="text-[10.5px] font-mono font-bold">1.1 + 1.2</span>
                  </li>
                  <li className={`flex items-center justify-between p-1.5 pl-4 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <span>1.1 Ativo Circulante</span>
                    <span className="text-[10px] font-mono">Caixa + Clientes + Estoque</span>
                  </li>
                  <li className={`flex items-center justify-between p-1.5 pl-4 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <span>1.2 Ativo Não Circulante</span>
                    <span className="text-[10px] font-mono">Imobilizado + Intangível</span>
                  </li>
                </ul>
              </div>

              {/* Passivo Nodes */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-[#081024] border-amber-500/30" : "bg-amber-50 border-amber-300"}`}>
                <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">2. Nós do Passivo</h4>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 font-black text-amber-800 dark:text-amber-300">
                    <span>2.1 Passivo Circulante</span>
                    <span className="text-[10.5px] font-mono font-bold">Fornecedores + Dívida CP</span>
                  </li>
                  <li className={`flex items-center justify-between p-1.5 pl-4 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <span>2.2 Passivo Não Circulante</span>
                    <span className="text-[10px] font-mono">Financiamentos LP</span>
                  </li>
                </ul>
              </div>

              {/* PL & Equality */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-[#081024] border-emerald-500/30" : "bg-emerald-50 border-emerald-300"}`}>
                <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">3. Patrimônio Líquido & Equilíbrio</h4>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 font-black text-emerald-800 dark:text-emerald-300">
                    <span>2.3 Patrimônio Líquido</span>
                    <span className="text-[10.5px] font-mono font-bold">Capital + Reservas + Lucros</span>
                  </li>
                  <li className="flex items-center justify-between p-2 rounded-xl bg-[#ff5722]/15 text-[#d84315] dark:text-[#ff5722] font-black border border-[#ff5722]/30">
                    <span>ATIVO = PASSIVO + PL</span>
                    <span className="text-[10.5px] font-mono">Δ = 0.00</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. TAB 6: Full BP AI Agent Chat & Skill Knowledge Reference */}
      {activeTab === "chat" && (
        <div className="space-y-6">
          <BPAgentPanel
            summary={bpAgentSummary}
            onRefreshSummary={async () => {
              const res = await fetch(`${apiBaseUrl}/api/bp/agent/explain`);
              if (res.ok) {
                const d = await res.json();
                setBpAgentSummary(d.summary || "");
              }
            }}
          />

          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? "bg-[#0b1329] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-md"
          }`}>
            <h4 className="text-sm font-black flex items-center gap-2 text-amber-500">
              <BookOpen className="w-4 h-4" />
              <span>{isEn ? "Skill Knowledge Reference (analise-balanco-patrimonial)" : "Referência e Diretrizes da Skill (analise-balanco-patrimonial)"}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <h5 className="font-bold text-sky-400 mb-1">1. Liquidez & Solvência</h5>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  Cruza Liquidez Corrente, Seca, Imediata e Geral com o ciclo operacional. Avalia capacidade de honrar passivos no curto e longo prazo.
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <h5 className="font-bold text-emerald-400 mb-1">2. Modelo Fleuriet (Giro)</h5>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  Reclassifica o BP em contas operacionais e financeiras: calcula NCG, CDG e Saldo de Tesouraria (ST). Determina se a estrutura é Sólida ou de Risco.
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <h5 className="font-bold text-amber-400 mb-1">3. Decomposição Dupont</h5>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  Decompõe o ROE em Margem Líquida × Giro do Ativo × Multiplicador de Alavancagem. Identifica se o retorno decorre de eficiência ou de endividamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
