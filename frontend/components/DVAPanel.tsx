"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Users,
  Building,
  Landmark,
  Award,
  RefreshCw,
  Download,
  Share2,
  CheckCircle2,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { usePreferences, getApiUrl } from "./PreferencesContext";
import StatementNotFoundBanner from "./StatementNotFoundBanner";

interface DVAPanelProps {
  onNavigate?: (mode: string) => void;
}

export default function DVAPanel({ onNavigate }: DVAPanelProps) {
  const { theme, language, apiBaseUrl, activeCompany } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [loading, setLoading] = useState(true);
  const [dvaData, setDvaData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"tabela" | "distribuicao">("distribuicao");

  const fetchDva = async () => {
    setLoading(true);
    try {
      const url = getApiUrl("/api/statements/dva", apiBaseUrl);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDvaData(data);
      } else {
        setDvaData({ has_data: false });
      }
    } catch (err) {
      console.error("Fetch DVA error:", err);
      setDvaData({ has_data: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDva();
  }, [apiBaseUrl, activeCompany?.id]);

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 1,
    }).format(val);
  };

  const handleExportCSV = () => {
    if (!dvaData || !dvaData.geracao || !dvaData.distribuicao) return;
    const periods = dvaData.periods || [];
    let csv = "Código;Descrição da Conta;" + periods.join(";") + "\n";
    csv += "--- 1. GERAÇÃO DO VALOR ADICIONADO ---\n";
    dvaData.geracao.forEach((r: any) => {
      const vals = periods.map((p: string) => (r.values && r.values[p] !== undefined ? r.values[p] : ""));
      csv += `"${r.code}";"${r.name}";${vals.join(";")}\n`;
    });
    csv += "--- 2. DISTRIBUIÇÃO DO VALOR ADICIONADO ---\n";
    dvaData.distribuicao.forEach((r: any) => {
      const vals = periods.map((p: string) => (r.values && r.values[p] !== undefined ? r.values[p] : ""));
      csv += `"${r.code}";"${r.name}";${vals.join(";")}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DVA_${dvaData.company?.name || "Empresa"}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">
          {isEn ? "Loading Statement of Added Value (DVA)..." : "Carregando Demonstração do Valor Adicionado (DVA)..."}
        </p>
      </div>
    );
  }

  if (!dvaData || dvaData.has_data === false) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <StatementNotFoundBanner
          statementName="DVA"
          statementFullName={isEn ? "Statement of Added Value (DVA)" : "Demonstração do Valor Adicionado (DVA)"}
          legalBasis="CPC 09 e Art. 176, V da Lei nº 6.404/76 (Obrigatória para Cia Aberta)"
          companyName={activeCompany?.name || "Empresa Ativa"}
          reason={dvaData?.reason}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  const kpis = dvaData.kpis || {};
  const periods = dvaData.periods || ["2023", "2024", "2025", "Budget 2026"];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5 border-slate-700/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              CPC 09 • Art. 176, V Lei 6.404
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">Obrigatória para Companhias Abertas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <PieChart className="w-8 h-8 text-emerald-400" />
            <span>Demonstração do Valor Adicionado (DVA)</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Evidenciação da riqueza gerada pela atividade da companhia e a distribuição entre Colaboradores, Governo, Financiadores e Acionistas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className={`flex rounded-xl p-1 border ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-300"}`}>
            <button
              onClick={() => setActiveTab("distribuicao")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "distribuicao"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Distribuição de Riqueza
            </button>
            <button
              onClick={() => setActiveTab("tabela")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "tabela"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Quadro Canônico Completo
            </button>
          </div>

          <button
            onClick={fetchDva}
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
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pessoal & Benefícios</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-sky-400" : "text-sky-700"}`}>
            {kpis.pessoal_pct}%
          </div>
          <span className={`text-[10px] mt-1 block ${isDark ? "text-slate-400" : "text-slate-600"}`}>Remuneração direta, benefícios e encargos sociais</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>Governo & Tributos</span>
            <Building className={`w-4 h-4 ${isDark ? "text-amber-400" : "text-amber-700"}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-amber-400" : "text-amber-800"}`}>
            {kpis.governo_pct}%
          </div>
          <span className={`text-[10px] mt-1 block ${isDark ? "text-slate-400" : "text-slate-600"}`}>Tributos Federais, Estaduais e Municipais</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>Financiadores (3ºs)</span>
            <Landmark className={`w-4 h-4 ${isDark ? "text-rose-400" : "text-rose-700"}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-rose-400" : "text-rose-700"}`}>
            {kpis.financiadores_pct}%
          </div>
          <span className={`text-[10px] mt-1 block ${isDark ? "text-slate-400" : "text-slate-600"}`}>Juros, aluguéis e custos de captação</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>Acionistas & PL</span>
            <Award className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
            {kpis.acionistas_pct}%
          </div>
          <span className={`text-[10px] mt-1 block ${isDark ? "text-slate-400" : "text-slate-600"}`}>Dividendos, JCP e lucros retidos</span>
        </div>
      </div>

      {activeTab === "distribuicao" ? (
        /* Visual Distribution Breakdown */
        <div className={`p-6 rounded-3xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"} shadow-lg space-y-6`}>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
            <span>Distribuição Relativa do Valor Adicionado — Exercício 2025</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className={isDark ? "text-sky-400" : "text-sky-800 font-bold"}>1. Pessoal (Folha, Encargos e Benefícios)</span>
                <span className={isDark ? "text-slate-200" : "text-slate-950 font-extrabold"}>{formatCurrency(dvaData.distribuicao[0]?.values?.["2025"])} (30.0%)</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: "30%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className={isDark ? "text-amber-400" : "text-amber-800 font-bold"}>2. Impostos, Taxas e Contribuições (Governo)</span>
                <span className={isDark ? "text-slate-200" : "text-slate-950 font-extrabold"}>{formatCurrency(dvaData.distribuicao[1]?.values?.["2025"])} (32.0%)</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: "32%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className={isDark ? "text-rose-400" : "text-rose-800 font-bold"}>3. Remuneração de Capitais de Terceiros (Bancos / Debenturistas)</span>
                <span className={isDark ? "text-slate-200" : "text-slate-950 font-extrabold"}>{formatCurrency(dvaData.distribuicao[2]?.values?.["2025"])} (19.7%)</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: "19.7%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className={isDark ? "text-emerald-400" : "text-emerald-800 font-bold"}>4. Remuneração de Capitais Próprios (Acionistas / PL)</span>
                <span className={isDark ? "text-slate-200" : "text-slate-950 font-extrabold"}>{formatCurrency(dvaData.distribuicao[3]?.values?.["2025"])} (18.3%)</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "18.3%" }}></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Full Canonical Tables (Geração & Distribuição) */}
      <div className={`border rounded-2xl overflow-hidden shadow-lg ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"} space-y-6`}>
        {/* Bloco 1: Geração */}
        <div>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? "bg-slate-950/40 border-slate-700/50" : "bg-emerald-50/70 border-slate-200"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-800 font-extrabold"}`}>
              1. GERAÇÃO DO VALOR ADICIONADO (R$ Milhões)
            </h3>
            <span className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>Receitas - Insumos + Transferências</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className={`border-b ${isDark ? "bg-slate-950/80 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-800"} font-bold`}>
                  <th className="py-3 px-4 w-20">Código</th>
                  <th className="py-3 px-4 min-w-[300px]">Descrição</th>
                  {periods.map((p: string) => (
                    <th key={p} className="py-3 px-4 text-right min-w-[120px] font-mono">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {dvaData.geracao.map((row: any, idx: number) => (
                  <tr
                    key={idx}
                    className={`transition ${
                      row.is_total
                        ? isDark ? "bg-emerald-950/20 font-bold text-white" : "bg-emerald-50/90 font-bold text-slate-950"
                        : isDark ? "hover:bg-slate-800/40 text-slate-300" : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <td className={`py-2.5 px-4 font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>{row.code}</td>
                    <td className={`py-2.5 px-4 font-sans ${row.is_total ? "font-bold" : "pl-8"} ${isDark ? "text-slate-200" : "text-slate-900"}`}>{row.name}</td>
                    {periods.map((p: string) => {
                      const val = row.values ? row.values[p] : undefined;
                      const isNegative = val < 0;
                      return (
                        <td key={p} className={`py-2.5 px-4 text-right font-medium ${
                          isNegative 
                            ? (isDark ? "text-rose-400" : "text-rose-700 font-bold") 
                            : (isDark ? "text-slate-200" : "text-slate-900")
                        }`}>
                          {val !== undefined ? formatCurrency(val) : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloco 2: Distribuição */}
        <div>
          <div className={`p-4 border-t border-b flex items-center justify-between ${isDark ? "bg-slate-950/40 border-slate-700/50" : "bg-sky-50/70 border-slate-200"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-sky-400" : "text-sky-800 font-extrabold"}`}>
              2. DISTRIBUIÇÃO DO VALOR ADICIONADO (R$ Milhões)
            </h3>
            <span className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>Pessoal + Tributos + Terceiros + Acionistas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className={`border-b ${isDark ? "bg-slate-950/80 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-800"} font-bold`}>
                  <th className="py-3 px-4 w-20">Código</th>
                  <th className="py-3 px-4 min-w-[300px]">Destinatário / Grupo</th>
                  {periods.map((p: string) => (
                    <th key={p} className="py-3 px-4 text-right min-w-[120px] font-mono">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {dvaData.distribuicao.map((row: any, idx: number) => (
                  <tr
                    key={idx}
                    className={`transition ${
                      row.is_total
                        ? isDark ? "bg-sky-950/20 font-bold text-white" : "bg-sky-50/90 font-bold text-slate-950"
                        : isDark ? "hover:bg-slate-800/40 text-slate-300" : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <td className={`py-2.5 px-4 font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>{row.code}</td>
                    <td className={`py-2.5 px-4 font-sans ${row.is_total ? "font-bold" : "pl-8"} ${isDark ? "text-slate-200" : "text-slate-900"}`}>{row.name}</td>
                    {periods.map((p: string) => {
                      const val = row.values ? row.values[p] : undefined;
                      return (
                        <td key={p} className={`py-2.5 px-4 text-right font-medium ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                          {val !== undefined ? formatCurrency(val) : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
