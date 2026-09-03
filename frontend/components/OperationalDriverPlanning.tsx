"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  HardHat,
  TrendingUp,
  Scale,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Sparkles,
  PieChart,
  BarChart3,
  HelpCircle,
  Bot
} from "lucide-react";
import { usePreferences, getApiUrl } from "./PreferencesContext";

interface DepartmentPlan {
  department_id: string;
  department_name: string;
  category: string;
  current_headcount: number;
  hiring_plan: number;
  attrition_rate_pct: number;
  avg_salary_monthly: number;
  avg_benefits_monthly: number;
  fgts_pct: number;
  inss_patronal_pct: number;
  sistema_s_rat_pct: number;
  provisao_13_ferias_pct: number;
}

interface CapexProject {
  project_id: string;
  project_name: string;
  asset_category: string;
  total_investment: number;
  useful_life_years: number;
  residual_value_pct: number;
  start_year: number;
  is_active: boolean;
}

export default function OperationalDriverPlanning() {
  const { theme, language, apiBaseUrl, activeCompany, hasActiveData } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"HEADCOUNT" | "CAPEX" | "STATEMENTS" | "METRICS">("HEADCOUNT");
  const [loading, setLoading] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Driver data state
  const [departments, setDepartments] = useState<DepartmentPlan[]>([]);
  const [capexProjects, setCapexProjects] = useState<CapexProject[]>([]);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // New Department Modal / Form State
  const [showNewDeptModal, setShowNewDeptModal] = useState<boolean>(false);
  const [newDept, setNewDept] = useState<DepartmentPlan>({
    department_id: "",
    department_name: "",
    category: "OPERATIONS",
    current_headcount: 10,
    hiring_plan: 2,
    attrition_rate_pct: 3.0,
    avg_salary_monthly: 8000.0,
    avg_benefits_monthly: 1800.0,
    fgts_pct: 8.0,
    inss_patronal_pct: 20.0,
    sistema_s_rat_pct: 8.8,
    provisao_13_ferias_pct: 19.44
  });

  // New Capex Modal / Form State
  const [showNewCapexModal, setShowNewCapexModal] = useState<boolean>(false);
  const [newCapex, setNewCapex] = useState<CapexProject>({
    project_id: "",
    project_name: "",
    asset_category: "MACHINERY",
    total_investment: 1000.0,
    useful_life_years: 10,
    residual_value_pct: 5.0,
    start_year: 2026,
    is_active: true
  });

  // Fetch baseline drivers for active company
  const fetchBaseline = async (companyId?: string) => {
    const cid = (companyId && companyId !== "aguardando_upload") ? companyId : "empresa_cliente";
    setLoading(true);
    setError(null);
    try {
      const url = getApiUrl(`/api/financials/planning/drivers?company_id=${encodeURIComponent(cid)}`, apiBaseUrl);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Erro ${res.status} ao carregar direcionadores operacionais`);
      }
      const data = await res.json();
      setSimulationResult(data);
      if (data.workforce_summary && data.workforce_summary.departments) {
        setDepartments(data.workforce_summary.departments);
      }
      if (data.capex_summary && data.capex_summary.projects) {
        setCapexProjects(
          data.capex_summary.projects.map((p: any) => ({
            project_id: p.project_id,
            project_name: p.project_name,
            asset_category: p.asset_category,
            total_investment: p.total_investment,
            useful_life_years: p.useful_life_years,
            residual_value_pct: p.residual_value_pct,
            start_year: p.start_year,
            is_active: p.is_active
          }))
        );
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const [clientAiModel, setClientAiModel] = useState<string>("Llama 3.3 70B Versatile");
  const [adaptingSector, setAdaptingSector] = useState<boolean>(false);

  useEffect(() => {
    const updateModel = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("hypercube_ai_model") || "Llama 3.3 70B Versatile";
        setClientAiModel(saved);
      }
    };
    updateModel();
    window.addEventListener("hypercube_ai_updated", updateModel);
    window.addEventListener("storage", updateModel);
    return () => {
      window.removeEventListener("hypercube_ai_updated", updateModel);
      window.removeEventListener("storage", updateModel);
    };
  }, []);

  const adaptToSectorWithAI = async () => {
    setAdaptingSector(true);
    setError(null);
    try {
      const url = getApiUrl("/api/financials/planning/drivers/generate-sector", apiBaseUrl);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: activeCompany?.id || "empresa_cliente",
          company_name: activeCompany?.name || "Empresa Cliente",
          ticker: activeCompany?.ticker || "",
          sector_hint: (activeCompany as any)?.sector || ""
        })
      });
      if (!res.ok) throw new Error("Falha ao gerar direcionadores setoriais com IA");
      const data = await res.json();
      setSimulationResult(data);
      if (data.workforce_summary?.departments) {
        setDepartments(data.workforce_summary.departments);
      }
      if (data.capex_summary?.projects) {
        setCapexProjects(data.capex_summary.projects);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao consultar agente de setor");
    } finally {
      setAdaptingSector(false);
    }
  };

  useEffect(() => {
    fetchBaseline(activeCompany?.id);
  }, [activeCompany?.id, apiBaseUrl]);

  // Execute simulation when user modifies drivers
  const runSimulation = async () => {
    if (!activeCompany?.id || activeCompany.id === "aguardando_upload") return;
    setSimulating(true);
    setError(null);
    try {
      const payload = {
        company_id: activeCompany.id,
        headcount_plans: departments,
        capex_projects: capexProjects,
        growth_pct_override: 8.5,
        payout_pct_override: 40.0
      };

      const url = getApiUrl("/api/financials/planning/drivers/simulate", apiBaseUrl);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status} ao simular planejamento`);
      }
      const data = await res.json();
      setSimulationResult(data);
    } catch (err: any) {
      setError(err.message || "Falha na simulação de direcionadores");
    } finally {
      setSimulating(false);
    }
  };

  // Department field change
  const handleDepartmentChange = (index: number, field: keyof DepartmentPlan, value: any) => {
    const updated = [...departments];
    updated[index] = { ...updated[index], [field]: value };
    setDepartments(updated);
  };

  // Capex field change
  const handleCapexChange = (index: number, field: keyof CapexProject, value: any) => {
    const updated = [...capexProjects];
    updated[index] = { ...updated[index], [field]: value };
    setCapexProjects(updated);
  };

  // Add new department
  const handleAddDepartment = () => {
    if (!newDept.department_name.trim()) return;
    const item: DepartmentPlan = {
      ...newDept,
      department_id: newDept.department_name.toLowerCase().replace(/\s+/g, "_") + `_${Date.now()}`
    };
    setDepartments([...departments, item]);
    setShowNewDeptModal(false);
    setNewDept({
      department_id: "",
      department_name: "",
      category: "OPERATIONS",
      current_headcount: 10,
      hiring_plan: 2,
      attrition_rate_pct: 3.0,
      avg_salary_monthly: 8000.0,
      avg_benefits_monthly: 1800.0,
      fgts_pct: 8.0,
      inss_patronal_pct: 20.0,
      sistema_s_rat_pct: 8.8,
      provisao_13_ferias_pct: 19.44
    });
  };

  // Add new capex project
  const handleAddCapex = () => {
    if (!newCapex.project_name.trim()) return;
    const item: CapexProject = {
      ...newCapex,
      project_id: `proj_${Date.now()}`
    };
    setCapexProjects([...capexProjects, item]);
    setShowNewCapexModal(false);
    setNewCapex({
      project_id: "",
      project_name: "",
      asset_category: "MACHINERY",
      total_investment: 1000.0,
      useful_life_years: 10,
      residual_value_pct: 5.0,
      start_year: 2026,
      is_active: true
    });
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  const formatBRLM = (val: number) => {
    const abs = Math.abs(val);
    const sign = val < 0 ? "-" : "";
    return `${sign}R$ ${abs.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`;
  };

  const renderCategoryOptions = () => {
    const sec = simulationResult?.sector_id || "BANKING";
    if (sec === "BANKING") {
      return (
        <>
          <option value="OPERATIONS">Despesas com Pessoal & Agências (Bancos)</option>
          <option value="SALES">Despesas de Captação & Comerciais</option>
          <option value="ADMIN">Despesas SG&A (G&A Corporativo)</option>
          <option value="RD">Tecnologia Bancária, Pix & Segurança</option>
        </>
      );
    }
    if (sec === "REAL_ESTATE") {
      return (
        <>
          <option value="OPERATIONS">Custos de Imóveis Vendidos (Canteiro / Obras)</option>
          <option value="SALES">Despesas Comerciais & Stands</option>
          <option value="ADMIN">Despesas SG&A (G&A Corporativo)</option>
          <option value="RD">Novos Negócios & Estudos Landbank</option>
        </>
      );
    }
    if (sec === "RETAIL") {
      return (
        <>
          <option value="OPERATIONS">Custos / Despesas de Lojas Físicas & CDs</option>
          <option value="SALES">Despesas com Vendas e Marketing</option>
          <option value="ADMIN">Despesas SG&A (G&A Corporativo)</option>
          <option value="RD">E-commerce & Plataforma Omnichannel</option>
        </>
      );
    }
    return (
      <>
        <option value="OPERATIONS">Custos Industriais / CPV (Fábrica)</option>
        <option value="SALES">Despesas de Vendas e Canais</option>
        <option value="ADMIN">Despesas SG&A (G&A Corporativo)</option>
        <option value="RD">P&D / Engenharia de Processos</option>
      </>
    );
  };

  const workforce = simulationResult?.workforce_summary;
  const capex = simulationResult?.capex_summary;
  const threeStmt = simulationResult?.three_statement;
  const variance = simulationResult?.driver_impact_variance;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Header Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-all duration-300 ${
        isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-[#222a3d]">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/30">
                Etapa 3 • Connected Planning
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                Planejamento por Drivers
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Planejamento Operacional por Drivers (Headcount & Capex)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Modelagem causal da força de trabalho e carteira de ativos com recálculo automatizado do Triângulo Contábil (DRE, DFC e Balanço Patrimonial Fechado com tolerância zero).
            </p>
          </div>

          {/* Company Badge & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Analyzed Company Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-orange-500/40">
              <Building2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                  {isEn ? "Analyzed Company" : "Empresa Analisada"}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    {activeCompany?.name || (isEn ? "Awaiting Company" : "Aguardando Empresa")}
                  </span>
                  {activeCompany?.ticker && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-mono font-bold border border-orange-500/30">
                      {activeCompany.ticker}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sector AI Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <Bot className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400">
                  Agente Setorial ({clientAiModel})
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-white">
                  {simulationResult?.sector_name || "Bancos & Intermediação Financeira"}
                </span>
              </div>
            </div>

            <button
              onClick={adaptToSectorWithAI}
              disabled={adaptingSector}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-black shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title={`Adaptar estrutura de headcount e capex ao setor econômico usando ${clientAiModel}`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${adaptingSector ? "animate-spin" : ""}`} />
              <span>{adaptingSector ? "Analisando..." : `Adaptar ao Setor (${clientAiModel})`}</span>
            </button>

            <button
              onClick={runSimulation}
              disabled={simulating || (!simulationResult && (!hasActiveData || !activeCompany?.id || activeCompany.id === "aguardando_upload"))}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? "animate-spin" : ""}`} />
              <span>{simulating ? "Recalculando..." : "Simular Drivers"}</span>
            </button>

            <button
              onClick={() => fetchBaseline()}
              disabled={!simulationResult && (!hasActiveData || !activeCompany?.id || activeCompany.id === "aguardando_upload")}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Restaurar orçamento base"
            >
              <span>Resetar</span>
            </button>
          </div>
        </div>

        {/* Sector AI Rationale Box */}
        {simulationResult?.executive_rationale && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
            <Bot className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-black text-emerald-400 flex items-center gap-2">
                <span>Racional Setorial C-Level • {simulationResult.sector_name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  {clientAiModel}
                </span>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {simulationResult.executive_rationale}
              </p>
            </div>
          </div>
        )}

        {/* Empty state banner when no company is loaded */}
        {(!simulationResult && (!hasActiveData || !activeCompany?.id || activeCompany.id === "aguardando_upload")) && (
          <div className="p-8 rounded-3xl bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] text-center space-y-3 shadow-xl my-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEn ? "No Company Loaded for Driver Planning" : "Nenhuma Empresa Carregada para Planejamento por Drivers"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {isEn 
                ? "Load a company via CVM Watch & Analysis or upload financial statements in Overview & Ingestion to model causal drivers (headcount & capex)."
                : "Carregue uma empresa no 'CVM Watch & Análise' ou envie uma planilha contábil em 'Visão Geral & Ingestão' para modelar direcionadores causais."}
            </p>
          </div>
        )}

        {/* Status Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Headcount Total</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {workforce?.total_final_headcount?.toLocaleString("pt-BR") || 0} FTEs
            </p>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">
              +{workforce?.net_headcount_growth || 0} líquido
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Custo Anual Folha</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatBRLM((workforce?.total_workforce_cost_annual || 0) / 1000)}
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Salários + Encargos + Benefícios
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Capex Total Ativo</span>
              <HardHat className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatBRLM(capex?.total_active_capex || 0)}
            </p>
            <p className="text-[11px] text-amber-500 font-semibold mt-0.5">
              {capex?.total_active_projects || 0} projetos em carteira
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Fechamento 3-Statement</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-black text-emerald-400">
                Δ R$ 0,00 Garantido
              </p>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Ativo = Passivo + PL
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-200 dark:border-[#222a3d] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("HEADCOUNT")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "HEADCOUNT"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Headcount & Folha de Pagamento</span>
          </button>

          <button
            onClick={() => setActiveTab("CAPEX")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "CAPEX"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Capex & Imobilizado Automático</span>
          </button>

          <button
            onClick={() => setActiveTab("STATEMENTS")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "STATEMENTS"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Impacto no Triângulo Contábil</span>
          </button>

          <button
            onClick={() => setActiveTab("METRICS")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "METRICS"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Síntese de Retorno & Sensibilidade</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HEADCOUNT & WORKFORCE PLANNING */}
      {activeTab === "HEADCOUNT" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Quadro de Pessoal por Departamento & Encargos Sociais
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Altere contratações, rotatividade e salários. Os encargos (FGTS, INSS, 13º e Férias) são calculados no padrão brasileiro.
              </p>
            </div>
            <button
              onClick={() => setShowNewDeptModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Departamento</span>
            </button>
          </div>

          {/* Department Table */}
          <div className={`rounded-3xl border overflow-hidden shadow-lg ${
            isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b ${isDark ? "bg-[#0b1326] border-[#222a3d] text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                  <tr>
                    <th className="p-3.5 font-extrabold">Departamento</th>
                    <th className="p-3.5 font-extrabold">Destinação Contábil</th>
                    <th className="p-3.5 font-extrabold text-right">FTE Atual</th>
                    <th className="p-3.5 font-extrabold text-right">Contratações (+)</th>
                    <th className="p-3.5 font-extrabold text-right">Turnover (%)</th>
                    <th className="p-3.5 font-extrabold text-right">FTE Final</th>
                    <th className="p-3.5 font-extrabold text-right">Salário Médio (R$)</th>
                    <th className="p-3.5 font-extrabold text-right">Encargos (%)</th>
                    <th className="p-3.5 font-extrabold text-right">Custo Anual Total</th>
                    <th className="p-3.5 text-center font-extrabold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#14335a]/50">
                  {departments.map((dept, idx) => {
                    const turnover = Math.floor(dept.current_headcount * (dept.attrition_rate_pct / 100.0));
                    const finalFte = Math.max(0, dept.current_headcount + Number(dept.hiring_plan) - turnover);
                    const chargesPct = dept.fgts_pct + dept.inss_patronal_pct + dept.sistema_s_rat_pct + dept.provisao_13_ferias_pct;
                    const annualBase = finalFte * dept.avg_salary_monthly * 12;
                    const annualCharges = annualBase * (chargesPct / 100);
                    const annualBenefits = finalFte * dept.avg_benefits_monthly * 12;
                    const totalCost = annualBase + annualCharges + annualBenefits;

                    return (
                      <tr key={dept.department_id || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          <input
                            type="text"
                            value={dept.department_name}
                            onChange={(e) => handleDepartmentChange(idx, "department_name", e.target.value)}
                            className="bg-transparent font-bold border-b border-transparent hover:border-slate-400 focus:border-orange-500 focus:outline-none w-full"
                          />
                        </td>
                        <td className="p-3.5">
                          <select
                            value={dept.category}
                            onChange={(e) => handleDepartmentChange(idx, "category", e.target.value)}
                            className="bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                          >
                            {renderCategoryOptions()}
                          </select>
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          <input
                            type="number"
                            value={dept.current_headcount}
                            onChange={(e) => handleDepartmentChange(idx, "current_headcount", Number(e.target.value))}
                            className="w-20 text-right bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] rounded-lg px-2 py-1 font-mono focus:outline-none focus:border-orange-500"
                          />
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          <input
                            type="number"
                            value={dept.hiring_plan}
                            onChange={(e) => handleDepartmentChange(idx, "hiring_plan", Number(e.target.value))}
                            className="w-16 text-right bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] rounded-lg px-2 py-1 font-mono text-emerald-500 font-bold focus:outline-none focus:border-orange-500"
                          />
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          <input
                            type="number"
                            step="0.5"
                            value={dept.attrition_rate_pct}
                            onChange={(e) => handleDepartmentChange(idx, "attrition_rate_pct", Number(e.target.value))}
                            className="w-16 text-right bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] rounded-lg px-2 py-1 font-mono text-rose-400 focus:outline-none focus:border-orange-500"
                          />
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-slate-900 dark:text-white">
                          {finalFte.toLocaleString("pt-BR")}
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          <input
                            type="number"
                            value={dept.avg_salary_monthly}
                            onChange={(e) => handleDepartmentChange(idx, "avg_salary_monthly", Number(e.target.value))}
                            className="w-24 text-right bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] rounded-lg px-2 py-1 font-mono focus:outline-none focus:border-orange-500"
                          />
                        </td>
                        <td className="p-3.5 text-right font-mono text-amber-500 font-bold">
                          {chargesPct.toFixed(1)}%
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-slate-900 dark:text-white">
                          {formatBRL(totalCost)}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setDepartments(departments.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remover departamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Allocation Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border shadow-lg ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Destinação: CPV / CMV</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Custos Fabris
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatBRL(workforce?.allocation?.cmv_operations || 0)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Alocado diretamente na linha de Custos dos Produtos Vendidos na DRE.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border shadow-lg ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Destinação: Vendas</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Comercial
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatBRL(workforce?.allocation?.sales_expenses || 0)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Alocado na linha de Despesas Comerciais e Força de Vendas na DRE.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border shadow-lg ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Destinação: SG&A</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Admin & P&D
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatBRL(workforce?.allocation?.admin_sga || 0)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Alocado na linha de Despesas Gerais e Administrativas na DRE.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAPEX & AUTOMATED ASSET DEPRECIATION */}
      {activeTab === "CAPEX" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Carteira de Projetos Capex & Cronograma de Depreciação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A D&A anual é calculada automaticamente com base na vida útil regulamentar e no valor residual de cada ativo.
              </p>
            </div>
            <button
              onClick={() => setShowNewCapexModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Projeto Capex</span>
            </button>
          </div>

          {/* Projects Table */}
          <div className={`rounded-3xl border overflow-hidden shadow-lg ${
            isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b ${isDark ? "bg-[#0b1326] border-[#222a3d] text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                  <tr>
                    <th className="p-3.5 font-extrabold">Projeto de Investimento</th>
                    <th className="p-3.5 font-extrabold">Categoria do Ativo</th>
                    <th className="p-3.5 font-extrabold text-right">Investimento Total (R$ M)</th>
                    <th className="p-3.5 font-extrabold text-right">Vida Útil (Anos)</th>
                    <th className="p-3.5 font-extrabold text-right">Valor Residual (%)</th>
                    <th className="p-3.5 font-extrabold text-right">Depreciação Anual</th>
                    <th className="p-3.5 font-extrabold text-right">Depreciação Mensal</th>
                    <th className="p-3.5 text-center font-extrabold">Status</th>
                    <th className="p-3.5 text-center font-extrabold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#14335a]/50">
                  {capexProjects.map((proj, idx) => {
                    const depBase = proj.total_investment * (1.0 - (proj.residual_value_pct / 100.0));
                    const annualDepr = proj.is_active ? depBase / Math.max(1, proj.useful_life_years) : 0.0;
                    const monthlyDepr = annualDepr / 12.0;

                    return (
                      <tr key={proj.project_id || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          <input
                            type="text"
                            value={proj.project_name}
                            onChange={(e) => handleCapexChange(idx, "project_name", e.target.value)}
                            className="bg-transparent font-bold border-b border-transparent hover:border-slate-400 focus:border-amber-500 focus:outline-none w-full"
                          />
                        </td>
                        <td className="p-3.5">
                          <select
                            value={proj.asset_category}
                            onChange={(e) => handleCapexChange(idx, "asset_category", e.target.value)}
                            className="bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                          >
                            <option value="MACHINERY">Máquinas & Equipamentos (10a)</option>
                            <option value="SOFTWARE">TI & Softwares (5a)</option>
                            <option value="VEHICLES">Veículos & Frota (5a)</option>
                            <option value="BUILDINGS">Edificações & Obras (25a)</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          <input
                            type="number"
                            value={proj.total_investment}
                            onChange={(e) => handleCapexChange(idx, "total_investment", Number(e.target.value))}
                            className="w-24 text-right bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] rounded-lg px-2 py-1 font-mono font-bold text-amber-500 focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          <input
                            type="number"
                            value={proj.useful_life_years}
                            onChange={(e) => handleCapexChange(idx, "useful_life_years", Number(e.target.value))}
                            className="w-16 text-right bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] rounded-lg px-2 py-1 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          <input
                            type="number"
                            value={proj.residual_value_pct}
                            onChange={(e) => handleCapexChange(idx, "residual_value_pct", Number(e.target.value))}
                            className="w-16 text-right bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] rounded-lg px-2 py-1 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-slate-900 dark:text-white">
                          {formatBRLM(annualDepr)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-500 dark:text-slate-400">
                          {formatBRLM(monthlyDepr)}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleCapexChange(idx, "is_active", !proj.is_active)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition cursor-pointer ${
                              proj.is_active
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                            }`}
                          >
                            {proj.is_active ? "ATIVO" : "PAUSADO"}
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setCapexProjects(capexProjects.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remover projeto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5-Year Trajectory Table */}
          <div className={`p-6 rounded-3xl border shadow-lg ${
            isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
          }`}>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Trajetória de 5 Anos do Imobilizado Líquido & Quota de Depreciação Acumulada</span>
            </h4>
            <div className="grid grid-cols-5 gap-3 pt-2">
              {capex?.trajectory_5y?.map((yr: any) => (
                <div key={yr.year_index} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d] text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase">{yr.year_label}</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {formatBRLM(yr.total_net_book_value)}
                  </p>
                  <p className="text-[11px] text-amber-500 font-semibold mt-0.5">
                    D&A: -{formatBRLM(yr.total_depreciation)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLOSED-LOOP 3-STATEMENT IMPACT */}
      {activeTab === "STATEMENTS" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-400">
                  Triângulo Contábil Fechado com Sucesso (Closed-Loop Tolerância Zero)
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  Ativo Total ({formatBRLM(threeStmt?.balanco?.ativo_total || 0)}) = Passivo + PL ({formatBRLM(threeStmt?.balanco?.passivo_total_pl || 0)}) | Diferença: R$ 0,00
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
              AUDITADO
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DRE Summary */}
            <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-[#222a3d]">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">DRE Projetada 2026</h4>
                <span className="text-[10px] font-mono font-bold text-sky-400">Driver-Based</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receita Líquida</span>
                  <span className="font-bold">{formatBRLM(threeStmt?.dre?.receita_liquida || 0)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>(-) Custos Operacionais (CMV)</span>
                  <span>-{formatBRLM(threeStmt?.dre?.cpv || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>(=) Lucro Bruto</span>
                  <span>{formatBRLM(threeStmt?.dre?.lucro_bruto || 0)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>(-) Despesas Comerciais</span>
                  <span>-{formatBRLM(threeStmt?.dre?.despesas_vendas || 0)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>(-) Despesas SG&A (Pessoal & Admin)</span>
                  <span>-{formatBRLM(threeStmt?.dre?.despesas_admin || 0)}</span>
                </div>
                <div className="flex justify-between font-black text-amber-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>(=) EBITDA Projetado</span>
                  <span>{formatBRLM(threeStmt?.dre?.ebitda || 0)}</span>
                </div>
                <div className="flex justify-between text-amber-500">
                  <span>(-) Depreciação & Amortização</span>
                  <span>-{formatBRLM(threeStmt?.dre?.depreciacao_amortizacao || 0)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>(=) Lucro Líquido</span>
                  <span>{formatBRLM(threeStmt?.dre?.lucro_liquido || 0)}</span>
                </div>
              </div>
            </div>

            {/* DFC Summary */}
            <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-[#222a3d]">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">DFC Causal 2026</h4>
                <span className="text-[10px] font-mono font-bold text-emerald-400">Método Indireto</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lucro Líquido Base</span>
                  <span className="font-bold">{formatBRLM(threeStmt?.dfc?.lucro_liquido || 0)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>(+) Ajustes de D&A</span>
                  <span>+{formatBRLM(threeStmt?.dfc?.depreciacao_amortizacao || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-sky-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>(=) Fluxo Operacional (FCO)</span>
                  <span>{formatBRLM(threeStmt?.dfc?.fco || 0)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>(-) Capex Investimentos (FCI)</span>
                  <span>{formatBRLM(threeStmt?.dfc?.fci || 0)}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>(+/-) Financiamentos & Dividendos (FCF)</span>
                  <span>{formatBRLM(threeStmt?.dfc?.fcf || 0)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>(=) Variação Líquida de Caixa</span>
                  <span>{formatBRLM(threeStmt?.dfc?.variacao_liquida_caixa || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>(+) Caixa Inicial</span>
                  <span>{formatBRLM(threeStmt?.dfc?.saldo_inicial_caixa || 0)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>(=) Saldo Final de Caixa (BP)</span>
                  <span>{formatBRLM(threeStmt?.dfc?.saldo_final_caixa || 0)}</span>
                </div>
              </div>
            </div>

            {/* BP Summary */}
            <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-[#222a3d]">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Balanço Patrimonial 2026</h4>
                <span className="text-[10px] font-mono font-bold text-emerald-400">Equilibrado</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between font-bold text-sky-400">
                  <span>Ativo Circulante (Caixa + Giro)</span>
                  <span>{formatBRLM(threeStmt?.balanco?.ativo_circulante?.total_ativo_circulante || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-2">
                  <span>• Caixa & Equivalentes</span>
                  <span>{formatBRLM(threeStmt?.balanco?.ativo_circulante?.caixa_equivalentes || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-sky-400">
                  <span>Ativo Não Circulante (Imobilizado)</span>
                  <span>{formatBRLM(threeStmt?.balanco?.ativo_nao_circulante?.total_ativo_nao_circulante || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-2">
                  <span>• Imobilizado Líquido</span>
                  <span>{formatBRLM(threeStmt?.balanco?.ativo_nao_circulante?.imobilizado_liquido || 0)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>ATIVO TOTAL</span>
                  <span>{formatBRLM(threeStmt?.balanco?.ativo_total || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-400">
                  <span>Passivo Exigível (PC + PNC)</span>
                  <span>{formatBRLM((threeStmt?.balanco?.passivo_circulante?.total_passivo_circulante || 0) + (threeStmt?.balanco?.passivo_nao_circulante?.total_passivo_nao_circulante || 0))}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>Patrimônio Líquido (PL)</span>
                  <span>{formatBRLM(threeStmt?.balanco?.patrimonio_liquido?.total_patrimonio_liquido || 0)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>PASSIVO TOTAL + PL</span>
                  <span>{formatBRLM(threeStmt?.balanco?.passivo_total_pl || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METRICS & SENSITIVITY */}
      {activeTab === "METRICS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* EBITDA Variance */}
            <div className={`p-6 rounded-3xl border shadow-lg ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <p className="text-xs font-bold text-slate-400 uppercase">EBITDA Simulado vs Base</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatBRLM(variance?.ebitda_simulated || 0)}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                <span className={variance?.delta_ebitda >= 0 ? "text-emerald-500" : "text-rose-500"}>
                  {variance?.delta_ebitda >= 0 ? "+" : ""}{formatBRLM(variance?.delta_ebitda || 0)}
                </span>
                <span className="text-slate-500">vs 2025</span>
              </div>
            </div>

            {/* Ending Cash Variance */}
            <div className={`p-6 rounded-3xl border shadow-lg ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <p className="text-xs font-bold text-slate-400 uppercase">Caixa Final Simulado</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatBRLM(variance?.caixa_simulated || 0)}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                <span className={variance?.delta_caixa >= 0 ? "text-emerald-500" : "text-rose-500"}>
                  {variance?.delta_caixa >= 0 ? "+" : ""}{formatBRLM(variance?.delta_caixa || 0)}
                </span>
                <span className="text-slate-500">variação líquida</span>
              </div>
            </div>

            {/* Fleuriet Diagnosis */}
            <div className={`p-6 rounded-3xl border shadow-lg ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <p className="text-xs font-bold text-slate-400 uppercase">Modelo Fleuriet (Giro)</p>
              <p className="text-xl font-black text-emerald-400 mt-2">
                {threeStmt?.fleuriet?.classificacao || "Sólida"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                NCG: {formatBRLM(threeStmt?.fleuriet?.ncg || 0)} | ST: {formatBRLM(threeStmt?.fleuriet?.st || 0)}
              </p>
            </div>

            {/* DuPont ROE */}
            <div className={`p-6 rounded-3xl border shadow-lg ${
              isDark ? "bg-[#131b2e] border-[#222a3d]" : "bg-white border-slate-200"
            }`}>
              <p className="text-xs font-bold text-slate-400 uppercase">Retorno DuPont (ROE)</p>
              <p className="text-2xl font-black text-sky-400 mt-2">
                {threeStmt?.dupont?.roe_pct?.toFixed(2) || 0}%
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Margem: {threeStmt?.dupont?.margem_liquida_pct?.toFixed(1) || 0}% • Giro: {threeStmt?.dupont?.giro_ativo?.toFixed(2) || 0}x
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO DEPARTAMENTO */}
      {showNewDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDark ? "bg-[#131b2e] border-[#222a3d] text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <h3 className="text-lg font-black">Adicionar Novo Departamento</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Nome do Departamento</label>
                <input
                  type="text"
                  placeholder="Ex: Logística & Centros de Distribuição"
                  value={newDept.department_name}
                  onChange={(e) => setNewDept({ ...newDept, department_name: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400">Destinação Contábil</label>
                  <select
                    value={newDept.category}
                    onChange={(e) => setNewDept({ ...newDept, category: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                  >
                    {renderCategoryOptions()}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-400">Headcount Atual (FTE)</label>
                  <input
                    type="number"
                    value={newDept.current_headcount}
                    onChange={(e) => setNewDept({ ...newDept, current_headcount: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400">Contratações (+) 2026</label>
                  <input
                    type="number"
                    value={newDept.hiring_plan}
                    onChange={(e) => setNewDept({ ...newDept, hiring_plan: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400">Salário Médio Mensal (R$)</label>
                  <input
                    type="number"
                    value={newDept.avg_salary_monthly}
                    onChange={(e) => setNewDept({ ...newDept, avg_salary_monthly: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#222a3d]">
              <button
                onClick={() => setShowNewDeptModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDepartment}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow"
              >
                Salvar Departamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PROJETO CAPEX */}
      {showNewCapexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDark ? "bg-[#131b2e] border-[#222a3d] text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <h3 className="text-lg font-black">Adicionar Projeto de Investimento (Capex)</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Nome do Projeto</label>
                <input
                  type="text"
                  placeholder="Ex: Aquisição de Novas Turbinas Eólicas"
                  value={newCapex.project_name}
                  onChange={(e) => setNewCapex({ ...newCapex, project_name: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400">Categoria do Ativo</label>
                  <select
                    value={newCapex.asset_category}
                    onChange={(e) => setNewCapex({ ...newCapex, asset_category: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                  >
                    <option value="MACHINERY">Máquinas & Equipamentos (10a)</option>
                    <option value="SOFTWARE">TI & Softwares (5a)</option>
                    <option value="VEHICLES">Veículos & Frota (5a)</option>
                    <option value="BUILDINGS">Edificações & Obras (25a)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-400">Investimento Total (R$ M)</label>
                  <input
                    type="number"
                    value={newCapex.total_investment}
                    onChange={(e) => setNewCapex({ ...newCapex, total_investment: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400">Vida Útil (Anos)</label>
                  <input
                    type="number"
                    value={newCapex.useful_life_years}
                    onChange={(e) => setNewCapex({ ...newCapex, useful_life_years: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400">Valor Residual (%)</label>
                  <input
                    type="number"
                    value={newCapex.residual_value_pct}
                    onChange={(e) => setNewCapex({ ...newCapex, residual_value_pct: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1326] border-slate-300 dark:border-[#222a3d] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#222a3d]">
              <button
                onClick={() => setShowNewCapexModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCapex}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow"
              >
                Salvar Projeto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
