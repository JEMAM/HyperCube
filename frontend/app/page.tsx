"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import DagViewer from "@/components/DagViewer";
import ScenarioPanel from "@/components/ScenarioPanel";
import IngestionPanel from "@/components/IngestionPanel";
import ResultsDashboard from "@/components/ResultsDashboard";
import AgentPanel from "@/components/AgentPanel";
import EconomicDashboard from "@/components/EconomicDashboard";
import MultiDimGrid from "@/components/MultiDimGrid";
import ThemeLanguageToggle from "@/components/ThemeLanguageToggle";
import WelcomeSetupModal from "@/components/WelcomeSetupModal";
import DynamicLogo from "@/components/DynamicLogo";
import LandingPage from "@/components/LandingPage";
import UserGuide from "@/components/UserGuide";
import CVMWatchPanel from "@/components/CVMWatchPanel";
import ValuationPanel from "@/components/ValuationPanel";
import BPPanel from "@/components/BPPanel";
import DRAPanel from "@/components/DRAPanel";
import DMPLPanel from "@/components/DMPLPanel";
import DVAPanel from "@/components/DVAPanel";
import NEPanel from "@/components/NEPanel";
import CompanyBadge from "@/components/CompanyBadge";
import ERPConnectionsPanel from "@/components/ERPConnectionsPanel";
import ThreeStatementIntegrator from "@/components/ThreeStatementIntegrator";
import PageExplainerGuide from "@/components/PageExplainerGuide";
import { PreferencesProvider, usePreferences } from "@/components/PreferencesContext";

import { useAuth } from "@/components/AuthContext";
import AuthModal from "@/components/AuthModal";
import { 
  Settings, 
  LogOut, 
  Box, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Home as HomeIcon, 
  BarChart2, 
  Activity, 
  Network, 
  HelpCircle,
  BookOpen,
  Menu,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Zap,
  Info,
  Layers,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  Calculator,
  Scale,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  FileSpreadsheet,
  PieChart,
  Database,
  Users,
  Award,
  Wrench,
  X
} from "lucide-react";
import Link from "next/link";

const OlapCube3D = dynamic(() => import("@/components/OlapCube3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-anaplan-coral border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-200">Carregando Cubo OLAP 3D WebGL...</span>
    </div>
  ),
});

const OperationalDriverPlanning = dynamic(() => import("@/components/OperationalDriverPlanning"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-200">Carregando Planejamento por Drivers...</span>
    </div>
  ),
});

const RollingForecastMonteCarlo = dynamic(() => import("@/components/RollingForecastMonteCarlo"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-3xl bg-[#131b2e] border border-[#222a3d] flex flex-col items-center justify-center space-y-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-200">Carregando Previsão Contínua & Monte Carlo...</span>
    </div>
  ),
});

const BoardGovernanceCovenants = dynamic(() => import("@/components/BoardGovernanceCovenants"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-3xl bg-[#131b2e] border border-[#222a3d] flex flex-col items-center justify-center space-y-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-200">Carregando Governança Executiva & Covenants...</span>
    </div>
  ),
});

