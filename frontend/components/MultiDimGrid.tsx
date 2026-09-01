"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Calendar,
  Building2,
  TrendingUp,
  Box,
  Cpu,
  Search,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit3,
  Split,
  GitBranch,
  ArrowRight,
  RefreshCw,
  Eye,
  Download,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Calculator,
  FileSpreadsheet,
  LineChart as LineChartIcon,
  BarChart3,
  Eraser,
  Trash2,
  Check
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import RuleEditorModal from "./RuleEditorModal";
import DynamicAccountsLineChart from "./DynamicAccountsLineChart";
import WaterfallChart from "./WaterfallChart";

interface MultiDimGridProps {
  onRefresh?: () => void;
}

export default function MultiDimGrid({ onRefresh }: MultiDimGridProps) {
  const { theme, language, apiBaseUrl, activeCompany: globalActiveCompany } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  // Dimensions metadata
  const [dimensions, setDimensions] = useState<any>({});
  const [selectedTime, setSelectedTime] = useState("4T25");
  const [selectedVersion, setSelectedVersion] = useState("Actuals");
  const [selectedScenario, setSelectedScenario] = useState("Base");
  const [selectedEntity, setSelectedEntity] = useState("Total_Company");
  const [selectedProduct, setSelectedProduct] = useState("Total_Products");

  // Grid Data
  const [gridData, setGridData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{ accountId: string; colId: string; currentVal: number } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [savingCell, setSavingCell] = useState(false);
  const [lastSavedCell, setLastSavedCell] = useState<string | null>(null);

  // Breakback Dialog State
  const [showBreakbackModal, setShowBreakbackModal] = useState(false);
  const [pendingBreakback, setPendingBreakback] = useState<{ accountId: string; colId: string; newVal: number } | null>(null);
  const [spreadMethod, setSpreadMethod] = useState<"proportional" | "equal">("proportional");

  // Calculation Trace Drawer State
  const [traceCell, setTraceCell] = useState<any>(null);
  const [traceLoading, setTraceLoading] = useState(false);

  // Variance Analysis Mode State (4T24 vs 4T25 or Period Comparison)
  const [varianceMode, setVarianceMode] = useState(false);
  const [baseTime, setBaseTime] = useState("4T24");
  const [targetTime, setTargetTime] = useState("4T25");
  const [baseVersion, setBaseVersion] = useState("Actuals");
  const [targetVersion, setTargetVersion] = useState("Actuals");
  const [varianceData, setVarianceData] = useState<any>(null);
  const [showWaterfall, setShowWaterfall] = useState(true);

  // Clone Scenario Modal State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [newVersionId, setNewVersionId] = useState("");
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [growthFactor, setGrowthFactor] = useState(1.10);

  // Rule Editor Modal
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Dynamic Accounts Line Chart State
  const [showLineChart, setShowLineChart] = useState(true);
  const [selectedChartAccounts, setSelectedChartAccounts] = useState<string[]>(["Receita_Liquida", "Margem_Bruta", "EBITDA", "Lucro_Liquido"]);

  // Clear Cells for Production State
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearingCells, setClearingCells] = useState(false);
  const [clearAlsoUploads, setClearAlsoUploads] = useState(false);
  const [cleanProductionActive, setCleanProductionActive] = useState(false);
  const [productionToast, setProductionToast] = useState<string | null>(null);

  const handleClearCellsForProduction = async () => {
    setClearingCells(true);
    try {
      if (clearAlsoUploads) {
        const res = await fetch(`${apiBaseUrl}/api/production/reset-all`, {
          method: "POST"
        });
        if (res.ok) {
          setCleanProductionActive(true);
          setProductionToast(
            isEn 
              ? "All cells and test files cleared! Model is 100% ready for client analysis." 
              : "Todas as células e arquivos temporários foram zerados! Modelo 100% pronto para o cliente."
          );
        }
      } else {
        const res = await fetch(`${apiBaseUrl}/api/multidim/cells/clear`, {
          method: "POST"
        });
        if (res.ok) {
          setCleanProductionActive(true);
          setProductionToast(
            isEn 
              ? "All grid cells cleared (0.00)! Ready for client production budgeting." 
              : "Todas as células da grade foram zeradas (0,00)! Pronto para o orçamento do cliente."
          );
        }
      }
      await fetchGridData();
      if (onRefresh) onRefresh();
      setShowClearModal(false);
      setTimeout(() => setProductionToast(null), 6000);
    } catch (err) {
      console.error("Error clearing cells for production:", err);
    } finally {
      setClearingCells(false);
    }
  };

  const handleRestoreDemoCells = async () => {
    setClearingCells(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/cells/restore-demo`, {
        method: "POST"
      });
      if (res.ok) {
        setCleanProductionActive(false);
        setProductionToast(
          isEn 
            ? "Demo seed data restored successfully." 
            : "Dados de demonstração restaurados com sucesso."
        );
        await fetchGridData();
        if (onRefresh) onRefresh();
        setTimeout(() => setProductionToast(null), 4000);
      }
    } catch (err) {
      console.error("Error restoring demo cells:", err);
    } finally {
      setClearingCells(false);
    }
  };


  // Fetch Dimensions
  const fetchDimensions = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/dimensions`);
      if (res.ok) {
        const data = await res.json();
        setDimensions(data);
        const timeMembers = (data.time?.members || []).filter((m: any) => m.id !== "Budget_2026");
        if (timeMembers.length >= 2) {
          setBaseTime(timeMembers[1].id);
          setTargetTime(timeMembers[0].id);
        } else if (timeMembers.length === 1) {
          setBaseTime(timeMembers[0].id);
          setTargetTime(timeMembers[0].id);
        }
      }
    } catch {
      console.warn("MultiDim dimensions fetch fallback (backend offline or connecting...)");
    }
  };

  // Fetch Grid Data
  const fetchGridData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          row_dim: "account",
          col_dim: "time",
          filters: {
            version: selectedVersion,
            scenario: selectedScenario,
            entity: selectedEntity,
            product: selectedProduct
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGridData(data);
      }
    } catch {
      console.warn("MultiDim grid query fetch fallback (backend offline or connecting...)");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Variance Data
  const fetchVarianceData = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/variance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_version: baseVersion,
          target_version: targetVersion,
          filters: {
            base_time: baseTime,
            target_time: targetTime,
            scenario: selectedScenario,
            entity: selectedEntity,
            product: selectedProduct
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVarianceData(data);
      }
    } catch {
      console.warn("MultiDim variance fetch fallback (backend offline or connecting...)");
    }
  };

  const [activeCompany, setActiveCompany] = useState<any>(globalActiveCompany || {
    name: "Vale S.A.",
    ticker: "VALE3 / NYSE: VALE",
    currency: "USD Milhões",
    periods: ["2024", "2025", "Budget_2026"]
  });

  useEffect(() => {
    if (globalActiveCompany?.name) {
      setActiveCompany(globalActiveCompany);
    }
  }, [globalActiveCompany]);

  useEffect(() => {
    fetchDimensions();
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/active-company`);
        if (res.ok) {
          const comp = await res.json();
          setActiveCompany(comp);
        }
      } catch (e) {
        console.warn("Could not load active company in MultiDimGrid", e);
      }
    };
    fetchCompany();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (varianceMode) {
      fetchVarianceData();
    } else {
      fetchGridData();
    }
  }, [apiBaseUrl, selectedVersion, selectedScenario, selectedEntity, selectedProduct, varianceMode, baseVersion, targetVersion, baseTime, targetTime, selectedTime]);

  // Handle Cell Double Click / Edit
  const handleStartEdit = (accountId: string, colId: string, currentVal: number) => {
    setEditingCell({ accountId, colId, currentVal });
    setEditValue(currentVal.toString());
  };

  const handleCommitEdit = async () => {
    if (!editingCell) return;
    const numVal = parseFloat(editValue);
    if (isNaN(numVal) || numVal === editingCell.currentVal) {
      setEditingCell(null);
      return;
    }

    if (selectedEntity === "Total_Company") {
      setPendingBreakback({ accountId: editingCell.accountId, colId: editingCell.colId, newVal: numVal });
      setShowBreakbackModal(true);
      setEditingCell(null);
      return;
    }

    await executeWriteBack(editingCell.accountId, editingCell.colId, numVal, "proportional");
    setEditingCell(null);
  };

  const executeWriteBack = async (accountId: string, colId: string, val: number, method: string) => {
    setSavingCell(true);
    setLastSavedCell(`${accountId}_${colId}`);
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/cell/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time: colId,
          version: selectedVersion,
          scenario: selectedScenario,
          entity: selectedEntity,
          account: accountId,
          product: selectedProduct,
          value: val,
          spread_method: method,
          user: "FP&A Lead"
        })
      });
      if (res.ok) {
        await fetchGridData();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Write-back error:", err);
    } finally {
      setSavingCell(false);
      setShowBreakbackModal(false);
      setPendingBreakback(null);
      setTimeout(() => setLastSavedCell(null), 2500);
    }
  };

  // Inspect Calculation Trace
  const handleTraceCell = async (accountId: string, colId: string) => {
    setTraceLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/cell/trace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time: colId,
          version: selectedVersion,
          scenario: selectedScenario,
          entity: selectedEntity,
          account: accountId,
          product: selectedProduct
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTraceCell(data);
      }
    } catch (err) {
      console.error("Trace error:", err);
    } finally {
      setTraceLoading(false);
    }
  };

  // Clone Scenario
  const handleCloneVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionId.trim()) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/versions/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_version_id: selectedVersion,
          new_version_id: newVersionId.trim(),
          new_label: newVersionLabel.trim() || newVersionId.trim(),
          growth_factor: Number(growthFactor)
        })
      });
      if (res.ok) {
        await fetchDimensions();
        setSelectedVersion(newVersionId.trim());
        setShowCloneModal(false);
        setNewVersionId("");
        setNewVersionLabel("");
      }
    } catch (err) {
      console.error("Clone error:", err);
    }
  };

  const ACCOUNT_TRANSLATIONS: Record<string, string> = {
    Receita_Liquida: "(+) Net Revenue",
    CMV: "(-) Cost of Goods Sold (COGS)",
    Margem_Bruta: "(=) Gross Profit",
    Despesas_Vendas: "(-) Selling Expenses",
    Despesas_Gerais_Admin: "(-) General & Administrative (G&A)",
    EBITDA: "(=) EBITDA",
    Depreciacao_Amortizacao: "(-) Depreciation & Amortization",
    EBIT: "(=) Operating Income (EBIT)",
    Resultado_Financeiro: "(+/-) Net Financial Result",
    EBT_LAIR: "(=) Earnings Before Taxes (EBT)",
    Impostos_IR_CSLL: "(-) Income Taxes (IR/CSLL)",
    Lucro_Liquido: "(=) Consolidated Net Income",
    receita_com_operacoes_de_credito_e_repasses: "(+) Financial Intermediation Revenue",
    despesas_de_captacao: "(-) Funding Expenses",
    provisao_para_risco_de_credito_prc: "(-) Loan Loss Provisions (PDD)",
    despesas_pessoal_e_administrativas: "(-) Personnel & Admin Expenses",
    resultado_com_participacoes_societarias: "(+) Equity Income / Financial Result",
    despesas_tributarias: "(-) Tax Expenses",
    outras_despesas_liquidas: "(-) Other Operating Expenses",
    tributos_sobre_o_lucro: "(-) Income Taxes",
    participacao_nos_lucros: "(-) Profit Sharing / Non-controlling",
    produto_da_intermediacao_financeira: "(=) Gross Intermediation Margin",
    resultado_da_intermediacao_financeira: "(=) Operating Margin / EBIT",
    resultado_antes_da_tributacao: "(=) Earnings Before Taxes (EBT)",
    recebimento_vendas: "(+) Customer Collections / Sales Receipts",
    pagamento_fornecedores: "(-) Supplier Payments",
    pagamento_salarios: "(-) Salaries & Personnel Payments",
    pagamento_despesas_operacionais: "(-) Operating Expenses Paid",
    pagamento_impostos: "(-) Taxes Paid",
    fco_caixa_liquido: "(=) Net Operating Cash Flow (OCF)",
    aquisicao_ativos_imobilizados: "(-) Capex / Fixed & Intangibles",
    compra_imoveis_veiculos: "(-) Asset & Real Estate Purchases",
    venda_ativos_equipamentos: "(+) Asset Divestments / Sales",
    fci_caixa_liquido: "(=) Net Investing Cash Flow (ICF)",
    aporte_capital: "(+) Capital Injections",
    captacao_emprestimos: "(+) Loans & Financing Borrowed",
    amortizacao_dividas: "(-) Debt Repayments / Amortization",
    pagamento_dividendos_jcp: "(-) Dividends & Interest on Equity Paid",
    fcf_caixa_liquido: "(=) Net Financing Cash Flow (FCF)",
    variacao_liquida_caixa: "(=) Net Change in Cash",
    saldo_inicial_caixa: "Beginning Cash Balance",
    saldo_final_caixa: "(=) Ending Cash Balance"
  };

  const getAccountLabel = (id: string, defaultLabel: string) => {
    if (!isEn) return defaultLabel;
    return ACCOUNT_TRANSLATIONS[id] || defaultLabel;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(isEn ? "en-US" : "pt-BR", {
      style: "currency",
      currency: activeCompany.currency?.includes("USD") ? "USD" : "BRL",
      maximumFractionDigits: 1
    }).format(val);
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Rule Editor Modal */}
      <RuleEditorModal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        onRuleUpdated={() => fetchGridData()}
      />

      {/* Breadcrumbs & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            <span className={isDark ? "text-slate-300" : "text-slate-600"}>
              {isEn ? "HyperCube Corporate Workspace" : "Espaço Corporativo HyperCube"}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-400" />
            <span className={isDark ? "text-white font-bold" : "text-slate-800 font-bold"}>{activeCompany.name} ({activeCompany.ticker})</span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-400" />
            <span className="text-anaplan-coral font-bold">
              {isEn ? `Consolidated (${activeCompany.currency})` : `Consolidado (${activeCompany.currency})`}
            </span>
          </div>
          <h2 className={`text-xl font-bold tracking-tight mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
            {isEn
              ? `Multidimensional Income Statement (${activeCompany.name})`
              : `Demonstrativo de Resultados Multidimensional (${activeCompany.name})`}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLineChart(!showLineChart)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              showLineChart
                ? "bg-anaplan-cyan text-white hover:bg-sky-600"
                : isDark ? "bg-slate-800 border border-slate-700 text-sky-300 hover:bg-slate-700" : "bg-white border border-slate-300 text-sky-700 hover:bg-slate-50"
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            {showLineChart
              ? (isEn ? "Hide Line Charts" : "Ocultar Gráficos de Linha")
              : (isEn ? "Dynamic Line Charts" : "Gráficos Dinâmicos de Linha")}
          </button>

          <button
            onClick={() => setVarianceMode(!varianceMode)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              varianceMode
                ? "bg-anaplan-coral text-white hover:bg-anaplan-coral-hover"
                : isDark ? "bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700" : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {varianceMode
              ? (isEn ? "General Grid View" : "Visualização em Grade Geral")
              : (isEn ? "Variance Analysis (Deltas)" : "Análise de Variância (Deltas)")}
          </button>

          <button
            onClick={() => setShowCloneModal(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              isDark ? "bg-slate-800 border border-slate-700 text-sky-300 hover:bg-slate-700 hover:text-white" : "bg-white border border-slate-300 text-sky-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-sky-400" />
            {isEn ? "New Scenario / Branch" : "Novo Cenário / Branch"}
          </button>

          <button
            onClick={() => setShowRuleModal(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              isDark ? "bg-slate-800 border border-slate-700 text-amber-300 hover:bg-slate-700 hover:text-white" : "bg-white border border-slate-300 text-amber-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            {isEn ? "DSL Formula Rules" : "Regras de Fórmulas DSL"}
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm border ${
              cleanProductionActive
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                : isDark
                ? "bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60 hover:text-white"
                : "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
            }`}
            title={isEn ? "Clear all cells for client production handover" : "Limpar todas as células para produção e handover para clientes"}
          >
            <Eraser className="w-3.5 h-3.5 text-rose-400" />
            {isEn ? "Clear Cells (Production)" : "Limpar Células (Produção)"}
          </button>
        </div>
      </div>

      {/* Page Selectors Bar (Dimension Filters) */}
      <div className={`p-4 rounded-xl border ${
        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 shadow-sm text-slate-900"
      }`}>
        <div className="flex items-center gap-2 mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          <SlidersHorizontal className="w-3.5 h-3.5 text-anaplan-coral" />
          <span className={isDark ? "text-slate-100" : "text-slate-800"}>
            {isEn ? "Dimensional Context Selectors" : "Seletores de Contexto Dimensional"} — {activeCompany.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
          {/* Versão */}
          <div className="space-y-1">
            <label className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              <TrendingUp className="w-3 h-3 text-anaplan-coral" /> {isEn ? "Version" : "Versão"}
            </label>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border outline-none font-semibold transition ${
                isDark ? "bg-slate-950 border-slate-700 text-white focus:border-anaplan-coral" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-anaplan-coral"
              }`}
            >
              {(dimensions.version?.members || []).map((m: any) => (
                <option key={m.id} value={m.id} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Cenário */}
          <div className="space-y-1">
            <label className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              <Sparkles className="w-3 h-3 text-anaplan-cyan" /> {isEn ? "Scenario" : "Cenário"}
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border outline-none font-semibold transition ${
                isDark ? "bg-slate-950 border-slate-700 text-white focus:border-anaplan-coral" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-anaplan-coral"
              }`}
            >
              {(dimensions.scenario?.members || []).map((m: any) => (
                <option key={m.id} value={m.id} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Entidade / Unidade Operacional */}
          <div className="space-y-1">
            <label className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              <Building2 className="w-3 h-3 text-indigo-400" /> {isEn ? "Operation / Region" : "Operação / Região"}
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border outline-none font-semibold transition ${
                isDark ? "bg-slate-950 border-slate-700 text-white focus:border-anaplan-coral" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-anaplan-coral"
              }`}
            >
              {(dimensions.entity?.members || []).map((m: any) => (
                <option key={m.id} value={m.id} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Produto / Segmento */}
          <div className="space-y-1">
            <label className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              <Box className="w-3 h-3 text-emerald-400" /> {isEn ? "Segment / Brands" : "Segmento / Marcas"}
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border outline-none font-semibold transition ${
                isDark ? "bg-slate-950 border-slate-700 text-white focus:border-anaplan-coral" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-anaplan-coral"
              }`}
            >
              {(dimensions.product?.members || []).map((m: any) => (
                <option key={m.id} value={m.id} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Período */}
          <div className="space-y-1">
            <label className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              <Calendar className="w-3 h-3 text-rose-400" /> {isEn ? "Period in Focus" : "Período em Foco"}
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border outline-none font-semibold transition ${
                isDark ? "bg-slate-950 border-slate-700 text-white focus:border-anaplan-coral" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-anaplan-coral"
              }`}
            >
              {(dimensions.time?.members || []).map((m: any) => (
                <option key={m.id} value={m.id} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Production Clean Status Toast Banner */}
      {productionToast && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{productionToast}</span>
          </div>
          <button
            onClick={() => handleRestoreDemoCells()}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-sky-400" />
            {isEn ? "Restore Demo Data" : "Restaurar Dados Demo"}
          </button>
        </div>
      )}

      {/* Main Matrix Table View */}
      {!varianceMode ? (
        <div className={`rounded-xl border overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 shadow-sm text-slate-900"
        }`}>
          {/* Table Header Bar */}
          <div className={`px-6 py-3 border-b flex justify-between items-center text-xs ${
            isDark ? "bg-slate-950/90 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center gap-3">
              <span className={`font-bold uppercase tracking-wider text-[11px] ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                {isEn
                  ? `Financial Results Statement — ${activeCompany.name} (${activeCompany.currency})`
                  : `Demonstração de Resultados — Dados Oficiais ${activeCompany.name} (${activeCompany.currency})`}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-anaplan-coral/10 text-anaplan-coral font-bold border border-anaplan-coral/20">
                {isEn ? "Active Write-Back & Simulation" : "Write-Back & Simulação Ativos"}
              </span>
            </div>

            {savingCell && (
              <span className="flex items-center gap-1.5 text-anaplan-coral font-bold text-xs animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> {isEn ? "Recalculating cube..." : "Recalculando cubo..."}
              </span>
            )}
          </div>

          {/* Matrix Grid Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className={`border-b anaplan-grid-header ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-100 border-slate-200 text-slate-800"
                }`}>
                  <th className={`py-3 px-6 font-extrabold uppercase tracking-wider text-[11px] w-96 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {isEn ? "Income Statement Line" : "Linha da DRE"}
                  </th>
                  {(gridData?.columns || []).map((col: any) => (
                    <th key={col.id} className={`py-3 px-4 font-extrabold text-right font-mono text-[11px] ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {col.label}
                    </th>
                  ))}
                  <th className={`py-3 px-4 text-center w-20 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {isEn ? "Audit" : "Auditar"}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800/80 text-slate-100" : "divide-slate-200 text-slate-900"}`}>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-14 text-center text-slate-400">
                      <div className="w-7 h-7 border-2 border-anaplan-coral border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      {isEn ? "Loading multidimensional model..." : "Carregando modelo multidimensional..."}
                    </td>
                  </tr>
                ) : (
                  (gridData?.rows || []).map((row: any) => {
                    const isSummaryRow = row.id.includes("Lucro") || row.id.includes("EBIT") || row.id.includes("Receita_Liquida") || row.id.includes("Margem_Bruta");
                    const isTotalLucro = row.id === "Lucro_Liquido";

                    return (
                      <tr
                        key={row.id}
                        className={`transition ${
                          isTotalLucro
                            ? (isDark ? "bg-anaplan-coral/20 font-bold text-white" : "bg-orange-50 font-bold text-slate-900")
                            : isSummaryRow
                            ? (isDark ? "bg-slate-800/60 font-bold text-white" : "bg-slate-100/90 font-bold text-slate-900")
                            : (isDark ? "hover:bg-slate-800/40 text-slate-200" : "hover:bg-slate-50 text-slate-800")
                        }`}
                      >
                        <td className="py-2.5 px-6 font-medium flex items-center justify-between">
                          <span className={`${
                            isTotalLucro
                              ? "text-anaplan-coral font-black"
                              : isSummaryRow
                              ? (isDark ? "text-white font-bold" : "text-slate-900 font-bold")
                              : (isDark ? "text-slate-200" : "text-slate-800")
                          }`}>
                            {getAccountLabel(row.id, row.label)}
                          </span>
                        </td>
                        {(gridData?.columns || []).map((col: any) => {
                          const val = row.values[col.id] || 0;
                          const isEditing = editingCell?.accountId === row.id && editingCell?.colId === col.id;
                          const isJustSaved = lastSavedCell === `${row.id}_${col.id}`;

                          return (
                            <td
                              key={col.id}
                              onDoubleClick={() => handleStartEdit(row.id, col.id, val)}
                              className={`py-2.5 px-4 text-right font-mono cursor-pointer transition-colors ${
                                isJustSaved ? "bg-emerald-500/20 text-emerald-400 font-bold" : "hover:bg-anaplan-coral/10"
                              }`}
                              title={isEn ? "Double click to edit value with Write-Back" : "Clique duplo para editar valor com Write-Back"}
                            >
                              {isEditing ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={handleCommitEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCommitEdit();
                                    if (e.key === "Escape") setEditingCell(null);
                                  }}
                                  className="w-28 px-1.5 py-0.5 rounded text-right bg-anaplan-coral text-white font-bold outline-none shadow-md"
                                />
                              ) : (
                                <span className={
                                  val < 0 
                                    ? "text-rose-500 dark:text-rose-400 font-semibold" 
                                    : isDark ? "text-slate-100 font-medium" : "text-slate-900 font-medium"
                                }>
                                  {formatCurrency(val)}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-4 text-center flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedChartAccounts([row.id]);
                              setShowLineChart(true);
                            }}
                            className={`p-1 rounded transition ${isDark ? "text-slate-400 hover:text-anaplan-cyan hover:bg-slate-800" : "text-slate-500 hover:text-anaplan-cyan hover:bg-slate-100"}`}
                            title={isEn ? "Plot this account on dynamic trendline" : "Plotar esta conta no Gráfico de Linhas Dinâmico"}
                          >
                            <LineChartIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleTraceCell(row.id, selectedTime || "4T25")}
                            className={`p-1 rounded transition ${isDark ? "text-slate-400 hover:text-anaplan-coral hover:bg-slate-800" : "text-slate-500 hover:text-anaplan-coral hover:bg-slate-100"}`}
                            title={isEn ? "Audit Calculation Lineage (Calculation Trace)" : "Auditar Linhagem de Cálculo (Calculation Trace)"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Variance Analysis Table (4T24 vs 4T25 or Period Comparison) */
        <div className={`rounded-xl border overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 shadow-sm text-slate-900"
        }`}>
          <div className={`px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4 text-xs ${
            isDark ? "bg-slate-950/90 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div>
              <span className="font-bold text-anaplan-coral uppercase tracking-wider text-xs block">
                {isEn
                  ? `Variance Analysis Statement — ${baseTime} vs ${targetTime} (${activeCompany.name})`
                  : `Demonstrativo de Variância — ${baseTime} vs ${targetTime} (${activeCompany.name})`}
              </span>
              <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn
                  ? `Official period comparison with reported absolute and percentage deltas (${activeCompany.currency})`
                  : `Comparativo oficial de períodos com deltas absolutos e percentuais reportados (${activeCompany.currency})`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Período Base */}
              <div className="flex items-center gap-1.5">
                <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {isEn ? "Base Period:" : "Período Base:"}
                </span>
                <select
                  value={baseTime}
                  onChange={(e) => setBaseTime(e.target.value)}
                  className={`rounded px-2.5 py-1 font-semibold border outline-none ${
                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  {(dimensions.time?.members || []).map((m: any) => (
                    <option key={m.id} value={m.id} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{m.label}</option>
                  ))}
                </select>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400" />

              {/* Período Alvo */}
              <div className="flex items-center gap-1.5">
                <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {isEn ? "Target Period:" : "Período Alvo:"}
                </span>
                <select
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className={`rounded px-2.5 py-1 font-semibold border outline-none ${
                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  {(dimensions.time?.members || []).map((m: any) => (
                    <option key={m.id} value={m.id} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Botão de Alternar Gráfico Waterfall */}
              <button
                onClick={() => setShowWaterfall(!showWaterfall)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold border transition ml-2 ${
                  showWaterfall
                    ? "bg-anaplan-coral text-white border-anaplan-coral shadow-sm"
                    : isDark
                    ? "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
                title={isEn ? "Toggle Waterfall Bridge Chart" : "Alternar Gráfico Waterfall (Ponte de Variância)"}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{isEn ? "Waterfall Bridge" : "Gráfico Waterfall"}</span>
              </button>
            </div>
          </div>

          {/* Gráfico Waterfall de Variância Integrado */}
          {showWaterfall && (
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <WaterfallChart
                basePeriod={baseTime}
                targetPeriod={targetTime}
                baseVersion={baseVersion}
                targetVersion={targetVersion}
                currency={activeCompany.currency || "USD M"}
                companyName={activeCompany.name || "Empresa"}
                filters={{
                  scenario: selectedScenario,
                  entity: selectedEntity,
                  product: selectedProduct
                }}
              />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>

                <tr className={`border-b ${isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-100 border-slate-200 text-slate-800"}`}>
                  <th className={`py-3 px-6 font-extrabold uppercase tracking-wider ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    {isEn ? "Statement Line" : "Linha DRE"}
                  </th>
                  <th className={`py-3 px-4 font-extrabold text-right font-mono ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    {baseTime} ({isEn ? "Base" : "Base"})
                  </th>
                  <th className="py-3 px-4 font-extrabold text-right font-mono text-anaplan-coral">
                    {targetTime} ({isEn ? "Target" : "Alvo"})
                  </th>
                  <th className={`py-3 px-4 font-extrabold text-right font-mono ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    {isEn ? `Variance (${activeCompany.currency || "USD M"})` : `Desvio (${activeCompany.currency || "USD M"})`}
                  </th>
                  <th className={`py-3 px-4 font-extrabold text-right font-mono ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    {isEn ? "Growth (%)" : "Variação (%)"}
                  </th>
                  <th className={`py-3 px-4 text-center ${isDark ? "text-slate-100" : "text-slate-800"}`}>Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800/80 text-slate-100" : "divide-slate-200 text-slate-900"}`}>
                {(varianceData?.rows || []).map((r: any) => (
                  <tr key={r.account_id} className={`transition ${isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}`}>
                    <td className={`py-2.5 px-6 font-medium ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                      {getAccountLabel(r.account_id, r.label)}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>{formatCurrency(r.val_base)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-anaplan-coral font-bold">{formatCurrency(r.val_target)}</td>
                    <td className={`py-2.5 px-4 text-right font-mono font-bold ${r.delta >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                      {r.delta >= 0 ? `+${formatCurrency(r.delta)}` : formatCurrency(r.delta)}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-mono font-bold ${r.variance_pct >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                      {r.variance_pct >= 0 ? `+${r.variance_pct}%` : `${r.variance_pct}%`}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === "favorable"
                          ? "bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30"
                      }`}>
                        {r.status === "favorable" ? (isEn ? "Favorable" : "Favorável") : (isEn ? "Unfavorable" : "Desfavorável")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Interactive Accounts Line Chart */}
      {showLineChart && (
        <DynamicAccountsLineChart
          title={
            isEn
              ? `Temporal Account Trajectory (${dimensions.entity?.members?.find((m: any) => m.id === selectedEntity)?.label || selectedEntity} — ${dimensions.version?.members?.find((m: any) => m.id === selectedVersion)?.label || selectedVersion})`
              : `Trajetória Temporal das Contas (${dimensions.entity?.members?.find((m: any) => m.id === selectedEntity)?.label || selectedEntity} — ${dimensions.version?.members?.find((m: any) => m.id === selectedVersion)?.label || selectedVersion})`
          }
          subtitle={
            isEn
              ? "Dynamic multi-scale line charts (Nominal, Base 100, Margins %, PoP) reactively synced with the grid."
              : "Gráficos de linhas dinâmicos com múltiplos modos de escala (Nominal, Base 100, Margens %, PoP) sincronizados reativamente com a grade."
          }
          gridData={gridData}
          initialSelectedAccounts={selectedChartAccounts}
        />
      )}

      {/* Breakback / Top-Down Allocation Dialog Modal */}
      {showBreakbackModal && pendingBreakback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center gap-3 border-b border-slate-800/30 pb-3">
              <div className="p-2.5 rounded-xl bg-anaplan-coral/10 text-anaplan-coral">
                <Split className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                  {isEn ? "Breakback Top-Down Spread" : "Distribuição Breakback (Top-Down Spread)"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn
                    ? `You modified a consolidated node for ${activeCompany.name}. Choose how to allocate changes to child operations:`
                    : `Você alterou um nó consolidado de ${activeCompany.name}. Escolha a regra de distribuição para as operações filhas:`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setSpreadMethod("proportional")}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  spreadMethod === "proportional"
                    ? "bg-anaplan-coral/10 border-anaplan-coral text-anaplan-coral"
                    : isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-anaplan-coral flex items-center justify-center mt-0.5">
                  {spreadMethod === "proportional" && <div className="w-2 h-2 rounded-full bg-anaplan-coral"></div>}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {isEn ? "Proportional Distribution (Recommended)" : "Distribuição Proporcional (Recomendado)"}
                  </h4>
                  <p className={`text-[11px] mt-0.5 font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                    {isEn
                      ? "Maintains the historical baseline weight of each operating unit."
                      : "Mantém o peso histórico de cada operação."}
                  </p>
                </div>
              </div>

              <div
                onClick={() => setSpreadMethod("equal")}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  spreadMethod === "equal"
                    ? "bg-anaplan-coral/10 border-anaplan-coral text-anaplan-coral"
                    : isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-anaplan-coral flex items-center justify-center mt-0.5">
                  {spreadMethod === "equal" && <div className="w-2 h-2 rounded-full bg-anaplan-coral"></div>}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {isEn ? "Equal Spread" : "Distribuição Igualitária (Equal Spread)"}
                  </h4>
                  <p className={`text-[11px] mt-0.5 font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                    {isEn
                      ? "Divides the target variance equally among all child operations."
                      : "Divide o valor em partes iguais entre as operações filhas."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBreakbackModal(false)}
                className={`px-4 py-2 rounded-lg text-xs font-bold ${isDark ? "text-slate-200 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
              >
                {isEn ? "Cancel" : "Cancelar"}
              </button>
              <button
                onClick={() => executeWriteBack(pendingBreakback.accountId, pendingBreakback.colId, pendingBreakback.newVal, spreadMethod)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-anaplan-coral hover:bg-anaplan-coral-hover text-white transition shadow-md"
              >
                {isEn ? "Apply Breakback" : "Aplicar Breakback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Trace Drawer / Modal */}
      {traceCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-2xl p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-anaplan-cyan/10 text-anaplan-cyan">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                    {isEn ? "Calculation Trace & Lineage" : "Auditoria de Célula (Calculation Trace)"}
                  </h3>
                  <p className={`text-xs font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                    {traceCell.target?.account_label} — <span className="font-bold text-anaplan-coral">{traceCell.type}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setTraceCell(null)} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <div className={`p-4 rounded-xl border text-xs space-y-2 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex justify-between items-center">
                <span className={isDark ? "text-slate-100 font-bold" : "text-slate-700 font-semibold"}>
                  {isEn ? "Evaluated Cell Value:" : "Valor Avaliado na Célula:"}
                </span>
                <span className="font-mono font-bold text-anaplan-coral text-sm">{formatCurrency(traceCell.value)}</span>
              </div>
              {traceCell.formula && (
                <div className={`pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  <span className={`text-[10px] uppercase font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    {isEn ? "Compiled DSL Formula:" : "Fórmula DSL Compilada:"}
                  </span>
                  <div className={`font-mono mt-1 px-2 py-1 rounded border ${isDark ? "bg-slate-900 border-slate-800 text-sky-400 font-bold" : "bg-white border-slate-300 text-sky-700 font-bold"}`}>
                    = {traceCell.formula.expression}
                  </div>
                  <p className={`text-[11px] mt-1 font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{traceCell.formula.description}</p>
                </div>
              )}
            </div>

            {/* Precedents Table */}
            {traceCell.precedents?.length > 0 && (
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  {isEn ? "Precedent Calculation Inputs" : "Contas Precedentes no Cálculo"}
                </h4>
                <div className="space-y-1.5">
                  {traceCell.precedents.map((p: any) => (
                    <div key={p.account_id} className={`p-2.5 rounded-lg border flex justify-between items-center text-xs ${isDark ? "bg-slate-950 border-slate-800/80" : "bg-slate-50 border-slate-200"}`}>
                      <span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{p.label}</span>
                      <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{formatCurrency(p.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contributions Breakdown if Consolidated */}
            {traceCell.contributions?.length > 0 && (
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  {isEn ? `Operating Unit Composition (Top ${traceCell.contributions.length})` : `Composição das Operações (Top ${traceCell.contributions.length})`}
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {traceCell.contributions.map((c: any, idx: number) => (
                    <div key={idx} className={`p-2 rounded border flex justify-between items-center text-xs ${isDark ? "bg-slate-950 border-slate-800/60" : "bg-slate-50 border-slate-200"}`}>
                      <span className={`font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}>{c.coordinates}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{formatCurrency(c.value)}</span>
                        <span className="text-[10px] text-anaplan-coral font-mono font-bold">({c.share_pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTraceCell(null)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${isDark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"}`}
              >
                {isEn ? "Close" : "Fechar Auditoria"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Version Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form onSubmit={handleCloneVersion} className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center gap-3 border-b border-slate-800/30 pb-3">
              <div className="p-2.5 rounded-xl bg-anaplan-cyan/10 text-anaplan-cyan">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                  {isEn ? "Create / Branch New Scenario" : "Criar / Branch de Novo Cenário"}
                </h3>
                <p className={`text-xs font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                  {isEn ? `Clones current state of version ` : `Clona o estado atual da versão `}<strong>{selectedVersion}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  {isEn ? "New Version Identifier (ID)" : "Identificador da Nova Versão (ID)"}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? "e.g. Budget_Optimistic_2026, FX_Stress" : "ex: Orcamento_Otimista_2026, Stress_Dolar"}
                  value={newVersionId}
                  onChange={(e) => setNewVersionId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none font-mono font-semibold ${
                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  {isEn ? "Friendly Label / Description" : "Rótulo / Descrição Amigável"}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? "e.g. Budget 2026 (Optimistic +10%)" : "ex: Orçamento 2026 (Cenário Otimista +10%)"}
                  value={newVersionLabel}
                  onChange={(e) => setNewVersionLabel(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none font-semibold ${
                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  {isEn ? "Growth Factor / Baseline Multiplier" : "Multiplicador de Crescimento / Choque Inicial"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={growthFactor}
                  onChange={(e) => setGrowthFactor(parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border outline-none font-mono font-bold ${
                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
                <p className={`text-[10.5px] mt-1 font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                  {isEn ? "1.10 = +10% initial variance relative to base scenario." : "1.10 = +10% de premissa em relação ao cenário base."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCloneModal(false)}
                className={`px-4 py-2 rounded-lg text-xs font-bold ${isDark ? "text-slate-200 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
              >
                {isEn ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-anaplan-coral hover:bg-anaplan-coral-hover text-white transition shadow-md"
              >
                {isEn ? "Create Scenario Branch" : "Criar Branch de Cenário"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clear Cells for Production Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl space-y-5 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center gap-3 border-b border-slate-800/30 pb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Eraser className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                  {isEn ? "Clear All Cells for Production" : "Limpar Todas as Células para Produção"}
                </h3>
                <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {isEn ? "Handover clean slate model for client analysis" : "Entrega do modelo limpo (em branco) para análise do cliente"}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className={`p-3.5 rounded-xl border ${
                isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <p className="font-medium">
                  {isEn
                    ? "This action clears all cell values across the entire Connected Planning cube (all set to 0.00). All dimension structures, accounting lines, periods, and formula rules remain 100% intact, ready for client data input."
                    : "Esta ação zera todos os valores das células em todo o cubo multidimensional de Planejamento Conectado (todos definidos para R$ 0,00). As contas da DRE, períodos fiscais, entidades e regras de cálculo permanecem 100% preservadas para a inserção de dados do cliente."}
                </p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-lg hover:bg-slate-800/20 transition border border-transparent hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={clearAlsoUploads}
                  onChange={(e) => setClearAlsoUploads(e.target.checked)}
                  className="mt-0.5 rounded text-rose-500 focus:ring-rose-500 w-4 h-4"
                />
                <div>
                  <span className={`font-bold block ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {isEn ? "Full Production Reset (Reset All)" : "Reset Completo de Produção (Zerar Tudo)"}
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {isEn 
                      ? "Also deletes temporary test uploads and resets workspace to 'Waiting for Data Upload'." 
                      : "Também remove arquivos temporários de upload de teste e redefine a empresa para 'Aguardando Upload de Dados'."}
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/30">
              <button
                type="button"
                onClick={() => handleRestoreDemoCells()}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Restaura os valores padrões de demonstração"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                {isEn ? "Restore Demo" : "Restaurar Demo"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  disabled={clearingCells}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    isDark ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {isEn ? "Cancel" : "Cancelar"}
                </button>
                <button
                  type="button"
                  onClick={handleClearCellsForProduction}
                  disabled={clearingCells}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {clearingCells ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {isEn ? "Clearing..." : "Limpando..."}
                    </>
                  ) : (
                    <>
                      <Eraser className="w-3.5 h-3.5" />
                      {isEn ? "Confirm & Clear Cells" : "Confirmar e Zerar Células"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

