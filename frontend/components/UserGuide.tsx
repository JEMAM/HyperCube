"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Sparkles,
  Layers,
  Network,
  Box,
  TrendingUp,
  Activity,
  FileSpreadsheet,
  Zap,
  CheckCircle2,
  HelpCircle,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Download,
  Terminal,
  ShieldCheck,
  Bot,
  Split,
  Database,
  Calendar,
  Cpu,
  Award,
  RefreshCw,
  ExternalLink,
  Calculator,
  Scale,
  Building2,
  Play,
  Lightbulb,
  Compass,
  SlidersHorizontal,
  BarChart2,
  Table,
  Eye,
  Check,
  CheckCircle,
  FileText
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import CompanyBadge from "./CompanyBadge";

interface UserGuideProps {
  onNavigate?: (mode: "LANDING" | "PLANNING" | "THREE_STATEMENT" | "OVERVIEW" | "CONNECTIONS" | "DRE" | "DFC" | "DAG" | "CUBE" | "ECONOMY" | "VALUATION" | "BP" | "CVM") => void;
}

interface GuideSection {
  id: string;
  number: string;
  title: string;
  category: string;
  badge: string;
  icon: any;
  summary: string;
  navTarget?: "LANDING" | "PLANNING" | "THREE_STATEMENT" | "OVERVIEW" | "CONNECTIONS" | "DRE" | "DFC" | "DAG" | "CUBE" | "ECONOMY" | "VALUATION" | "BP" | "CVM";
  content: React.ReactNode;
}


