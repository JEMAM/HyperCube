"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Scale,
  RefreshCw,
  Download,
  DollarSign,
  PieChart,
  Percent,
  CheckCircle2,
  Calendar,
  Layers
} from "lucide-react";
import { usePreferences, getApiUrl } from "./PreferencesContext";
import StatementNotFoundBanner from "./StatementNotFoundBanner";

interface DMPLPanelProps {
  onNavigate?: (mode: string) => void;
}

export default function DMPLPanel({ onNavigate }: DMPLPanelProps) {
  const { theme, language, apiBaseUrl, activeCompany } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [loading, setLoading] = useState(true);
  const [dmplData, setDmplData] = useState<any>(null);

  const fetchDmpl = async () => {
    setLoading(true);
    try {
      const url = getApiUrl("/api/statements/dmpl", apiBaseUrl);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDmplData(data);
      } else {
        setDmplData({ has_data: false });
      }
    } catch (err) {
      console.error("Fetch DMPL error:", err);
      setDmplData({ has_data: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDmpl();
  }, [apiBaseUrl, activeCompany?.id]);

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return "-";
    if (val === 0) return "0,0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 1,
    }).format(val);
  };

  const handleExportCSV = () => {
    if (!dmplData || !dmplData.rows || !dmplData.columns) return;
    const cols = dmplData.columns;
    let csv = "Evento / Movimentação;" + cols.map((c: any) => c.label).join(";") + "\n";
    dmplData.rows.forEach((r: any) => {
      const vals = cols.map((c: any) => (r.values && r.values[c.id] !== undefined ? r.values[c.id] : "0"));
      csv += `"${r.event}";${vals.join(";")}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DMPL_${dmplData.company?.name || "Empresa"}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">
          {isEn ? "Loading Statement of Changes in Equity (DMPL)..." : "Carregando Demonstração das Mutações do Patrimônio Líquido (DMPL)..."}
        </p>
      </div>
    );
  }

  if (!dmplData || dmplData.has_data === false) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <StatementNotFoundBanner
          statementName="DMPL"
          statementFullName={isEn ? "Statement of Changes in Equity (DMPL)" : "Demonstração das Mutações do Patrimônio Líquido (DMPL)"}
          legalBasis="Lei nº 6.404/76 (Art. 186) e CPC 26 (R1)"
          companyName={activeCompany?.name || "Empresa Ativa"}
          reason={dmplData?.reason}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  const kpis = dmplData.kpis || {};
  const columns = dmplData.columns || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5 border-slate-700/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              CPC 26 (R1) • Art. 186 Lei 6.404
            </span>
            <span className="text-xs font-mono text-slate-400">Resolução CVM nº 80/2022</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Scale className="w-8 h-8 text-indigo-400" />
            <span>Demonstração das Mutações do Patrimônio Líquido (DMPL)</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Abertura analítica e conciliação de todas as contas patrimoniais (Capital Social, Reservas de Lucros, ORA e Dividendos).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchDmpl}
            className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isEn ? "Export CSV" : "Exportar CSV"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            PL Final Consolidado
          </span>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
            {formatCurrency(kpis.pl_final)}
          </div>
          <span className={`text-[10px] mt-1 block ${isDark ? "text-slate-400" : "text-slate-600"}`}>Posição de fechamento do exercício</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Variação no Exercício
          </span>
          <div className={`text-xl sm:text-2xl font-black ${
            kpis.variacao_pl_nominal >= 0 
              ? (isDark ? "text-emerald-400" : "text-emerald-700") 
              : (isDark ? "text-rose-400" : "text-rose-700")
          }`}>
            {formatCurrency(kpis.variacao_pl_nominal)}
          </div>
          <span className={`text-[10px] font-bold mt-1 block ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
            +{kpis.variacao_pl_pct}% em relação ao saldo inicial
          </span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Proventos Declarados (Div + JCP)
          </span>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-sky-400" : "text-sky-700"}`}>
            {formatCurrency(kpis.dividendos_distribuidos)}
          </div>
          <span className={`text-[10px] mt-1 block ${isDark ? "text-slate-400" : "text-slate-600"}`}>Retorno direto aos acionistas</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Payout Efetivo
          </span>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>
            {kpis.payout_efetivo_pct || 35.0}%
          </div>
          <span className={`text-[10px] mt-1 block ${isDark ? "text-slate-400" : "text-slate-600"}`}>Acima do mínimo estatutário (25%)</span>
        </div>
      </div>

      {/* Main Analytical Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-lg ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-700"}`} />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Quadro de Movimentações das Contas do Patrimônio Líquido (R$ Milhões)
            </h3>
          </div>
          <span className={`text-xs font-mono font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {dmplData.company?.name} • Exercício Social
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className={`border-b ${isDark ? "bg-slate-950/80 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-800"} font-bold`}>
                <th className="py-3 px-4 min-w-[260px] sticky left-0 z-10 bg-inherit">Evento / Movimentação</th>
                {columns.map((c: any) => (
                  <th key={c.id} className="py-3 px-3 text-right min-w-[130px] font-mono">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {dmplData.rows.map((row: any, idx: number) => {
                const isBold = row.is_bold;
                return (
                  <tr
                    key={idx}
                    className={`transition ${
                      isBold
                        ? isDark ? "bg-indigo-950/20 font-bold text-white" : "bg-indigo-50/90 font-bold text-slate-950"
                        : isDark ? "hover:bg-slate-800/40 text-slate-300" : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <td className={`py-2.5 px-4 font-sans sticky left-0 z-10 ${
                      isBold 
                        ? (isDark ? "font-bold bg-inherit text-white" : "font-bold bg-inherit text-slate-950") 
                        : (isDark ? "bg-inherit text-slate-200" : "bg-inherit text-slate-900")
                    }`}>
                      {row.event}
                    </td>
                    {columns.map((c: any) => {
                      const val = row.values ? row.values[c.id] : 0.0;
                      const isNegative = val < 0;
                      return (
                        <td key={c.id} className={`py-2.5 px-3 text-right font-medium ${
                          isNegative 
                            ? (isDark ? "text-rose-400" : "text-rose-700 font-bold") 
                            : (isDark ? "text-slate-200" : "text-slate-900")
                        }`}>
                          {formatCurrency(val)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
