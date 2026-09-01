"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PreferencesProvider, usePreferences } from "@/components/PreferencesContext";
import CompanyBadge from "@/components/CompanyBadge";
import CVMWatchPanel from "@/components/CVMWatchPanel";

function StandaloneAnalysisPage() {
  const { theme } = usePreferences();
  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      } p-4 md:p-8 space-y-6 transition-colors duration-200`}
    >
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={`p-2.5 rounded-2xl border transition shadow-sm ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
              title="Voltar ao Painel Principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xs font-semibold text-slate-500">Voltar ao Painel Principal</span>
          </div>

          <CompanyBadge variant="header" />
        </div>

        <CompanyBadge variant="banner" />

        <CVMWatchPanel />
      </div>
    </main>
  );
}

export default function AnalisePage() {
  return (
    <PreferencesProvider>
      <StandaloneAnalysisPage />
    </PreferencesProvider>
  );
}
