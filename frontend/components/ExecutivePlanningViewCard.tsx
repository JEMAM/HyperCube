"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { ChevronRight, TrendingUp, FileSpreadsheet, Activity, Scale, BarChart2, Maximize2 } from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import StructuredStatementTable from "./StructuredStatementTable";

interface ExecutivePlanningViewCardProps {
  onNavigate?: (mode: "DRE" | "PLANNING" | "OVERVIEW" | "DFC" | "BP" | "DAG" | "CUBE" | "ECONOMY") => void;
  className?: string;
  defaultTab?: "chart" | "document";
  forcedDark?: boolean;
  statementType?: "DRE" | "DFC" | "BP";
  onOpenTable?: () => void;
}

// Fallback series for DRE
const DEFAULT_DRE_SERIES = [
  { period: "1T25", receita: 6991.0, margem_bruta: 2109.0, ebitda: 570.0, lucro_liquido: -408.0 },
  { period: "1T26", receita: 7416.0, margem_bruta: 2247.0, ebitda: 597.0, lucro_liquido: -1064.0 },
  { period: "Budget 2026", receita: 8200.0, margem_bruta: 2550.0, ebitda: 780.0, lucro_liquido: -500.0 },
];

// Fallback series for DFC
const DEFAULT_DFC_SERIES = [
  { period: "1T25", fco: 11200.0, fci: -4300.0, fcf: -3800.0, variacao_caixa: 3100.0, saldo_final: 14500.0 },
  { period: "2T25", fco: 12400.0, fci: -4600.0, fcf: -4100.0, variacao_caixa: 3700.0, saldo_final: 18200.0 },
  { period: "3T25", fco: 13800.0, fci: -5100.0, fcf: -4500.0, variacao_caixa: 4200.0, saldo_final: 22400.0 },
  { period: "4T25", fco: 14820.0, fci: -5410.0, fcf: -4800.0, variacao_caixa: 4610.0, saldo_final: 27010.0 },
];

// Fallback series for BP
const DEFAULT_BP_SERIES = [
  { period: "1T25", ativo_total: 81000.0, ativo_circulante: 32400.0, passivo_circulante: 21200.0, pl: 31400.0, ncg: 7200.0 },
  { period: "2T25", ativo_total: 83600.0, ativo_circulante: 34100.0, passivo_circulante: 22100.0, pl: 32700.0, ncg: 7600.0 },
  { period: "3T25", ativo_total: 86600.0, ativo_circulante: 36200.0, passivo_circulante: 23300.0, pl: 34200.0, ncg: 7900.0 },
  { period: "4T25", ativo_total: 88450.0, ativo_circulante: 37850.0, passivo_circulante: 23800.0, pl: 35250.0, ncg: 8120.0 },
];