export default function UserGuide({ onNavigate }: UserGuideProps) {
  const { theme, language } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string>("sec-quickstart");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const sections: GuideSection[] = useMemo(() => [
    {
      id: "sec-quickstart",
      number: "01",
      title: isEn
        ? "Quick Start: Your First 5 Minutes on HyperCube"
        : "Início Rápido: Seus Primeiros 5 Minutos no HyperCube",
      category: isEn ? "Getting Started" : "Primeiros Passos",
      badge: isEn ? "Essential Onboarding" : "Guia Passo a Passo",
      icon: Compass,
      summary: isEn
        ? "The complete essential walkthrough to get started: from ingestion to valuation in 4 simple steps."
        : "O passo a passo essencial para começar do zero: da ingestão ao valuation em 4 etapas simples.",
      navTarget: "OVERVIEW",
      content: (
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {isEn ? (
              <>
                Welcome to <strong className="text-slate-900 dark:text-white font-bold">HyperCube Connected Planning</strong>! 
                Follow this 4-step sequence to operate the platform with maximum productivity from your very first session:
              </>
            ) : (
              <>
                Seja bem-vindo ao <strong className="text-slate-900 dark:text-white font-bold">HyperCube Connected Planning</strong>! 
                Siga a sequência abaixo para dominar a plataforma com máxima produtividade desde o seu primeiro acesso:
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Step 1 */}
            <div className={`p-5 rounded-2xl border transition shadow-sm ${
              isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                  1
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? "Step 1" : "Etapa 1"}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                {isEn ? "Select Company or Ingest Files" : "Selecione a Empresa ou Faça Ingestão"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-normal">
                {isEn
                  ? "Navigate to Overview & Ingestion. You can either use the pre-loaded company (Vale S.A., Banco do Brasil), choose from 750+ CVM public companies, or drag-and-drop your own DRE, DFC or Balance Sheet PDF/Excel."
                  : "Acesse a aba 'Visão Geral & Ingestão'. Você pode usar a empresa pré-carregada (Vale S.A., Banco do Brasil), pesquisar entre 750+ companhias abertas da CVM ou arrastar suas próprias demonstrações em PDF/Excel."}
              </p>
              <button
                onClick={() => onNavigate && onNavigate("OVERVIEW")}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>{isEn ? "Go to Overview & Ingestion" : "Ir para Visão Geral & Ingestão"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 2 */}
            <div className={`p-5 rounded-2xl border transition shadow-sm ${
              isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 font-black text-xs flex items-center justify-center border border-sky-500/30">
                  2
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? "Step 2" : "Etapa 2"}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                {isEn ? "Explore Connected Statements (DRE, DFC, BP)" : "Explore as Demonstrações (DRE, DFC, BP)"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-normal">
                {isEn
                  ? "Switch across the DRE, DFC, and Balance Sheet (BP) tabs. Inspect horizontal/vertical analysis, operating cash flows, working capital (Fleuriet Model: NCG, CDG, ST), and ask questions to the specialized AI analyst."
                  : "Navegue pelas abas de DRE, DFC e Balanço Patrimonial (BP). Veja análises vertical/horizontal, fluxo operacional, modelo Fleuriet (NCG, CDG, Saldo de Tesouraria) e tire dúvidas com o Agente Especialista IA."}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onNavigate && onNavigate("DRE")}
                  className="py-1.5 px-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[11px] font-bold transition text-center"
                >
                  DRE
                </button>
                <button
                  onClick={() => onNavigate && onNavigate("DFC")}
                  className="py-1.5 px-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-[11px] font-bold transition text-center"
                >
                  DFC
                </button>
                <button
                  onClick={() => onNavigate && onNavigate("BP")}
                  className="py-1.5 px-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[11px] font-bold transition text-center"
                >
                  Balanço (BP)
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`p-5 rounded-2xl border transition shadow-sm ${
              isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center border border-purple-500/30">
                  3
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? "Step 3" : "Etapa 3"}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                {isEn ? "Simulate What-If Scenarios & Corporate Valuation" : "Simule Cenários What-If & Valuation Corporativo"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-normal">
                {isEn
                  ? "Access Corporate Valuation. Use the 14-parameter What-If deck to stress WACC, beta, EBIT margin, capex, and growth rates. Watch Enterprise Value and Fair Share Price recalculate in real-time."
                  : "Acesse a tela de Valuation Corporativo. Utilize os 14 sliders do simulador What-If para alterar WACC, beta, margem EBIT, capex e crescimento. Veja o Enterprise Value e Preço Justo recalcularem em tempo real."}
              </p>
              <button
                onClick={() => onNavigate && onNavigate("VALUATION")}
                className="w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>{isEn ? "Open Corporate Valuation" : "Abrir Valuation Corporativo"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 4 */}
            <div className={`p-5 rounded-2xl border transition shadow-sm ${
              isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-anaplan-coral/20 text-anaplan-coral font-black text-xs flex items-center justify-center border border-anaplan-coral/30">
                  4
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? "Step 4" : "Etapa 4"}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                {isEn ? "3D OLAP Spatial Cube & BCB Macroeconomics" : "Cubo 3D OLAP & Macroeconomia BCB"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-normal">
                {isEn
                  ? "Inspect the multi-dimensional structure of accounts and temporal axes in the 3D OLAP Cube. Check live Selic, IPCA, and PTAX exchange rates in the Macroeconomics panel synced with BCB SGS."
                  : "Inspecione a estrutura tridimensional de contas e eixos temporais no Cubo 3D OLAP interativo. Monitore a Selic, IPCA e PTAX em tempo real no painel macroeconômico sincronizado com o SGS do Banco Central."}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigate && onNavigate("CUBE")}
                  className="py-1.5 px-3 rounded-xl bg-anaplan-coral/10 hover:bg-anaplan-coral/20 text-anaplan-coral border border-anaplan-coral/30 text-xs font-bold transition text-center"
                >
                  Cubo 3D OLAP
                </button>
                <button
                  onClick={() => onNavigate && onNavigate("ECONOMY")}
                  className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition text-center"
                >
                  Macro & BCB
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-1",
      number: "02",
      title: isEn
        ? "Platform Overview & Connected Planning Architecture"
        : "Visão Geral da Plataforma & Arquitetura Connected Planning",
      category: isEn ? "Fundamentals" : "Fundamentos",
      badge: isEn ? "Concept & Architecture" : "Conceito & Arquitetura",
      icon: Sparkles,
      summary: isEn
        ? "Understand the replacement of static spreadsheets with in-memory DAG graphs and multidimensional OLAP cubes."
        : "Entenda a substituição de planilhas estáticas por grafos DAG em memória e cubos multidimensionais OLAP.",
      navTarget: "PLANNING",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                <strong className="text-slate-900 dark:text-white font-bold">HyperCube</strong> is an enterprise continuous financial planning infrastructure (<em>Connected Planning</em>) designed to eliminate bloated spreadsheet matrix bottlenecks, circular formula errors, and recalculation lag.
              </>
            ) : (
              <>
                O <strong className="text-slate-900 dark:text-white font-bold">HyperCube</strong> é uma infraestrutura de planejamento financeiro corporativo contínuo (<em>Connected Planning</em>) projetada para eliminar os gargalos de matrizes de planilhas pesadas, erros de fórmulas circulares e lentidão em recálculos.
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}>
              <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400 mb-2">
                <Network className="w-4 h-4" />
                <span>{isEn ? "Conventional Spreadsheets vs HyperCube" : "Planilhas Convencionais vs HyperCube"}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li>• <strong className="text-slate-900 dark:text-white">{isEn ? "Spreadsheets:" : "Planilhas:"}</strong> {isEn ? "Recalculate entire workbook sequentially in O(N), locking complex models." : "Recalculam todo o arquivo sequencialmente em O(N), gerando travamentos em modelos complexos."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">HyperCube:</strong> {isEn ? "Uses topological sorting in DAG Graph, recalculating only O(K) impacted nodes in microseconds (< 2 ms)." : "Utiliza ordenação topológica em Grafo DAG, recalculando apenas os O(K) nós impactados em microssegundos (< 2 ms)."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">{isEn ? "Integrity:" : "Integridade:"}</strong> {isEn ? "Zero risk of formula corruption when adding new columns or scenario branches." : "Sem risco de corrupção de fórmulas ao adicionar colunas ou cenários."}</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}>
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                <Box className="w-4 h-4" />
                <span>{isEn ? "The 6 Dimensions of HyperCube" : "As 6 Dimensões do Hipercubo"}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li>• <strong className="text-slate-900 dark:text-white">1. {isEn ? "Time:" : "Tempo:"}</strong> {isEn ? "Quarters (1Q to 4Q) and Consolidated Annual (12M)." : "Trimestres (1T a 4T) e Consolidado Anual (12M)."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">2. {isEn ? "Financial Accounts:" : "Contas Contábeis:"}</strong> {isEn ? "18 canonical nodes for Income Statement (DRE), Cash Flow (DFC), and Balance Sheet (BP)." : "Nós canônicos interconectados de DRE, DFC e Balanço Patrimonial (BP)."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">3. {isEn ? "Scenarios:" : "Cenários:"}</strong> {isEn ? "Base, Optimistic (+10%), Stress (-15%), and Custom." : "Base, Otimista (+10%), Estresse (-15%) e Custom."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">4. {isEn ? "Versions:" : "Versões:"}</strong> {isEn ? "Actuals, Budget, and Forecast." : "Realizado (Actuals), Orçamento (Budget) e Forecast."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">5. {isEn ? "Operating Entities:" : "Unidades de Negócio:"}</strong> {isEn ? "Geographical divisions and subsidiaries." : "Operações geográficas e subsidiárias."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">6. {isEn ? "Metrics:" : "Métricas:"}</strong> {isEn ? "Nominal Values, YoY Growth %, Margins %, and Base 100." : "Valores Nominais, Variação YoY, Margem % e Base 100."}</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-2",
      number: "03",
      title: isEn
        ? "Financial Statements Ingestion & Canonical Mapping"
        : "Ingestão de Demonstrações & Mapeamento Canônico",
      category: isEn ? "Data & Setup" : "Dados & Setup",
      badge: isEn ? "Intelligent Ingestion" : "Ingestão Inteligente",
      icon: FileSpreadsheet,
      summary: isEn
        ? "How to import official PDF, Excel, and CSV statements with automated canonical classification."
        : "Como importar balanços oficiais em PDF, Excel e CSV com classificação automática de contas.",
      navTarget: "OVERVIEW",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn
              ? "The ingestion engine processes official corporate financial filings and aligns line items to the canonical financial taxonomy across all three core statements:"
              : "O módulo de ingestão processa documentos financeiros corporativos oficiais e realiza o alinhamento com a taxonomia canônica das três demonstrações contábeis fundamentais:"}
          </p>

          <div className="space-y-3 pt-1">
            <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="w-6 h-6 rounded-full bg-anaplan-coral/20 text-anaplan-coral font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {isEn ? "Choose Statement Type: DRE, DFC, BP or All Statements" : "Escolha o Tipo: DRE, DFC, Balanço (BP) ou Todas as Demonstrações"}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  {isEn
                    ? "In the Ingestion card, select whether you want to upload Income Statement (DRE), Cash Flow Statement (DFC), Balance Sheet (BP), or use 'Todas as Demonstrações' to ingest a full annual package at once."
                    : "No card de Ingestão, selecione se deseja carregar a DRE, a DFC, o Balanço Patrimonial (BP) ou clique no botão 'Todas as Demonstrações' para enviar o pacote contábil completo de uma vez."}
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="w-6 h-6 rounded-full bg-anaplan-coral/20 text-anaplan-coral font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {isEn ? "Drag & Drop Multi-Format Upload (.pdf, .xlsx, .csv, .txt)" : "Upload Multi-Formato (.pdf, .xlsx, .csv, .txt)"}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  {isEn
                    ? "The intelligent parser automatically isolates numerical tables, removes page footers, auditor signatures, and explanatory notes, and scales currency units (thousands or millions)."
                    : "O extrator inteligente isola tabelas numéricas, remove rodapés, assinaturas de auditores e notas explicativas, além de normalizar a escala monetária (milhares ou milhões de reais)."}
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="w-6 h-6 rounded-full bg-anaplan-coral/20 text-anaplan-coral font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {isEn ? "Canonical Mapping & DAG Graph Compilation" : "Mapeamento Canônico & Compilação do Grafo DAG"}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  {isEn
                    ? "Line items are classified into canonical accounts (Net Revenue, COGS, Gross Profit, SG&A, EBITDA, EBIT, Current/Non-Current Assets, Short/Long-Term Debt, Equity) and wired to the dependency graph."
                    : "As contas são classificadas em contas canônicas padronizadas (Receita Líquida, CMV, Lucro Bruto, SG&A, EBITDA, EBIT, Ativo Circulante/Não Circulante, Dívida Curto/Longo Prazo, PL) e conectadas ao grafo de dependências."}
                </p>
              </div>
            </div>
          </div>

          {/* Formas de Upload de Mais de Um Arquivo */}
          <div className={`p-5 rounded-2xl border mt-4 shadow-sm ${
            isDark ? "bg-slate-900/60 border-slate-800" : "bg-blue-50/60 border-blue-200/70"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-4 h-4 text-sky-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {isEn ? "📦 4 Ways to Upload Multiple Files / Statements" : "📦 As 4 Formas de Fazer Upload de Mais de Um Arquivo"}
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-blue-100"}`}>
                <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">
                  {isEn ? "1. Compressed Package (.ZIP)" : "1. Pacote Compactado (.ZIP)"}
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isEn
                    ? "Put all PDF/Excel files (DRE, DFC, Balance Sheet or multiple fiscal years) into a single .zip. The backend automatically unpacks, inspects, and matches all statements at once."
                    : "Reúna todos os PDFs ou planilhas (DRE, DFC, Balanço ou múltiplos exercícios) em um único arquivo .zip. O backend descompacta e classifica tudo de forma 100% automática."}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-blue-100"}`}>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                  {isEn ? "2. Sequential Upload by Statement" : "2. Upload Seletivo por Card"}
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isEn
                    ? "Use the dedicated cards (DRE, DFC, BP) to upload each statement from separate files. Each upload persists without overwriting previously loaded statements for that company."
                    : "Utilize os cards individuais na tela de Ingestão para subir arquivos separados de DRE, DFC ou BP. Cada upload é preservado na sessão sem apagar os outros."}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-blue-100"}`}>
                <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                  {isEn ? "3. Multi-Tab Excel Workbook (.xlsx)" : "3. Planilha Excel Multi-Abas (.xlsx)"}
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isEn
                    ? "Upload an Excel file with sheets named 'DRE', 'DFC', and 'BP'. The engine scans all sheets simultaneously and harmonizes them into the unified DAG."
                    : "Envie um único arquivo Excel com abas nomeadas como 'DRE', 'DFC' e 'BP'. O motor lê todas as abas simultaneamente e unifica o grafo financeiro."}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-blue-100"}`}>
                <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                  {isEn ? "4. Automated REST API Endpoint" : "4. API REST Automatizada (/api/upload-all)"}
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isEn
                    ? "Send multipart/form-data to POST /api/upload-all with .zip, .pdf, or .xlsx for automated batch ingestion pipelines directly from your ERP."
                    : "Envie requisições multipart/form-data para o endpoint POST /api/upload-all para esteiras de integração contínua diretamente do seu ERP (SAP/Totvs)."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-connections",
      number: "04",
      title: isEn
        ? "ERP & Database Connections (On-Premises & Cloud) — Live Connectors & Pipeline"
        : "Conexões ERP & Bancos de Dados (Local & Nuvem) — Integração e Variáveis",
      category: isEn ? "Data & Integration" : "Dados & Integração",
      badge: isEn ? "Live Connectors & Pipeline" : "Conectores Vivos & Pipeline",
      icon: Database,
      summary: isEn
        ? "Direct integration with Enterprise ERPs (SAP, Oracle, TOTVS, Dynamics, Senior, Sankhya, Omie) and SQL/Cloud databases with real-time ping and 4-stage pipeline."
        : "Conexão direta com qualquer ERP (SAP, Oracle, TOTVS, Dynamics, Senior, Sankhya, Omie) e Bancos de Dados SQL/Cloud com teste de ping e pipeline em 4 etapas.",
      navTarget: "CONNECTIONS",
      content: (
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                The <strong className="text-slate-900 dark:text-white font-bold">ERP & Database Connections</strong> panel (3rd navigation page) establishes a live data pipeline between your transactional enterprise systems and HyperCube's multidimensional DAG engine, eliminating repetitive manual spreadsheet uploads.
              </>
            ) : (
              <>
                A página de <strong className="text-slate-900 dark:text-white font-bold">Conexões ERP & Bancos de Dados</strong> (3ª página na barra de navegação) estabelece uma esteira viva de dados entre os sistemas transacionais da sua empresa e o motor DAG multidimensional do HyperCube, eliminando a dependência de exportações manuais de planilhas.
              </>
            )}
          </p>

          {/* Supported Systems Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}>
              <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400 mb-2">
                <Building2 className="w-4 h-4" />
                <span>{isEn ? "Supported Enterprise & National ERPs" : "ERPs Enterprise & Nacionais Suportados"}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li>• <strong className="text-slate-900 dark:text-white">SAP S/4HANA & ECC:</strong> {isEn ? "HANA In-Memory Driver (hdbcli), client (mandante), instance number, schema SAPABAP1, and ACDOCA unified ledger table." : "Driver SAP HANA In-Memory (hdbcli), mandante, número de instância, schema SAPABAP1 e tabela contábil unificada ACDOCA."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">Oracle Cloud ERP / NetSuite:</strong> {isEn ? "Native oracledb driver, port 1521, SID/Service Name, and GL_BALANCES_V view." : "Driver nativo oracledb, porta 1521, SID/Service Name e view do razão contábil GL_BALANCES_V."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">TOTVS Protheus & RM:</strong> {isEn ? "Relational backends (SQL Server, Oracle, PostgreSQL), branch filter (empresa/filial), and ledger movement tables (CT1, CT2010, CV3)." : "Bancos relacionais (SQL Server, Oracle, Postgres), filial/empresa 01 e tabelas contábeis CT1, CT2010 e CV3."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">Dynamics 365 / Senior / Sankhya:</strong> {isEn ? "OData endpoints, Dataverse, Azure Synapse, and Sapiens E640LCT movement tables." : "Endpoints OData v4, Azure Synapse, Dataverse e tabelas E640LCT (Sapiens) e TCBCON (Sankhya)."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">Omie / Conta Azul / Bling:</strong> {isEn ? "REST APIs with Webhooks and JSON accounting extraction for scale-ups and SMEs." : "APIs REST com Webhooks JSON e sincronização de DRE gerencial para PMEs e startups."}</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}>
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                <Database className="w-4 h-4" />
                <span>{isEn ? "SQL Databases & Cloud Warehouses" : "Bancos de Dados SQL & Cloud Warehouses"}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li>• <strong className="text-slate-900 dark:text-white">Oracle Database (19c/21c/23ai):</strong> {isEn ? "Direct corporate high-throughput queries with TCPS/SSL encryption." : "Consultas de altíssima vazão com criptografia TCPS/SSL."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">Microsoft SQL Server & Azure SQL:</strong> {isEn ? "ODBC Driver 18, Windows/SQL Authentication, and encrypted TLS connections." : "Driver ODBC 18, autenticação SQL/Windows e conexões criptografadas TLS."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">PostgreSQL & TimescaleDB:</strong> {isEn ? "Native psycopg2/asyncpg with hypertables for temporal accounting balances." : "Driver psycopg2/asyncpg nativo com hypertables para séries contábeis."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">Snowflake / BigQuery / Redshift:</strong> {isEn ? "Corporate Cloud Data Warehouses with serverless query execution." : "Cloud Data Warehouses corporativos com execução distribuída de queries contábeis."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">DuckDB Local (Embedded):</strong> {isEn ? "Default zero-latency in-memory vectorized engine." : "Motor embarcado nativo de latência sub-milissegundo em memória."}</li>
              </ul>
            </div>
          </div>

          {/* Connection Variables Guide */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? "bg-[#0b1626] border-[#142640]" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-anaplan-coral" />
              <span>{isEn ? "Configurable Connection Variables per Instrument" : "Variáveis de Conexão Configuráveis por Instrumento"}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-medium">
              {isEn
                ? "Clicking 'Configurar & Conectar' opens a tailored drawer with specific fields for each technology:"
                : "Ao clicar em 'Configurar & Conectar', um drawer dinâmico exibe os campos específicos para a tecnologia escolhida:"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${isDark ? "bg-[#070e1b] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">1. Rede & Ambiente</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {isEn ? "Host/Endpoint, default port (e.g. 1521, 1433, 5432, 30015), and Local (On-Premises) vs Cloud toggle." : "Host/IP, porta padrão (ex: 1521, 1433, 5432, 30015) e alternador Local (On-Premises) vs Nuvem (Cloud)."}
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? "bg-[#070e1b] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">2. Autenticação & Segurança</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {isEn ? "Database/SID, Schema, Username, masked Password/API Token with reveal toggle, and SSL/TLS Mode." : "Database/SID, Schema, Usuário, Senha/Token mascarados com visualizador opcional e Modo SSL/TLS."}
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? "bg-[#070e1b] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">3. Mapeamento Contábil</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {isEn ? "Target ledger table (ACDOCA, CT2010, GL_JE_LINES) mapped automatically via Schema Harmonizer." : "Tabela ou view contábil alvo (ACDOCA, CT2010, GL_JE_LINES) normalizada pelo Schema Harmonizer."}
                </span>
              </div>
            </div>
          </div>

          {/* The 4-Stage Connection Progress Pipeline */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? "bg-[#071322] border-emerald-500/30" : "bg-emerald-50/70 border-emerald-200"
          }`}>
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isEn ? "Real-Time Connection Progress Bar & 4-Stage Pipeline" : "Barra de Progresso da Conexão & Pipeline em 4 Estágios"}</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 font-medium">
              {isEn
                ? "The live progress bar visualizes the streaming state through 4 standardized validation stages:"
                : "A barra de progresso visualiza em tempo real a esteira de sincronização através de 4 fases:"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#050f1a] border-slate-800 text-slate-300" : "bg-white border-emerald-200 text-slate-800"}`}>
                <span className="font-black text-sky-600 dark:text-sky-400 block">Estágio 1 (25%)</span>
                <strong className="text-[11px] block mt-0.5">Handshake TCP/TLS</strong>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Medição de latência (ms) e abertura de socket.</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#050f1a] border-slate-800 text-slate-300" : "bg-white border-emerald-200 text-slate-800"}`}>
                <span className="font-black text-amber-600 dark:text-amber-400 block">Estágio 2 (50%)</span>
                <strong className="text-[11px] block mt-0.5">Autenticação & Driver</strong>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Validação de credenciais e certificados SSL.</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#050f1a] border-slate-800 text-slate-300" : "bg-white border-emerald-200 text-slate-800"}`}>
                <span className="font-black text-indigo-600 dark:text-indigo-400 block">Estágio 3 (75%)</span>
                <strong className="text-[11px] block mt-0.5">Mapeamento Contábil</strong>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Tradução 'De/Para' via Schema Harmonizer.</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#050f1a] border-slate-800 text-slate-300" : "bg-white border-emerald-200 text-slate-800"}`}>
                <span className="font-black text-emerald-600 dark:text-emerald-400 block">Estágio 4 (100%)</span>
                <strong className="text-[11px] block mt-0.5">Todas as Telas Ativas</strong>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400">DRE, DFC, BP, MultiDim, 3D Cube e Valuation alimentados.</span>
              </div>
            </div>
          </div>

          {/* Sandbox Mock Testing Card */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? "bg-[#0b1b2d] border-amber-500/30" : "bg-amber-50/70 border-amber-300"
          }`}>
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isEn ? "Testing with Simulated/Mock Data (Sandbox 1-Click)" : "Teste de Conexão com Dados Fictícios (Sandbox 1-Click)"}</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {isEn
                ? "You don't need real corporate production credentials to test connections. Every ERP in the catalog has a dedicated [Teste Sandbox] button that pre-fills realistic parameters and simulates up to 150,000 mock accounting entries in memory, validating ping latency and feeding all dashboard screens."
                : "Você não precisa ter credenciais de produção para testar as conexões. Todos os instrumentos do catálogo possuem um botão [Teste Sandbox] que preenche automaticamente parâmetros fictícios realistas e simula até 150.000 lançamentos contábeis em memória, medindo a latência real do ping e alimentando todas as telas do sistema."}
            </p>
          </div>

          {/* Action Call to Navigate */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => onNavigate && onNavigate("CONNECTIONS")}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>{isEn ? "Open ERP & Database Connections Panel" : "Abrir Conexões ERP & Bancos de Dados"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    },
    {
      id: "sec-bp",
      number: "05",
      title: isEn
        ? "Balance Sheet (BP), Fleuriet Model & AI Financial Analyst"
        : "Balanço Patrimonial (BP), Modelo Fleuriet & Analista de Balanço IA",
      category: isEn ? "Financial Statements" : "Demonstrações Contábeis",
      badge: isEn ? "Working Capital & Solvency" : "Capital de Giro & Solvência",
      icon: Scale,
      summary: isEn
        ? "Working capital dynamics (NCG, CDG, Treasury Balance - Fleuriet Model), liquidity ratios, and specialized AI chat."
        : "Dinâmica do capital de giro (NCG, CDG, Saldo de Tesouraria - Modelo Fleuriet), índices de liquidez e chat com IA especialista.",
      navTarget: "BP",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                The <strong className="text-slate-900 dark:text-white">Balance Sheet (BP)</strong> screen provides structural solvency analysis and dynamic working capital evaluation:
              </>
            ) : (
              <>
                A tela de <strong className="text-slate-900 dark:text-white">Balanço Patrimonial (BP)</strong> oferece a análise estrutural da solvência e da saúde financeira da empresa através do clássico <strong className="text-slate-900 dark:text-white">Modelo Fleuriet</strong>:
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-amber-500 mb-2">
                <Activity className="w-4 h-4" />
                <span>NCG (Necessidade de Capital de Giro)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {isEn
                  ? "Operating Current Assets minus Operating Current Liabilities. Measures the financial gap created by the operating cycle (Receivables + Inventory - Suppliers)."
                  : "Ativo Circulante Operacional (-) Passivo Circulante Operacional. Mede o descasamento gerado pelo ciclo operacional (Clientes + Estoques - Fornecedores)."}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-sky-500 mb-2">
                <Layers className="w-4 h-4" />
                <span>CDG (Capital de Giro Líquido)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {isEn
                  ? "Permanent Resources (Equity + Long-Term Liabilities) minus Fixed Assets. Represents the long-term funding available to finance operations."
                  : "Recursos Não Correntes (Patrimônio Líquido + Passivo Não Circulante) (-) Ativo Não Circulante. Representa a folga de recursos de longo prazo."}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-emerald-500 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>ST (Saldo de Tesouraria)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {isEn
                  ? "CDG minus NCG. If positive, the company enjoys financial comfort. If negative, the company relies on expensive short-term bank debt (scissor effect risk)."
                  : "CDG (-) NCG. Se positivo, indica folga e liquidez financeira. Se negativo, a empresa depende de dívidas bancárias de curto prazo (risco de efeito tesoura)."}
              </p>
            </div>
          </div>

          {/* AI Chat Agent for BP */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
            isDark ? "bg-indigo-950/20 border-indigo-800/60" : "bg-indigo-50/80 border-indigo-200"
          }`}>
            <Bot className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
                {isEn ? "Specialized Balance Sheet AI Agent" : "Agente Especialista IA com Skill de Análise de Balanço"}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                {isEn
                  ? "At the bottom of the Balance Sheet panel, you have a dedicated AI chat equipped with the analise-balanco-patrimonial skill. Ask for DuPont analysis, liquidity stress, debt coverage, or working capital recommendations in plain Portuguese or English."
                  : "No rodapé do painel do Balanço Patrimonial, você tem um chat com IA especializado equipado com a skill 'analise-balanco-patrimonial'. Pergunte sobre liquidez corrente, índice de endividamento, rentabilidade sobre o patrimônio líquido (ROE) ou risco de efeito tesoura."}
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-valuation",
      number: "06",
      title: isEn
        ? "Corporate Valuation & 14-Parameter What-If Simulator"
        : "Valuation Corporativo & Simulador What-If Multi-Paramétrico",
      category: isEn ? "Valuation & M&A" : "Valuation & M&A",
      badge: isEn ? "DCF & Multiples" : "DCF & Múltiplos",
      icon: Calculator,
      summary: isEn
        ? "Discounted cash flows, WACC / CAPM, Gordon Growth, relative market multiples, and live What-If sliders."
        : "Fluxo de caixa descontado, WACC / CAPM, crescimento perpétuo, múltiplos de mercado e sliders de What-If.",
      navTarget: "VALUATION",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                The <strong className="text-slate-900 dark:text-white">Corporate Valuation & Fair Value Analysis</strong> module provides full executive transparency across intrinsic and relative valuation methodologies:
              </>
            ) : (
              <>
                O módulo de <strong className="text-slate-900 dark:text-white">Valuation Corporativo & Análise de Valor Justo</strong> oferece transparência executiva completa combinando métodos intrínsecos e relativos:
              </>
            )}
          </p>

          {/* Key Features of Valuation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400 mb-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>{isEn ? "14-Parameter Interactive What-If Deck" : "Simulador What-If de 14 Parâmetros"}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {isEn
                  ? "Adjust variables individually with real-time recalculation of Enterprise Value, Equity Value, Fair Price, and Upside:"
                  : "Ajuste cada variável matemática individualmente com recálculo instantâneo em tempo real:"}
              </p>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                <li>• <strong className="text-slate-900 dark:text-white">Custo de Capital:</strong> Taxa Livre de Risco (Rf), Beta (β), Prêmio de Risco (ERP), Custo da Dívida (Kd), Alavancagem (D/V) e WACC Global.</li>
                <li>• <strong className="text-slate-900 dark:text-white">Operação & DCF:</strong> Margem EBIT Projetada, CAGR Receita Anos 1-5, Crescimento Perpétuo (g), Intensidade de CAPEX e Giro (ΔNWC).</li>
                <li>• <strong className="text-slate-900 dark:text-white">Múltiplos dos Pares:</strong> Múltiplo EV/EBITDA de Saída e Múltiplo Preço/Lucro (P/L).</li>
                <li>• <strong className="text-slate-900 dark:text-white">Cenários Rápidos:</strong> Presets Bull (Otimista) e Bear (Estresse) em 1 clique.</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                <BookOpen className="w-4 h-4" />
                <span>{isEn ? "Tab 5: Methodologies & Parameter Matrix" : "Aba 5: Metodologias & Parâmetros dos Indicadores"}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {isEn
                  ? "Inspect the exact mathematical formula, symbol, What-If live value, and price elasticity for every single indicator."
                  : "Consulte a fórmula matemática exata, símbolo, valor vigente do What-If e a elasticidade/impacto no preço justo para cada indicador do modelo."}
              </p>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                <li>• <strong className="text-slate-900 dark:text-white">Gráfico FCFF Ajustado:</strong> Visualização do Fluxo Livre Nominal vs. Valor Presente Descontado ao WACC com escala limpa em R$ Bi.</li>
                <li>• <strong className="text-slate-900 dark:text-white">Football Field:</strong> Cruzamento de DCF Gordon, Exit Multiple, EV/EBITDA e P/L com faixa recomendada de valor.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-3",
      number: "07",
      title: isEn
        ? "Connected Planning N-D: Write-Back & Breakback"
        : "Planejamento Conectado N-D: Write-Back & Breakback",
      category: isEn ? "Operation" : "Operação",
      badge: isEn ? "Multidimensional Editing" : "Edição Multidimensional",
      icon: Layers,
      summary: isEn
        ? "Direct grid cell editing with Top-Down Spread (Breakback) and scenario branching."
        : "Edição direta de células na grade com distribuição Top-Down (Breakback) e ramificação de cenários.",
      navTarget: "PLANNING",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                The <strong className="text-slate-900 dark:text-white">Connected Planning (N-D)</strong> view provides the multi-axis analytical planning experience:
              </>
            ) : (
              <>
                A página <strong className="text-slate-900 dark:text-white">Planejamento Conectado (N-D)</strong> oferece a experiência definitiva de edição analítica multi-eixo:
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-anaplan-coral mb-2">
                <Split className="w-4 h-4" />
                <span>{isEn ? "Breakback Mechanism (Top-Down Spread)" : "Mecanismo de Breakback (Top-Down Spread)"}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {isEn
                  ? "When modifying a consolidated account or annual total, HyperCube triggers the Breakback dialog to let you allocate changes to child accounts:"
                  : "Ao alterar o valor de uma conta consolidada ou total anual, o HyperCube abre o modal de Breakback para você escolher como distribuir o valor entre as contas filhas:"}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium mt-2">
                <li>• <strong className="text-slate-900 dark:text-white">{isEn ? "Proportional Distribution:" : "Distribuição Proporcional:"}</strong> {isEn ? "Preserves the historical baseline weight of each operating unit or quarter." : "Mantém o peso histórico de cada operação ou trimestre."}</li>
                <li>• <strong className="text-slate-900 dark:text-white">{isEn ? "Equal Spread:" : "Distribuição Igualitária:"}</strong> {isEn ? "Divides the target variance equally among all child units." : "Divide o valor em partes iguais entre as operações filhas."}</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400 mb-2">
                <Cpu className="w-4 h-4" />
                <span>{isEn ? "Scenario Branching & Budgeting" : "Branching de Cenários & Orçamento"}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {isEn
                  ? "Enables cloning the actual or budget baseline into an isolated new scenario branch:"
                  : "Permite clonar a base realizada ou orçada em uma nova ramificação isolada:"}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium mt-2">
                <li>• {isEn ? "Create FX shock, inflation, or raw material stress scenarios (+10%, -5%)." : "Criação de cenários de estresse de câmbio ou custos de insumos (+10%, -5%)."}</li>
                <li>• {isEn ? "Side-by-side comparison in the Variance Statement (Actual vs Budget)." : "Comparativo lado a lado no demonstrativo de variância (Actual vs Budget)."}</li>
              </ul>
            </div>
          </div>

          {/* Matriz de Variáveis Modificáveis por Página */}
          <div className={`p-5 rounded-2xl border mt-4 shadow-sm ${
            isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50/80 border-slate-200"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-anaplan-coral" />
              <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {isEn ? "🎛️ Complete Modifiable Variables Matrix for Scenario Modeling" : "🎛️ Matriz Completa de Variáveis Modificáveis para Cenários em Todas as Páginas"}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed font-normal">
              {isEn
                ? "Every module in HyperCube exposes specific operational and financial levers that propagate through the Directed Acyclic Graph (DAG):"
                : "Cada página da plataforma expõe alavancas operacionais e financeiras que recalculam o modelo reativamente através do Grafo DAG:"}
            </p>

            <div className="space-y-3 text-xs">
              {/* DRE */}
              <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {isEn ? "1. Income Statement (DRE)" : "1. Demonstração do Resultado (DRE)"}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {isEn ? "8 Levers" : "8 Variáveis"}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  <strong>{isEn ? "Modifiable Variables:" : "Variáveis Modificáveis:"}</strong> Receita Bruta / Intermediação, Deduções/Impostos s/ Vendas, CPV / CMV / Captações, Despesas com Vendas & Logística, Despesas Gerais & Administrativas (SG&A), Provisão de Crédito (PDD), Resultado Financeiro Líquido e Alíquota de IR/CSLL.
                  <br />
                  <span className="text-slate-500 dark:text-slate-500 text-[11px] block mt-1">
                    ↳ <em>{isEn ? "DAG Impact:" : "Impacto de Jusante (DAG):"}</em> Recálculo de Margem Bruta, EBITDA, EBIT, LAIR e Lucro Líquido.
                  </span>
                </p>
              </div>

              {/* DFC */}
              <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between font-bold text-teal-600 dark:text-teal-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    {isEn ? "2. Cash Flow Statement (DFC)" : "2. Fluxo de Caixa (DFC)"}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                    {isEn ? "10 Levers" : "10 Variáveis"}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  <strong>{isEn ? "Modifiable Variables:" : "Variáveis Modificáveis:"}</strong> Recebimento de Clientes (PMR/DSO), Pagamento a Fornecedores (PMP/DPO), Desembolso de Pessoal, Impostos Pagos, CAPEX em Imobilizado, Desinvestimento de Ativos, Captação de Empréstimos/Letras, Amortização de Dívidas e Pagamento de Dividendos/JCP.
                  <br />
                  <span className="text-slate-500 dark:text-slate-500 text-[11px] block mt-1">
                    ↳ <em>{isEn ? "DAG Impact:" : "Impacto de Jusante (DAG):"}</em> Recálculo do FCO, FCI, FCF, Variação Líquida e Saldo Final de Caixa.
                  </span>
                </p>
              </div>

              {/* BP */}
              <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    {isEn ? "3. Balance Sheet (BP) & Fleuriet" : "3. Balanço Patrimonial (BP) & Fleuriet"}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {isEn ? "12 Levers" : "12 Variáveis"}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  <strong>{isEn ? "Modifiable Variables:" : "Variáveis Modificáveis:"}</strong> Caixa e Aplicações, Contas a Receber, Estoques, Outros Ativos Circulantes, Realizável a Longo Prazo, Imobilizado Líquido, Fornecedores, Dívidas CP e LP, Provisões de Contingências, Capital Social e Reservas de Lucros.
                  <br />
                  <span className="text-slate-500 dark:text-slate-500 text-[11px] block mt-1">
                    ↳ <em>{isEn ? "DAG Impact:" : "Impacto de Jusante (DAG):"}</em> Fechamento Contábil (Delta = 0,00), Índices de Liquidez (Corrente, Seca, Imediata) e Modelo Fleuriet (NCG, CDG, ST).
                  </span>
                </p>
              </div>

              {/* Valuation */}
              <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between font-bold text-purple-600 dark:text-purple-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    {isEn ? "4. Corporate Valuation & What-If Deck" : "4. Valuation Corporativo & Simulador What-If"}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {isEn ? "14 Sliders" : "14 Sliders"}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  <strong>{isEn ? "Modifiable Variables:" : "Variáveis Modificáveis:"}</strong> Taxa Livre de Risco (Rf), Beta do Ativo (β), Prêmio de Risco (ERP), Custo da Dívida (Kd), Alavancagem (D/V), Margem EBIT Projetada, CAGR de Crescimento de Receita, Crescimento Perpétuo (g), CAPEX Ratio, Variação NWC, Múltiplo EV/EBITDA e Múltiplo P/L.
                  <br />
                  <span className="text-slate-500 dark:text-slate-500 text-[11px] block mt-1">
                    ↳ <em>{isEn ? "DAG Impact:" : "Impacto de Jusante (DAG):"}</em> Enterprise Value, Equity Value, Preço Justo por Ação (Fair Price) e Gráfico Football Field.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-waterfall",
      number: "08",
      title: isEn
        ? "Waterfall Variance Bridge & Volume-Price-Mix Causal Analysis"
        : "Ponte de Variância Waterfall & Análise Volume-Preço-Mix",
      category: isEn ? "Strategic FP&A" : "FP&A Estratégico",
      badge: isEn ? "100% Additive Closure" : "Decomposição Causal 100% Fechada",
      icon: BarChart2,
      summary: isEn
        ? "Executive variance bridge decomposing EBITDA, Revenue, and Net Income gaps into Volume, Price, COGS, and SG&A levers with perfect closure."
        : "Ponte executiva de variância decompondo desvios de EBITDA, Receita e Lucro Líquido em Volume, Preço Médio, Custos e SG&A com fechamento exato.",
      navTarget: "PLANNING",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                The <strong className="text-slate-900 dark:text-white">Waterfall Variance Bridge</strong> transforms complex multi-dimensional budget variances into an intuitive, board-ready narrative, answering why actual performance deviated from budget or prior year:
              </>
            ) : (
              <>
                A <strong className="text-slate-900 dark:text-white">Ponte de Variância Waterfall</strong> transforma variações orçamentárias complexas em uma narrativa executiva imediata para a diretoria e conselho de administração, explicando com rigor causal por que o resultado diferiu do orçamento ou do ano anterior:
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                <BarChart2 className="w-4 h-4" />
                <span>{isEn ? "Ponte de EBITDA" : "Ponte de EBITDA"}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {isEn
                  ? "Decomposes operating variance into Volume Effect, Price Realization, COGS Efficiency, Commercial/Marketing, and Fixed Overhead G&A."
                  : "Decompõe a variação operacional nos efeitos Volume, Realização de Preço Médio, Eficiência de Custos (CMV), Vendas & Marketing e G&A Fixo."}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>{isEn ? "Ponte de Receita Líquida" : "Ponte de Receita Líquida"}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {isEn
                  ? "Isolates real volume expansion from inflationary price adjustments, currency effects, and tax deduction variations."
                  : "Isola a expansão orgânica de volume das repactuações inflacionárias de preço, efeitos cambiais e carga tributária sobre vendas."}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400 mb-2">
                <Scale className="w-4 h-4" />
                <span>{isEn ? "Ponte de Lucro Líquido" : "Ponte de Lucro Líquido"}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {isEn
                  ? "Incorporates operating drivers alongside financial results (interest rates and FX) and effective income tax rate variations."
                  : "Incorpora os desvios operacionais com despesas financeiras (impacto de Selic/Dívida) e alíquota efetiva de imposto de renda."}
              </p>
            </div>
          </div>

          {/* Mathematical Closure Guarantee */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? "bg-[#071322] border-emerald-500/30" : "bg-emerald-50/70 border-emerald-200"
          }`}>
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isEn ? "100% Mathematical Closure Guarantee" : "Garantia de Fechamento Matemático Aditivo de 100%"}</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {isEn
                ? "Unlike simplistic charts that leave unexplained discrepancies, HyperCube's Waterfall Engine guarantees strict mathematical closure: Target Value = Base Value + sum of all step effects, with residuals captured in transparent plug reconciling line items."
                : "Diferente de ferramentas que deixam discrepâncias inexplicadas, o Motor Waterfall do HyperCube garante fechamento aditivo rigoroso: Valor Alvo = Valor Base + somatório de todos os efeitos causais, com resíduos capturados de forma transparente."}
            </p>
          </div>
        </div>
      )
    },
    {
      id: "sec-three-statement",
      number: "09",
      title: isEn
        ? "Closed-Loop 3-Statement Model (DRE ↔ DFC ↔ BP) & Fleuriet"
        : "Modelo Triangular Fechado 3-Statement (DRE ↔ DFC ↔ BP) & Fleuriet",
      category: isEn ? "Integrated Modeling" : "Modelagem Integrada",
      badge: isEn ? "Zero-Delta Balance & Solvency" : "Reconciliação Delta Zero & Fleuriet",
      icon: Scale,
      summary: isEn
        ? "Unified real-time loop linking Income Statement, Cash Flow, and Balance Sheet with zero tolerance for imbalance and dynamic working capital."
        : "Loop dinâmico em tempo real amarrando DRE, DFC e Balanço com tolerância zero a descasamentos patrimoniais (Ativo = Passivo + PL) e gestão Fleuriet.",
      navTarget: "THREE_STATEMENT",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                The <strong className="text-slate-900 dark:text-white">Closed-Loop 3-Statement Model</strong> solves the fundamental challenge of corporate financial modeling: creating an unbroken, multi-period mathematical circle between the three core financial statements without formula circularity or spreadsheet freeze:
              </>
            ) : (
              <>
                O <strong className="text-slate-900 dark:text-white">Modelo Triangular Fechado 3-Statement</strong> resolve o maior desafio da modelagem financeira corporativa: criar uma amarração contínua e multi-período entre as 3 demonstrações primárias sem circularidade e com integridade absoluta:
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400 mb-2">
                <Network className="w-4 h-4" />
                <span>{isEn ? "The 3 Statement Ties" : "Os Vínculos Causais do Triângulo"}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li>• <strong className="text-slate-900 dark:text-white">DRE ➔ DFC:</strong> O Lucro Líquido da DRE é o ponto de partida do Fluxo de Caixa Indireto, ajustado por D&A e variações de capital de giro.</li>
                <li>• <strong className="text-slate-900 dark:text-white">DFC ➔ Balanço (BP):</strong> A variação líquida de caixa alimenta diretamente a conta Caixa e Equivalentes do Ativo Circulante.</li>
                <li>• <strong className="text-slate-900 dark:text-white">DRE ➔ Balanço (PL):</strong> O Lucro Líquido deduzido de dividendos provisionados incrementa a conta Lucros Acumulados no Patrimônio Líquido.</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 mb-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>{isEn ? "Operational Drivers Simulation Drawer" : "Gaveta de Simulador de Direcionadores"}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li>• <strong className="text-slate-900 dark:text-white">PMR (DSO):</strong> Prazo Médio de Recebimento de Clientes (dias).</li>
                <li>• <strong className="text-slate-900 dark:text-white">PME (DIO):</strong> Prazo Médio de Renovação de Estoques (dias).</li>
                <li>• <strong className="text-slate-900 dark:text-white">PMP (DPO):</strong> Prazo Médio de Pagamento a Fornecedores (dias).</li>
                <li>• <strong className="text-slate-900 dark:text-white">Capex & Expansão:</strong> Investimentos em ativos imobilizados e intangíveis.</li>
                <li>• <strong className="text-slate-900 dark:text-white">Dividend Payout:</strong> Percentual de distribuição de lucro aos acionistas.</li>
              </ul>
            </div>
          </div>

          {/* Fleuriet Model & Overtrading Warning */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? "bg-slate-900/60 border-slate-800" : "bg-amber-50/70 border-amber-300"
          }`}>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isEn ? "Fleuriet Dynamic Working Capital & Scissor Effect Alert" : "Modelo Fleuriet Dinâmico & Detecção de Efeito Tesoura"}</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              O módulo calcula instantaneamente a <strong>Necessidade de Capital de Giro (NCG)</strong>, o <strong>Capital de Giro Próprio (CDG)</strong> e o <strong>Saldo de Tesouraria (ST)</strong>. Se o crescimento de vendas exigir aumento desproporcional de NCG financiado por dívidas de curto prazo, o sistema emite um alerta preventivo de <em>Efeito Tesoura (Overtrading)</em>.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "sec-4",
      number: "10",

      title: isEn
        ? "Reactive DAG Engine, What-If Simulations & Agno AI Agent"
        : "Motor DAG Reativo, Simulações What-If & Agente Agno (PhD)",
      category: isEn ? "Calculation Engine" : "Motor de Cálculo",
      badge: isEn ? "Reactivity < 2ms" : "Reatividade < 2ms",
      icon: Zap,
      summary: isEn
        ? "How the dependency graph propagates shocks and generates natural language financial diagnostics."
        : "Como o grafo de dependências propaga choques paramétricos e gera diagnósticos em linguagem natural.",
      navTarget: "DRE",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                In the <strong className="text-slate-900 dark:text-white">Income Statement (DRE)</strong> and <strong className="text-slate-900 dark:text-white">Cash Flow (DFC)</strong> panels, <em>What-If</em> simulations re-evaluate the entire financial model in real time:
              </>
            ) : (
              <>
                No painel de <strong className="text-slate-900 dark:text-white">Demonstração DRE</strong> e <strong className="text-slate-900 dark:text-white">Fluxo de Caixa (DFC)</strong>, as simulações <em>What-If</em> reavaliam o modelo financeiro em tempo real:
              </>
            )}
          </p>

          <div className={`p-4 rounded-2xl border space-y-3 shadow-sm ${
            isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{isEn ? "How to Run a What-If Simulation:" : "Como Executar uma Simulação What-If:"}</span>
            </h4>
            <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium pl-4 list-decimal">
              <li>{isEn ? "Select the " : "Selecione o "}<strong className="text-slate-900 dark:text-white">{isEn ? "Input Assumption Node" : "Nó de Premissa"}</strong> {isEn ? "(e.g., Net Operating Revenue, Operating COGS, or SG&A)." : "(ex: Receita Operacional Líquida, Custos Operacionais / CMV ou Despesas SG&A)."}</li>
              <li>{isEn ? "Adjust the " : "Ajuste a "}<strong className="text-slate-900 dark:text-white">{isEn ? "Percentage Variance (%)" : "Variação Percentual (%)"}</strong> {isEn ? "via the slider or numeric input (e.g. " : "através do slider ou campo numérico (ex: "}<code>+5.00%</code>).</li>
              <li>{isEn ? "Set the target " : "Defina o "}<strong className="text-slate-900 dark:text-white">{isEn ? "Year / Period Range" : "Intervalo de Anos"}</strong>.</li>
              <li>{isEn ? "Click " : "Clique em "}<strong className="text-slate-900 dark:text-white">{isEn ? "Run Simulation" : "Executar Simulação"}</strong>: {isEn ? "the DAG graph recomputes all downstream nodes in " : "o grafo DAG recalcula os nós dependentes em "}<strong className="text-emerald-600 dark:text-emerald-400">&lt; 2 ms</strong>.</li>
              <li>{isEn ? "The " : "O "}<strong className="text-slate-900 dark:text-white">{isEn ? "AI Financial Agent (PhD Economist)" : "Agente IA Agno (PhD Economista)"}</strong> {isEn ? "automatically generates natural language explanations in the panel." : "gera automaticamente o diagnóstico explicativo em linguagem natural no painel."}</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: "sec-5",
      number: "09",
      title: isEn
        ? "3D WebGL Spatial Explorer (OLAP Cube)"
        : "Visualizador Espacial 3D WebGL (Cubo OLAP)",
      category: isEn ? "3D Visualization" : "Visualização 3D",
      badge: "Three.js & WebGL",
      icon: Box,
      summary: isEn
        ? "Orbital navigation and volumetric inspection of financial and temporal intersections."
        : "Navegação orbital e inspeção volumétrica das intersecções contábeis e temporais.",
      navTarget: "CUBE",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                The <strong className="text-slate-900 dark:text-white">Interactive 3D OLAP Cube</strong> transforms flat matrix tables into an interactive spatial geometric model rendered in WebGL via Three.js:
              </>
            ) : (
              <>
                O <strong className="text-slate-900 dark:text-white">Cubo 3D OLAP Interativo</strong> transforma planilhas tabulares em um modelo geométrico espacial interativo renderizado em WebGL via Three.js:
              </>
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className={`p-3.5 rounded-xl border text-center shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center font-bold text-xs mb-2">Y</div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">{isEn ? "Vertical Axis (Y)" : "Eixo Vertical (Y)"}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">{isEn ? "Profit Margin & Profitability (%)" : "Margem de Lucro e Rentabilidade (%)"}</p>
            </div>

            <div className={`p-3.5 rounded-xl border text-center shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center font-bold text-xs mb-2">{isEn ? "Color" : "Cor"}</div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">{isEn ? "Voxel Color" : "Cor do Voxel"}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">{isEn ? "Sales Volume & Income Statement Accounts" : "Volume de Vendas e Contas da DRE"}</p>
            </div>

            <div className={`p-3.5 rounded-xl border text-center shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-bold text-xs mb-2">Z</div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">{isEn ? "Depth Axis (Z)" : "Profundidade (Z)"}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">{isEn ? "Temporal Trajectory (Years & Quarters)" : "Trajetória Temporal (Anos e Trimestres)"}</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 pt-1 font-medium">
            💡 <strong className="text-slate-800 dark:text-slate-200">{isEn ? "Navigation Tip:" : "Dica de Navegação:"}</strong> {isEn ? "Click and drag to rotate the cube spatially, use the scroll wheel to zoom, and click any voxel to inspect its financial value." : "Clique e arraste para rotacionar o cubo espacialmente, use a roda do mouse para zoom, e clique em qualquer voxel para abrir o painel de inspeção."}
          </div>
        </div>
      )
    },
    {
      id: "sec-6",
      number: "10",
      title: isEn
        ? "Macroeconomics, Weekly Focus Survey & Central Bank Sync"
        : "Macroeconomia, Pesquisa Focus Semanal & Sincronização BCB",
      category: isEn ? "Macroeconomics" : "Macroeconomia",
      badge: "SGS BCB & Focus",
      icon: TrendingUp,
      summary: isEn
        ? "Central Bank official time series, 6-week Focus survey history, and background daily updates."
        : "Séries oficiais do Banco Central, histórico de 6 semanas da Focus e worker diário em background.",
      navTarget: "ECONOMY",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                The <strong className="text-slate-900 dark:text-white">Macroeconomics & BCB</strong> tab connects corporate planning to official Central Bank of Brazil indicators:
              </>
            ) : (
              <>
                A aba <strong className="text-slate-900 dark:text-white">Macroeconomia & BCB</strong> conecta o planejamento corporativo às variáveis macroeconômicas oficiais do Banco Central do Brasil:
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}>
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm mb-2">
                {isEn ? "Official BCB SGS Series" : "Séries Oficiais SGS BCB (Padrão 2 Casas Decimais)"}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li>• <strong className="text-slate-900 dark:text-white">SGS 432:</strong> {isEn ? "Selic Target Rate Copom" : "Taxa Selic Meta Copom"} (<strong className="text-emerald-600 dark:text-emerald-400">14.00% a.a.</strong>)</li>
                <li>• <strong className="text-slate-900 dark:text-white">SGS 13522:</strong> {isEn ? "IPCA Inflation 12M" : "IPCA Acumulado 12 Meses"} (<strong className="text-sky-600 dark:text-sky-400">4.44%</strong>)</li>
                <li>• <strong className="text-slate-900 dark:text-white">SGS 10813:</strong> {isEn ? "USD/BRL PTAX FX Rate" : "Câmbio USD/BRL PTAX Venda"} (<strong className="text-amber-600 dark:text-amber-400">R$ 5.22</strong>)</li>
                <li>• <strong className="text-slate-900 dark:text-white">SGS 13762:</strong> {isEn ? "Gross General Government Debt" : "Dívida Bruta Governo Geral"} (<strong className="text-rose-600 dark:text-rose-400">81.93% do PIB</strong>)</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}>
              <h4 className="font-bold text-anaplan-coral text-xs sm:text-sm mb-2">
                {isEn ? "Weekly Focus Survey (Mondays)" : "Pesquisa Focus Semanal (Segundas-feiras)"}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {isEn
                  ? "Table with the latest 6 consecutive official release weeks (Friday close, Monday 08:30 publication)."
                  : "Tabela com as últimas 6 semanas consecutivas de divulgação oficial (fechamento às sextas, publicação às segundas 08h30)."}
              </p>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-medium mt-2">
                <li>• {isEn ? "Metrics: Median, Mean, Standard Deviation, Spread, and Respondents." : "Métricas: Mediana, Média, Desvio Padrão, Spread e Respondentes."}</li>
                <li>• {isEn ? "Automated Deltas: Δ 1-Week and Δ 4-Week." : "Variações automáticas: Δ 1 semana e Δ 4 semanas."}</li>
                <li>• {isEn ? "CSV Export button for direct financial modeling." : "Botão de Exportação em CSV para modelagem."}</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-cvm",
      number: "11",
      title: isEn
        ? "CVM Watchdog & Public Companies Registry"
        : "CVM Watchdog & Cadastro de Companhias Abertas",
      category: isEn ? "Compliance & Market" : "Mercado & Regulação",
      badge: "750+ Companhias",
      icon: Building2,
      summary: isEn
        ? "Automated synchronization of publicly traded companies registered with CVM (Brazil's SEC) and financial filings."
        : "Sincronização automática do cadastro de companhias abertas da CVM e demonstrações financeiras.",
      navTarget: "CVM",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn ? (
              <>
                The <strong className="text-slate-900 dark:text-white">CVM Watchdog</strong> maintains an automated link with the Brazilian Securities and Exchange Commission (Comissão de Valores Mobiliários):
              </>
            ) : (
              <>
                O <strong className="text-slate-900 dark:text-white">CVM Watchdog</strong> mantém um vínculo automatizado com os dados abertos oficiais da Comissão de Valores Mobiliários:
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <h4 className="font-bold text-sky-600 dark:text-sky-400 text-xs sm:text-sm mb-2">
                {isEn ? "CVM Open Data Integration (cad_cia_aberta.csv)" : "Integração CVM Dados Abertos"}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {isEn
                  ? "Synchronizes 750+ registered corporations with their official CVM Code, CNPJ, Industry Sector, and Trading Status on B3."
                  : "Sincroniza mais de 750 companhias registradas com código CVM, CNPJ, setor de atividade econômica e situação de negociação na B3."}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm mb-2">
                {isEn ? "Direct Ingestion by Ticker" : "Ingestão Direta por Ticker"}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {isEn
                  ? "Search for tickers like VALE3, PETR4, BBAS3, or ITUB4 to load standardized financial reports directly into the HyperCube workspace."
                  : "Pesquise por tickers como VALE3, PETR4, BBAS3 ou ITUB4 para carregar demonstrações padronizadas diretamente no workspace do HyperCube."}
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-7",
      number: "12",
      title: isEn
        ? "AI Engines & Multi-Provider LLM Configuration"
        : "Configuração de Motores de IA & LLMs Multi-Provedor",
      category: isEn ? "Artificial Intelligence" : "Inteligência Artificial",
      badge: isEn ? "18 Integrated Models" : "18 Modelos Integrados",
      icon: Bot,
      summary: isEn
        ? "How to select and switch between Claude, ChatGPT, Ollama, Groq, and Gemini on any screen."
        : "Como selecionar e alternar entre Claude, ChatGPT, Ollama, Groq e Gemini em qualquer tela.",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>
            {isEn
              ? "HyperCube is model-agnostic, allowing you to choose the optimal AI infrastructure according to your company's privacy, compliance, and latency policies:"
              : "O HyperCube é agnóstico a modelos de linguagem, permitindo escolher a infraestrutura ideal de acordo com a política de privacidade e velocidade da sua empresa:"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div className={`p-3.5 rounded-xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">Claude (Anthropic)</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Opus 5, Fable 5, Sonnet 5, Haiku 4.5</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                {isEn ? "Deep financial reasoning and accounting audit." : "Raciocínio financeiro e auditoria contábil profunda."}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">ChatGPT (OpenAI)</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">GPT-5.6 Sol/Luna, GPT-5.5, o3/o4-mini, Codex</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                {isEn ? "Flagship frontier models and mathematical reasoning." : "Flagship frontier e cadeia de pensamento matemática."}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Ollama (Local / On-Premise)</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Gemma 4/3, Qwen 3.6/3, DeepSeek-R1/V3</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                {isEn ? "Complete data privacy running 100% on local hardware." : "Privacidade total com execução em hardware local."}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Groq (Ultra-Fast LPU)</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Llama 3.1/3.3/4, DeepSeek R1, GPT-OSS</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                {isEn ? "Accelerated inference at over 800 tokens/second." : "Inferência acelerada a mais de 800 tokens/s."}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Gemini (Google DeepMind)</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Gemini 3.1 Pro, 3.6/3.5 Flash, 3.5 Flash-Lite</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                {isEn ? "Massive 2M+ context window and multimodal analysis." : "Janela de contexto gigante e análise multimodal."}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 pt-1 font-medium">
            👉 <strong className="text-slate-800 dark:text-slate-200">{isEn ? "To change active AI model:" : "Para alterar o modelo:"}</strong> {isEn ? "Click the 🤖 [Active Model] button on the top right header anytime." : "Clique no botão 🤖 [Modelo Ativo] no topo direito da tela a qualquer momento."}
          </div>
        </div>
      )
    },
  ], [isDark, isEn, onNavigate]);

  const faqs = useMemo(() => [
    {
      q: isEn
        ? "How does HyperCube guarantee data integrity during scenario simulations?"
        : "Como o HyperCube garante a integridade dos dados ao simular cenários?",
      a: isEn
        ? "HyperCube executes simulations in isolated in-memory branches. Original baseline data is never overwritten. Furthermore, DAG topological ordering guarantees that calculations strictly adhere to financial accounting hierarchies."
        : "O HyperCube executa simulações em memória isolada e ramificações (branches). Os dados históricos originais nunca são sobrescritos acidentalmente. Além disso, a ordenação topológica do grafo DAG garante que cada cálculo respeita a hierarquia estrita da contabilidade."
    },
    {
      q: isEn
        ? "Can I use custom chart of accounts from other industry sectors?"
        : "Posso utilizar meus próprios planos de contas e balanços de outros setores?",
      a: isEn
        ? "Yes! The canonical mapping algorithm is universal and multi-sectoral. It supports financial statements from Banking, Retail, Beverages/Consumer Goods, Services, Agribusiness, and Technology."
        : "Sim! O algoritmo de mapeamento canônico é universal e multi-setorial. Ele aceita balanços de Bancos, Varejo, Indústria de Bebidas/Consumo, Serviços, Agronegócio e Tecnologia."
    },
    {
      q: isEn
        ? "How often are Central Bank macroeconomic indicators updated?"
        : "Qual a frequência de atualização dos dados econômicos do BCB?",
      a: isEn
        ? "Daily rates (Selic and USD/BRL PTAX) are refreshed by the background worker. The Focus survey is updated every Monday morning immediately upon official Central Bank publication."
        : "As taxas diárias (Selic e Câmbio PTAX) são atualizadas diariamente pelo worker de background. A Pesquisa Focus é atualizada semanalmente todas as segundas-feiras às 08h30 logo após a divulgação oficial pelo Banco Central."
    },
    {
      q: isEn
        ? "Does HyperCube work offline without paid API keys?"
        : "O HyperCube funciona offline ou sem chaves de API pagas?",
      a: isEn
        ? "Yes! The DAG calculation engine, 3D OLAP Cube, multidimensional grid, and data analysis work 100% offline. For local offline AI, you can select the Ollama provider (with local Gemma, Qwen, or DeepSeek)."
        : "Sim! O motor de cálculo DAG, o Cubo 3D OLAP, a matriz multidimensional e a análise de dados funcionam 100% offline. Para diagnósticos por IA sem internet, você pode selecionar o provedor Ollama (com Gemma, Qwen ou DeepSeek-R1 local)."
    },
    {
      q: isEn
        ? "How do What-If parameter overrides affect Corporate Valuation?"
        : "Como os parâmetros de What-If afetam o Valuation Corporativo?",
      a: isEn
        ? "When you adjust any of the 14 sliders (WACC, beta, risk-free rate, EBIT margin, capex, perpetual growth g, multiples), the system recalculates the entire topological chain: FCFF year-by-year projections, terminal value, enterprise value, equity value bridge, and football field ranges in real time."
        : "Ao ajustar qualquer um dos 14 sliders (WACC, beta, taxa livre de risco, margem EBIT, capex, crescimento perpétuo g, múltiplos), o sistema recalcula toda a cadeia topológica: projeções ano a ano de FCFF, valor terminal de perpetuidade, Enterprise Value, ponte de dívida para Equity Value e faixas do Football Field em tempo real."
    },
    {
      q: isEn
        ? "How do I export reports for executive leadership and board meetings?"
        : "Como exportar relatórios para a diretoria executiva?",
      a: isEn
        ? "On any results view (Income Statement, Cash Flow, or Focus), click the export button to generate PDF reports with executive layout summaries or CSV files for external audits."
        : "Em qualquer tela de resultados (DRE, DFC ou Focus), você pode clicar no botão de exportação para gerar relatórios em PDF com sumário executivo diagramado ou planilhas CSV para auditoria externa."
    },
    {
      q: isEn
        ? "Which ERPs and databases can I connect, and how is credential security handled?"
        : "Quais tipos de ERP e bancos de dados posso conectar e como funciona a segurança das credenciais?",
      a: isEn
        ? "HyperCube connects to SAP (S/4HANA & ECC via hdbcli), Oracle (Cloud ERP / NetSuite / EBS), TOTVS (Protheus & RM), Microsoft Dynamics 365, Senior, Sankhya, Omie, as well as SQL Databases (Oracle DB, MSSQL, Postgres, MySQL) and Cloud Warehouses (Snowflake, BigQuery, Redshift, DuckDB). All connections support TLS/SSL encryption, passwords/tokens are stored with security masks, and credentials can run On-Premises (Local) or in Cloud environments."
        : "O HyperCube conecta nativamente a SAP (S/4HANA & ECC via hdbcli In-Memory), Oracle (Cloud ERP / NetSuite / EBS), TOTVS (Protheus & RM sobre SQL Server, Oracle ou Postgres), Microsoft Dynamics 365, Senior Sapiens, Sankhya OM, Omie, além de bancos SQL (Oracle DB, MSSQL, Postgres, MySQL) e Cloud Warehouses (Snowflake, BigQuery, Redshift, DuckDB). Todas as conexões suportam criptografia SSL/TLS, senhas e tokens são protegidos por máscara de segurança, e a comunicação opera tanto em ambiente On-Premises (Local) quanto em Nuvem (Cloud)."
    }
  ], [isEn]);

  // Filter sections by search
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    return sections.filter(s =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, sections]);

  return (
    <div className="w-full min-h-screen py-6 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Active Company Banner */}
      <CompanyBadge variant="banner" onClick={() => onNavigate && onNavigate("OVERVIEW")} className="cursor-pointer" />

      {/* Header Banner - Executive Navy Styling */}
      <div className="p-8 sm:p-10 rounded-3xl border relative overflow-hidden shadow-2xl bg-[#0c2340] border-[#14335a] text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-transparent to-anaplan-coral/10 pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-anaplan-coral/25 text-anaplan-coral border border-anaplan-coral/40 text-xs font-extrabold shadow-sm">
            <BookOpen className="w-4 h-4" />
            <span>
              {isEn
                ? "Official Documentation & HyperCube User Guide v4.0"
                : "Documentação Oficial & Manual do Usuário HyperCube v4.0"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {isEn ? "Comprehensive User Guide &" : "Guia Completo do Usuário &"} <br />
            <span className="bg-gradient-to-r from-anaplan-coral via-[#ff7a59] to-sky-300 bg-clip-text text-transparent">
              {isEn ? "Platform Operational Manual" : "Manual Operacional da Plataforma"}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            {isEn
              ? "Everything you need to master HyperCube: from statement ingestion and working capital analysis (Fleuriet Model) to 14-parameter What-If corporate valuation, 3D OLAP cube navigation, and Central Bank macroeconomic synchronization."
              : "Tudo o que você precisa para dominar o HyperCube: desde a ingestão de demonstrações contábeis e análise de capital de giro (Modelo Fleuriet) até o valuation com 14 parâmetros What-If, navegação espacial 3D e sincronização macroeconômica com o Banco Central."}
          </p>

          {/* Search Box */}
          <div className="pt-3">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isEn ? "Search manual (e.g. Valuation, WACC, Balanço, Breakback, CVM)..." : "Buscar no manual (ex: Valuation, WACC, Balanço, Fleuriet, CVM)..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none font-bold transition bg-slate-900/90 border-slate-700 text-white placeholder-slate-400 focus:border-anaplan-coral shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Topic Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className={`text-[11px] font-extrabold uppercase tracking-wider mr-2 flex-shrink-0 ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}>
          {isEn ? "Topics:" : "Módulos:"}
        </span>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSectionId(s.id);
              const el = document.getElementById(s.id);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 border shadow-sm ${
              activeSectionId === s.id
                ? "bg-anaplan-coral text-white border-anaplan-coral shadow-md ring-1 ring-anaplan-coral/40"
                : isDark
                ? "bg-slate-900 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>{s.number}. {s.title.split(":")[0].split("&")[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Main Guide Content: Sections */}
      <div className="space-y-6">
        {filteredSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <section
              key={sec.id}
              id={sec.id}
              className={`p-6 sm:p-8 rounded-3xl border transition shadow-md ${
                isDark
                  ? "bg-slate-900/95 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200/90 text-slate-900"
              }`}
            >
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-5 border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-anaplan-coral/15 text-anaplan-coral border border-anaplan-coral/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-anaplan-coral">
                        {isEn ? "MODULE" : "MÓDULO"} {sec.number}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        isDark ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-slate-100 text-slate-800 border border-slate-300"
                      }`}>
                        {sec.badge}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight mt-0.5 text-slate-900 dark:text-white">
                      {sec.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold hidden md:inline">
                    {sec.summary}
                  </span>
                  {sec.navTarget && (
                    <button
                      onClick={() => onNavigate && onNavigate(sec.navTarget!)}
                      className="py-1.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-bold transition flex items-center gap-1.5"
                      title={isEn ? "Go to this screen" : "Acessar esta tela"}
                    >
                      <span>{isEn ? "Access" : "Acessar"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Section Body */}
              <div className="pt-2">
                {sec.content}
              </div>
            </section>
          );
        })}
      </div>

      {/* FAQ Section */}
      <section className={`p-6 sm:p-8 rounded-3xl border transition shadow-md space-y-6 ${
        isDark ? "bg-slate-900/95 border-slate-800 text-slate-100" : "bg-white border-slate-200/90 text-slate-900"
      }`}>
        <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800/80">
          <div className="p-3 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              {isEn ? "Questions & Answers" : "Perguntas & Respostas"}
            </span>
            <h2 className="text-lg sm:text-xl font-black tracking-tight mt-0.5 text-slate-900 dark:text-white">
              {isEn ? "Frequently Asked Questions (FAQ)" : "Dúvidas Frequentes sobre o HyperCube (FAQ)"}
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition overflow-hidden shadow-sm ${
                  isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-anaplan-coral dark:hover:text-anaplan-coral transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-anaplan-coral flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className={`px-4 pb-4 pt-1 text-xs sm:text-sm leading-relaxed border-t font-medium ${
                    isDark ? "border-slate-800/80 text-slate-300" : "border-slate-200 text-slate-700"
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA to Explore the System */}
      <section className="bg-gradient-to-r from-[#0c2340] via-[#14335a] to-[#0c2340] text-white rounded-3xl p-8 sm:p-10 border border-[#1e4475] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-black tracking-tight text-white">
            {isEn ? "Ready to Start Your Connected Planning?" : "Pronto para iniciar seu Planejamento Conectado?"}
          </h3>
          <p className="text-xs text-slate-200 font-medium">
            {isEn
              ? "Access the Overview, import financial statements, or run real-time What-If simulations."
              : "Acesse a Visão Geral, importe demonstrações contábeis ou execute simulações What-If em tempo real."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate("OVERVIEW")}
            className="px-6 py-3 rounded-2xl bg-anaplan-coral hover:bg-[#e03e22] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition"
          >
            <span>{isEn ? "Start with Overview" : "Começar pela Visão Geral"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
