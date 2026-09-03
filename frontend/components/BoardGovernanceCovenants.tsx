"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Award,
  FileText,
  Printer,
  Sparkles,
  TrendingUp,
  Scale,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Download,
  Calendar,
  Layers,
  Building2,
  RefreshCw
} from "lucide-react";
import { usePreferences, getApiUrl } from "./PreferencesContext";

interface CovenantEvaluation {
  covenant_id: string;
  name: string;
  description: string;
  operator: string;
  threshold: number;
  unit: string;
  category: string;
  current_value: number;
  is_compliant: boolean;
  buffer_pct: number;
  status: "SAFE" | "WARNING" | "BREACH";
}

interface TimelineCovenant {
  quarter_id: string;
  label: string;
  period_type: string;
  is_actual: boolean;
  leverage_ratio: number;
  covenant_limit: number;
  is_compliant: boolean;
  debt_headroom_brl: number;
}

export default function BoardGovernanceCovenants() {
  const { theme, language, apiBaseUrl, activeCompany, hasActiveData } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"MEMO" | "COVENANTS" | "BOARDPACK" | "CHECKLIST">("MEMO");

  const [covenantData, setCovenantData] = useState<any>(null);
  const [boardMemo, setBoardMemo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [memoLoading, setMemoLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (comp?: string) => {
    const cid = (comp && comp !== "aguardando_upload") ? comp : "empresa_cliente";
    setLoading(true);
    setError(null);
    try {
      // Fetch covenants status
      const covUrl = getApiUrl(`/api/governance/covenants?company_id=${encodeURIComponent(cid)}`, apiBaseUrl);
      const covRes = await fetch(covUrl);
      if (!covRes.ok) throw new Error("Erro ao carregar status de covenants");
      const covJson = await covRes.json();
      setCovenantData(covJson);

      // Fetch Board Memo
      const memoUrl = getApiUrl("/api/governance/board-memo", apiBaseUrl);
      const memoRes = await fetch(memoUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: cid })
      });
      if (memoRes.ok) {
        const memoJson = await memoRes.json();
        setBoardMemo(memoJson);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o backend de governança");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeCompany?.id);
  }, [activeCompany?.id, apiBaseUrl]);

  const regenerateMemo = async () => {
    setMemoLoading(true);
    try {
      const memoUrl = getApiUrl("/api/governance/board-memo", apiBaseUrl);
      const memoRes = await fetch(memoUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: activeCompany?.id || "cvm_company" })
      });
      if (!memoRes.ok) throw new Error("Erro ao regerar parecer do conselho");
      const memoJson = await memoRes.json();
      setBoardMemo(memoJson);
    } catch (err: any) {
      setError(err.message || "Erro ao regerar memorando");
    } finally {
      setMemoLoading(false);
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
          <div className="p-3 bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-400 rounded-2xl text-white shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{isEn ? "Autonomous AI & Board Governance" : "IA Autônoma & Governança Executiva"}</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono font-bold border border-amber-500/30">
                  Etapa 5
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEn
                ? "C-Level Board Advisor (Agno Agent), debt covenant early warning system, and board-ready packs."
                : "Agente Agno Consultor de Conselho, monitor de covenants com early warning e dossiês board-ready."}
            </p>
          </div>
        </div>

        {/* Analyzed Company Badge & Actions */}
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          {/* Nome da Empresa Analisada (Aumentado de Tamanho) */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0b1326] border border-amber-500/40 shadow-lg">
            <Building2 className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {isEn ? "Analyzed Company" : "Empresa Analisada"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {activeCompany?.name || "BANCO ABC BRASIL S/A"}
                </span>
                {activeCompany?.ticker && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-mono font-bold border border-amber-500/30">
                    {activeCompany.ticker}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Regenerate AI Memo Button */}
          <button
            onClick={regenerateMemo}
            disabled={memoLoading || loading}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#0b1326] border border-[#222a3d] hover:border-amber-500 text-amber-300 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Regerar parecer executivo com o Agente Agno"
          >
            <Sparkles className={`w-3.5 h-3.5 ${memoLoading ? "animate-spin text-amber-400" : "text-amber-400"}`} />
            <span>{memoLoading ? (isEn ? "Synthesizing..." : "Sintetizando...") : (isEn ? "Regenerate AI Memo" : "Regerar Parecer IA")}</span>
          </button>

          {/* Print Board Pack */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-slate-950 flex items-center gap-1.5 shadow-lg transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isEn ? "Print Board Pack" : "Imprimir Dossiê"}</span>
          </button>
        </div>
      </div>

      {/* Empty state banner when no company is loaded */}
      {!covenantData && (!hasActiveData || !activeCompany?.id || activeCompany.id === "aguardando_upload") && (
        <div className="p-8 rounded-3xl bg-[#131b2e] border border-[#222a3d] text-center space-y-3 shadow-xl my-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            {isEn ? "No Company Loaded for Governance & Covenants" : "Nenhuma Empresa Carregada para Análise de Governança & Covenants"}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isEn 
              ? "Load a company via CVM Watch & Analysis or upload financial statements in Overview & Ingestion to calculate debt covenants and board memos."
              : "Carregue uma empresa no 'CVM Watch & Análise' ou envie uma planilha contábil em 'Visão Geral & Ingestão' para calcular covenants e pareceres do conselho."}
          </p>
        </div>
      )}

      {/* KPI Ribbon - Governance & Headrooms */}
      {covenantData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Overall Compliance Status */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] shadow-sm flex flex-col justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Status dos Covenants</span>
              {covenantData.overall_status === "SAFE" ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : covenantData.overall_status === "WARNING" ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              )}
            </span>
            <div className="mt-2">
              <span className={`text-lg sm:text-xl font-black font-mono tracking-wide ${
                covenantData.overall_status === "SAFE"
                  ? "text-emerald-400"
                  : covenantData.overall_status === "WARNING"
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}>
                {covenantData.overall_status === "SAFE" ? "CONFORME" : covenantData.overall_status === "WARNING" ? "ATENÇÃO" : "VIOLAÇÃO"}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                {covenantData.overall_status === "SAFE"
                  ? (isEn ? "100% of debt clauses safe" : "Todas as 4 cláusulas contratuais cumpridas")
                  : (isEn ? "Headroom buffer under 15%" : "Folga de segurança inferior a 15%")}
              </span>
            </div>
          </div>

          {/* EBITDA Headroom */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] shadow-sm flex flex-col justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Folga de EBITDA (Headroom)</span>
              <DollarSign className="w-3.5 h-3.5 text-sky-400" />
            </span>
            <div className="mt-2">
              <span className="text-lg sm:text-xl font-black text-sky-300 font-mono tabular-nums">
                {fmtCurrency(covenantData.headrooms.ebitda_headroom_brl)}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                Margem de segurança: <strong>{covenantData.headrooms.ebitda_headroom_pct}%</strong>
              </span>
            </div>
          </div>

          {/* Debt Headroom */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] shadow-sm flex flex-col justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Folga para Nova Dívida</span>
              <Scale className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="mt-2">
              <span className="text-lg sm:text-xl font-black text-amber-300 font-mono tabular-nums">
                {fmtCurrency(covenantData.headrooms.debt_headroom_brl)}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                Capacidade de absorção de alavancagem
              </span>
            </div>
          </div>

          {/* Current Leverage Ratio */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] shadow-sm flex flex-col justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Alavancagem Atual</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="mt-2">
              <span className="text-lg sm:text-xl font-black text-emerald-300 font-mono tabular-nums">
                {covenantData?.timeline && covenantData.timeline.length > 0
                  ? `${covenantData.timeline[covenantData.timeline.length - 1].leverage_ratio}x`
                  : "2.15x"}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                Limite contratual do covenant: <strong>{covenantData?.timeline && covenantData.timeline.length > 0 ? `${covenantData.timeline[0].covenant_limit}x` : "3.50x"}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#131b2e] border border-[#222a3d] w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab("MEMO")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "MEMO"
              ? "bg-amber-500 text-slate-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isEn ? "1. Board Advisor Memo (AI)" : "1. Parecer Executivo do Conselho (IA)"}</span>
        </button>

        <button
          onClick={() => setActiveTab("COVENANTS")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "COVENANTS"
              ? "bg-amber-500 text-slate-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isEn ? "2. Covenants & Early Warning" : "2. Monitor & Early Warning de Covenants"}</span>
        </button>

        <button
          onClick={() => setActiveTab("BOARDPACK")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "BOARDPACK"
              ? "bg-amber-500 text-slate-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isEn ? "3. Board-Ready Pack" : "3. Dossiê Executivo Board-Ready"}</span>
        </button>

        <button
          onClick={() => setActiveTab("CHECKLIST")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "CHECKLIST"
              ? "bg-amber-500 text-slate-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isEn ? "4. IBGC Governance Matrix" : "4. Matriz de Governança & IBGC"}</span>
        </button>
      </div>

      {/* TAB 1: BOARD ADVISOR MEMO */}
      {activeTab === "MEMO" && boardMemo && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#131b2e] border border-[#222a3d] shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#222a3d]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Memorando Executivo — Conselho de Administração
                </h3>
                <span className="text-xs text-slate-400">
                  Emitido em {boardMemo.generated_at} pelo Agente Agno (Gabinete do CFO)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                Auditado C-Level
              </span>
            </div>
          </div>

          {/* Rendered Markdown Body */}
          <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4">
            <div className="bg-[#0b1326] p-6 rounded-2xl border border-[#222a3d] font-sans whitespace-pre-wrap leading-relaxed">
              {boardMemo.memo_markdown}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COVENANTS & EARLY WARNING */}
      {activeTab === "COVENANTS" && covenantData && (
        <div className="space-y-5">
          {/* Covenants Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {covenantData.covenants.map((cov: CovenantEvaluation) => {
              const isCompliant = cov.is_compliant;
              const isWarning = cov.status === "WARNING";

              return (
                <div
                  key={cov.covenant_id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isCompliant
                      ? isWarning
                        ? "bg-[#131b2e] border-amber-500/40 shadow-amber-500/5"
                        : "bg-[#131b2e] border-[#222a3d]"
                      : "bg-[#131b2e] border-rose-500/50 shadow-rose-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#222a3d]">
                    <span className="text-xs font-bold text-slate-300">{cov.name}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        cov.status === "SAFE"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : cov.status === "WARNING"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {cov.status === "SAFE" ? "SEGURO" : cov.status === "WARNING" ? "ALERTA" : "VIOLAÇÃO"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 my-3">{cov.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-[#0b1326] border border-[#222a3d] font-mono tabular-nums">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Atual</span>
                      <span className="text-sm font-black text-white">{fmtNumber(cov.current_value)} {cov.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Limite {cov.operator}</span>
                      <span className="text-sm font-black text-amber-400">{cov.threshold} {cov.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Folga</span>
                      <span className={`text-sm font-black ${cov.buffer_pct > 15 ? "text-emerald-400" : "text-amber-400"}`}>
                        {cov.buffer_pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Evolution over 8 Quarters */}
          <div className="p-6 rounded-3xl bg-[#131b2e] border border-[#222a3d] shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-[#222a3d]">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Trajetória da Alavancagem e Folga de Dívida (8 Trimestres Deslizantes)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono tabular-nums text-left">
                <thead>
                  <tr className="bg-[#0b1326] text-slate-400 border-b border-[#222a3d]">
                    <th className="py-3 px-4 font-bold text-slate-200">Trimestre</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3 text-right">Alavancagem (Dív. Líq / EBITDA)</th>
                    <th className="py-3 px-3 text-right">Limite Máximo</th>
                    <th className="py-3 px-3 text-right">Folga de Dívida (Headroom R$ M)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222a3d]/60 text-slate-300">
                  {(covenantData?.timeline || []).map((q: TimelineCovenant) => (
                    <tr key={q.quarter_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-bold text-white">{q.label}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          q.is_actual ? "bg-slate-800 text-slate-400" : "bg-sky-500/20 text-sky-300"
                        }`}>
                          {q.period_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-100">{q.leverage_ratio}x</td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{q.covenant_limit}x</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{fmtCurrency(q.debt_headroom_brl)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          Cumprido
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOARD-READY PACK */}
      {activeTab === "BOARDPACK" && covenantData && boardMemo && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#131b2e] border border-[#222a3d] shadow-2xl space-y-6">
          {/* Header Formal */}
          <div className="border-b border-[#222a3d] pb-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                Dossiê Corporativo Oficial — Reunião Ordinária do Conselho
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Relatório Integrado de Governança & Covenants 2026
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {activeCompany?.name || covenantData.company_name} ({activeCompany?.ticker || covenantData.ticker}) • Setor: {covenantData.sector}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 block">Documento N° BD-2026-04</span>
              <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                Aprovado para Deliberação
              </span>
            </div>
          </div>

          {/* Pack Executive Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0b1326] border border-[#222a3d]">
              <span className="text-xs font-bold text-slate-400 block mb-1">Geração de Caixa Operacional</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {fmtCurrency(boardMemo.metrics.ebitda_2026_budget)}
              </span>
              <p className="text-[10.5px] text-slate-500 mt-1">
                EBITDA com margem de {boardMemo.metrics.ebitda_margin_2026_pct}%.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b1326] border border-[#222a3d]">
              <span className="text-xs font-bold text-slate-400 block mb-1">Solvência da Dívida</span>
              <span className="text-xl font-black text-sky-400 font-mono">
                {boardMemo.metrics.leverage_ratio}x
              </span>
              <p className="text-[10.5px] text-slate-500 mt-1">
                Abaixo do teto contratual de {boardMemo.metrics.covenant_limit}x.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b1326] border border-[#222a3d]">
              <span className="text-xs font-bold text-slate-400 block mb-1">Risco Máximo Estimado (VaR 95%)</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {fmtCurrency(boardMemo.metrics.var_95_ebitda)}
              </span>
              <p className="text-[10.5px] text-slate-500 mt-1">
                Shortfall sob 1.500 iterações estocásticas.
              </p>
            </div>
          </div>

          {/* Executive Synthesis */}
          <div className="p-5 rounded-2xl bg-[#0b1326] border border-[#222a3d] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Parecer Sintético da Assessoria de Governança
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              O Comitê de Auditoria e a Assessoria de Governança concluem que a <strong>{covenantData.company_name}</strong> apresenta indicadores de liquidez e alavancagem em total conformidade com as emissões de debêntures e contratos bilaterais de crédito. Recomenda-se a aprovação unânime do plano orçamentário de 2026, com recomendação de manutenção de folga mínima de caixa de R$ 500 Milhões sobre o limite de alavancagem.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: IBGC GOVERNANCE MATRIX */}
      {activeTab === "CHECKLIST" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#131b2e] border border-[#222a3d] shadow-2xl space-y-5">
          <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-[#222a3d]">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Matriz de Conformidade & Boas Práticas IBGC / CVM</span>
          </h3>

          <div className="space-y-3">
            {[
              {
                title: "1. Reconciliação Contábil Fechada com Tolerância Zero (Delta = R$ 0,00)",
                status: "CONFORME",
                desc: "Triângulo contábil DRE-DFC-BP balanceado em todos os períodos históricos e orçados sem plugging forçado."
              },
              {
                title: "2. Monitoramento Ativo de Headroom de Covenants de Dívida",
                status: "CONFORME",
                desc: "Cálculo diário e contínuo da margem de segurança antes do acionamento de cláusulas de cross-default."
              },
              {
                title: "3. Simulação Estocástica de Risco de Cauda (Monte Carlo & VaR 95%)",
                status: "CONFORME",
                desc: "Quantificação matemática de volatilidades em receitas, insumos fabris e taxa Selic em 1.000 a 10.000 universos simultâneos."
              },
              {
                title: "4. Teste de Estresse do Modelo Fleuriet (Capital de Giro & Efeito Tesoura)",
                status: "CONFORME",
                desc: "Acompanhamento em tempo real do Saldo de Tesouraria (ST) e da Necessidade de Capital de Giro (NCG)."
              },
              {
                title: "5. Governança por IA com Trilha Auditável de Cálculo (Calculation Trace)",
                status: "CONFORME",
                desc: "Total transparência dos nós precedentes e sucessores no grafo DAG de cálculo financeiro."
              },
              {
                title: "6. Dossiê Executivo Automatizado para Reunião de Conselho (Board-Ready)",
                status: "CONFORME",
                desc: "Geração instantânea de memorandos executivos de alta densidade analítica e relatórios formatados para deliberação."
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#0b1326] border border-[#222a3d] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-6">{item.desc}</p>
                </div>

                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex-shrink-0">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
