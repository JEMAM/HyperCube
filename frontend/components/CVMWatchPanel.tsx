"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Zap,
  CheckCircle2,
  FileText,
  DollarSign,
  PieChart,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronDown,
  Download,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import ThemeLanguageToggle from "./ThemeLanguageToggle";
import { usePreferences } from "./PreferencesContext";
import CompanyBadge from "./CompanyBadge";
import {
  CVM_SECTORS,
  CVM_COMPANIES,
  generateCvmAnalysis,
  CVMCompany,
  CVMFiling,
  CVMAnalysisResponse
} from "@/lib/cvmData";

function formatCurrency(val: number): string {
  if (Math.abs(val) >= 1000) {
    return `R$ ${(val / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Bi`;
  }
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Mi`;
}

function formatCurrencyRaw(val: number): string {
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mi`;
}

interface CVMWatchPanelProps {
  onNavigate?: (mode: string) => void;
}

export default function CVMWatchPanel({ onNavigate }: CVMWatchPanelProps) {
  const { theme, language, apiBaseUrl, backendOnline, refreshActiveCompany, activeCompany, setActiveCompany } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  // Pre-seeded complete list of 756 CVM companies and 31 sectors
  const [sectors, setSectors] = useState<string[]>(CVM_SECTORS);
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [allCompanies, setAllCompanies] = useState<CVMCompany[]>(CVM_COMPANIES);

  // Initialize selected company: try to match activeCompany from workspace, fallback to Petrobras
  const [selectedCodCvm, setSelectedCodCvm] = useState<number>(() => {
    if (activeCompany) {
      if (activeCompany.id && activeCompany.id.startsWith("cvm_")) {
        const rawCode = parseInt(activeCompany.id.replace("cvm_", ""), 10);
        if (rawCode && !isNaN(rawCode)) return rawCode;
      }
      const match = CVM_COMPANIES.find(c => 
        (activeCompany.ticker && c.nome_pregao.toUpperCase() === activeCompany.ticker.toUpperCase()) ||
        (activeCompany.name && c.denom_social.toUpperCase() === activeCompany.name.toUpperCase())
      );
      if (match) return match.cod_cvm;
    }
    return 9512; // Petrobras
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [analysisData, setAnalysisData] = useState<CVMAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCube, setLoadingCube] = useState<boolean>(false);
  const [cubeLoadedMsg, setCubeLoadedMsg] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"DRE" | "MARGINS" | "STRUCTURE">("DRE");

  // Watchdog status
  const [watchStatus, setWatchStatus] = useState<any>(null);
  const [runningWatchdog, setRunningWatchdog] = useState<boolean>(false);

  // Synchronous and immediate company list filtering based on sector and search term
  const filteredCompanies = useMemo(() => {
    let list = allCompanies;
    if (selectedSector && selectedSector !== "all") {
      const secNorm = selectedSector.toLowerCase().trim();
      list = list.filter((c) => {
        const cSec = (c.setor || "").toLowerCase().trim();
        return cSec === secNorm || cSec.includes(secNorm) || secNorm.includes(cSec);
      });
    }
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((c) =>
        (c.nome_pregao || "").toLowerCase().includes(term) ||
        (c.denom_social || "").toLowerCase().includes(term) ||
        (c.codigo_cvm_str || "").includes(term) ||
        (c.cnpj || "").includes(term)
      );
    }
    return list;
  }, [allCompanies, selectedSector, searchTerm]);

  // Synchronize company selection: if selectedCodCvm does not belong to the newly filtered list, pick the first one
  useEffect(() => {
    if (filteredCompanies.length > 0) {
      const inList = filteredCompanies.some((c) => c.cod_cvm === selectedCodCvm);
      if (!inList) {
        const nextCod = filteredCompanies[0].cod_cvm;
        setSelectedCodCvm(nextCod);
        loadCompanyFinancials(nextCod);
      }
    }
  }, [filteredCompanies, selectedCodCvm]);

  // Multi-target robust fetch helper to prevent network/CORS timing dropouts
  const fetchWithFallback = async (path: string): Promise<any> => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const isBrowser = typeof window !== "undefined";
    const isLoopback = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    const candidates: string[] = [];
    if (isLoopback) {
      candidates.push(`http://127.0.0.1:8000${cleanPath}`);
      candidates.push(`http://localhost:8000${cleanPath}`);
    }
    if (apiBaseUrl && apiBaseUrl !== "") {
      candidates.push(`${apiBaseUrl.replace(/\/$/, "")}${cleanPath}`);
    }
    candidates.push(cleanPath);

    for (const url of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const json = await res.json();
          if (json && json.message === "HyperCube Cloud API Handler") {
            continue;
          }
          return json;
        }
      } catch {
        // Continue to next candidate
      }
    }
    throw new Error(`Failed to fetch from candidate endpoints: ${path}`);
  };

  // Fetch Sectors
  const loadSectors = async () => {
    try {
      const data = await fetchWithFallback("/api/cvm/sectors");
      if (Array.isArray(data) && data.length > 0) {
        const cleanSectors = Array.from(new Set(data.map((s: string) => String(s).trim()))).filter(Boolean).sort();
        if (cleanSectors.length >= 20) {
          setSectors(cleanSectors);
          return;
        }
      }
    } catch {
      // Keep initial sectors on fallback
    }
    setSectors(CVM_SECTORS);
  };

  // Fetch Companies from backend if available to enrich database
  const loadCompaniesFromApi = async () => {
    try {
      const data = await fetchWithFallback(`/api/cvm/companies`);
      if (Array.isArray(data) && data.length > 0) {
        setAllCompanies(data);
      }
    } catch {
      // Fallback is already initialized in state
    }
  };

  // Fetch Financial Analysis for a specific company code
  const loadCompanyFinancials = async (codCvm: number) => {
    if (!codCvm) return;
    setLoading(true);
    setCubeLoadedMsg(null);

    try {
      const data = await fetchWithFallback(`/api/cvm/companies/${codCvm}/financials`);
      if (data && data.kpis && Array.isArray(data.time_series) && data.time_series.length > 0) {
        setAnalysisData(data);
        return;
      }
      throw new Error("No KPIs in response");
    } catch (err) {
      console.warn("Using canonical CVM analysis generator:", err);
      // Fallback: Generate full accurate canonical analysis for the company
      const fallbackData = generateCvmAnalysis(codCvm);
      setAnalysisData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Watchdog Status
  const loadWatchStatus = async () => {
    try {
      const data = await fetchWithFallback("/api/cvm/watchdog/status");
      if (data) setWatchStatus(data);
    } catch {
      // silent
    }
  };

  // On mount and whenever backend status changes
  useEffect(() => {
    loadSectors();
    loadCompaniesFromApi();
    loadWatchStatus();
    loadCompanyFinancials(selectedCodCvm);
  }, [apiBaseUrl, backendOnline]);

  // Handler for explicit company selection in dropdown
  const handleSelectCompany = (newCodCvm: number) => {
    setSelectedCodCvm(newCodCvm);
    loadCompanyFinancials(newCodCvm);
  };

  // Handler for sector selection: synchronous useMemo will immediately filter companies
  const handleSelectSector = (newSector: string) => {
    setSelectedSector(newSector);
  };

  // Trigger CVM Watchdog manually
  const handleTriggerWatchdog = async () => {
    setRunningWatchdog(true);
    try {
      const candidates = [
        `${apiBaseUrl || "http://localhost:8000"}/api/cvm/watchdog/run`,
        "http://127.0.0.1:8000/api/cvm/watchdog/run",
        "http://localhost:8000/api/cvm/watchdog/run",
        "/api/cvm/watchdog/run"
      ];
      for (const url of candidates) {
        try {
          const res = await fetch(url, { method: "POST" });
          if (res.ok) break;
        } catch {
          // continue
        }
      }
      setTimeout(() => {
        loadWatchStatus();
        loadSectors();
        loadCompaniesFromApi();
        loadCompanyFinancials(selectedCodCvm);
        setRunningWatchdog(false);
      }, 1500);
    } catch (err) {
      console.warn("Notice triggering watchdog:", err);
      setRunningWatchdog(false);
    }
  };

  // Load into Hyperblock Cube
  const handleLoadIntoCube = async () => {
    if (!selectedCodCvm) return;
    setLoadingCube(true);
    try {
      const comp = selectedCompany || allCompanies.find(c => c.cod_cvm === selectedCodCvm) || CVM_COMPANIES.find(c => c.cod_cvm === selectedCodCvm);
      if (comp) {
        const activePayload = {
          id: `cvm_${comp.codigo_cvm_str || comp.cod_cvm}`,
          name: comp.denom_social,
          ticker: comp.nome_pregao,
          currency: "R$",
          periods: ["2023", "2024", "2025", "Budget 2026"],
          description: `Companhia aberta listada na CVM (${comp.denom_social}) carregada via CVM Watch & Análise.`
        };
        if (setActiveCompany) {
          setActiveCompany(activePayload);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hypercube_company_updated", { detail: activePayload }));
        }
      }

      const candidates = [
        `${apiBaseUrl || "http://localhost:8000"}/api/cvm/companies/${selectedCodCvm}/load-cube`,
        `http://127.0.0.1:8000/api/cvm/companies/${selectedCodCvm}/load-cube`,
        `http://localhost:8000/api/cvm/companies/${selectedCodCvm}/load-cube`,
        `/api/cvm/companies/${selectedCodCvm}/load-cube`
      ];
      for (const url of candidates) {
        try {
          const res = await fetch(url, { method: "POST" });
          if (res.ok) {
            const data = await res.json();
            setCubeLoadedMsg(data.message || (isEn ? "Successfully loaded into Cube!" : "Carregado com sucesso no Cubo!"));
            break;
          }
        } catch {
          // continue
        }
      }

      if (refreshActiveCompany) {
        await refreshActiveCompany();
      }
    } catch (err) {
      console.warn("Notice loading into cube:", err);
    } finally {
      setLoadingCube(false);
    }
  };

  // Export canonical DRE data as CSV
  const handleExportDRE = () => {
    if (!analysisData?.time_series || analysisData.time_series.length === 0) return;
    const periods = analysisData.time_series.map((ts) => ts.quarter);
    const headers = [isEn ? "Line Item (Canonical)" : "Linha Contábil (Canônica)", ...periods].join(";");
    
    const rows = [
      [(isEn ? "(+) Net Revenue" : "(+) Receita Líquida"), ...analysisData.time_series.map(ts => ts.receita_liquida.toFixed(2))].join(";"),
      [(isEn ? "(-) Cost of Goods & Services Sold" : "(-) Custos dos Bens e Serviços"), ...analysisData.time_series.map(ts => ts.custo_bens_servicos.toFixed(2))].join(";"),
      [(isEn ? "(=) Gross Profit" : "(=) Lucro Bruto"), ...analysisData.time_series.map(ts => ts.lucro_bruto.toFixed(2))].join(";"),
      [(isEn ? "(=) Operating Result (EBIT)" : "(=) Resultado Operacional (EBIT)"), ...analysisData.time_series.map(ts => ts.resultado_ebit.toFixed(2))].join(";"),
      [(isEn ? "(=) Consolidated Net Income" : "(=) Lucro Líquido Consolidado"), ...analysisData.time_series.map(ts => ts.lucro_liquido.toFixed(2))].join(";"),
      [(isEn ? "Gross Margin (%)" : "Margem Bruta (%)"), ...analysisData.time_series.map(ts => ts.margem_bruta.toFixed(1))].join(";"),
      [(isEn ? "EBIT Margin (%)" : "Margem EBIT (%)"), ...analysisData.time_series.map(ts => ts.margem_ebit.toFixed(1))].join(";"),
      [(isEn ? "Net Margin (%)" : "Margem Líquida (%)"), ...analysisData.time_series.map(ts => ts.margem_liquida.toFixed(1))].join(";"),
    ];

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CVM_${selectedCompany?.nome_pregao || "Empresa"}_DRE_Canonica.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Active company display metadata
  const selectedCompany = useMemo(() => {
    return allCompanies.find((c) => c.cod_cvm === selectedCodCvm) || 
           CVM_COMPANIES.find((c) => c.cod_cvm === selectedCodCvm) || 
           analysisData?.company;
  }, [allCompanies, selectedCodCvm, analysisData]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
              isDark
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            } flex items-center gap-1`}>
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              CVM Open Data Portal
            </span>
            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>dados.cvm.gov.br</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent flex items-center gap-2 mt-0.5">
            <Building2 className="w-7 h-7 text-emerald-500" />
            <span>{isEn ? "Listed Companies Analysis & CVM Watch" : "Análise de Companhias Listadas & CVM Watch"}</span>
          </h1>
        </div>

        {/* Watchdog Status & Controls */}
        <div className="flex items-center flex-wrap gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 shadow-sm ${
              isDark ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">Watchdog CVM:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {watchStatus?.status === "RUNNING"
                ? (isEn ? "Checking..." : "Verificando...")
                : (isEn ? "Monitoring" : "Monitorando")}
            </span>
            <span className={`${isDark ? "text-slate-500" : "text-slate-400"} text-[10px]`}>
              {watchStatus?.last_run ? new Date(watchStatus.last_run).toLocaleTimeString(isEn ? "en-US" : "pt-BR") : (isEn ? "Daily" : "Diário")}
            </span>
          </div>

          <button
            onClick={handleTriggerWatchdog}
            disabled={runningWatchdog}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
            }`}
            title={isEn ? "Trigger immediate check on CVM Open Data Portal" : "Executar verificação imediata no Portal de Dados Abertos da CVM"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningWatchdog ? "animate-spin text-emerald-500" : ""}`} />
            <span>{isEn ? "Check CVM Now" : "Verificar CVM Agora"}</span>
          </button>
        </div>
      </header>

      {/* Workspace Context & Active Model Synchronization Bar */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border transition shadow-sm ${
        isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isEn ? "Workspace Active Model" : "Empresa Ativa no Modelo Multidimensional"}
            </div>
            <div className="text-sm font-extrabold flex items-center gap-2">
              <span className={isDark ? "text-slate-100" : "text-slate-900"}>{activeCompany?.name || "BRASKEM S.A."}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                {activeCompany?.ticker || "BRKM5"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCompany && (selectedCompany.nome_pregao === activeCompany?.ticker || selectedCompany.denom_social === activeCompany?.name) ? (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              {isEn ? "Synchronized with active model" : "Sincronizada com o modelo ativo"}
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-500 dark:text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Info className="w-4 h-4" />
              {isEn
                ? `Viewing CVM: ${selectedCompany?.nome_pregao || "Company"} (Click "Load into Hyperblock" to activate in model)`
                : `Visualizando na CVM: ${selectedCompany?.nome_pregao || "Empresa"} (Clique em "Carregar no Hyperblock" para torná-la ativa)`}
            </span>
          )}
        </div>
      </div>

      {/* Cascading Filter Bar (Sector -> Company Search) */}
      <section
        className={`p-4 rounded-2xl border shadow-sm ${
          isDark ? "bg-slate-900/60 border-slate-800 backdrop-blur-md" : "bg-white border-slate-200"
        } flex flex-col md:flex-row items-center gap-4`}
      >
        {/* Sector Selector */}
        <div className="w-full md:w-1/3 flex flex-col gap-1.5">
          <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            <Filter className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isEn ? "1. CVM Economic Sector" : "1. Setor Econômico CVM"}</span>
          </label>
          <div className="relative">
            <select
              value={selectedSector}
              onChange={(e) => handleSelectSector(e.target.value)}
              className={`w-full appearance-none px-3.5 py-2 text-sm rounded-xl border font-semibold pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm ${
                isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <option value="all">{isEn ? `All Sectors (${sectors.length})` : `Todos os Setores (${sectors.length})`}</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Company Combobox / Selector */}
        <div className="w-full md:w-2/3 flex flex-col gap-1.5">
          <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            <Building2 className="w-3.5 h-3.5 text-cyan-500" />
            <span>
              {isEn
                ? `2. Listed Company (B3 / CVM) — (${filteredCompanies.length} in sector)`
                : `2. Companhia Aberta (B3 / CVM) — (${filteredCompanies.length} no setor)`}
            </span>
          </label>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <select
                value={selectedCodCvm}
                onChange={(e) => handleSelectCompany(Number(e.target.value))}
                className={`w-full appearance-none px-3.5 py-2 text-sm rounded-xl border font-bold pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-sm ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                {filteredCompanies.map((c) => (
                  <option key={c.cod_cvm} value={c.cod_cvm}>
                    {c.nome_pregao} — {c.denom_social} (CVM {c.codigo_cvm_str})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Refresh Company Data Button */}
            <button
              onClick={() => loadCompanyFinancials(selectedCodCvm)}
              disabled={loading}
              className={`p-2 rounded-xl border transition shadow-sm ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
                  : "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900"
              }`}
              title={isEn ? "Refresh financial statements" : "Atualizar demonstrações financeiras"}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
            </button>

            {/* Quick Text Search */}
            <div className="relative w-44">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={isEn ? "Search ticker/name..." : "Buscar ticker/nome..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Loading Indicator Banner */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse shadow-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>
            {isEn
              ? `Loading official statements and historical series for ${selectedCompany?.nome_pregao || "company"}...`
              : `Carregando demonstrações oficiais e série histórica de ${selectedCompany?.nome_pregao || "empresa"}...`}
          </span>
        </div>
      )}

      {/* Active Company Hero Banner & Hyperblock CTA */}
      {selectedCompany && (
        <section
          className={`p-6 rounded-3xl border shadow-md relative overflow-hidden transition-all ${
            isDark
              ? "bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30"
              : "bg-gradient-to-br from-white via-slate-50 to-emerald-50 border-emerald-200"
          }`}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-emerald-500 text-slate-950 shadow-sm">
                  {selectedCompany.nome_pregao}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-md font-semibold border ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-200/80 border-slate-300 text-slate-800"
                }`}>
                  CVM: {selectedCompany.codigo_cvm_str}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-md font-semibold border ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-200/80 border-slate-300 text-slate-800"
                }`}>
                  CNPJ: {selectedCompany.cnpj}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-md font-semibold border ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-200/80 border-slate-300 text-slate-800"
                }`}>
                  UF: {selectedCompany.uf || "BR"}
                </span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${
                  isDark ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-cyan-100 text-cyan-900 border-cyan-300"
                }`}>
                  {selectedCompany.setor}
                </span>
              </div>
              <h2 className={`text-xl md:text-2xl font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                {selectedCompany.denom_social}
              </h2>
              <p className={`text-xs max-w-2xl font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn
                  ? "Standardized official regulatory statements (ITR and DFP) consolidated and normalized for the Hyperblock reactive multidimensional engine."
                  : "Demonstrações financeiras oficiais padronizadas (ITR e DFP) consolidadas e normalizadas para o motor reativo multidimensional Hyperblock."}
              </p>
            </div>

            {/* Hyperblock Engine CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <button
                onClick={handleLoadIntoCube}
                disabled={loadingCube}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <Zap className={`w-4 h-4 ${loadingCube ? "animate-spin" : "fill-current"}`} />
                <span>{loadingCube ? (isEn ? "Injecting into Cube..." : "Injetando no Cubo...") : (isEn ? "Load into Hyperblock" : "Carregar no Hyperblock")}</span>
              </button>

              <button
                onClick={() => onNavigate && onNavigate("CUBE")}
                className={`w-full sm:w-auto px-4 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                  isDark
                    ? "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-500" />
                <span>{isEn ? "View 3D Cube" : "Ver Cubo 3D"}</span>
              </button>
            </div>
          </div>

          {/* Cube Loaded Success Banner */}
          {cubeLoadedMsg && (
            <div className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm ${
              isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-100 border-emerald-300 text-emerald-900"
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{cubeLoadedMsg}</span>
              </div>
              <button
                onClick={() => onNavigate && onNavigate("PLANNING")}
                className="underline hover:opacity-80 text-xs font-bold flex items-center gap-1"
              >
                {isEn ? "Go to Connected Planning" : "Ir para Planejamento Conectado"} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* KPI Cards Grid */}
      {analysisData?.kpis && (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Receita Líquida */}
          <div
            className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn ? "Net Revenue" : "Receita Líquida"}
              </span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className={`text-lg md:text-xl font-extrabold mt-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {formatCurrency(analysisData.kpis.receita_liquida)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {analysisData.kpis.receita_growth_yoy >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +{analysisData.kpis.receita_growth_yoy}%
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> {analysisData.kpis.receita_growth_yoy}%
                </span>
              )}
              <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>YoY</span>
            </div>
          </div>

          {/* Lucro Líquido */}
          <div
            className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn ? "Net Income" : "Lucro Líquido"}
              </span>
              <TrendingUp className="w-4 h-4 text-cyan-500" />
            </div>
            <div className={`text-lg md:text-xl font-extrabold mt-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {formatCurrency(analysisData.kpis.lucro_liquido)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {analysisData.kpis.lucro_growth_yoy >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +{analysisData.kpis.lucro_growth_yoy}%
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> {analysisData.kpis.lucro_growth_yoy}%
                </span>
              )}
              <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>YoY</span>
            </div>
          </div>

          {/* Margem Bruta */}
          <div
            className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn ? "Gross Margin" : "Margem Bruta"}
              </span>
              <PieChart className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-lg md:text-xl font-extrabold mt-2 text-indigo-600 dark:text-indigo-400">
              {analysisData.kpis.margem_bruta.toFixed(1)}%
            </div>
            <div className={`text-[10px] mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              {isEn ? "Direct operating margin" : "Margem operacional direta"}
            </div>
          </div>

          {/* Margem EBIT */}
          <div
            className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn ? "EBIT Margin" : "Margem EBIT"}
              </span>
              <BarChart3 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-lg md:text-xl font-extrabold mt-2 text-purple-600 dark:text-purple-400">
              {analysisData.kpis.margem_ebit.toFixed(1)}%
            </div>
            <div className={`text-[10px] mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              {isEn ? "Operating profitability" : "Rentabilidade operacional"}
            </div>
          </div>

          {/* Margem Líquida */}
          <div
            className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn ? "Net Margin" : "Margem Líquida"}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-lg md:text-xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">
              {analysisData.kpis.margem_liquida.toFixed(1)}%
            </div>
            <div className={`text-[10px] mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              {isEn ? "Bottom line conversion" : "Conversão final do resultado"}
            </div>
          </div>

          {/* ROE Estimado */}
          <div
            className={`p-4 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[11px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn ? "Estimated ROE" : "ROE Estimado"}
              </span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg md:text-xl font-extrabold mt-2 text-amber-600 dark:text-amber-400">
              {analysisData.kpis.roe_estimado.toFixed(1)}%
            </div>
            <div className={`text-[10px] mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              {isEn ? "Return on Equity" : "Retorno s/ Patrimônio"}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Visualizations (Recharts) */}
      {analysisData?.time_series && (
        <section
          className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          {/* Chart Tabs */}
          <div className="flex justify-between items-center flex-wrap gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <span>{isEn ? "Financial Statements Historical Evolution" : "Evolução Histórica das Demonstrações Financeiras"}</span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChartTab("DRE")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition shadow-sm ${
                  activeChartTab === "DRE"
                    ? "bg-emerald-500 text-slate-950 font-extrabold"
                    : isDark
                    ? "bg-slate-800 text-slate-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {isEn ? "Income Statement: Revenue & Income" : "DRE: Receita & Lucro"}
              </button>
              <button
                onClick={() => setActiveChartTab("MARGINS")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition shadow-sm ${
                  activeChartTab === "MARGINS"
                    ? "bg-cyan-500 text-slate-950 font-extrabold"
                    : isDark
                    ? "bg-slate-800 text-slate-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {isEn ? "Margins Trajectory (%)" : "Trajetória de Margens (%)"}
              </button>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === "DRE" ? (
                <BarChart data={analysisData.time_series} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="quarter" stroke={isDark ? "#94a3b8" : "#475569"} tick={{ fill: isDark ? "#94a3b8" : "#475569", fontWeight: 600 }} />
                  <YAxis stroke={isDark ? "#94a3b8" : "#475569"} tick={{ fill: isDark ? "#94a3b8" : "#475569", fontWeight: 600 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}B`} />
                  <Tooltip
                    formatter={(value: any) => [formatCurrencyRaw(Number(value)), ""]}
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                      borderRadius: "12px",
                      color: isDark ? "#f8fafc" : "#0f172a",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="receita_liquida" name={isEn ? "Net Revenue" : "Receita Líquida"} fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro_bruto" name={isEn ? "Gross Profit" : "Lucro Bruto"} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro_liquido" name={isEn ? "Net Income" : "Lucro Líquido"} fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={analysisData.time_series} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="quarter" stroke={isDark ? "#94a3b8" : "#475569"} tick={{ fill: isDark ? "#94a3b8" : "#475569", fontWeight: 600 }} />
                  <YAxis stroke={isDark ? "#94a3b8" : "#475569"} tick={{ fill: isDark ? "#94a3b8" : "#475569", fontWeight: 600 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toFixed(2)}%`, ""]}
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                      borderRadius: "12px",
                      color: isDark ? "#f8fafc" : "#0f172a",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend iconType="line" iconSize={14} />
                  <Line type="monotone" dataKey="margem_bruta" name={isEn ? "Gross Margin (%)" : "Margem Bruta (%)"} stroke="#10b981" strokeWidth={3} dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="margem_ebit" name={isEn ? "EBIT Margin (%)" : "Margem EBIT (%)"} stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="margem_liquida" name={isEn ? "Net Margin (%)" : "Margem Líquida (%)"} stroke="#a855f7" strokeWidth={3} dot={false} activeDot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* DRE Canonical Statements Table */}
      {analysisData?.time_series && (
        <section
          className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              <FileText className="w-5 h-5 text-cyan-500" />
              <span>{isEn ? "Canonical Income Statement (Quarterly & Annual)" : "Demonstração de Resultados Canônica (DRE Trimestral & Anual)"}</span>
            </h3>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {isEn ? "Values in R$ Millions" : "Valores em R$ Milhões"}
              </span>
              <button
                onClick={handleExportDRE}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                }`}
                title={isEn ? "Export canonical statement to CSV" : "Exportar demonstração canônica para CSV"}
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isEn ? "Export CSV" : "Exportar CSV"}</span>
              </button>
            </div>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <table className="w-full text-left text-xs">
              <thead className={`${isDark ? "bg-slate-950 text-slate-300" : "bg-slate-100 text-slate-800"} uppercase text-[11px]`}>
                <tr>
                  <th className="p-3.5 font-bold">{isEn ? "Statement Line (Canonical)" : "Linha da DRE (Canônica)"}</th>
                  {analysisData.time_series.slice(-6).map((ts) => (
                    <th key={ts.period} className="p-3.5 font-bold text-right">
                      {ts.quarter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                  <td className={`p-3 font-bold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                    {isEn ? "(+) Net Revenue" : "(+) Receita Líquida"}
                  </td>
                  {analysisData.time_series.slice(-6).map((ts) => (
                    <td key={ts.period} className={`p-3 text-right font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {ts.receita_liquida.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                  <td className={`p-3 font-medium ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                    {isEn ? "(-) Cost of Goods & Services Sold (COGS)" : "(-) Custos dos Bens e Serviços (CPV / CMV)"}
                  </td>
                  {analysisData.time_series.slice(-6).map((ts) => (
                    <td key={ts.period} className={`p-3 text-right font-semibold ${isDark ? "text-rose-400" : "text-rose-700"}`}>
                      {ts.custo_bens_servicos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className={`font-bold ${isDark ? "hover:bg-slate-800/30 bg-slate-800/20" : "hover:bg-slate-100 bg-slate-100/60"}`}>
                  <td className={`p-3 font-extrabold ${isDark ? "text-cyan-400" : "text-cyan-800"}`}>
                    {isEn ? "(=) Gross Profit" : "(=) Lucro Bruto"}
                  </td>
                  {analysisData.time_series.slice(-6).map((ts) => (
                    <td key={ts.period} className={`p-3 text-right font-black ${isDark ? "text-cyan-400" : "text-cyan-800"}`}>
                      {ts.lucro_bruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                  <td className={`p-3 font-medium ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                    {isEn ? "(=) Operating Result (EBIT)" : "(=) Resultado Operacional (EBIT)"}
                  </td>
                  {analysisData.time_series.slice(-6).map((ts) => (
                    <td key={ts.period} className={`p-3 text-right font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {ts.resultado_ebit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className={`font-extrabold border-t ${
                  isDark ? "hover:bg-slate-800/30 bg-emerald-950/20 border-emerald-500/20" : "hover:bg-emerald-100/50 bg-emerald-50 border-emerald-300"
                }`}>
                  <td className={`p-3.5 font-black ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                    {isEn ? "(=) Consolidated Net Income" : "(=) Lucro Líquido Consolidado"}
                  </td>
                  {analysisData.time_series.slice(-6).map((ts) => (
                    <td key={ts.period} className={`p-3.5 text-right font-black ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                      {ts.lucro_liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Regulatory Filings Table */}
      {analysisData?.filings && analysisData.filings.length > 0 && (
        <section
          className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span>{isEn ? "CVM Regulatory Filings History (ITR & DFP)" : "Histórico de Entregas Regulatórias CVM (ITR & DFP)"}</span>
            </h3>
            <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isEn ? "Synced via Watchdog" : "Sincronizado via Watchdog"}
            </span>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <table className="w-full text-left text-xs">
              <thead className={`${isDark ? "bg-slate-950 text-slate-300" : "bg-slate-100 text-slate-800"} uppercase text-[11px]`}>
                <tr>
                  <th className="p-3 font-bold">{isEn ? "Type" : "Tipo"}</th>
                  <th className="p-3 font-bold">{isEn ? "Reference Date" : "Data de Referência"}</th>
                  <th className="p-3 font-bold">{isEn ? "Filing Date" : "Data de Entrega"}</th>
                  <th className="p-3 font-bold">{isEn ? "Version" : "Versão"}</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold text-right">{isEn ? "Open File" : "Arquivo Aberto"}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                {analysisData.filings.map((f) => (
                  <tr key={f.id} className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                    <td className={`p-3 font-bold ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>{f.tipo}</td>
                    <td className={`p-3 font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{f.dt_refer}</td>
                    <td className={`p-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{f.dt_entrega || f.dt_refer}</td>
                    <td className={`p-3 font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>v{f.versao}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                        isDark
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {(() => {
                        const validDocUrl = f.url_documento?.includes("/DOC/")
                          ? f.url_documento
                          : f.url_documento?.replace("/CIA_ABERTA/", "/CIA_ABERTA/DOC/");
                        return (
                          <a
                            href={validDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`text-xs inline-flex items-center gap-1 font-semibold transition ${
                              isDark
                                ? "text-slate-300 hover:text-emerald-400"
                                : "text-slate-700 hover:text-emerald-700"
                            }`}
                          >
                            <span>Download ZIP/CSV</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
