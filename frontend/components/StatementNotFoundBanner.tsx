"use client";

import React from "react";
import { AlertCircle, Building2, BookOpen, ShieldAlert } from "lucide-react";
import { usePreferences } from "./PreferencesContext";

interface StatementNotFoundBannerProps {
  statementName: string;
  statementFullName: string;
  legalBasis: string;
  companyName: string;
  reason?: string;
  onNavigate?: (mode: string) => void;
}

export default function StatementNotFoundBanner({
  statementName,
  statementFullName,
  legalBasis,
  companyName,
  reason,
  onNavigate
}: StatementNotFoundBannerProps) {
  const { theme, language } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border transition-all shadow-xl ${
      isDark 
        ? "bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/30 text-slate-200" 
        : "bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-amber-300 text-slate-900 shadow-sm"
    }`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b pb-5 border-amber-500/20 mb-6">
        <div className="flex items-center gap-3.5">
          <div className={`p-3.5 rounded-2xl border shadow-inner ${
            isDark 
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30" 
              : "bg-amber-100 text-amber-700 border-amber-300"
          }`}>
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                isDark 
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30" 
                  : "bg-amber-200/90 text-amber-950 border-amber-400 font-black shadow-xs"
              }`}>
                {isEn ? "Data Unavailable • Awaiting Ingestion" : "Dados Indisponíveis • Aguardando Ingestão"}
              </span>
              <span className={`text-xs font-mono font-black ${isDark ? "text-slate-400" : "text-slate-800"}`}>
                {statementName}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black mt-1 text-slate-900 dark:text-white">
              {statementFullName}
            </h3>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono ${
          isDark 
            ? "bg-slate-950/40 border-slate-800 text-slate-400" 
            : "bg-slate-100 border-slate-300 text-slate-900 font-bold shadow-xs"
        }`}>
          <ShieldAlert className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-amber-400" : "text-amber-700"}`} />
          <span className="truncate max-w-[280px]" title={legalBasis}>{legalBasis}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
          {isEn
            ? `Data Unavailable: No records or uploaded financial data found for "${companyName}" in this statement.`
            : `Dados Indisponíveis: Não foram encontradas informações ou registros contábeis para "${companyName}" nesta demonstração.`}
        </p>
        <p className={`text-xs font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-700"}`}>
          {reason || (isEn
            ? "This statement is waiting for ingestion in the 'Overview & Ingestion' tab. Ingestion is centralized there to populate all statements and models across HyperCube."
            : "Esta demonstração está aguardando a realização da ingestão na página 'Visão Geral & Ingestão'. Todas as importações de arquivos contábeis são centralizadas na Visão Geral para garantir a sincronização do modelo.")}
        </p>
      </div>

      {/* Suggested Actions (Ingestion button removed, centralized in Overview) */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {onNavigate && (
          <>
            <button
              onClick={() => onNavigate("CVM")}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "bg-white border-slate-300 text-slate-900 hover:bg-slate-100 shadow-sm"
              }`}
            >
              <Building2 className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <span>{isEn ? "Browse CVM Watch Companies" : "Consultar Empresas no CVM Watch"}</span>
            </button>

            <button
              onClick={() => onNavigate("GUIDE")}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "bg-white border-slate-300 text-slate-900 hover:bg-slate-100 shadow-sm"
              }`}
            >
              <BookOpen className={`w-4 h-4 ${isDark ? "text-sky-400" : "text-sky-600"}`} />
              <span>{isEn ? "CVM Regulatory Requirements Guide" : "Manual de Exigências CVM"}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
