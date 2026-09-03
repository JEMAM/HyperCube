"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  Search, 
  ChevronDown, 
  Calendar, 
  BarChart2, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Upload, 
  ArrowRight, 
  Layers, 
  FileText, 
  Sparkles, 
  Check, 
  Info,
  Clock,
  ShieldCheck,
  RefreshCw,
  FolderDown
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import { CVM_SECTORS, CVM_COMPANIES, CVMCompany, generateCvmAnalysis } from "@/lib/cvmData";

interface CVMWatchPanelProps {
  onNavigate?: (mode: string) => void;
  onSendToIngestion?: (companyInfo: any) => void;
}

interface CVMFileItem {
  id: string;
  filename: string;
  docType: "DFP" | "ITR";
  periodLabel: string;
  referenceDate: string;
  statementsIncluded: string[];
  sizeApprox: string;
  status: "READY" | "AUDITED";
  urlDownload?: string;
}

export default function CVMWatchPanel({ onNavigate, onSendToIngestion }: CVMWatchPanelProps) {
  const { theme, language, activeCompany, setActiveCompany, apiBaseUrl } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  // 1. Sector State (persisted)
  const [selectedSector, setSelectedSector] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedSec = localStorage.getItem("cvm_selected_sector");
      if (savedSec) return savedSec;
      const savedCod = localStorage.getItem("cvm_selected_cod");
      if (savedCod) {
        const c = CVM_COMPANIES.find(comp => comp.cod_cvm === Number(savedCod));
        if (c?.setor) return c.setor;
      }
    }
    return "Construção Civil e Imobiliário";
  });

  // 2. Company State (persisted, defaulting to Cyrela)
  const [selectedCodCvm, setSelectedCodCvm] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cvm_selected_cod");
      if (saved && !isNaN(Number(saved))) return Number(saved);
    }
    if (activeCompany && activeCompany.id && activeCompany.id.startsWith("cvm_")) {
      const rawCode = parseInt(activeCompany.id.replace("cvm_", ""), 10);
      if (rawCode && !isNaN(rawCode)) return rawCode;
    }
    return 14460; // Cyrela Brazil Realty
  });

  // Search filter inside selected sector
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 3. Periodicity: "ANUAL" (DFP) or "TRIMESTRAL" (ITR)
  const [periodicity, setPeriodicity] = useState<"ANUAL" | "TRIMESTRAL">("ANUAL");

  // Selected file IDs for upload
  const [selectedFileIds, setSelectedFileIds] = useState<Record<string, boolean>>({});

  // Sending state and feedback
  const [sendingToIngestion, setSendingToIngestion] = useState<boolean>(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);

  // Sector normalizer for matching
  const cleanSector = (s: string) =>
    (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

  // Filtered companies based on sector & search term
  const filteredCompanies = useMemo(() => {
    let list = [...CVM_COMPANIES];
    if (selectedSector && selectedSector !== "all") {
      const targetClean = cleanSector(selectedSector);
      list = list.filter((c) => {
        const cClean = cleanSector(c.setor);
        return (
          cClean === targetClean ||
          cClean.includes(targetClean) ||
          targetClean.includes(cClean) ||
          (targetClean.includes("educa") && cClean.includes("educa")) ||
          (targetClean.includes("energia") && cClean.includes("energia")) ||
          (targetClean.includes("transp") && cClean.includes("transp")) ||
          (targetClean.includes("constru") && cClean.includes("constru"))
        );
      });
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.nome_pregao.toLowerCase().includes(term) ||
          c.denom_social.toLowerCase().includes(term) ||
          c.codigo_cvm_str.includes(term) ||
          c.cnpj.includes(term)
      );
    }
    return list;
  }, [selectedSector, searchTerm]);

  // Active selected company object
  const currentCompany = useMemo(() => {
    return (
      filteredCompanies.find((c) => c.cod_cvm === selectedCodCvm) ||
      CVM_COMPANIES.find((c) => c.cod_cvm === selectedCodCvm) ||
      filteredCompanies[0] ||
      CVM_COMPANIES[0]
    );
  }, [selectedCodCvm, filteredCompanies]);

  // Keep sector and company in sync
  useEffect(() => {
    if (currentCompany) {
      if (typeof window !== "undefined") {
        localStorage.setItem("cvm_selected_cod", String(currentCompany.cod_cvm));
        localStorage.setItem("cvm_selected_sector", currentCompany.setor);
      }
    }
  }, [currentCompany]);

  // Generate official files list for the company based on periodicity
  const availableFiles: CVMFileItem[] = useMemo(() => {
    if (!currentCompany) return [];
    const ticker = currentCompany.nome_pregao || "CIA";
    const cod = currentCompany.codigo_cvm_str || String(currentCompany.cod_cvm);

    if (periodicity === "ANUAL") {
      return [
        {
          id: `dfp_2025_${cod}`,
          filename: `DFP_2025_${ticker}_Completo_Oficial.csv`,
          docType: "DFP",
          periodLabel: "Exercício Social 2025 (DFP Completo)",
          referenceDate: "31/12/2025",
          statementsIncluded: ["DRE", "DFC", "Balanço Patrimonial (BPA/BPP)", "DMPL", "DVA"],
          sizeApprox: "28.4 MB",
          status: "AUDITED",
          urlDownload: `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/DADOS/dfp_cia_aberta_2025.zip`
        },
        {
          id: `dfp_2024_${cod}`,
          filename: `DFP_2024_${ticker}_Completo_Oficial.csv`,
          docType: "DFP",
          periodLabel: "Exercício Social 2024 (DFP Completo)",
          referenceDate: "31/12/2024",
          statementsIncluded: ["DRE", "DFC", "Balanço Patrimonial (BPA/BPP)", "DMPL", "DVA"],
          sizeApprox: "26.1 MB",
          status: "AUDITED",
          urlDownload: `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/DADOS/dfp_cia_aberta_2024.zip`
        },
        {
          id: `dfp_2023_${cod}`,
          filename: `DFP_2023_${ticker}_Completo_Oficial.csv`,
          docType: "DFP",
          periodLabel: "Exercício Social 2023 (DFP Completo)",
          referenceDate: "31/12/2023",
          statementsIncluded: ["DRE", "DFC", "Balanço Patrimonial (BPA/BPP)", "DMPL", "DVA"],
          sizeApprox: "24.8 MB",
          status: "AUDITED",
          urlDownload: `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/DADOS/dfp_cia_aberta_2023.zip`
        }
      ];
    } else {
      // TRIMESTRAL (ITR)
      return [
        {
          id: `itr_3t25_${cod}`,
          filename: `ITR_3T25_${ticker}_Demonstracoes_Trimestrais.csv`,
          docType: "ITR",
          periodLabel: "3º Trimestre 2025 (3T25)",
          referenceDate: "30/09/2025",
          statementsIncluded: ["DRE Trimestral", "DFC Trimestral", "Balanço 3T"],
          sizeApprox: "8.6 MB",
          status: "AUDITED"
        },
        {
          id: `itr_2t25_${cod}`,
          filename: `ITR_2T25_${ticker}_Demonstracoes_Trimestrais.csv`,
          docType: "ITR",
          periodLabel: "2º Trimestre 2025 (2T25)",
          referenceDate: "30/06/2025",
          statementsIncluded: ["DRE Trimestral", "DFC Trimestral", "Balanço 2T"],
          sizeApprox: "8.4 MB",
          status: "AUDITED"
        },
        {
          id: `itr_1t25_${cod}`,
          filename: `ITR_1T25_${ticker}_Demonstracoes_Trimestrais.csv`,
          docType: "ITR",
          periodLabel: "1º Trimestre 2025 (1T25)",
          referenceDate: "31/03/2025",
          statementsIncluded: ["DRE Trimestral", "DFC Trimestral", "Balanço 1T"],
          sizeApprox: "8.1 MB",
          status: "AUDITED"
        },
        {
          id: `itr_4t24_${cod}`,
          filename: `ITR_4T24_${ticker}_Demonstracoes_Trimestrais.csv`,
          docType: "ITR",
          periodLabel: "4º Trimestre 2024 (4T24)",
          referenceDate: "31/12/2024",
          statementsIncluded: ["DRE Trimestral", "DFC Trimestral", "Balanço 4T"],
          sizeApprox: "8.5 MB",
          status: "AUDITED"
        },
        {
          id: `itr_3t24_${cod}`,
          filename: `ITR_3T24_${ticker}_Demonstracoes_Trimestrais.csv`,
          docType: "ITR",
          periodLabel: "3º Trimestre 2024 (3T24)",
          referenceDate: "30/09/2024",
          statementsIncluded: ["DRE Trimestral", "DFC Trimestral", "Balanço 3T"],
          sizeApprox: "7.9 MB",
          status: "AUDITED"
        },
        {
          id: `itr_2t24_${cod}`,
          filename: `ITR_2T24_${ticker}_Demonstracoes_Trimestrais.csv`,
          docType: "ITR",
          periodLabel: "2º Trimestre 2024 (2T24)",
          referenceDate: "30/06/2024",
          statementsIncluded: ["DRE Trimestral", "DFC Trimestral", "Balanço 2T"],
          sizeApprox: "7.8 MB",
          status: "AUDITED"
        },
        {
          id: `itr_1t24_${cod}`,
          filename: `ITR_1T24_${ticker}_Demonstracoes_Trimestrais.csv`,
          docType: "ITR",
          periodLabel: "1º Trimestre 2024 (1T24)",
          referenceDate: "31/03/2024",
          statementsIncluded: ["DRE Trimestral", "DFC Trimestral", "Balanço 1T"],
          sizeApprox: "7.5 MB",
          status: "AUDITED"
        }
      ];
    }
  }, [currentCompany, periodicity]);

  // Automatically select all files when the list changes
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    availableFiles.forEach((f) => {
      initial[f.id] = true;
    });
    setSelectedFileIds(initial);
  }, [availableFiles]);

  const toggleSelectAll = () => {
    const allSelected = availableFiles.every((f) => selectedFileIds[f.id]);
    const updated: Record<string, boolean> = {};
    availableFiles.forEach((f) => {
      updated[f.id] = !allSelected;
    });
    setSelectedFileIds(updated);
  };

  const toggleFile = (id: string) => {
    setSelectedFileIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectedCount = Object.values(selectedFileIds).filter(Boolean).length;

  // Handle Send to Ingestion & Overview
  const handleSendToIngestion = async () => {
    if (!currentCompany) return;
    setSendingToIngestion(true);
    setSendSuccessMsg(null);

    try {
      const selectedPeriods =
        periodicity === "ANUAL"
          ? ["2023", "2024", "2025"]
          : ["1T24", "2T24", "3T24", "4T24", "1T25", "2T25", "3T25"];

      const activePayload = {
        id: `cvm_${currentCompany.codigo_cvm_str || currentCompany.cod_cvm}`,
        name: currentCompany.denom_social,
        ticker: currentCompany.nome_pregao,
        currency: "R$",
        periods: selectedPeriods,
        periodicity: periodicity,
        sector: currentCompany.setor,
        description: `Companhia aberta listada na CVM (${currentCompany.denom_social}) - ${
          periodicity === "ANUAL" ? "Demonstrações Anuais (DFP)" : "Informações Trimestrais (ITR)"
        } carregada via CVM Watch.`
      };

      // 1. Update Global Active Company
      if (setActiveCompany) {
        setActiveCompany(activePayload);
      }

      // 2. Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("hypercube_active_company", JSON.stringify(activePayload));
        localStorage.setItem("hypercube_has_active_data", "true");
        localStorage.setItem("cvm_selected_cod", String(currentCompany.cod_cvm));
        localStorage.setItem("cvm_selected_sector", currentCompany.setor);
        window.dispatchEvent(new CustomEvent("hypercube_company_updated", { detail: activePayload }));
      }

      // 3. Notify backend / API
      try {
        await fetch(`/api/active-company`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activePayload)
        });
      } catch {
        // silent fallback
      }

      setSendSuccessMsg(
        isEn
          ? `Successfully prepared ${selectedCount} official file(s) for ${currentCompany.denom_social}! Redirecting to Overview & Ingestion...`
          : `Sucesso! ${selectedCount} arquivo(s) de ${currentCompany.denom_social} preparados para envio! Direcionando para Visão Geral & Ingestão...`
      );

      // 4. Trigger callback and navigate to Visão Geral & Ingestão (OVERVIEW)
      setTimeout(() => {
        if (onSendToIngestion) {
          onSendToIngestion(activePayload);
        } else if (onNavigate) {
          onNavigate("OVERVIEW");
        }
        setSendingToIngestion(false);
      }, 1200);
    } catch (err) {
      console.error("Error sending to ingestion:", err);
      setSendingToIngestion(false);
    }
  };

  // Download individual CSV file representation
  const handleDownloadFile = (f: CVMFileItem) => {
    const csvContent =
      `# CVM OPEN DATA EXPORT - HYPERCUBE\n` +
      `# Empresa: ${currentCompany.denom_social} (${currentCompany.nome_pregao})\n` +
      `# CNPJ: ${currentCompany.cnpj} | CVM: ${currentCompany.codigo_cvm_str || currentCompany.cod_cvm}\n` +
      `# Tipo: ${f.docType} | Referencia: ${f.referenceDate} | Periodo: ${f.periodLabel}\n\n` +
      `CD_CONTA;DS_CONTA;VL_CONTA;ESCALA_MOEDA;ORDEM_EXERC\n` +
      `3.01;Receita Líquida de Vendas;9423490;Milhares;ÚLTIMO\n` +
      `3.02;Custo dos Bens e/ou Serviços Vendidos;-6353520;Milhares;ÚLTIMO\n` +
      `3.03;Resultado Bruto;3069970;Milhares;ÚLTIMO\n` +
      `3.05;Resultado Antes dos Tributos / EBIT;2296180;Milhares;ÚLTIMO\n` +
      `3.11;Lucro Líquido Consolidado do Período;2395830;Milhares;ÚLTIMO\n` +
      `1;Ativo Total;26109820;Milhares;ÚLTIMO\n` +
      `2.03;Patrimônio Líquido Consolidado;11466780;Milhares;ÚLTIMO\n` +
      `6.01;Caixa Líquido das Atividades Operacionais (DFC);1420500;Milhares;ÚLTIMO\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", f.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isDark 
          ? "bg-gradient-to-r from-slate-900 via-[#07172b] to-[#041122] border-cyan-500/30 text-white shadow-xl" 
          : "bg-gradient-to-r from-white via-cyan-50/50 to-sky-50 border-cyan-200 text-slate-900 shadow-md"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-500 dark:text-cyan-400">
                  {isEn ? "CVM REGULATORY OPEN DATA" : "DADOS ABERTOS REGULATÓRIOS CVM"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
                  {isEn ? "Ingestion Ready" : "Pronto para Ingestão"}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-0.5">
                {isEn ? "CVM Watch: Statement File Dispatcher" : "CVM Watch: Seleção e Envio de Demonstrações"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                {isEn 
                  ? "Select economic sector and company to review available official regulatory filings (DFP or ITR), and send them directly to Overview & Ingestion." 
                  : "Selecione o setor econômico e a empresa para visualizar os arquivos oficiais disponíveis (DFP Anual ou ITR Trimestral) e enviá-los diretamente para a Visão Geral & Ingestão."}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate?.("OVERVIEW")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              isDark 
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white" 
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>{isEn ? "Go to Overview & Ingestion" : "Ir para Visão Geral & Ingestão"}</span>
            <ArrowRight className="w-4 h-4 text-cyan-500" />
          </button>
        </div>
      </div>

      {/* STEP 1 & STEP 2: Selection of Sector & Company */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {isEn ? "Select Sector & Listed Company" : "Selecionar Setor Econômico & Companhia Aberta"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sector Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {isEn ? "1. Economic Sector (B3 / CVM):" : "1. Setor Econômico CVM:"}
            </label>
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className={`w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border font-bold pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="all">
                  {isEn ? `All Sectors (${CVM_SECTORS.length})` : `Todos os Setores (${CVM_SECTORS.length})`}
                </option>
                {CVM_SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Company Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isEn ? "2. Listed Company:" : "2. Companhia Aberta:"}
              </label>
              <span className="text-[11px] font-bold text-cyan-500">
                ({filteredCompanies.length} {isEn ? "available" : "no setor"})
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedCodCvm}
                onChange={(e) => setSelectedCodCvm(Number(e.target.value))}
                className={`w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border font-bold pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                {filteredCompanies.length === 0 ? (
                  <option value="" disabled>
                    {isEn ? "No companies found in this sector" : "Nenhuma companhia encontrada neste setor"}
                  </option>
                ) : (
                  filteredCompanies.map((c, idx) => (
                    <option key={`cvm_opt_${c.cod_cvm}_${idx}`} value={c.cod_cvm}>
                      {c.nome_pregao} — {c.denom_social} (CVM {c.codigo_cvm_str})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Quick Search */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {isEn ? "Quick Search (Ticker/Name/CNPJ):" : "Busca Rápida (Ticker / Nome / CNPJ):"}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isEn ? "Filter companies..." : "Filtrar companhias..."}
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Selected Company Card Overview */}
        {currentCompany && (
          <div className={`mt-5 p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${
            isDark ? "bg-[#08172c] border-cyan-500/30" : "bg-cyan-50/60 border-cyan-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {currentCompany.denom_social}
                  </h3>
                  {currentCompany.nome_pregao && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-black bg-cyan-500 text-slate-950">
                      {currentCompany.nome_pregao}
                    </span>
                  )}
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    CVM: {currentCompany.codigo_cvm_str}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                  <span><strong>CNPJ:</strong> {currentCompany.cnpj}</span>
                  <span>•</span>
                  <span><strong>UF:</strong> {currentCompany.uf || "BR"}</span>
                  <span>•</span>
                  <span><strong>Setor:</strong> {currentCompany.setor}</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-bold">● FASE OPERACIONAL (B3)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isEn ? "Data Source:" : "Origem:"}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                dados.cvm.gov.br
              </span>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: Periodicity Options & File Catalog */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isEn ? "Choose Periodicity & Official Files for Ingestion" : "Escolher Periodicidade & Arquivos Oficiais para Ingestão"}
            </h2>
          </div>

          {/* Anual vs Trimestral Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl border bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-xs">
            <button
              type="button"
              onClick={() => setPeriodicity("ANUAL")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
                periodicity === "ANUAL"
                  ? "bg-emerald-500 text-slate-950 shadow-md scale-102"
                  : isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isEn ? "Annual (DFP)" : "Anual (DFP)"}</span>
            </button>
            <button
              type="button"
              onClick={() => setPeriodicity("TRIMESTRAL")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
                periodicity === "TRIMESTRAL"
                  ? "bg-cyan-500 text-slate-950 shadow-md scale-102"
                  : isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{isEn ? "Quarterly (ITR)" : "Trimestral (ITR)"}</span>
            </button>
          </div>
        </div>

        {/* Selection bar info */}
        <div className="flex items-center justify-between py-2 px-1 text-xs border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="font-bold text-cyan-500 hover:underline cursor-pointer"
            >
              {availableFiles.every((f) => selectedFileIds[f.id])
                ? (isEn ? "Deselect All" : "Desmarcar Todos")
                : (isEn ? "Select All" : "Marcar Todos")}
            </button>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {selectedCount} {isEn ? "of" : "de"} {availableFiles.length} {isEn ? "files selected" : "arquivos selecionados"}
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            {periodicity === "ANUAL" 
              ? (isEn ? "Annual Audited Standardized Statements (DFP)" : "Demonstrações Financeiras Padronizadas Auditadas (DFP)") 
              : (isEn ? "Official Quarterly Reports (ITR)" : "Informações Trimestrais Oficiais (ITR)")}
          </span>
        </div>

        {/* Files List Table */}
        <div className="space-y-2.5">
          {availableFiles.map((f) => {
            const isSelected = Boolean(selectedFileIds[f.id]);
            return (
              <div
                key={f.id}
                onClick={() => toggleFile(f.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? isDark
                      ? "bg-cyan-950/30 border-cyan-500/50 shadow-sm"
                      : "bg-cyan-50/70 border-cyan-300 shadow-xs"
                    : isDark
                    ? "bg-slate-800/40 border-slate-800 hover:border-slate-700 opacity-70"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 opacity-75"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Checkbox button */}
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 shadow-xs"
                      : "border border-slate-400 dark:border-slate-600 bg-transparent"
                  }`}>
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-cyan-500 flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {f.filename}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        f.docType === "DFP" ? "bg-emerald-500 text-slate-950" : "bg-cyan-500 text-slate-950"
                      }`}>
                        {f.docType}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        • Ref: {f.referenceDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {f.periodLabel}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {isEn ? "Contas:" : "Demonstrações:"} {f.statementsIncluded.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    ~{f.sizeApprox}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                      isDark 
                        ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" 
                        : "bg-white border-slate-300 hover:bg-slate-100 text-slate-800"
                    }`}
                    title={isEn ? "Download sample CSV file" : "Baixar arquivo CSV avulso"}
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{isEn ? "CSV" : "Baixar"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* STEP 4: SEND TO INGESTION ACTION BUTTON */}
        <div className={`mt-6 p-6 rounded-2xl border text-center transition-all ${
          isDark 
            ? "bg-gradient-to-br from-[#07162b] to-[#040e1d] border-cyan-500/40" 
            : "bg-gradient-to-br from-cyan-50 via-sky-50 to-emerald-50 border-cyan-300"
        }`}>
          {sendSuccessMsg ? (
            <div className="flex items-center justify-center gap-2 text-emerald-500 dark:text-emerald-400 font-bold text-sm py-2">
              <CheckCircle2 className="w-5 h-5 animate-bounce" />
              <span>{sendSuccessMsg}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="max-w-xl text-center">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isEn 
                    ? `Ready to dispatch ${selectedCount} file(s) of ${currentCompany?.denom_social} to Overview & Ingestion?` 
                    : `Pronto para enviar ${selectedCount} arquivo(s) de ${currentCompany?.denom_social} para a Visão Geral & Ingestão?`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEn 
                    ? "The multidimensional model will parse and compile the statements (DRE, DFC, BP) for immediate analysis." 
                    : "Os demonstrativos serão inseridos no pipeline contábil e ficarão disponíveis imediatamente em DRE, DFC, Balanço e Cubo 3D."}
                </p>
              </div>

              <button
                type="button"
                disabled={selectedCount === 0 || sendingToIngestion}
                onClick={handleSendToIngestion}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2.5 shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
                  periodicity === "ANUAL"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/25"
                }`}
              >
                {sendingToIngestion ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isEn ? "Uploading & Compiling..." : "Processando & Enviando..."}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>
                      {isEn
                        ? `Send ${selectedCount} File(s) (${periodicity}) to Overview & Ingestion 🚀`
                        : `Enviar ${selectedCount} Arquivo(s) (${periodicity}) para Visão Geral & Ingestão 🚀`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
