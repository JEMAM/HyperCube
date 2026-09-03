"use client";

import React from "react";
import { Building2, Layers, CheckCircle2 } from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import { CVM_COMPANIES } from "@/lib/cvmData";

interface CompanyBadgeProps {
  variant?: "header" | "banner" | "subtle" | "chip";
  className?: string;
  onClick?: () => void;
  showCurrency?: boolean;
}

export default function CompanyBadge({
  variant = "header",
  className = "",
  onClick,
  showCurrency = true,
}: CompanyBadgeProps) {
  const { activeCompany, theme, language } = usePreferences();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";
  const isEn = language === "en";

  // Resolve active company: check activeCompany state, then localStorage fallback to Cyrela
  let currentCompany = activeCompany;
  if (mounted && (!currentCompany || currentCompany.id === "aguardando_upload")) {
    const savedCod = typeof window !== "undefined" ? localStorage.getItem("cvm_selected_cod") : null;
    const cod = savedCod ? Number(savedCod) : 14460;
    const match = CVM_COMPANIES.find(c => c.cod_cvm === cod);
    if (match) {
      currentCompany = {
        id: `cvm_${match.cod_cvm}`,
        name: match.denom_social,
        ticker: match.nome_pregao,
        currency: "R$",
        periods: ["2022", "2023", "2024", "2025"],
        periodicity: "ANUAL",
        sector: match.setor,
        description: match.denom_social
      };
    }
  }

  const isAwaitingUpload = !currentCompany || currentCompany.id === "aguardando_upload";

  if (variant === "chip") {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition ${
          isAwaitingUpload
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            : isDark
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
            : "bg-emerald-50 text-emerald-800 border border-emerald-300"
        } ${onClick ? "cursor-pointer hover:opacity-80" : ""} ${className}`}
        title={currentCompany.description || currentCompany.name}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span className="truncate max-w-[200px]">{currentCompany.name}</span>
        {currentCompany.ticker && (
          <span className="font-mono text-[10px] opacity-80">({currentCompany.ticker})</span>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 shadow-sm ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        } ${className}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isAwaitingUpload
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                : "bg-gradient-to-tr from-sky-500 to-emerald-500 text-white shadow-sm"
            }`}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? "Active Model Company:" : "Empresa em Análise no Modelo:"}
              </span>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  isAwaitingUpload
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : isDark
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                {currentCompany.ticker || "EMPRESA"}
              </span>
              {showCurrency && currentCompany.currency && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  • {currentCompany.currency}
                </span>
              )}
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {currentCompany.name}
            </h4>
          </div>
        </div>

        {onClick && (
          <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              isDark
                ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                : "bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700"
            }`}
          >
            {isEn ? "View Dataset" : "Ver Demonstrações"}
          </button>
        )}
      </div>
    );
  }

  // Default: "header"
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-xs transition ${
        isAwaitingUpload
          ? isDark
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
            : "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-xs"
          : isDark
          ? "bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-800"
          : "bg-slate-100 border-slate-300 text-slate-900 hover:bg-white shadow-xs"
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      title={currentCompany.description || currentCompany.name}
    >
      <Building2 className="w-3.5 h-3.5 text-anaplan-coral flex-shrink-0" />
      <span className={`text-[11px] font-bold hidden sm:inline ${
        isDark ? "text-slate-400" : "text-slate-700"
      }`}>
        {isEn ? "Company:" : "Empresa:"}
      </span>
      <span className={`font-black truncate max-w-[180px] sm:max-w-[260px] ${
        isAwaitingUpload
          ? isDark ? "text-amber-300" : "text-amber-950"
          : isDark ? "text-white" : "text-slate-900"
      }`}>
        {currentCompany.name}
      </span>
      {currentCompany.ticker && (
        <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-black ${
          isDark ? "bg-slate-700 text-slate-200" : "bg-slate-200 text-slate-900"
        }`}>
          {currentCompany.ticker}
        </span>
      )}
    </div>
  );
}