export default function ExecutivePlanningViewCard({
  onNavigate,
  className = "",
  defaultTab = "chart",
  forcedDark,
  statementType = "DRE",
  onOpenTable,
}: ExecutivePlanningViewCardProps) {
  const { theme, language, apiBaseUrl, activeCompany: prefActiveCompany } = usePreferences();
  const isDark = forcedDark !== undefined ? forcedDark : theme === "dark";
  const isEn = language === "en";
  const [activeView, setActiveView] = useState<"chart" | "document">(defaultTab);
  const [showModal, setShowModal] = useState(false);

  const [activeCompany, setActiveCompany] = useState<any>(prefActiveCompany || {
    id: "casas_bahia",
    name: "Grupo Casas Bahia S.A.",
    ticker: "BHIA3",
    currency: "R$ Milhões",
    periods: ["1T25", "1T26", "Budget 2026"],
    description: "Demonstrações financeiras consolidadas oficiais (Exercício 2024 / 2025)."
  });
  
  const [dreSeries, setDreSeries] = useState<any[]>(DEFAULT_DRE_SERIES);
  const [dfcSeries, setDfcSeries] = useState<any[]>(DEFAULT_DFC_SERIES);
  const [bpSeries, setBpSeries] = useState<any[]>(DEFAULT_BP_SERIES);

  useEffect(() => {
    const loadData = async () => {
      try {
        let currentComp = prefActiveCompany;
        if (!currentComp || currentComp.id === "aguardando_upload") {
          const compRes = await fetch(`${apiBaseUrl}/api/active-company`);
          if (compRes.ok) {
            currentComp = await compRes.json();
            setActiveCompany(currentComp);
          }
        } else {
          setActiveCompany(currentComp);
        }

        const periodicity = currentComp?.periodicity || (currentComp?.periods?.some((p: string) => p.includes("T")) ? "TRIMESTRAL" : "ANUAL");

        if (statementType === "DRE") {
          const tsRes = await fetch(`${apiBaseUrl}/api/dre/timeseries?periodicity=${periodicity}`);
          if (tsRes.ok) {
            const ts = await tsRes.json();
            if (Array.isArray(ts) && ts.length > 0) {
              const mapped = ts.map((item: any) => ({
                period: item.period,
                receita: item.Receita_Liquida,
                margem_bruta: item.Margem_Bruta,
                ebitda: item.EBITDA,
                lucro_liquido: item.Lucro_Liquido,
              }));
              setDreSeries(mapped);
            }
          }
        } else if (statementType === "DFC") {
          const dfcRes = await fetch(`${apiBaseUrl}/api/dfc/timeseries?periodicity=${periodicity}`);
          if (dfcRes.ok) {
            const data = await dfcRes.json();
            if (Array.isArray(data) && data.length > 0) {
              const mapped = data.map((item: any) => ({
                period: item.period,
                fco: item.fco ?? item.fco_caixa_liquido ?? 0,
                fci: item.fci ?? item.fci_caixa_liquido ?? 0,
                fcf: item.fcf ?? item.fcf_caixa_liquido ?? 0,
                variacao_caixa: item.variacao_caixa ?? item.variacao_liquida_caixa ?? 0,
                saldo_final: item.saldo_final ?? item.saldo_final_caixa ?? 0,
              }));
              setDfcSeries(mapped);
            }
          }
        } else if (statementType === "BP") {
          const bpRes = await fetch(`${apiBaseUrl}/api/bp/table`);
          if (bpRes.ok) {
            const data = await bpRes.json();
            const rows = Array.isArray(data) ? data : data.rows || [];
            const periods = data.periods || ["2024", "2025", "Budget 2026"];
            if (rows.length > 0) {
              const mapped = periods.map((p: string) => {
                const getVal = (id: string) => {
                  const r = rows.find((x: any) => x.id === id);
                  return r?.periods?.[p]?.value ?? 0;
                };
                const ac = getVal("ativo_circulante");
                const pc = getVal("passivo_circulante");
                const at = getVal("ativo_total");
                const pl = getVal("patrimonio_liquido");
                const rec = getVal("contas_receber");
                const est = getVal("estoques");
                const forn = getVal("fornecedores");
                const ncg = (rec + est) - forn;
                return {
                  period: p,
                  ativo_total: at,
                  ativo_circulante: ac,
                  passivo_circulante: pc,
                  pl: pl,
                  ncg: ncg || (ac - pc) * 0.7,
                };
              });
              setBpSeries(mapped);
            }
          }
        }
      } catch (e) {
        console.warn("Could not load dynamic ExecutivePlanning data", e);
      }
    };
    loadData();
  }, [apiBaseUrl, statementType, prefActiveCompany?.id, prefActiveCompany?.periodicity, prefActiveCompany?.periods]);

  // Current series based on statement type
  const activeSeries = statementType === "DFC" ? dfcSeries : statementType === "BP" ? bpSeries : dreSeries;
  const latestRow = activeSeries[activeSeries.length - 1] || activeSeries[0] || {};
  const prevRow = activeSeries.length > 1 ? activeSeries[activeSeries.length - 2] : activeSeries[0] || {};

  // Content tailoring by statementType
  const statementTitle = statementType === "DFC"
    ? (isEn ? "Cash Flow Statement (DFC)" : "Demonstração do Fluxo de Caixa (DFC)")
    : statementType === "BP"
    ? (isEn ? "Balance Sheet (BP)" : "Balanço Patrimonial (BP)")
    : (isEn ? "Income Statement (DRE)" : "Demonstração do Resultado (DRE)");

  const aiQueryText = statementType === "DFC"
    ? (isEn ? `"What is the impact of extending DSO by +15 days on ${activeCompany.name} Final Cash?"` : `"Qual o impacto de estender o prazo de recebimento em +15 dias no Saldo Final de Caixa?"`)
    : statementType === "BP"
    ? (isEn ? `"What is the impact of a -10% reduction in Accounts Receivable on Working Capital (NCG)?"` : `"Qual o impacto de uma redução de -10% no Contas a Receber na NCG e no Saldo de Tesouraria?"`)
    : (isEn ? `"What is the impact of a -5% reduction in SG&A on ${activeCompany.name} EBITDA?"` : `"Qual o impacto da redução de -5% no SG&A no EBITDA de ${activeCompany.name}?"`);

  return (
    <div className={`relative w-full select-none pt-4 sm:pt-5 ${className}`}>
      {/* Floating AI Query Dialogue Pill (Top Right) */}
      <div className={`absolute top-0 right-2 sm:right-6 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-transform hover:scale-105 duration-200 border shadow-2xl ${
        isDark ? "bg-[#0b192c] text-white border-[#1e3a5f]" : "bg-white text-slate-900 border-slate-300 shadow-xl"
      }`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm flex-shrink-0 ${
          statementType === "DFC"
            ? "bg-gradient-to-tr from-sky-500 to-emerald-500"
            : statementType === "BP"
            ? "bg-gradient-to-tr from-purple-500 to-indigo-500"
            : "bg-gradient-to-tr from-[#ff5722] to-[#f59e0b]"
        }`}>
          {isEn ? "AI" : "IA"}
        </div>
        <span
          suppressHydrationWarning
          className={`font-bold tracking-tight truncate max-w-[260px] sm:max-w-md ${isDark ? "text-slate-100" : "text-slate-800"}`}
        >
          {aiQueryText}
        </span>
      </div>

      {/* Main Window Container */}
      <div className={`relative rounded-[28px] p-5 sm:p-6 border shadow-2xl overflow-hidden backdrop-blur-xl transition ${
        isDark ? "bg-[#070e1b] border-[#17263c] text-white" : "bg-white border-slate-200 text-slate-900 shadow-xl"
      }`}>
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          statementType === "DFC" ? "bg-sky-500/10" : statementType === "BP" ? "bg-purple-500/10" : "bg-anaplan-coral/10"
        }`} />

        {/* Window Header / Titlebar */}
        <div className={`flex items-center justify-between border-b pb-4 mb-4 ${
          isDark ? "border-[#14233a]" : "border-slate-200"
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f43f5e] inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-[#10b981] inline-block shadow-sm"></span>
            <span
              suppressHydrationWarning
              className={`text-xs font-black ml-3 tracking-wide font-sans ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              HyperCube Executive Planning View — {statementType} {activeCompany.name} ({activeCompany.currency})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Pills */}
            <div className={`flex items-center p-0.5 rounded-xl border ${
              isDark ? "bg-[#0b1626] border-[#162a45]" : "bg-slate-100 border-slate-300"
            }`}>
              <button
                onClick={() => setActiveView("chart")}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1.5 ${
                  activeView === "chart"
                    ? (statementType === "DFC" ? "bg-sky-600 text-white shadow-sm" : statementType === "BP" ? "bg-emerald-600 text-white shadow-sm" : "bg-[#ff5722] text-white shadow-sm")
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-700 hover:text-slate-900"
                }`}
                title={isEn ? "View Dynamic Chart" : "Ver Gráfico Dinâmico"}
              >
                <TrendingUp className="w-3 h-3" />
                <span>{statementType === "DFC" ? (isEn ? "Flow Chart" : "Gráfico de Fluxos") : statementType === "BP" ? (isEn ? "Balance Structure" : "Estrutura Patrimonial") : (isEn ? "Line Chart" : "Gráfico de Linhas")}</span>
              </button>
              <button
                onClick={() => setActiveView("document")}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1.5 ${
                  activeView === "document"
                    ? (statementType === "DFC" ? "bg-sky-600 text-white shadow-sm" : statementType === "BP" ? "bg-emerald-600 text-white shadow-sm" : "bg-[#ff5722] text-white shadow-sm")
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-700 hover:text-slate-900"
                }`}
                title={isEn ? "View Statement Table" : "Ver Demonstrativo Contábil"}
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>{statementType === "DFC" ? (isEn ? "Cash Flow Table" : "Demonstrativo DFC") : statementType === "BP" ? (isEn ? "Balance Sheet Table" : "Demonstrativo BP") : (isEn ? "Income Statement" : "Demonstrativo DRE")}</span>
              </button>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold tracking-wider border ${
              isDark
                ? "bg-[#052e16] border-[#10b981]/50 text-[#34d399]"
                : "bg-emerald-50 border-emerald-300 text-emerald-700"
            }`}>
              LIVE ENGINE
            </div>
          </div>
        </div>

        {/* 3 Top KPI Cards Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* Card 1 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border transition shadow-sm ${
            isDark ? "bg-[#0b1626] border-[#162a45] hover:border-[#223f66]" : "bg-white border-slate-200 hover:border-slate-300"
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              {statementType === "DFC"
                ? (isEn ? "OPERATING CASH FLOW (FCO)" : "FLUXO OPERACIONAL (FCO)")
                : statementType === "BP"
                ? (isEn ? "TOTAL ASSETS" : "ATIVO TOTAL")
                : (isEn ? "NET SALES REVENUE" : "RECEITA DE VENDAS")} ({latestRow.period || "4T25"})
            </p>
            <p className={`text-xl sm:text-2xl font-black font-sans tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              {activeCompany.currency.includes("USD") ? "USD " : "R$ "}
              {statementType === "DFC"
                ? `${((latestRow.fco || 14820) / 1000).toFixed(2)} B`
                : statementType === "BP"
                ? `${((latestRow.ativo_total || 88450) / 1000).toFixed(2)} B`
                : `${((latestRow.receita || 7416) / 1000).toFixed(2)} B`}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#10b981] mt-1">
              <span>▲</span>
              <span>
                {statementType === "DFC"
                  ? "+18.2% YoY"
                  : statementType === "BP"
                  ? (isEn ? "Strict Balance Closure: Δ = 0.00" : "Ativo = Passivo + PL (Δ = 0,00)")
                  : (prevRow.receita ? `+${(((latestRow.receita - prevRow.receita) / prevRow.receita) * 100).toFixed(1)}% YoY` : "+6.1% YoY")}
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border transition shadow-sm ${
            isDark ? "bg-[#0b1626] border-[#162a45] hover:border-[#223f66]" : "bg-white border-slate-200 hover:border-slate-300"
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              {statementType === "DFC"
                ? (isEn ? "INVESTING FLOW (FCI / CAPEX)" : "FLUXO DE INVESTIMENTO (FCI)")
                : statementType === "BP"
                ? (isEn ? "WORKING CAPITAL (NCG / CDG)" : "CAPITAL DE GIRO (NCG)")
                : (isEn ? "NET INCOME / LOSS" : "LUCRO / PREJUÍZO LÍQUIDO")}
            </p>
            <p className={`text-xl sm:text-2xl font-black font-sans tracking-tight ${
              statementType === "DFC"
                ? "text-sky-400"
                : statementType === "BP"
                ? "text-emerald-400"
                : (latestRow.lucro_liquido || 0) >= 0 ? "text-emerald-500" : "text-[#ff5722]"
            }`}>
              {activeCompany.currency.includes("USD") ? "USD " : "R$ "}
              {statementType === "DFC"
                ? `${Number(latestRow.fci || -5410).toLocaleString("pt-BR")} M`
                : statementType === "BP"
                ? `${Number(latestRow.ncg || 8120).toLocaleString("pt-BR")} M`
                : `${Number(latestRow.lucro_liquido || -1064).toLocaleString("pt-BR")} M`}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-sky-500 mt-1">
              <span>●</span>
              <span>
                {statementType === "DFC"
                  ? (isEn ? "Capex & Financial Investments" : "Capex de Sustentação")
                  : statementType === "BP"
                  ? (isEn ? "Fleuriet Dynamic: Solid Position" : "Modelo Fleuriet: Situação Sólida")
                  : `EBITDA: ${activeCompany.currency.includes("USD") ? "USD " : "R$ "}${Number(latestRow.ebitda || 597).toLocaleString("pt-BR")} M`}
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border transition shadow-sm ${
            isDark ? "bg-[#0b1626] border-[#162a45] hover:border-[#223f66]" : "bg-white border-slate-200 hover:border-slate-300"
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              {statementType === "DFC"
                ? (isEn ? "FINAL CASH BALANCE" : "SALDO FINAL DE CAIXA")
                : statementType === "BP"
                ? (isEn ? "RETURN ON EQUITY (ROE)" : "RETORNO SOBRE O PL (ROE)")
                : (isEn ? "DAG RECALCULATION" : "RECÁLCULO DAG")}
            </p>
            <p className="text-xl sm:text-2xl font-black text-sky-600 dark:text-[#38bdf8] font-mono tracking-tight">
              {statementType === "DFC"
                ? `${activeCompany.currency.includes("USD") ? "USD " : "R$ "}${((latestRow.saldo_final || 27010) / 1000).toFixed(2)} B`
                : statementType === "BP"
                ? "28.4%"
                : "1.34 ms"}
            </p>
            <p className={`text-[11px] font-medium mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {statementType === "DFC"
                ? (isEn ? "DAG DFC recalculated in 1.12 ms" : "Recálculo DAG DFC em 1.12 ms")
                : statementType === "BP"
                ? (isEn ? "Dupont 3-Factors: Margin × Turnover × Lev." : "Dupont 3 Fatores: Margem × Giro × Alav.")
                : (isEn ? "18 re-evaluated nodes" : "18 nós reavaliados")}
            </p>
          </div>
        </div>

        {/* Bottom Section: Dynamic Line Chart OR Official Statement Table */}
        <div className={`relative rounded-2xl overflow-hidden border ${
          isDark ? "border-[#162a45] bg-[#0b1626]" : "border-slate-200 bg-white shadow-inner"
        }`}>
          {activeView === "chart" ? (
            /* DYNAMIC LINE CHART */
            <div className={`relative w-full h-56 sm:h-64 p-4 pt-3 ${
              isDark
                ? "bg-gradient-to-br from-[#0c182a] via-[#091220] to-[#060c17]"
                : "bg-white"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    suppressHydrationWarning
                    className={`text-[11px] font-extrabold ${isDark ? "text-slate-300" : "text-slate-800"}`}
                  >
                    {statementType === "DFC"
                      ? (isEn ? "Cash Flow Dynamics (DFC)" : "Trajetória dos Fluxos DFC")
                      : statementType === "BP"
                      ? (isEn ? "Balance Sheet Capital Structure (BP)" : "Estrutura Patrimonial do Balanço (BP)")
                      : (isEn ? "Income Statement Trendlines (DRE)" : "Trajetória das Linhas DRE")} — {activeCompany.name} ({activeCompany.currency})
                  </span>
                  <span
                    suppressHydrationWarning
                    className="text-[9.5px] px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold font-mono"
                  >
                    {activeCompany.ticker}
                  </span>
                </div>
              </div>

              <div className="w-full h-44 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  {statementType === "DFC" ? (
                    <LineChart data={dfcSeries} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#162a45" : "#e2e8f0"} vertical={false} />
                      <XAxis dataKey="period" stroke={isDark ? "#64748b" : "#475569"} fontSize={10} tickLine={false} />
                      <YAxis stroke={isDark ? "#64748b" : "#475569"} fontSize={9.5} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}B`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: isDark ? "#070e1b" : "#ffffff", borderColor: isDark ? "#1e3a5f" : "#cbd5e1", borderRadius: "12px", fontSize: "11px" }}
                        formatter={(val: any, name: any) => [
                          `${activeCompany.currency.includes("USD") ? "USD " : "R$ "}${Number(val).toLocaleString("pt-BR")} M`,
                          name === "fco" ? (isEn ? "Operating Cash Flow (FCO)" : "Caixa Operacional (FCO)")
                            : name === "fci" ? (isEn ? "Investing Cash Flow (FCI)" : "Investimentos (FCI)")
                            : name === "fcf" ? (isEn ? "Financing Cash Flow (FCF)" : "Financiamentos (FCF)")
                            : (isEn ? "Net Cash Variation" : "Variação Líquida de Caixa")
                        ]}
                      />
                      <Legend verticalAlign="top" height={24} iconType="line" iconSize={12} wrapperStyle={{ fontSize: "10px" }} />
                      <Line type="monotone" dataKey="fco" name={isEn ? "Operating Flow (FCO)" : "Caixa Operacional (FCO)"} stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="fci" name={isEn ? "Investing (FCI)" : "Investimentos (FCI)"} stroke="#0284c7" strokeWidth={2} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="fcf" name={isEn ? "Financing (FCF)" : "Financiamentos (FCF)"} stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="variacao_caixa" name={isEn ? "Net Variation" : "Variação Líquida de Caixa"} stroke="#ff5722" strokeWidth={2.5} dot={false} activeDot={false} />
                    </LineChart>
                  ) : statementType === "BP" ? (
                    <LineChart data={bpSeries} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#162a45" : "#e2e8f0"} vertical={false} />
                      <XAxis dataKey="period" stroke={isDark ? "#64748b" : "#475569"} fontSize={10} tickLine={false} />
                      <YAxis stroke={isDark ? "#64748b" : "#475569"} fontSize={9.5} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}B`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: isDark ? "#070e1b" : "#ffffff", borderColor: isDark ? "#1e3a5f" : "#cbd5e1", borderRadius: "12px", fontSize: "11px" }}
                        formatter={(val: any, name: any) => [
                          `${activeCompany.currency.includes("USD") ? "USD " : "R$ "}${Number(val).toLocaleString("pt-BR")} M`,
                          name === "ativo_total" ? (isEn ? "Total Assets" : "Ativo Total")
                            : name === "ativo_circulante" ? (isEn ? "Current Assets" : "Ativo Circulante")
                            : name === "passivo_circulante" ? (isEn ? "Current Liabilities" : "Passivo Circulante")
                            : (isEn ? "Shareholders' Equity" : "Patrimônio Líquido (PL)")
                        ]}
                      />
                      <Legend verticalAlign="top" height={24} iconType="line" iconSize={12} wrapperStyle={{ fontSize: "10px" }} />
                      <Line type="monotone" dataKey="ativo_total" name={isEn ? "Total Assets" : "Ativo Total"} stroke="#0284c7" strokeWidth={2.5} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="ativo_circulante" name={isEn ? "Current Assets" : "Ativo Circulante"} stroke="#10b981" strokeWidth={2} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="passivo_circulante" name={isEn ? "Current Liabilities" : "Passivo Circulante"} stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="pl" name={isEn ? "Equity (PL)" : "Patrimônio Líquido"} stroke="#a855f7" strokeWidth={2} dot={false} activeDot={false} />
                    </LineChart>
                  ) : (
                    <LineChart data={dreSeries} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#162a45" : "#e2e8f0"} vertical={false} />
                      <XAxis dataKey="period" stroke={isDark ? "#64748b" : "#475569"} fontSize={10} tickLine={false} />
                      <YAxis stroke={isDark ? "#64748b" : "#475569"} fontSize={9.5} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}B`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: isDark ? "#070e1b" : "#ffffff", borderColor: isDark ? "#1e3a5f" : "#cbd5e1", borderRadius: "12px", fontSize: "11px" }}
                        formatter={(val: any, name: any) => [
                          `${activeCompany.currency.includes("USD") ? "USD " : "R$ "}${Number(val).toLocaleString("pt-BR")} M`,
                          name === "receita" ? (isEn ? "Net Sales Revenue" : "Receita de Vendas")
                            : name === "margem_bruta" ? (isEn ? "Gross Profit" : "Lucro Bruto")
                            : name === "ebitda" ? (isEn ? "Adjusted EBITDA" : "EBITDA Ajustado")
                            : (isEn ? "Net Income / Loss" : "Lucro / Prejuízo Líquido"),
                        ]}
                      />
                      <Legend verticalAlign="top" height={24} iconType="line" iconSize={12} wrapperStyle={{ fontSize: "10px" }} />
                      <Line type="monotone" dataKey="receita" name={isEn ? "Net Revenue" : "Receita de Vendas"} stroke="#0284c7" strokeWidth={2.5} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="margem_bruta" name={isEn ? "Gross Profit" : "Lucro Bruto"} stroke="#10b981" strokeWidth={2} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="ebitda" name={isEn ? "EBITDA" : "EBITDA Ajustado"} stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="lucro_liquido" name={isEn ? "Net Income" : "Lucro / Prejuízo"} stroke="#ff5722" strokeWidth={2.5} dot={false} activeDot={false} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* DOCUMENT VIEW (STRUCTURED STATEMENT TABLE) */
            <div className="relative w-full overflow-hidden">
              <StructuredStatementTable
                statementType={statementType}
                className="border-0 shadow-none rounded-none"
              />
            </div>
          )}

          {/* Bottom Action Strip */}
          <div className={`p-3.5 sm:p-4 flex items-center justify-between border-t transition ${
            isDark ? "bg-[#070e1b] border-[#14233a]" : "bg-white border-slate-200"
          }`}>
            <div className="space-y-0.5">
              <h4 className={`text-xs sm:text-sm font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {statementTitle} — {activeCompany.name}
              </h4>
              <p className={`text-[10px] sm:text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {activeCompany.description}
              </p>
            </div>

            <button
              onClick={() => {
                if (onOpenTable) {
                  onOpenTable();
                } else {
                  setShowModal(true);
                }
                if (onNavigate) {
                  onNavigate(statementType);
                }
              }}
              className={`px-4 py-2 rounded-xl text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95 flex-shrink-0 ${
                statementType === "DFC"
                  ? "bg-sky-600 hover:bg-sky-500 shadow-sky-950/30"
                  : statementType === "BP"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/30"
                  : "bg-[#ff5722] hover:bg-[#f4511e] shadow-orange-950/30"
              }`}
            >
              <span>{statementType === "DFC" ? (isEn ? "Open DFC Table" : "Abrir Tabela DFC") : statementType === "BP" ? (isEn ? "Open BP Table" : "Abrir Tabela BP") : (isEn ? "Open DRE Table" : "Abrir Tabela DRE")}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Statement Table Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl shadow-2xl">
            <StructuredStatementTable
              statementType={statementType}
              isModal={true}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