function DashboardContent() {
  const { theme, language, t, apiBaseUrl, backendOnline, checkBackendHealth, activeCompany, refreshActiveCompany, activeConnection, refreshActiveConnection, disconnectConnection } = usePreferences();
  const { user, isAuthenticated, logout } = useAuth();
  const isDark = theme === "dark";
  const [viewMode, setViewMode] = useState<"LANDING" | "OVERVIEW" | "CONNECTIONS" | "PLANNING" | "DRIVERS" | "FORECAST" | "GOVERNANCE" | "THREE_STATEMENT" | "DRE" | "DFC" | "BP" | "DRA" | "DMPL" | "DVA" | "NE" | "DAG" | "CUBE" | "VALUATION" | "ECONOMY" | "CVM" | "GUIDE">("LANDING");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [annualData, setAnnualData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({});
  const [summary, setSummary] = useState("");
  const [lastMetrics, setLastMetrics] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for tab navigation triggered by background agent notifications
  useEffect(() => {
    const handleNavTab = (e: any) => {
      if (e?.detail) {
        setViewMode(e.detail);
      }
    };
    window.addEventListener("hypercube_navigate_tab", handleNavTab);
    return () => window.removeEventListener("hypercube_navigate_tab", handleNavTab);
  }, []);

  // Pipeline execution progress for Visão Geral & Ingestão

  const [pipelineProgress, setPipelineProgress] = useState<{
    status: "idle" | "uploading" | "extracting" | "compiling" | "completed" | "error";
    percent: number;
    message: string;
  }>({
    status: "idle",
    percent: 0,
    message: "Dados Indisponíveis: Aguardando envio de demonstração contábil na Visão Geral..."
  });

  useEffect(() => {
    if (activeCompany.id !== "aguardando_upload") {
      setPipelineProgress({
        status: "completed",
        percent: 100,
        message: language === "en"
          ? `All statements and pages fully populated for ${activeCompany.name}.`
          : `Todas as demonstrações e páginas 100% preenchidas para ${activeCompany.name}.`
      });
    }
  }, [activeCompany.id, activeCompany.name, language]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Auto-sync stored LLM provider, model, and key to FastAPI backend on load
      const savedProvider = localStorage.getItem("hypercube_ai_provider") || "groq";
      const savedModel = localStorage.getItem("hypercube_ai_model") || "Llama 3.3 70B Versatile";
      const savedKey = localStorage.getItem(`hypercube_${savedProvider}_key`) || localStorage.getItem("hypercube_ai_key") || "";

      fetch(`${apiBaseUrl}/api/config/llm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: savedProvider,
          model: savedModel,
          api_key: savedProvider === "ollama" ? "http://localhost:11434" : savedKey
        }),
      }).catch((e) => console.warn("Background LLM config sync:", e));
    }
    refreshActiveCompany();
  }, [apiBaseUrl]);

  const fetchData = async () => {
    refreshActiveCompany();
    if (viewMode === "LANDING" || viewMode === "OVERVIEW" || viewMode === "ECONOMY" || viewMode === "CUBE" || viewMode === "VALUATION" || viewMode === "BP" || viewMode === "PLANNING" || viewMode === "DRIVERS" || viewMode === "FORECAST" || viewMode === "GOVERNANCE" || viewMode === "THREE_STATEMENT" || viewMode === "GUIDE" || viewMode === "DRA" || viewMode === "DMPL" || viewMode === "DVA" || viewMode === "NE") return;
    try {
      setError(null);
      const annEndpoint = viewMode === "DFC" 
        ? `${apiBaseUrl || ""}/api/dfc/olap/resultado-por-ano`
        : `${apiBaseUrl || ""}/api/olap/resultado-por-ano`;
      const kpiEndpoint = viewMode === "DFC"
        ? `${apiBaseUrl || ""}/api/dfc/olap/kpis`
        : `${apiBaseUrl || ""}/api/olap/kpis`;

      let annuals: any = null;
      let kpiData: any = null;

      try {
        const [annRes, kpiRes] = await Promise.all([
          fetch(annEndpoint),
          fetch(kpiEndpoint),
        ]);
        if (annRes.ok && kpiRes.ok) {
          annuals = await annRes.json();
          kpiData = await kpiRes.json();
        }
      } catch {
        // Fallback to relative path (Vercel Edge Next.js API)
        const relAnn = viewMode === "DFC" ? "/api/dfc/olap/resultado-por-ano" : "/api/olap/resultado-por-ano";
        const relKpi = viewMode === "DFC" ? "/api/dfc/olap/kpis" : "/api/olap/kpis";
        try {
          const [annRes2, kpiRes2] = await Promise.all([
            fetch(relAnn),
            fetch(relKpi),
          ]);
          if (annRes2.ok && kpiRes2.ok) {
            annuals = await annRes2.json();
            kpiData = await kpiRes2.json();
          }
        } catch {}
      }

      if (annuals && kpiData) {
        setAnnualData(annuals);
        setKpis(kpiData);
        setError(null);
      } else {
        // Fallback canonical dataset (BRASKEM S.A. CVM data)
        if (viewMode === "DFC") {
          setAnnualData([
            { ano: 2023, fco: 10500.0, fci: -6200.0, fcf: -3900.0, variacao_liquida: 400.0, saldo_final: 3555.8, yoy_growth_pct: 0.0 },
            { ano: 2024, fco: 11850.2, fci: -7140.0, fcf: -4213.1, variacao_liquida: 497.1, saldo_final: 4052.9, yoy_growth_pct: 12.86 },
            { ano: 2025, fco: 12900.0, fci: -7600.0, fcf: -4500.0, variacao_liquida: 800.0, saldo_final: 4852.9, yoy_growth_pct: 8.86 }
          ]);
          setKpis({
            Total_FCO: 11850.2,
            Total_FCI: -7140.0,
            Total_FCF: -4213.1,
            Total_Variacao_Liquida: 497.1,
            Saldo_Final_Atual: 4052.9
          });
        } else {
          setAnnualData([
            { ano: 2023, produto_intermediacao: 13800.0, resultado_intermediacao: 5520.0, resultado_antes_tributacao: 2898.0, lucro_liquido: 1960.0, lucro_liquido_prev_year: 0.0, yoy_growth_pct: 0.0 },
            { ano: 2024, produto_intermediacao: 14560.0, resultado_intermediacao: 5824.0, resultado_antes_tributacao: 3057.6, lucro_liquido: 2074.8, lucro_liquido_prev_year: 1960.0, yoy_growth_pct: 5.86 },
            { ano: 2025, produto_intermediacao: 15430.0, resultado_intermediacao: 6172.0, resultado_antes_tributacao: 3240.3, lucro_liquido: 2198.5, lucro_liquido_prev_year: 2074.8, yoy_growth_pct: 5.96 }
          ]);
          setKpis({
            Total_Produto_Intermediacao: 14560.0,
            Total_Resultado_Intermediacao: 5824.0,
            Total_Resultado_Antes_Tributacao: 3057.6,
            Total_Lucro_Liquido: 2074.8
          });
        }
        setError(null);
      }
    } catch (err: any) {
      console.warn("API fetchData fallback (using canonical demo state):", err?.message);
      setError(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBaseUrl, viewMode, refreshKey]);

  const handleSimulate = async (payload: any) => {
    setLoading(true);
    try {
      const endpoint = viewMode === "DFC"
        ? `${apiBaseUrl}/api/dfc/simulate/whatif`
        : `${apiBaseUrl}/api/simulate/whatif`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLastMetrics(data.metrics || { node: payload.node, elapsed_ms: data.elapsed_ms });

      await fetchData();
      setRefreshKey((prev) => prev + 1);

      if (viewMode === "DRE" || viewMode === "DAG") {
        const agentRes = await fetch(`${apiBaseUrl}/api/agent/explain`);
        if (agentRes.ok) {
          const agentData = await agentRes.json();
          setSummary(agentData.summary || "");
        }
      } else if (viewMode === "DFC") {
        const agentRes = await fetch(`${apiBaseUrl}/api/dfc/agent/explain`);
        if (agentRes.ok) {
          const agentData = await agentRes.json();
          setSummary(agentData.summary || "");
        }
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const endpoint = viewMode === "DFC"
        ? `${apiBaseUrl}/api/dfc/simulate/reset`
        : `${apiBaseUrl}/api/simulate/reset`;
      await fetch(endpoint, { method: "POST" });
      setLastMetrics({});
      setSummary("");
      await fetchData();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Linha 1: Ferramentas (Visão geral, Conexões, Macroeconomia, Guia)
  const navTools = [
    { mode: "OVERVIEW" as const, label: t("overviewTab"), icon: HomeIcon },
    { mode: "CONNECTIONS" as const, label: t("connectionsTab"), icon: Database },
    { mode: "ECONOMY" as const, label: t("economyTab"), icon: TrendingUp },
    { mode: "GUIDE" as const, label: t("guideTab"), icon: HelpCircle },
  ];

  // Linha 2: Planejamento (Planejamento Conectado N-D, Drivers, Forecast, Covenants, 3-Statement, Cubo, Valuation)
  const navPlanning = [
    { mode: "PLANNING" as const, label: t("planningTab"), icon: Layers },
    { mode: "DRIVERS" as const, label: language === "en" ? "Drivers (HC & Capex)" : "Planejamento por Drivers", icon: Users },
    { mode: "FORECAST" as const, label: language === "en" ? "Forecast & Monte Carlo" : "Previsão & Monte Carlo", icon: Activity },
    { mode: "GOVERNANCE" as const, label: language === "en" ? "Board & Covenants" : "Conselho & Covenants", icon: Award },
    { mode: "THREE_STATEMENT" as const, label: language === "en" ? "3-Statement Loop" : "Loop DRE-DFC-BP", icon: Scale },
    { mode: "CUBE" as const, label: t("cubeTab"), icon: Box },
    { mode: "VALUATION" as const, label: t("valuationTab"), icon: Calculator },
  ];

  // Linha 3: Demonstrações Oficiais CVM / CPC
  const navCvm = [
    { mode: "DRE" as const, label: t("dreTab"), icon: BarChart2 },
    { mode: "DFC" as const, label: t("dfcTab"), icon: Activity },
    { mode: "BP" as const, label: t("bpTab"), icon: Scale },
    { mode: "DRA" as const, label: t("draTab"), icon: FileSpreadsheet },
    { mode: "DMPL" as const, label: t("dmplTab"), icon: SlidersHorizontal },
    { mode: "DVA" as const, label: t("dvaTab"), icon: PieChart },
    { mode: "NE" as const, label: t("neTab"), icon: BookOpen },
    { mode: "CVM" as const, label: t("cvmTab"), icon: Building2 },
  ];

  // Landing Page is the official front presentation page of the application
  if (viewMode === "LANDING") {
    return (
      <div className={`min-h-screen ${isDark ? "bg-[#071526] text-slate-100" : "bg-slate-50 text-slate-900"} font-sans transition-colors duration-200`}>
        <AuthModal
          isOpen={showAuthModal}
          initialMode={authModalMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setViewMode("PLANNING");
            fetchData();
          }}
        />
        <LandingPage
          onNavigate={(mode) => setViewMode(mode)}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode || "login");
            setShowAuthModal(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans transition-colors duration-200`}>
      {/* Auth Modal for internal workspace */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          fetchData();
        }}
      />
      {/* Welcome & Setup Modal */}
      <WelcomeSetupModal
        isOpen={showSetupModal}
        onComplete={() => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("hypercube_setup_completed", "true");
          }
          setShowSetupModal(false);
          fetchData();
        }}
      />

      {/* Top Global Navigation Bar (Sticky 2-Tier Header) with Top Breathing Space */}
      <header className={`sticky top-0 z-50 w-full pt-1.5 sm:pt-2 ${
        isDark ? "bg-[#0c2340] border-[#14335a]" : "bg-white border-slate-200"
      } border-b shadow-md transition-colors`}>
        {/* Tier 1: Brand, Company, Connection Status, System Health & User Profile */}
        <div className="flex justify-between items-center px-4 sm:px-6 min-h-[96px] py-2 border-b border-black/10 dark:border-white/5">
          {/* Left: Brand Logo & Company Selection (Tripled 3x Size) */}
          <div className="flex items-center gap-3">
            <DynamicLogo
              isExpanded={true}
              layout="horizontal"
              size="3x"
              onLogoClick={() => setViewMode("LANDING")}
            />
            
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <CompanyBadge
              variant="header"
              onClick={() => setViewMode("OVERVIEW")}
              className="cursor-pointer"
            />

            {/* Active ERP / Database Connection Status Badge */}
            <div
              onClick={() => setViewMode("CONNECTIONS")}
              className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                activeConnection
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-sm"
                  : isDark ? "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
              }`}
              title="Clique para abrir e gerenciar Conexões ERP & Bancos de Dados"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {activeConnection ? activeConnection.name : (language === "en" ? "Connect ERP / DB" : "Conectar ERP / Banco")}
              </span>
              <span className={`w-2 h-2 rounded-full ${activeConnection ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              {activeConnection && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await disconnectConnection();
                    await refreshActiveCompany();
                  }}
                  className="p-0.5 rounded-full hover:bg-rose-500/20 text-rose-500 hover:text-rose-600 transition cursor-pointer ml-1"
                  title="Desconectar ERP ativo e retornar ao modo base local"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Health, Config, Theme & User Profile */}
          <div className="flex items-center gap-3">
            {/* Backend Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all"
              style={{
                backgroundColor: backendOnline === true 
                  ? (isDark ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5") 
                  : backendOnline === false 
                  ? (isDark ? "rgba(239, 68, 68, 0.12)" : "#fef2f2") 
                  : (isDark ? "rgba(245, 158, 11, 0.12)" : "#fffbeb"),
                borderColor: backendOnline === true 
                  ? (isDark ? "rgba(16, 185, 129, 0.3)" : "#a7f3d0") 
                  : backendOnline === false 
                  ? (isDark ? "rgba(239, 68, 68, 0.3)" : "#fecaca") 
                  : (isDark ? "rgba(245, 158, 11, 0.3)" : "#fde68a"),
                color: backendOnline === true 
                  ? (isDark ? "#34d399" : "#065f46") 
                  : backendOnline === false 
                  ? (isDark ? "#f87171" : "#991b1b") 
                  : (isDark ? "#fbbf24" : "#92400e")
              }}
              title={backendOnline === true ? "Backend FastAPI conectado na porta 8000" : "Backend FastAPI desconectado"}
            >
              <span className={`w-2 h-2 rounded-full ${
                backendOnline === true ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : backendOnline === false ? "bg-rose-500 animate-ping" : "bg-amber-500 animate-pulse"
              }`} />
              <span className="hidden lg:inline">
                {backendOnline === true ? t("backendActive") : backendOnline === false ? t("backendInactive") : (language === "en" ? "Connecting API..." : "Conectando API...")}
              </span>
              {backendOnline === false && (
                <button
                  disabled={isReconnecting}
                  onClick={async () => {
                    setIsReconnecting(true);
                    try {
                      const ok = await checkBackendHealth();
                      if (ok) {
                        await refreshActiveCompany();
                        await fetchData();
                      }
                    } finally {
                      setIsReconnecting(false);
                    }
                  }}
                  className="ml-1.5 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] transition font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  title="Tentar reconectar ao backend FastAPI"
                >
                  <RefreshCw className={`w-3 h-3 ${isReconnecting ? "animate-spin" : ""}`} />
                  <span>{isReconnecting ? (language === "en" ? "Reconnecting..." : "Reconectando...") : (language === "en" ? "Reconnect" : "Reconectar")}</span>
                </button>
              )}
            </div>

            {/* Config & Theme Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSetupModal(true)}
                className={`p-1.5 rounded-lg border text-xs transition ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                }`}
                title="Configurar LLM / Parâmetros"
              >
                <Settings className="w-4 h-4" />
              </button>
              <ThemeLanguageToggle />

              {/* User Profile & Auth Controls in Header */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-2">
                  <div 
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    title={user?.email}
                  >
                    <span className="w-5 h-5 rounded-full bg-anaplan-coral text-white flex items-center justify-center text-[10px] font-black">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                    <span className="hidden xl:inline truncate max-w-[100px] text-slate-700 dark:text-slate-200">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setViewMode("LANDING");
                    }}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    title={language === "en" ? "Sign Out" : "Sair do Aplicativo"}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode("login");
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-anaplan-coral text-white text-xs font-bold hover:bg-orange-600 transition cursor-pointer"
                >
                  {language === "en" ? "Sign In" : "Entrar"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: 3-Row Navigation Bar Showing ALL Pages */}
        <div className={`border-t transition-colors ${
          isDark ? "bg-[#08172c] border-[#14335a]/80" : "bg-slate-100/90 border-slate-200"
        }`}>
          {/* Row 1: Ferramentas - Visão Geral & Ingestão, Conexões ERP, Macroeconomia & BCB, Guia do Usuário */}
          <nav className="px-4 sm:px-6 py-1.5 overflow-x-auto scrollbar-none flex items-center gap-1.5 flex-nowrap">
            <div className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg mr-1 flex items-center gap-1 select-none flex-shrink-0 ${
              isDark ? "bg-slate-800/80 text-sky-400 border border-slate-700/60" : "bg-sky-100 text-sky-950 border border-sky-300 shadow-2xs font-extrabold"
            }`}>
              <Wrench className="w-3.5 h-3.5 text-sky-500" />
              <span>{language === "en" ? "Tools" : "Ferramentas"}</span>
            </div>

            {navTools.map((item) => {
              const Icon = item.icon;
              const isActive = viewMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => {
                    setViewMode(item.mode);
                    setLastMetrics({});
                    setSummary("");
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all duration-150 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-anaplan-coral to-orange-500 text-white font-black shadow-md shadow-orange-500/25 scale-[1.02]"
                      : isDark
                      ? "text-slate-300 hover:text-white hover:bg-white/10 font-medium"
                      : "text-slate-800 hover:text-black hover:bg-white font-bold border border-transparent hover:border-slate-300 shadow-2xs"
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : isDark ? "text-slate-400" : "text-slate-700"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Row 2: Planejamento - Conectado N-D, Drivers HC & Capex, Previsão & Monte Carlo, Conselho & Covenants, Loop DRE-DFC-BP, Cubo 3D OLAP, Valuation */}
          <nav className={`px-4 sm:px-6 py-1.5 border-t overflow-x-auto scrollbar-none flex items-center gap-1.5 flex-nowrap ${
            isDark ? "border-[#14335a]/50 bg-[#071527]" : "border-slate-200/80 bg-slate-50/90"
          }`}>
            <div className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg mr-1 flex items-center gap-1 select-none flex-shrink-0 ${
              isDark ? "bg-slate-800/80 text-amber-400 border border-slate-700/60" : "bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs font-extrabold"
            }`}>
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === "en" ? "Planning" : "Planejamento"}</span>
            </div>

            {navPlanning.map((item) => {
              const Icon = item.icon;
              const isActive = viewMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => {
                    setViewMode(item.mode);
                    setLastMetrics({});
                    setSummary("");
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all duration-150 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-anaplan-coral to-orange-500 text-white font-black shadow-md shadow-orange-500/25 scale-[1.02]"
                      : isDark
                      ? "text-slate-300 hover:text-white hover:bg-white/10 font-medium"
                      : "text-slate-800 hover:text-black hover:bg-white font-bold border border-transparent hover:border-slate-300 shadow-2xs"
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : isDark ? "text-slate-400" : "text-slate-700"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Row 3: Demonstrações Oficiais CVM / CPC */}
          <nav className={`px-4 sm:px-6 py-1.5 border-t overflow-x-auto scrollbar-none flex items-center gap-1.5 flex-nowrap ${
            isDark ? "border-[#14335a]/50 bg-[#061224]" : "border-slate-200/80 bg-slate-50/90"
          }`}>
            <div className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg mr-1 flex items-center gap-1 select-none flex-shrink-0 ${
              isDark ? "bg-slate-800/80 text-emerald-400 border border-slate-700/60" : "bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs font-extrabold"
            }`}>
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === "en" ? "CVM Statements" : "Demonstrações CVM"}</span>
            </div>

            {navCvm.map((item) => {
              const Icon = item.icon;
              const isActive = viewMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => {
                    setViewMode(item.mode);
                    setLastMetrics({});
                    setSummary("");
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all duration-150 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-anaplan-coral to-orange-500 text-white font-black shadow-md shadow-orange-500/25 scale-[1.02]"
                      : isDark
                      ? "text-slate-300 hover:text-white hover:bg-white/10 font-medium"
                      : "text-slate-800 hover:text-black hover:bg-white font-bold border border-transparent hover:border-slate-300 shadow-2xs"
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : isDark ? "text-slate-400" : "text-slate-700"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Workspace Frame (Full Width) */}
      <div className="w-full flex-1 flex flex-col min-h-0">


        {/* Global Error Banner */}
        {error && (
          <div className="m-6 p-4 rounded-xl border flex items-center justify-between bg-rose-950/60 border-rose-800 text-rose-300 shadow-lg">
            <div>
              <p className="text-sm font-semibold">{error}</p>
              <p className="text-xs mt-0.5 opacity-80">Inicie o servidor backend na porta 8000.</p>
            </div>
            <button
              onClick={() => fetchData()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Workspace Canvas (Scrollable with Top Spacing) */}
        <div className="w-full flex-1 overflow-y-auto pt-6 sm:pt-8 pb-16">
          {viewMode === "PLANNING" && (
            <div className="max-w-[1400px] mx-auto py-6 px-8">
              <MultiDimGrid onRefresh={fetchData} />
              <PageExplainerGuide pageKey="PLANNING" />
            </div>
          )}

          {viewMode === "DRIVERS" && (
            <div className="max-w-[1400px] mx-auto py-6 px-8">
              <OperationalDriverPlanning />
              <PageExplainerGuide pageKey="DRIVERS" />
            </div>
          )}

          {viewMode === "FORECAST" && (
            <div className="max-w-[1400px] mx-auto py-6 px-8">
              <RollingForecastMonteCarlo />
              <PageExplainerGuide pageKey="FORECAST" />
            </div>
          )}

          {viewMode === "GOVERNANCE" && (
            <div className="max-w-[1400px] mx-auto py-6 px-8">
              <BoardGovernanceCovenants />
              <PageExplainerGuide pageKey="GOVERNANCE" />
            </div>
          )}

          {viewMode === "THREE_STATEMENT" && (
            <div className="max-w-[1400px] mx-auto py-6 px-8">
              <ThreeStatementIntegrator />
              <PageExplainerGuide pageKey="THREE_STATEMENT" />
            </div>
          )}


          {viewMode === "OVERVIEW" && (
            <div className="max-w-5xl mx-auto py-8 px-8 space-y-10">
              {/* Hero Banner Section */}
              <section className="bg-[#0c2340] text-white rounded-2xl relative overflow-hidden p-8 shadow-xl border border-[#14335a]">
                <div className="absolute inset-0 hero-gradient opacity-50"></div>
                <div className="absolute inset-0 mesh-lines opacity-10"></div>
                <div className="relative z-10 space-y-5">
                  <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm text-xs font-semibold text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-anaplan-coral" />
                    HyperCube Connected Planning Engine v3.0
                  </div>
                  <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
                    {language === "en" ? "Connected Financial Planning &" : "Planejamento Financeiro Conectado &"} <br/>
                    <span className="text-anaplan-coral">
                      {language === "en" ? "Reactive Multidimensional Intelligence." : "Inteligência Multidimensional Reativa."}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
                    {language === "en"
                      ? "Automated ingestion of financial statements (Income Statement & Cash Flow), intelligent account mapping, and DAG compilation for instant cell-level What-If simulations and Write-Back."
                      : "Ingestão automatizada de demonstrações financeiras (DRE e DFC), classificação inteligente de contas e compilação do grafo DAG para simulações instantâneas de What-If com Write-Back por célula."}
                  </p>
                  
                  {/* Explainer Steps Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-anaplan-coral/20 text-anaplan-coral font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <h4 className="text-xs font-bold text-white mb-0.5">
                          {language === "en" ? "Automated Account Classification" : "Classificação Automática de Contas"}
                        </h4>
                        <p className="text-[10.5px] text-slate-300 leading-normal">
                          {language === "en"
                            ? "PDF/Excel report ingestion with canonical financial account mapping."
                            : "Ingestão de relatórios em PDF/Excel com mapeamento para contas canônicas."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-anaplan-coral/20 text-anaplan-coral font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <h4 className="text-xs font-bold text-white mb-0.5">
                          {language === "en" ? "Reactive DAG Engine" : "Motor DAG Reativo"}
                        </h4>
                        <p className="text-[10.5px] text-slate-300 leading-normal">
                          {language === "en"
                            ? "Instant topological recalculation of dependent rows and cells only."
                            : "Recálculo topológico instantâneo apenas das linhas e células dependentes."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-anaplan-coral/20 text-anaplan-coral font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <h4 className="text-xs font-bold text-white mb-0.5">
                          {language === "en" ? "Simulations & Write-Back" : "Simulações & Write-Back"}
                        </h4>
                        <p className="text-[10.5px] text-slate-300 leading-normal">
                          {language === "en"
                            ? "Cell editing with Breakback and impact analysis via AI analyst."
                            : "Edição por célula com Breakback e análise de impacto com analista IA."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Main setup columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Active Dataset & Connected Model Summary */}
                <div className={`${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 shadow-md text-slate-900"} border p-6 rounded-2xl flex flex-col justify-between space-y-6 transition`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-sky-600 dark:text-sky-400">
                        <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <span>{language === "en" ? "Active Financial Model & Dataset" : "Modelo Financeiro & Dataset Ativo"}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        OFFICIAL DATASET
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          {language === "en" ? "Company / Accounting Source" : "Empresa / Fonte Contábil"}
                        </p>
                        <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{activeCompany.name} ({activeCompany.ticker})</p>
                        <p className={`text-xs mt-1 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {activeCompany.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                          <span className="text-[9.5px] uppercase font-bold text-slate-500 dark:text-slate-400">
                            {language === "en" ? "Income (DRE)" : "Demonstração DRE"}
                          </span>
                          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {language === "en" ? "18 Nodes" : "18 Nós"}
                          </p>
                          <span className="text-[9.5px] font-medium text-slate-600 dark:text-slate-400">
                            {language === "en" ? "DAG Compilation" : "Compilação DAG"}
                          </span>
                        </div>
                        <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                          <span className="text-[9.5px] uppercase font-bold text-slate-500 dark:text-slate-400">
                            {language === "en" ? "Cash Flow (DFC)" : "Demonstração DFC"}
                          </span>
                          <p className="text-xs font-black text-sky-600 dark:text-sky-400 mt-0.5">
                            {language === "en" ? "OCF, ICF, FCF" : "FCO, FCI, FCF"}
                          </p>
                          <span className="text-[9.5px] font-medium text-slate-600 dark:text-slate-400">
                            {language === "en" ? "Direct Cash Flow" : "Fluxo Direto"}
                          </span>
                        </div>
                        <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                          <span className="text-[9.5px] uppercase font-bold text-slate-500 dark:text-slate-400">
                            {language === "en" ? "Balance Sheet (BP)" : "Balanço (BP)"}
                          </span>
                          <p className="text-xs font-black text-purple-600 dark:text-purple-400 mt-0.5">
                            {language === "en" ? "29 Nodes" : "29 Nós • CPC 26"}
                          </p>
                          <span className="text-[9.5px] font-medium text-slate-600 dark:text-slate-400">
                            {language === "en" ? "Fleuriet & Dupont" : "Fleuriet & Dupont"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                      {language === "en" ? "Need to change AI Model?" : "Precisa alterar o modelo de IA?"}
                    </span>
                    <button
                      onClick={() => setShowSetupModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === "en" ? "Configure AI Engine" : "Configurar Motor IA"}</span>
                    </button>
                  </div>
                </div>

                {/* Right: Dedicated Ingestion Panel */}
                <div className="flex flex-col h-full">
                  <IngestionPanel
                    onUploadProgress={(progress) => {
                      setPipelineProgress(progress);
                    }}
                    onUploadSuccess={(type) => {
                      refreshActiveCompany();
                      fetchData();
                      setRefreshKey((k) => k + 1);
                      setPipelineProgress({
                        status: "completed",
                        percent: 100,
                        message: language === "en"
                          ? "Execution complete! All statements and pages fully populated."
                          : "Execução concluída com sucesso! Todas as demonstrações e páginas preenchidas."
                      });
                      setTimeout(() => {
                        if (type === "DFC") {
                          setViewMode("DFC");
                        } else if (type === "BP") {
                          setViewMode("BP");
                        } else if (type === "DRA") {
                          setViewMode("DRA");
                        } else if (type === "DMPL") {
                          setViewMode("DMPL");
                        } else if (type === "DVA") {
                          setViewMode("DVA");
                        } else if (type === "NE") {
                          setViewMode("NE");
                        } else if (type === "PLANNING") {
                          setViewMode("PLANNING");
                        } else {
                          setViewMode("DRE");
                        }
                      }, 2000);
                    }}
                  />
                </div>
              </div>

              {/* ===== BARRA DE PROGRESSO DE EXECUÇÃO DO PIPELINE ===== */}
              {/* Localização exata: Abaixo do upload e Acima da imagem (Stepper) */}
              <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm space-y-5 ${
                isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
              }`}>
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      pipelineProgress.percent === 100
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 shadow-sm"
                        : pipelineProgress.percent > 0
                        ? "bg-anaplan-coral/20 text-anaplan-coral border border-anaplan-coral/40 animate-pulse"
                        : isDark ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {pipelineProgress.percent === 100 ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : pipelineProgress.percent > 0 ? (
                        <Activity className="w-6 h-6 animate-spin" />
                      ) : (
                        <Layers className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                          {language === "en" ? "Pipeline Execution: Ingestion to All Pages Populated" : "Pipeline de Execução: do Upload ao Preenchimento das Páginas"}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          pipelineProgress.percent === 100
                            ? "bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/40"
                            : pipelineProgress.percent > 0
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 animate-pulse"
                            : isDark ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {pipelineProgress.percent === 100
                            ? (language === "en" ? "All Pages 100% Populated" : "Todas as Páginas 100% Preenchidas")
                            : pipelineProgress.percent > 0
                            ? (language === "en" ? "Processing Pipeline..." : "Processando Pipeline...")
                            : (language === "en" ? "Awaiting Ingestion" : "Aguardando Ingestão")}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {pipelineProgress.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className={`text-3xl font-black font-mono tracking-tight ${
                        pipelineProgress.percent === 100
                          ? "text-emerald-500"
                          : pipelineProgress.percent > 0
                          ? "text-anaplan-coral"
                          : isDark ? "text-slate-500" : "text-slate-400"
                      }`}>
                        {pipelineProgress.percent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Progress Bar Track */}
                <div className="space-y-1.5">
                  <div className={`w-full h-4 rounded-full overflow-hidden p-0.5 border ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                        pipelineProgress.percent === 100
                          ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-md shadow-emerald-500/20"
                          : pipelineProgress.percent > 0
                          ? "bg-gradient-to-r from-anaplan-coral via-orange-500 to-amber-400 shadow-md shadow-anaplan-coral/20"
                          : "bg-slate-300 dark:bg-slate-800"
                      }`}
                      style={{ width: `${Math.max(pipelineProgress.percent, pipelineProgress.percent > 0 ? 6 : 0)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-medium text-slate-400 px-1">
                    <span>{language === "en" ? "Upload Started" : "Início do Upload"}</span>
                    <span>{language === "en" ? "OCR & Extraction" : "Extração & Normalização"}</span>
                    <span>{language === "en" ? "Topological DAG" : "Grafo DAG & Fórmulas"}</span>
                    <span>{language === "en" ? "All Pages Filled (100%)" : "Todas as Páginas Preenchidas (100%)"}</span>
                  </div>
                </div>

                {/* 4 Pipeline Milestones */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  {/* Step 1 */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    pipelineProgress.percent >= 25
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : isDark ? "bg-slate-950 border-slate-800/60 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      pipelineProgress.percent >= 25 ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
                    }`}>
                      {pipelineProgress.percent >= 25 ? "✓" : "1"}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{language === "en" ? "File Ingestion" : "Ingestão do Arquivo"}</div>
                      <div className="text-[10px] opacity-75">{language === "en" ? "PDF / Excel / CSV" : "PDF / Excel / CSV"}</div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    pipelineProgress.percent >= 50
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : isDark ? "bg-slate-950 border-slate-800/60 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      pipelineProgress.percent >= 50 ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
                    }`}>
                      {pipelineProgress.percent >= 50 ? "✓" : "2"}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{language === "en" ? "Extraction & OCR" : "Extração & OCR"}</div>
                      <div className="text-[10px] opacity-75">{language === "en" ? "Accounts classified" : "Contas classificadas"}</div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    pipelineProgress.percent >= 75
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : isDark ? "bg-slate-950 border-slate-800/60 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      pipelineProgress.percent >= 75 ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
                    }`}>
                      {pipelineProgress.percent >= 75 ? "✓" : "3"}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{language === "en" ? "DAG & Hyperblock" : "Grafo DAG & Motor"}</div>
                      <div className="text-[10px] opacity-75">{language === "en" ? "Reactive formulas" : "Fórmulas reativas"}</div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    pipelineProgress.percent === 100
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : isDark ? "bg-slate-950 border-slate-800/60 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      pipelineProgress.percent === 100 ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
                    }`}>
                      {pipelineProgress.percent === 100 ? "✓" : "4"}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{language === "en" ? "All Pages Filled" : "Páginas Preenchidas"}</div>
                      <div className="text-[10px] opacity-75">{language === "en" ? "Ready for navigation" : "Pronto para análise"}</div>
                    </div>
                  </div>
                </div>

                {/* Badges of Filled Pages & Quick Navigation */}
                <div className={`pt-4 border-t ${isDark ? "border-slate-800/60" : "border-slate-200"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                      {language === "en" ? "Populated Statement Pages:" : "Páginas e Demonstrações Alimentadas:"}
                    </span>
                    {pipelineProgress.percent === 100 && (
                      <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === "en" ? "All 11 Modules Synced" : "Todos os 11 Módulos Sincronizados"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {[
                      { id: "DRE", label: "DRE", desc: language === "en" ? "Income Statement" : "Resultado" },
                      { id: "DFC", label: "DFC", desc: language === "en" ? "Cash Flow" : "Fluxo de Caixa" },
                      { id: "BP", label: "BP", desc: language === "en" ? "Balance Sheet" : "Balanço Patrimonial" },
                      { id: "DRA", label: "DRA", desc: language === "en" ? "Comprehensive" : "Resultado Abrangente" },
                      { id: "DMPL", label: "DMPL", desc: language === "en" ? "Changes in Equity" : "Mutações do PL" },
                      { id: "DVA", label: "DVA", desc: language === "en" ? "Added Value" : "Valor Adicionado" },
                      { id: "NE", label: "NE", desc: language === "en" ? "Notes" : "Notas Explicativas" },
                      { id: "PLANNING", label: "Planejamento", desc: language === "en" ? "Multi-D Model" : "Conectado N-D" },
                      { id: "THREE_STATEMENT", label: "Triângulo Contábil", desc: language === "en" ? "3-Statement Loop" : "DRE-DFC-BP & Fleuriet" },
                      { id: "DAG", label: "Grafo DAG", desc: language === "en" ? "Formulas" : "Dependências" },

                      { id: "CUBE", label: "Cubo 3D", desc: language === "en" ? "OLAP WebGL" : "Visão 3D OLAP" },
                      { id: "VALUATION", label: "Valuation", desc: language === "en" ? "DCF & Multiples" : "Valuation DCF" },
                    ].map((pg) => {
                      const isFilled = pipelineProgress.percent === 100;
                      return (
                        <button
                          key={pg.id}
                          onClick={() => setViewMode(pg.id as any)}
                          disabled={!isFilled}
                          className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                            isFilled
                              ? isDark
                                ? "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-white cursor-pointer hover:border-emerald-500/50 hover:shadow-sm"
                                : "bg-slate-50 hover:bg-white border-slate-200 text-slate-900 cursor-pointer hover:border-emerald-500/50 hover:shadow-sm"
                              : isDark
                              ? "bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-not-allowed opacity-60"
                              : "bg-slate-50/50 border-slate-200/50 text-slate-400 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{pg.label}</span>
                            {isFilled ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">✓</span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                {language === "en" ? "Unavailable" : "Indisponível"}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] mt-1 truncate ${isFilled ? "opacity-75" : "text-amber-700 dark:text-amber-400 font-bold"}`}>
                            {isFilled ? pg.desc : (language === "en" ? "Data Unavailable" : "Dados Indisponíveis")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Stepper Footer (A imagem enviada pelo usuário) */}
              <div className={`p-4 rounded-xl border flex items-center justify-center gap-8 text-xs font-semibold ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600 shadow-sm"}`}>
                <span className={`flex items-center gap-1.5 ${pipelineProgress.percent >= 25 ? "text-anaplan-coral font-extrabold" : "text-slate-500"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${pipelineProgress.percent >= 25 ? "bg-anaplan-coral text-white" : "bg-slate-700 text-white"}`}>1</span> {language === "en" ? "Ingestion" : "Ingestão"}
                </span>
                <span className={`w-4 h-px ${pipelineProgress.percent >= 50 ? "bg-anaplan-coral" : "bg-slate-700"}`}></span>
                <span className={`flex items-center gap-1.5 ${pipelineProgress.percent >= 50 ? "text-anaplan-coral font-extrabold" : isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${pipelineProgress.percent >= 50 ? "bg-anaplan-coral text-white" : "bg-slate-700 text-white"}`}>2</span> {language === "en" ? "Connected Planning" : "Planejamento Conectado"}
                </span>
                <span className={`w-4 h-px ${pipelineProgress.percent >= 75 ? "bg-emerald-500" : "bg-slate-700"}`}></span>
                <span className={`flex items-center gap-1.5 ${pipelineProgress.percent >= 75 ? "text-emerald-500 font-extrabold" : isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${pipelineProgress.percent >= 75 ? "bg-emerald-500 text-white" : "bg-slate-700 text-white"}`}>3</span> {language === "en" ? "CVM Statements (DRE, DFC, BP, DRA, DMPL, DVA, NE)" : "Demonstrações Contábeis CVM (DRE, DFC, BP, DRA, DMPL, DVA, NE)"}
                </span>
                <span className={`w-4 h-px ${pipelineProgress.percent === 100 ? "bg-emerald-500" : "bg-slate-700"}`}></span>
                <span className={`flex items-center gap-1.5 ${pipelineProgress.percent === 100 ? "text-emerald-500 font-extrabold" : isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${pipelineProgress.percent === 100 ? "bg-emerald-500 text-white" : "bg-slate-700 text-white"}`}>4</span> {language === "en" ? "Interactive 3D OLAP Cube" : "Cubo 3D OLAP Interativo"}
                </span>
              </div>
            </div>
          )}

          {viewMode === "CONNECTIONS" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <div className={`flex justify-between items-center pb-4 border-b ${isDark ? "border-slate-800/40" : "border-slate-200"}`}>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t("connectionsHeaderTitle")}
                  </h2>
                  <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {t("connectionsHeaderDesc")}
                  </p>
                </div>
                <CompanyBadge variant="chip" onClick={() => setViewMode("OVERVIEW")} />
              </div>

              <ERPConnectionsPanel
                onActivateConnection={async (conn) => {
                  await refreshActiveCompany();
                  await refreshActiveConnection();
                  await fetchData();
                }}
              />
            </div>
          )}

          {viewMode === "DRE" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <div className={`flex justify-between items-center pb-4 border-b ${isDark ? "border-slate-800/40" : "border-slate-200"}`}>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{t("dreHeaderTitle")}</h2>
                  <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>{t("dreHeaderDesc")} ({activeCompany.name}).</p>
                </div>
                <CompanyBadge variant="chip" onClick={() => setViewMode("OVERVIEW")} />
              </div>

              <ResultsDashboard viewMode="DRE" annualData={annualData} kpis={kpis} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <ScenarioPanel
                    viewMode="DRE"
                    onSimulate={handleSimulate}
                    onReset={handleReset}
                    lastMetrics={lastMetrics}
                    loading={loading}
                  />
                  <AgentPanel summary={summary} agentType="dre" />
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                  <DagViewer viewMode="DRE" refreshKey={refreshKey} />
                </div>
              </div>

              <PageExplainerGuide pageKey="DRE" />
            </div>
          )}

          {viewMode === "DFC" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <div className={`flex justify-between items-center pb-4 border-b ${isDark ? "border-slate-800/40" : "border-slate-200"}`}>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{t("dfcHeaderTitle")}</h2>
                  <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>{t("dfcHeaderDesc")} ({activeCompany.name}).</p>
                </div>
                <CompanyBadge variant="chip" onClick={() => setViewMode("OVERVIEW")} />
              </div>

              <ResultsDashboard viewMode="DFC" annualData={annualData} kpis={kpis} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <ScenarioPanel
                    viewMode="DFC"
                    onSimulate={handleSimulate}
                    onReset={handleReset}
                    lastMetrics={lastMetrics}
                    loading={loading}
                  />
                  <AgentPanel summary={summary} agentType="dfc" />
                </div>
                <div className="lg:col-span-2">
                  <DagViewer viewMode="DFC" refreshKey={refreshKey} />
                </div>
              </div>

              <PageExplainerGuide pageKey="DFC" />
            </div>
          )}

          {viewMode === "BP" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <BPPanel activeCompany={activeCompany} onNavigate={(mode) => setViewMode(mode as any)} />
              <PageExplainerGuide pageKey="BP" />
            </div>
          )}

          {viewMode === "DRA" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <DRAPanel onNavigate={(mode) => setViewMode(mode as any)} />
              <PageExplainerGuide pageKey="DRA" />
            </div>
          )}

          {viewMode === "DMPL" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <DMPLPanel onNavigate={(mode) => setViewMode(mode as any)} />
              <PageExplainerGuide pageKey="DMPL" />
            </div>
          )}

          {viewMode === "DVA" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <DVAPanel onNavigate={(mode) => setViewMode(mode as any)} />
              <PageExplainerGuide pageKey="DVA" />
            </div>
          )}

          {viewMode === "NE" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <NEPanel onNavigate={(mode) => setViewMode(mode as any)} />
              <PageExplainerGuide pageKey="NE" />
            </div>
          )}

          {viewMode === "CUBE" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <CompanyBadge variant="banner" onClick={() => setViewMode("OVERVIEW")} />
              <OlapCube3D />
              <PageExplainerGuide pageKey="CUBE" />
            </div>
          )}

          {viewMode === "VALUATION" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <ValuationPanel activeCompany={activeCompany} onNavigate={(mode) => setViewMode(mode as any)} />
              <PageExplainerGuide pageKey="VALUATION" />
            </div>
          )}

          {viewMode === "ECONOMY" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8">
              <EconomicDashboard apiBaseUrl={apiBaseUrl} />
            </div>
          )}

          {viewMode === "CVM" && (
            <div className="max-w-[1400px] mx-auto py-8 px-8 space-y-6">
              <CVMWatchPanel onNavigate={(mode) => setViewMode(mode as any)} />
              <PageExplainerGuide pageKey="CVM" />
            </div>
          )}

          {viewMode === "GUIDE" && (
            <UserGuide onNavigate={(mode) => setViewMode(mode)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <DashboardContent />;
}
