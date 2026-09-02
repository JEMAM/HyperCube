"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Download, FileText, Settings, Activity, ShieldAlert, CheckCircle, TrendingUp, BarChart2, Sparkles, LayoutDashboard, FileSpreadsheet } from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import DynamicAccountsLineChart, { AccountTimeSeriesData, AccountMeta } from "./DynamicAccountsLineChart";
import ExecutivePlanningViewCard from "./ExecutivePlanningViewCard";
import StructuredStatementTable from "./StructuredStatementTable";

interface ResultsDashboardProps {
  viewMode?: "DRE" | "DFC";
  annualData: any[];
  kpis: any;
}

export default function ResultsDashboard({ viewMode = "DRE", annualData, kpis }: ResultsDashboardProps) {
  const { theme, language, t, apiBaseUrl, activeCompany } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";
  const [chartTab, setChartTab] = useState<"executive" | "line" | "bar" | "table">("executive");

  const handleExportPdf = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/export/pdf?mode=${viewMode}`);
      if (!res.ok) throw new Error("Falha na exportação");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HyperCube_Simulacao_${viewMode}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("PDF export fallback:", err);
      window.location.href = `${apiBaseUrl}/api/export/pdf?mode=${viewMode}`;
    }
  };

  const [dynamicSeries, setDynamicSeries] = useState<AccountTimeSeriesData[] | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const periodicity = activeCompany?.periodicity || (activeCompany?.periods?.some((p: string) => p.includes("T")) ? "TRIMESTRAL" : "ANUAL");
        const endpoint = viewMode === "DFC"
          ? `${apiBaseUrl}/api/dfc/timeseries?periodicity=${periodicity}`
          : `${apiBaseUrl}/api/dre/timeseries?periodicity=${periodicity}`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDynamicSeries(data);
          }
        }
      } catch (e) {
        console.warn("Could not load dynamic timeseries:", e);
      }
    };
    fetchSeries();
  }, [apiBaseUrl, viewMode, annualData, kpis, activeCompany?.id, activeCompany?.periodicity]);

  // Convert annualData or canonical records into structured TimeSeries for DynamicAccountsLineChart
  const customTimeSeriesData: AccountTimeSeriesData[] = React.useMemo(() => {
    if (dynamicSeries && dynamicSeries.length > 0) {
      return dynamicSeries;
    }
    if (viewMode === "DFC") {
      // DFC time series data (Vale S.A. 2024 vs 2025 and Budget 2026 - USD Milhões)
      return [
        {
          period: "2024",
          periodLabel: isEn ? "Fiscal Year 2024 (Consolidated)" : "Exercício 2024 (Consolidado)",
          recebimento_vendas: 13767.0,
          pagamento_fornecedores: 0.0,
          pagamento_salarios: 0.0,
          pagamento_despesas_operacionais: 2419.0,
          pagamento_impostos: 1982.0,
          fco_caixa_liquido: 9366.0,
          fci_caixa_liquido: -5368.0,
          fcf_caixa_liquido: -2275.0,
          variacao_liquida_caixa: 1723.0,
          saldo_final_caixa: 4953.0
        },
        {
          period: "2025",
          periodLabel: isEn ? "Fiscal Year 2025 (Consolidated)" : "Exercício 2025 (Consolidado)",
          recebimento_vendas: 13401.0,
          pagamento_fornecedores: 0.0,
          pagamento_salarios: 0.0,
          pagamento_despesas_operacionais: 2618.0,
          pagamento_impostos: 1982.0,
          fco_caixa_liquido: 8801.0,
          fci_caixa_liquido: -6864.0,
          fcf_caixa_liquido: 270.0,
          variacao_liquida_caixa: 2207.0,
          saldo_final_caixa: 7372.0
        },
        {
          period: "Budget_2026",
          periodLabel: isEn ? "Budget 2026 (Vale Plan)" : "Orçamento 2026 (Budget Vale)",
          recebimento_vendas: 15000.0,
          pagamento_fornecedores: 0.0,
          pagamento_salarios: 0.0,
          pagamento_despesas_operacionais: 2400.0,
          pagamento_impostos: 1800.0,
          fco_caixa_liquido: 10800.0,
          fci_caixa_liquido: -6600.0,
          fcf_caixa_liquido: -2500.0,
          variacao_liquida_caixa: 1700.0,
          saldo_final_caixa: 9072.0
        }
      ];
    }

    // Default DRE Series (Vale S.A. 2024 vs 2025 and Budget 2026 - USD Milhões)
    return [
      {
        period: "2024",
        periodLabel: isEn ? "Fiscal Year 2024 (Consolidated)" : "Exercício 2024 (Consolidado Vale)",
        Receita_Liquida: 38056.0,
        Margem_Bruta: 14757.0,
        EBITDA: 15000.0,
        Lucro_Liquido: 6314.0,
        Despesas_Operacionais: 3770.0,
        Resultado_Financeiro: -2863.0
      },
      {
        period: "2025",
        periodLabel: isEn ? "Fiscal Year 2025 (Consolidated)" : "Exercício 2025 (Consolidado Vale)",
        Receita_Liquida: 38787.0,
        Margem_Bruta: 13917.0,
        EBITDA: 14500.0,
        Lucro_Liquido: 3838.0,
        Despesas_Operacionais: 4000.0,
        Resultado_Financeiro: -3000.0
      },
      {
        period: "Budget_2026",
        periodLabel: isEn ? "Budget 2026 (Vale Plan)" : "Orçamento 2026 (Budget Vale)",
        Receita_Liquida: 41000.0,
        Margem_Bruta: 15500.0,
        EBITDA: 16200.0,
        Lucro_Liquido: 5200.0,
        Despesas_Operacionais: 4100.0,
        Resultado_Financeiro: -2700.0
      }
    ];
  }, [viewMode, dynamicSeries, isEn]);

  const dfcAccountsMeta: AccountMeta[] = [
    { id: "recebimento_vendas", label: isEn ? "(+) Customer Collections / Sales Receipts" : "(+) Recebimento de Vendas", color: "#38bdf8", category: "revenue" },
    { id: "pagamento_fornecedores", label: isEn ? "(-) Supplier Payments" : "(-) Pagamento de Fornecedores", color: "#fb7185", category: "cost" },
    { id: "pagamento_despesas_operacionais", label: isEn ? "(-) Operating Expenses" : "(-) Despesas Operacionais", color: "#fbbf24", category: "expense" },
    { id: "pagamento_impostos", label: isEn ? "(-) Taxes & Duties" : "(-) Pagamento de Impostos", color: "#e879f9", category: "expense" },
    { id: "fco_caixa_liquido", label: isEn ? "(=) Net Operating Cash Flow (OCF)" : "(=) Caixa Líquido Operacional (FCO)", color: "#0284c7", category: "cash" },
    { id: "fci_caixa_liquido", label: isEn ? "(=) Net Investing Cash Flow (ICF)" : "(=) Caixa Líquido de Investimento (FCI)", color: "#f5822b", category: "cash" },
    { id: "fcf_caixa_liquido", label: isEn ? "(=) Net Financing Cash Flow (FCF)" : "(=) Caixa Líquido de Financiamento (FCF)", color: "#818cf8", category: "cash" },
    { id: "variacao_liquida_caixa", label: isEn ? "Net Change in Cash" : "Variação Líquida de Caixa", color: "#34d399", category: "result" },
    { id: "saldo_final_caixa", label: isEn ? "Ending Cash Balance" : "Saldo Final de Caixa", color: "#10b981", category: "cash" }
  ];

  if (viewMode === "DFC") {
    return (
      <div className="space-y-6">
        {/* Export Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {isEn ? "Results Dashboard" : "Painel de Resultados"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isEn
                ? "Statement of Cash Flows (DFC) comprising Operating, Investing, and Financing activities."
                : "Demonstração dos Fluxos de Caixa (DFC) composta por atividades operacionais, investimentos e financiamentos."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-sm"
            >
              <FileText className="w-4 h-4" />
              {isEn ? "Export Report (.pdf)" : "Exportar Relatório (.pdf)"}
            </button>
          </div>
        </div>

        {/* DFC KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-xl transition`}>
            <div className="text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">
              {isEn ? "Operating Cash Flow (OCF)" : "Caixa Operacional (FCO)"}
            </div>
            <div className="text-xl font-bold text-sky-400 font-mono">
              R$ {kpis?.Total_FCO?.toLocaleString("pt-BR") || "0"}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>{isEn ? "Classified" : "Classificado"}</span>
            </div>
          </div>
          <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-xl transition`}>
            <div className="text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">
              {isEn ? "Investing Cash Flow (ICF)" : "Caixa Investimento (FCI)"}
            </div>
            <div className="text-xl font-bold text-amber-400 font-mono">
              R$ {kpis?.Total_FCI?.toLocaleString("pt-BR") || "0"}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>{isEn ? "Classified" : "Classificado"}</span>
            </div>
          </div>
          <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-xl transition`}>
            <div className="text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">
              {isEn ? "Financing Cash Flow (FCF)" : "Caixa Financiamento (FCF)"}
            </div>
            <div className="text-xl font-bold text-indigo-400 font-mono">
              R$ {kpis?.Total_FCF?.toLocaleString("pt-BR") || "0"}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>{isEn ? "Classified" : "Classificado"}</span>
            </div>
          </div>
          <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-xl transition`}>
            <div className="text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">
              {isEn ? "Ending Cash Balance" : "Saldo Final de Caixa"}
            </div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              R$ {kpis?.Saldo_Final_Atual?.toLocaleString("pt-BR") || "0"}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>{isEn ? "Updated" : "Atualizado"}</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Executive Planning View vs Dynamic Line Charts vs Bar Chart vs Table) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/40 pb-2">
          <button
            onClick={() => setChartTab("executive")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              chartTab === "executive"
                ? "bg-anaplan-coral text-white shadow-md"
                : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{isEn ? "Executive Planning View" : "Painel Executivo (Planning View)"}</span>
          </button>
          <button
            onClick={() => setChartTab("table")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              chartTab === "table"
                ? "bg-anaplan-coral text-white shadow-md"
                : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isEn ? "Structured DFC Table (AV / AH)" : "Tabela Estruturada DFC (AV / AH)"}</span>
          </button>
          <button
            onClick={() => setChartTab("line")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              chartTab === "line"
                ? "bg-anaplan-coral text-white shadow-md"
                : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isEn ? "Dynamic Line Charts by DFC Accounts" : "Gráficos Dinâmicos de Linhas por Contas DFC"}</span>
          </button>
          <button
            onClick={() => setChartTab("bar")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              chartTab === "bar"
                ? "bg-anaplan-coral text-white shadow-md"
                : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>{isEn ? "Consolidated Bar Chart View" : "Visão em Barras Consolidada"}</span>
          </button>
        </div>

        {/* Content depending on selected tab */}
        {chartTab === "executive" ? (
          <ExecutivePlanningViewCard statementType="DFC" onOpenTable={() => setChartTab("table")} />
        ) : chartTab === "table" ? (
          <StructuredStatementTable statementType="DFC" />
        ) : chartTab === "line" ? (
          <DynamicAccountsLineChart
            title={isEn ? "Evolution of Cash Flow Statement Accounts (DFC)" : "Evolução das Contas do Fluxo de Caixa (DFC)"}
            subtitle={isEn ? "Dynamic and structured analysis of Operating, Investing, Financing Cash Flows, and Ending Cash Balance." : "Análise dinâmica e estruturada das linhas de FCO, FCI, FCF, Recebimentos e Saldo Final de Caixa."}
            customData={customTimeSeriesData}
            accountsMeta={dfcAccountsMeta}
            initialSelectedAccounts={["recebimento_vendas", "fco_caixa_liquido", "saldo_final_caixa"]}
            viewMode="DFC"
          />
        ) : (
          /* DFC Chart: Annual Evolution */
          <div className={`${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800 shadow-md"} border p-5 rounded-xl transition`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-4">
              {isEn ? "Annual Cash Flow Evolution (OCF, ICF, FCF & Net Change)" : "Evolução Anual do Fluxo de Caixa (FCO, FCI, FCF e Variação Líquida)"}
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annualData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="ano" stroke={isDark ? "#cbd5e1" : "#64748b"} fontSize={11} className="font-mono" />
                  <YAxis stroke={isDark ? "#cbd5e1" : "#64748b"} fontSize={11} className="font-mono" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0b1220" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                      color: isDark ? "#f8fafc" : "#0f172a",
                      borderRadius: "8px"
                    }}
                    formatter={(val: any) => `R$ ${Number(val).toLocaleString("pt-BR")}`}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="fco" fill="#38bdf8" name={isEn ? "OCF (Operating)" : "FCO (Operacional)"} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fci" fill="#f5822b" name={isEn ? "ICF (Investing)" : "FCI (Investimento)"} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fcf" fill="#818cf8" name={isEn ? "FCF (Financing)" : "FCF (Financiamento)"} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="variacao_liquida" fill="#10b981" name={isEn ? "Net Change" : "Variação Líquida"} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DRE View Mode (Default)
  return (
    <div className="space-y-6">
      {/* Export Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            {isEn ? "Results Dashboard" : "Painel de Resultados"}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-200">
            {isEn
              ? "Consolidated Income Statement (DRE) by canonical accounts and official fiscal periods."
              : "Demonstrativo do Resultado do Exercício consolidado por contas e períodos fiscais oficiais."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-sm"
          >
            <FileText className="w-4 h-4" />
            {isEn ? "Export Report (.pdf)" : "Exportar Relatório (.pdf)"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-xl transition`}>
          <div className="text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">{t("prodIntermed")}</div>
          <div className="text-xl font-bold text-sky-400 font-mono">
            R$ {kpis?.Total_Produto_Intermediacao?.toLocaleString("pt-BR") || "0"}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>{isEn ? "Classified" : "Classificado"}</span>
          </div>
        </div>
        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-xl transition`}>
          <div className="text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">{t("resIntermed")}</div>
          <div className="text-xl font-bold text-indigo-400 font-mono">
            R$ {kpis?.Total_Resultado_Intermediacao?.toLocaleString("pt-BR") || "0"}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>{isEn ? "Classified" : "Classificado"}</span>
          </div>
        </div>
        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-xl transition`}>
          <div className="text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">{t("resBeforeTax")}</div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            R$ {kpis?.Total_Resultado_Antes_Tributacao?.toLocaleString("pt-BR") || "0"}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>{isEn ? "Classified" : "Classificado"}</span>
          </div>
        </div>
        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-xl transition`}>
          <div className="text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">{t("netIncomeAcc")}</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            R$ {kpis?.Total_Lucro_Liquido?.toLocaleString("pt-BR") || "0"}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>{isEn ? "Calculated" : "Calculado"}</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs (Executive Planning View vs Dynamic Line Charts vs Bar Chart vs Table) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/40 pb-2">
        <button
          onClick={() => setChartTab("executive")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            chartTab === "executive"
              ? "bg-anaplan-coral text-white shadow-md"
              : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>{isEn ? "Executive Planning View" : "Painel Executivo (Planning View)"}</span>
        </button>
        <button
          onClick={() => setChartTab("table")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            chartTab === "table"
              ? "bg-anaplan-coral text-white shadow-md"
              : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isEn ? "Structured DRE Table (AV / AH)" : "Tabela Estruturada DRE (AV / AH)"}</span>
        </button>
        <button
          onClick={() => setChartTab("line")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            chartTab === "line"
              ? "bg-anaplan-coral text-white shadow-md"
              : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{isEn ? "Dynamic Line Charts by DRE Accounts" : "Gráficos Dinâmicos de Linhas por Contas DRE"}</span>
        </button>
        <button
          onClick={() => setChartTab("bar")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            chartTab === "bar"
              ? "bg-anaplan-coral text-white shadow-md"
              : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>{isEn ? "Consolidated Bar Chart View" : "Visão em Barras Consolidada"}</span>
        </button>
      </div>

      {/* Dynamic View rendering */}
      {chartTab === "executive" ? (
        <ExecutivePlanningViewCard statementType="DRE" onOpenTable={() => setChartTab("table")} />
      ) : chartTab === "table" ? (
        <StructuredStatementTable statementType="DRE" />
      ) : chartTab === "line" ? (
        <DynamicAccountsLineChart
          title={isEn ? "Income Statement Trajectory & Evolution (Vale S.A.)" : "Trajetória e Evolução das Linhas da DRE (Vale S.A.)"}
          subtitle={isEn ? "Select accounting lines to dynamically compare trajectories, base 100 growth, and percentage margins." : "Selecione contas contábeis para comparar dinamicamente trajetórias, crescimento relativo (Base 100) e margens percentuais."}
          customData={customTimeSeriesData}
          initialSelectedAccounts={["Receita_Liquida", "Margem_Bruta", "EBITDA", "Lucro_Liquido"]}
          viewMode="DRE"
        />
      ) : (
        /* Chart: Annual Evolution */
        <div className={`${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800 shadow-md"} border p-5 rounded-xl transition`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            {t("annualChartTitle")}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="ano" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} className="font-mono" />
                <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} className="font-mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0b1220" : "#ffffff",
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    color: isDark ? "#f8fafc" : "#0f172a",
                    borderRadius: "8px"
                  }}
                  formatter={(val: any) => `R$ ${Number(val).toLocaleString("pt-BR")}`}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="lucro_liquido" fill="#f5822b" name={t("netIncomeLegend")} radius={[4, 4, 0, 0]} />
                <Bar dataKey="resultado_intermediacao" fill="#3e7bfa" name={t("resIntermedLegend")} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
