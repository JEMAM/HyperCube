"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ThemeLanguageToggle from "@/components/ThemeLanguageToggle";
import CompanyBadge from "@/components/CompanyBadge";
import { PreferencesProvider, usePreferences } from "@/components/PreferencesContext";
import { ArrowLeft, Box, HelpCircle, Layers, Database, Cpu, Activity } from "lucide-react";
import Link from "next/link";

const OlapCube3D = dynamic(() => import("@/components/OlapCube3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold">Carregando Cubo OLAP 3D WebGL...</span>
    </div>
  ),
});

function CubePageContent() {
  const { theme, language } = usePreferences();
  const isDark = theme === "dark";

  return (
    <main className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} p-6 space-y-6 font-sans transition-colors duration-200`}>
      {/* Header */}
      <header className={`flex justify-between items-center border-b ${isDark ? "border-slate-800" : "border-slate-200"} pb-4`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`p-2 rounded-xl border transition ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
            title="Voltar ao Painel Principal"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent flex items-center gap-2">
              <Box className="w-6 h-6 text-sky-500" />
              <span>{language === "pt" ? "Cubo OLAP 3D Multidimensional" : "3D Multidimensional OLAP Cube"}</span>
            </h1>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {language === "pt"
                ? "Visualização 3D WebGL interativa e documentação conceitual da arquitetura OLAP"
                : "Interactive 3D WebGL view & conceptual documentation of the OLAP architecture"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CompanyBadge variant="header" />
          <ThemeLanguageToggle />
        </div>
      </header>

      {/* Active Company Banner */}
      <CompanyBadge variant="banner" />

      {/* 3D OLAP Cube Section */}
      <section>
        <OlapCube3D />
      </section>

      {/* Detailed Technical & Conceptual Explanation Section */}
      <section className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 space-y-6 ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-md"
      }`}>
        {/* Section Header */}
        <div className="flex items-center gap-3 border-b pb-4 border-slate-700/40">
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-sky-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sky-400">
              {language === "pt" ? "Como Funciona o Cubo OLAP 3D Multidimensional?" : "How Does the 3D Multidimensional OLAP Cube Work?"}
            </h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {language === "pt"
                ? "Conceitos fundamentais de análise multidimensional (OLAP), eixos do cubo e fatiamento reativo"
                : "Key concepts of multidimensional analysis (OLAP), cube axes, and reactive slicing"}
            </p>
          </div>
        </div>

        {/* Explanation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 3 Dimensions */}
          <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-800/50 border-slate-700/80" : "bg-slate-50 border-slate-200"} space-y-3`}>
            <div className="flex items-center gap-2.5 text-sky-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>1. As 3 Dimensões do Cubo</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Um cubo OLAP organiza dados financeiros em uma estrutura tridimensional ($X \times Y \times Z$):
            </p>
            <ul className="text-xs space-y-1.5 list-disc list-inside font-medium text-slate-300">
              <li><strong className="text-sky-400">Eixo X (Produto / DRE):</strong> Categoria, Modelo, Produto (Contas DRE).</li>
              <li><strong className="text-slate-300">Eixo Y (Tempo):</strong> Hierarquia temporal composta por Ano, Trimestre e Mês.</li>
              <li><strong className="text-emerald-400">Eixo Z (Região):</strong> Segmentação geográfica (Norte, Sudeste, Sul, etc).</li>
            </ul>
          </div>

          {/* Card 2: Slice & Dice */}
          <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-800/50 border-slate-700/80" : "bg-slate-50 border-slate-200"} space-y-3`}>
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>2. Operações Slice & Dice</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              O fatiamento reativo permite isolar interseções do cubo para análise detalhada:
            </p>
            <ul className="text-xs space-y-1.5 list-disc list-inside font-medium text-slate-300">
              <li><strong className="text-emerald-400">Slice (Fatiar):</strong> Filtra uma única dimensão (ex: isolar apenas o Ano 2024).</li>
              <li><strong className="text-amber-400">Dice (Dados em Dados):</strong> Seleciona um sub-cubo definindo múltiplos critérios.</li>
              <li><strong className="text-sky-400">Drill-Down:</strong> Aprofunda o nível de detalhamento (de Ano para Trimestre).</li>
            </ul>
          </div>

          {/* Card 3: Hyperblock & Vectorized Calculation */}
          <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-800/50 border-slate-700/80" : "bg-slate-50 border-slate-200"} space-y-3`}>
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>3. Motor Reativo Polars & DuckDB</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Diferente de planilhas tradicionais que recalculam a tabela inteira, nosso motor <strong>Hyperblock</strong>:
            </p>
            <ul className="text-xs space-y-1.5 list-disc list-inside font-medium text-slate-300">
              <li>Executa agregações OLAP ultrarrápidas em memória via <strong>DuckDB SQL</strong>.</li>
              <li>Propaga alterações premissas em ordem topológica no <strong>DAG</strong> via <strong>Polars</strong>.</li>
              <li>Garante recálculo instantâneo apenas das fatias afetadas.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CubePage() {
  return (
    <PreferencesProvider>
      <CubePageContent />
    </PreferencesProvider>
  );
}
