"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  SlidersHorizontal,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Download,
  Filter,
  Check,
  RotateCcw,
  Eye,
  BarChart3,
  Search,
  Table as TableIcon,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckSquare,
  Square
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";

export interface AccountTimeSeriesData {
  period: string; // e.g. "4T24", "4T25", "12M24", "12M25", "Budget_2026"
  periodLabel?: string;
  [accountId: string]: any;
}

export interface AccountMeta {
  id: string;
  label: string;
  color: string;
  category?: "revenue" | "cost" | "margin" | "expense" | "result" | "cash";
  defaultActive?: boolean;
}

interface DynamicAccountsLineChartProps {
  title?: string;
  subtitle?: string;
  customData?: AccountTimeSeriesData[];
  accountsMeta?: AccountMeta[];
  initialSelectedAccounts?: string[];
  gridData?: any; // from MultiDimGrid query
  viewMode?: "DRE" | "DFC" | "MULTIDIM";
  compact?: boolean;
}

// Curated harmonious color palette for financial accounts
const DEFAULT_ACCOUNT_COLORS: Record<string, string> = {
  Receita_Liquida: "#00a3e0", // Anaplan Cyan
  receita_com_operacoes_de_credito_e_repasses: "#00a3e0",
  recebimento_vendas: "#00a3e0",
  
  CMV: "#e11d48", // Rose Red
  despesas_de_captacao: "#e11d48",
  pagamento_fornecedores: "#e11d48",
  
  Margem_Bruta: "#10b981", // Emerald
  produto_da_intermediacao_financeira: "#10b981",
  
  Despesas_Logistica: "#f59e0b", // Amber
  Despesas_Comerciais: "#ec4899", // Pink
  Despesas_Gerais_Admin: "#8b5cf6", // Violet
  despesas_pessoal_e_administrativas: "#8b5cf6",
  pagamento_salarios: "#8b5cf6",
  pagamento_despesas_operacionais: "#f59e0b",
  
  EBIT: "#6366f1", // Indigo
  EBITDA: "#ff5537", // Anaplan Coral
  resultado_da_intermediacao_financeira: "#6366f1",
  
  Resultado_Financeiro: "#06b6d4", // Cyan
  resultado_com_participacoes_societarias: "#06b6d4",
  
  EBT: "#f97316", // Orange
  resultado_antes_da_tributacao: "#f97316",
  
  Impostos_Lucro: "#ef4444", // Red
  tributos_sobre_o_lucro: "#ef4444",
  pagamento_impostos: "#ef4444",
  
  Lucro_Liquido: "#22c55e", // Green
  lucro_liquido: "#22c55e",
  
  // DFC specific
  fco_caixa_liquido: "#38bdf8", // Sky
  fci_caixa_liquido: "#f59e0b", // Amber
  fcf_caixa_liquido: "#a855f7", // Purple
  saldo_final_caixa: "#10b981", // Emerald
  variacao_liquida_caixa: "#14b8a6", // Teal
};

// Fallback palette for dynamic accounts
const COLOR_PALETTE = [
  "#ff5537", "#00a3e0", "#10b981", "#8b5cf6", "#f59e0b",
  "#6366f1", "#ec4899", "#14b8a6", "#3b82f6", "#e11d48",
  "#84cc16", "#06b6d4", "#d946ef", "#f97316", "#a855f7"
];

export default function DynamicAccountsLineChart({
  title,
  subtitle,
  customData,
  accountsMeta,
  initialSelectedAccounts,
  gridData,
  viewMode = "MULTIDIM",
  compact = false,
}: DynamicAccountsLineChartProps) {
  const { theme, language } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  // Chart configuration states
  const [chartType, setChartType] = useState<"line" | "area" | "step" | "bar_line">("line");
  const [scaleMode, setScaleMode] = useState<"nominal" | "base100" | "margin_pct" | "growth_rate">("nominal");
  const [showDataPoints, setShowDataPoints] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showAverageLine, setShowAverageLine] = useState(false);
  const [showDataTable, setShowDataTable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Extracted Data & Accounts metadata from props or gridData
  const { chartData, availableAccounts } = useMemo(() => {
    // If customData is supplied
    if (customData && customData.length > 0) {
      const accs: AccountMeta[] = accountsMeta || [];
      if (accs.length === 0 && customData[0]) {
        const keys = Object.keys(customData[0]).filter(k => k !== "period" && k !== "periodLabel");
        keys.forEach((k, idx) => {
          accs.push({
            id: k,
            label: k.replace(/_/g, " "),
            color: DEFAULT_ACCOUNT_COLORS[k] || COLOR_PALETTE[idx % COLOR_PALETTE.length],
            defaultActive: idx < 4
          });
        });
      }
      return { chartData: customData, availableAccounts: accs };
    }

    // If gridData (from MultiDimGrid) is available
    if (gridData && gridData.columns && gridData.rows) {
      const periods: { id: string; label: string }[] = gridData.columns;
      const rows: { id: string; label: string; values: Record<string, number> }[] = gridData.rows;

      // Transform rows x columns into TimeSeries array
      const transformed: AccountTimeSeriesData[] = periods.map(col => {
        const item: AccountTimeSeriesData = {
          period: col.id,
          periodLabel: col.label || col.id,
        };
        rows.forEach(r => {
          item[r.id] = r.values ? (r.values[col.id] || 0) : 0;
        });
        return item;
      });

      const accs: AccountMeta[] = rows.map((r, idx) => ({
        id: r.id,
        label: r.label,
        color: DEFAULT_ACCOUNT_COLORS[r.id] || COLOR_PALETTE[idx % COLOR_PALETTE.length],
        defaultActive: ["Receita_Liquida", "Margem_Bruta", "EBITDA", "Lucro_Liquido", "fco_caixa_liquido", "saldo_final_caixa"].includes(r.id) || idx < 3
      }));

      return { chartData: transformed, availableAccounts: accs };
    }

    // Default Fallback Vale S.A. 2024, 2025, Budget 2026 data (USD Milhões)
    const fallbackData: AccountTimeSeriesData[] = [
      {
        period: "2024",
        periodLabel: "Exercício 2024 (Consolidado Vale)",
        Receita_Liquida: 38056.0,
        CMV: 24265.0,
        Margem_Bruta: 13791.0,
        Despesas_Logistica: 622.0,
        Despesas_Comerciais: 790.0,
        Despesas_Gerais_Admin: 403.0,
        EBIT: 10788.0,
        EBITDA: 14882.0,
        Resultado_Financeiro: -3823.0,
        EBT: 6696.0,
        Impostos_Lucro: 721.0,
        Lucro_Liquido: 5975.0,
      },
      {
        period: "2025",
        periodLabel: "Exercício 2025 (Consolidado Vale)",
        Receita_Liquida: 38403.0,
        CMV: 24947.0,
        Margem_Bruta: 13456.0,
        Despesas_Logistica: 641.0,
        Despesas_Comerciais: 693.0,
        Despesas_Gerais_Admin: 268.0,
        EBIT: 5897.0,
        EBITDA: 15500.0,
        Resultado_Financeiro: -1026.0,
        EBT: 4653.0,
        Impostos_Lucro: 2670.0,
        Lucro_Liquido: 1983.0,
      },
      {
        period: "Budget_2026",
        periodLabel: "Orçamento 2026 (Budget Vale)",
        Receita_Liquida: 41200.0,
        CMV: 25800.0,
        Margem_Bruta: 15400.0,
        Despesas_Logistica: 650.0,
        Despesas_Comerciais: 700.0,
        Despesas_Gerais_Admin: 250.0,
        EBIT: 12000.0,
        EBITDA: 16800.0,
        Resultado_Financeiro: -1100.0,
        EBT: 11100.0,
        Impostos_Lucro: 2800.0,
        Lucro_Liquido: 8300.0,
      }
    ];

    const fallbackAccs: AccountMeta[] = [
      { id: "Receita_Liquida", label: "Receita Líquida", color: "#00a3e0", defaultActive: true },
      { id: "CMV", label: "(-) Custo dos Produtos (CMV)", color: "#e11d48", defaultActive: false },
      { id: "Margem_Bruta", label: "(=) Lucro Bruto", color: "#10b981", defaultActive: true },
      { id: "Despesas_Logistica", label: "(-) Despesas Logísticas", color: "#f59e0b", defaultActive: false },
      { id: "Despesas_Comerciais", label: "(-) Despesas Comerciais", color: "#ec4899", defaultActive: false },
      { id: "Despesas_Gerais_Admin", label: "(-) SG&A / Administrativas", color: "#8b5cf6", defaultActive: false },
      { id: "EBIT", label: "(=) Lucro Operacional (EBIT)", color: "#6366f1", defaultActive: false },
      { id: "EBITDA", label: "(=) EBITDA Ajustado", color: "#ff5537", defaultActive: true },
      { id: "Resultado_Financeiro", label: "(+/-) Resultado Financeiro", color: "#06b6d4", defaultActive: false },
      { id: "EBT", label: "(=) Lucro Antes Tributos (EBT)", color: "#f97316", defaultActive: false },
      { id: "Impostos_Lucro", label: "(-) Impostos s/ Lucro", color: "#ef4444", defaultActive: false },
      { id: "Lucro_Liquido", label: "(=) Lucro Líquido", color: "#22c55e", defaultActive: true },
    ];

    return { chartData: fallbackData, availableAccounts: fallbackAccs };
  }, [customData, accountsMeta, gridData]);

  // Selected accounts state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(() => {
    if (initialSelectedAccounts && initialSelectedAccounts.length > 0) {
      return initialSelectedAccounts;
    }
    return availableAccounts.filter(a => a.defaultActive).map(a => a.id);
  });

  // Toggle account selection
  const handleToggleAccount = (id: string) => {
    setSelectedAccounts(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Quick Preset Handlers
  const handleApplyPreset = (preset: "profitability" | "costs" | "cash_flow" | "margins" | "all" | "clear") => {
    if (preset === "profitability") {
      const match = availableAccounts.filter(a =>
        ["Receita_Liquida", "Margem_Bruta", "EBIT", "EBITDA", "Lucro_Liquido", "receita_com_operacoes_de_credito_e_repasses", "produto_da_intermediacao_financeira", "lucro_liquido"].includes(a.id)
      ).map(a => a.id);
      setSelectedAccounts(match.length > 0 ? match : availableAccounts.slice(0, 4).map(a => a.id));
      setScaleMode("nominal");
    } else if (preset === "costs") {
      const match = availableAccounts.filter(a =>
        ["CMV", "Despesas_Logistica", "Despesas_Comerciais", "Despesas_Gerais_Admin", "Impostos_Lucro", "despesas_de_captacao", "despesas_pessoal_e_administrativas"].includes(a.id)
      ).map(a => a.id);
      setSelectedAccounts(match.length > 0 ? match : availableAccounts.slice(0, 4).map(a => a.id));
      setScaleMode("nominal");
    } else if (preset === "cash_flow") {
      const match = availableAccounts.filter(a =>
        ["recebimento_vendas", "fco_caixa_liquido", "fci_caixa_liquido", "fcf_caixa_liquido", "saldo_final_caixa", "variacao_liquida_caixa"].includes(a.id)
      ).map(a => a.id);
      setSelectedAccounts(match.length > 0 ? match : availableAccounts.slice(0, 4).map(a => a.id));
      setScaleMode("nominal");
    } else if (preset === "margins") {
      const match = availableAccounts.filter(a =>
        ["Margem_Bruta", "EBITDA", "EBIT", "Lucro_Liquido"].includes(a.id)
      ).map(a => a.id);
      setSelectedAccounts(match.length > 0 ? match : availableAccounts.slice(0, 3).map(a => a.id));
      setScaleMode("margin_pct");
    } else if (preset === "all") {
      setSelectedAccounts(availableAccounts.map(a => a.id));
    } else if (preset === "clear") {
      setSelectedAccounts([availableAccounts[0]?.id || "Receita_Liquida"]);
    }
  };

  // Filter accounts by search term
  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return availableAccounts;
    const term = searchTerm.toLowerCase();
    return availableAccounts.filter(a => a.label.toLowerCase().includes(term) || a.id.toLowerCase().includes(term));
  }, [availableAccounts, searchTerm]);

  // Transform / Scale chart data based on scaleMode
  const scaledChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    if (scaleMode === "nominal") {
      return chartData;
    }

    if (scaleMode === "base100") {
      // Find baseline values from the first period
      const basePeriod = chartData[0];
      return chartData.map(item => {
        const newItem: any = { ...item };
        selectedAccounts.forEach(accId => {
          const baseVal = Number(basePeriod[accId]) || 1;
          const currentVal = Number(item[accId]) || 0;
          newItem[accId] = baseVal !== 0 ? Number(((currentVal / Math.abs(baseVal)) * 100).toFixed(1)) : 100;
        });
        return newItem;
      });
    }

    if (scaleMode === "margin_pct") {
      // Margin % of Receita_Liquida (or first available revenue account)
      return chartData.map(item => {
        const newItem: any = { ...item };
        const revenue = Number(item["Receita_Liquida"] || item["receita_com_operacoes_de_credito_e_repasses"] || item["recebimento_vendas"] || 1);
        selectedAccounts.forEach(accId => {
          const currentVal = Number(item[accId]) || 0;
          newItem[accId] = revenue !== 0 ? Number(((currentVal / revenue) * 100).toFixed(1)) : 0;
        });
        return newItem;
      });
    }

    if (scaleMode === "growth_rate") {
      // Period over Period (PoP) growth rate %
      return chartData.map((item, idx) => {
        const newItem: any = { ...item };
        if (idx === 0) {
          selectedAccounts.forEach(accId => {
            newItem[accId] = 0.0;
          });
        } else {
          const prevItem = chartData[idx - 1];
          selectedAccounts.forEach(accId => {
            const prevVal = Number(prevItem[accId]) || 0;
            const currentVal = Number(item[accId]) || 0;
            if (prevVal === 0) {
              newItem[accId] = 0.0;
            } else {
              newItem[accId] = Number((((currentVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1));
            }
          });
        }
        return newItem;
      });
    }

    return chartData;
  }, [chartData, scaleMode, selectedAccounts]);

  // Calculate Summary Statistics for selected accounts
  const statsSummary = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    return selectedAccounts.map(accId => {
      const meta = availableAccounts.find(a => a.id === accId) || { id: accId, label: accId, color: "#ff5537" };
      const values = chartData.map(d => Number(d[accId]) || 0);
      const latestVal = values[values.length - 1] || 0;
      const initialVal = values[0] || 0;
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const totalGrowthPct = initialVal !== 0 ? ((latestVal - initialVal) / Math.abs(initialVal)) * 100 : 0;
      const avgVal = values.reduce((a, b) => a + b, 0) / values.length;

      return {
        id: accId,
        label: meta.label,
        color: meta.color,
        latestVal,
        initialVal,
        minVal,
        maxVal,
        avgVal,
        totalGrowthPct: Number(totalGrowthPct.toFixed(1)),
        isPositive: totalGrowthPct >= 0
      };
    });
  }, [chartData, selectedAccounts, availableAccounts]);

  // Overall average across all periods and active accounts for reference line
  const overallAverage = useMemo(() => {
    if (!scaledChartData || scaledChartData.length === 0 || selectedAccounts.length === 0) return 0;
    let sum = 0;
    let count = 0;
    scaledChartData.forEach(d => {
      selectedAccounts.forEach(accId => {
        sum += Number(d[accId]) || 0;
        count += 1;
      });
    });
    return count > 0 ? sum / count : 0;
  }, [scaledChartData, selectedAccounts]);

  // Formatting helpers
  const formatValue = (val: number) => {
    if (scaleMode === "base100") {
      return `${val.toFixed(1)} pts`;
    }
    if (scaleMode === "margin_pct" || scaleMode === "growth_rate") {
      return `${val >= 0 ? "+" : ""}${val.toFixed(1)}%`;
    }
    return new Intl.NumberFormat(isEn ? "en-US" : "pt-BR", {
      style: "currency",
      currency: isEn ? "USD" : "BRL",
      maximumFractionDigits: 1
    }).format(val) + (isEn ? " M" : " M");
  };

  const formatRawCurrency = (val: number) => {
    return new Intl.NumberFormat(isEn ? "en-US" : "pt-BR", {
      style: "currency",
      currency: isEn ? "USD" : "BRL",
      maximumFractionDigits: 1
    }).format(val) + (isEn ? " M" : " M");
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!chartData || chartData.length === 0) return;
    const headers = [isEn ? "Period" : "Periodo", ...selectedAccounts.map(id => {
      const meta = availableAccounts.find(a => a.id === id);
      return `"${meta ? meta.label : id}"`;
    })];

    const rows = chartData.map(d => {
      const rowVals = [d.periodLabel || d.period];
      selectedAccounts.forEach(id => {
        rowVals.push(String(d[id] || 0));
      });
      return rowVals.join(";");
    });

    const csvContent = [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HyperCube_Chart_Accounts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Custom Rich Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = chartData.find(d => d.period === label);
      const displayLabel = item?.periodLabel || label;
      const netRev = Number(item?.["Receita_Liquida"] || item?.["receita_com_operacoes_de_credito_e_repasses"] || item?.["recebimento_vendas"] || 0);

      return (
        <div className={`p-4 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-sans max-w-xs ${
          isDark ? "bg-slate-950/95 border-slate-700 text-slate-100" : "bg-white/95 border-slate-200 text-slate-900"
        }`}>
          <div className="border-b border-slate-800/40 pb-2 mb-2">
            <span className="font-mono font-bold text-anaplan-coral text-xs block">
              {displayLabel}
            </span>
            <span className={`text-[10.5px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {isEn ? "Temporal Financial Point" : "Ponto Temporal Financeiro"}
            </span>
          </div>

          <div className="space-y-2">
            {payload
              .slice()
              .sort((a: any, b: any) => (Number(b.value) || 0) - (Number(a.value) || 0))
              .map((entry: any, index: number) => {
                const meta = availableAccounts.find(a => a.id === entry.dataKey);
                const rawVal = Number(item?.[entry.dataKey]) || 0;
                const shareOfRev = netRev !== 0 ? ((rawVal / netRev) * 100).toFixed(1) : null;

                return (
                  <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px] py-1 border-b border-slate-800/30 last:border-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="font-medium truncate max-w-[170px]" title={meta?.label || entry.name}>
                        {meta?.label || entry.name}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-bold" style={{ color: entry.color }}>
                        {formatValue(entry.value)}
                      </div>
                      {scaleMode !== "nominal" && (
                        <div className="text-[9.5px] text-slate-400 font-mono">
                          {isEn ? "Nominal: " : "Nominal: "}{formatRawCurrency(rawVal)}
                        </div>
                      )}
                      {scaleMode === "nominal" && shareOfRev && meta?.id !== "Receita_Liquida" && (
                        <div className="text-[9.5px] text-slate-400 font-mono">
                          ({shareOfRev}% {isEn ? "of Revenue" : "da Receita"})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-5 font-sans ${isFullscreen ? "fixed inset-0 z-50 p-8 overflow-y-auto " + (isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900") : ""}`}>
      {/* Top Header & Interactive Configuration Bar */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isDark ? "bg-slate-900/90 border-slate-800 text-white shadow-lg" : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-anaplan-coral">
              <Activity className="w-4 h-4" />
              <span>{isEn ? "Dynamic Line Analysis & Financial Trends" : "Análise Dinâmica de Linhas & Tendências Financeiras"}</span>
            </div>
            <h3 className={`text-lg font-extrabold mt-0.5 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {title || (isEn ? "Temporal Trajectory of Accounting Statements" : "Evolução Temporal e Trajetória das Contas Contábeis")}
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {subtitle || (isEn ? "Compare multiple financial accounts simultaneously with nominal, base 100, margins %, and smooth splines." : "Compare múltiplas contas simultaneamente com suporte a escala nominal, Base 100, margens relativas e curvas suaves.")}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Type Selector */}
            <div className={`flex items-center rounded-lg p-1 border text-xs font-semibold ${isDark ? "bg-slate-950 border-slate-700" : "bg-slate-100 border-slate-300"}`}>
              <button
                onClick={() => setChartType("line")}
                className={`px-2.5 py-1 rounded-md transition ${chartType === "line" ? "bg-anaplan-coral text-white font-bold shadow-sm" : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
                title={isEn ? "Smooth Line Chart (Monotone Spline)" : "Gráfico de Linha Suave (Monotone Spline)"}
              >
                {isEn ? "Lines" : "Linhas"}
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`px-2.5 py-1 rounded-md transition ${chartType === "area" ? "bg-anaplan-coral text-white font-bold shadow-sm" : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
                title={isEn ? "Glow Gradient Area" : "Área com Gradiente Glow"}
              >
                {isEn ? "Area" : "Área"}
              </button>
              <button
                onClick={() => setChartType("step")}
                className={`px-2.5 py-1 rounded-md transition ${chartType === "step" ? "bg-anaplan-coral text-white font-bold shadow-sm" : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
                title={isEn ? "Step Line" : "Linha em Degraus (Step)"}
              >
                {isEn ? "Steps" : "Degraus"}
              </button>
              <button
                onClick={() => setChartType("bar_line")}
                className={`px-2.5 py-1 rounded-md transition ${chartType === "bar_line" ? "bg-anaplan-coral text-white font-bold shadow-sm" : isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
                title={isEn ? "Mixed Combination (Bars + Lines)" : "Combinação Mista (Barras + Linhas)"}
              >
                {isEn ? "Mixed" : "Misto"}
              </button>
            </div>

            {/* Scale Selector */}
            <select
              value={scaleMode}
              onChange={(e) => setScaleMode(e.target.value as any)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold outline-none transition ${
                isDark ? "bg-slate-950 border-slate-700 text-white focus:border-anaplan-coral" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-anaplan-coral"
              }`}
            >
              <option value="nominal">{isEn ? "Nominal Scale (Million USD / BRL)" : "Escala Nominal (R$ Milhões)"}</option>
              <option value="base100">{isEn ? "Indexed Base 100 (Relative Growth)" : "Indexado Base 100 (Crescimento Relativo)"}</option>
              <option value="margin_pct">{isEn ? "% Margin of Net Revenue" : "% Margem sobre Receita Líquida"}</option>
              <option value="growth_rate">{isEn ? "Period-over-Period Growth (%)" : "Variação Período a Período (%)"}</option>
            </select>

            {/* Quick View Controls */}
            <button
              onClick={() => setShowDataPoints(!showDataPoints)}
              className={`p-1.5 rounded-lg border text-xs transition ${
                showDataPoints
                  ? "bg-anaplan-coral/20 border-anaplan-coral text-anaplan-coral"
                  : isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-300 bg-slate-100 text-slate-600"
              }`}
              title={showDataPoints ? (isEn ? "Hide Vertex Markers" : "Ocultar Marcadores de Vértices") : (isEn ? "Show Vertex Markers" : "Exibir Marcadores de Vértices")}
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAverageLine(!showAverageLine)}
              className={`p-1.5 rounded-lg border text-xs transition ${
                showAverageLine
                  ? "bg-anaplan-cyan/20 border-anaplan-cyan text-anaplan-cyan"
                  : isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-300 bg-slate-100 text-slate-600"
              }`}
              title={showAverageLine ? (isEn ? "Hide Average Benchmark Line" : "Ocultar Linha Média de Referência") : (isEn ? "Show Average Benchmark Line" : "Exibir Linha Média de Referência")}
            >
              <TrendingUp className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowDataTable(!showDataTable)}
              className={`p-1.5 rounded-lg border text-xs transition ${
                showDataTable
                  ? "bg-amber-500/20 border-amber-500 text-amber-400"
                  : isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-300 bg-slate-100 text-slate-600"
              }`}
              title={showDataTable ? (isEn ? "Hide Underlying Data Table" : "Ocultar Tabela de Dados") : (isEn ? "Show Underlying Data Table" : "Exibir Tabela de Dados Subjacente")}
            >
              <TableIcon className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportCsv}
              className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 font-semibold ${
                isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              title={isEn ? "Export Chart Data to CSV" : "Exportar Dados do Gráfico em CSV"}
            >
              <Download className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 rounded-lg border text-xs transition ${
                isFullscreen
                  ? "bg-rose-600 text-white border-rose-500"
                  : isDark ? "border-slate-700 bg-slate-800 text-slate-400 hover:text-white" : "border-slate-300 bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
              title={isFullscreen ? (isEn ? "Exit Fullscreen" : "Sair da Tela Cheia") : (isEn ? "Expand Fullscreen" : "Expandir em Tela Cheia")}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Presets & Account Filter Pill Chips */}
        <div className="pt-4 space-y-3">
          {/* Preset Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10.5px] font-bold uppercase tracking-wider mr-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn ? "Quick Groups:" : "Grupos Rápidos:"}
              </span>
              <button
                onClick={() => handleApplyPreset("profitability")}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 border border-sky-500/40 text-sky-400 hover:bg-sky-500/25 transition"
              >
                📈 {isEn ? "P&L Profitability" : "Rentabilidade DRE"}
              </button>
              <button
                onClick={() => handleApplyPreset("costs")}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25 transition"
              >
                📉 {isEn ? "Costs & SG&A" : "Custos & SG&A"}
              </button>
              {viewMode === "DFC" && (
                <button
                  onClick={() => handleApplyPreset("cash_flow")}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 transition"
                >
                  💧 {isEn ? "Cash Flow (OCF/ICF/FCF)" : "Fluxo de Caixa (FCO/FCI/FCF)"}
                </button>
              )}
              <button
                onClick={() => handleApplyPreset("margins")}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 transition"
              >
                🎯 {isEn ? "Margins (%)" : "Margens (%)"}
              </button>
              <button
                onClick={() => handleApplyPreset("all")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                }`}
              >
                {isEn ? "All Accounts" : "Todas as Contas"}
              </button>
              <button
                onClick={() => handleApplyPreset("clear")}
                className={`px-2 py-1 rounded-full text-[11px] font-semibold transition ${
                  isDark ? "text-slate-400 hover:text-rose-400" : "text-slate-500 hover:text-rose-600"
                }`}
              >
                {isEn ? "Clear" : "Limpar"}
              </button>
            </div>

            {/* Account Search input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isEn ? "Filter accounts..." : "Filtrar contas..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-1 text-xs rounded-lg border outline-none font-medium transition ${
                  isDark ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-anaplan-coral" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-anaplan-coral"
                }`}
              />
            </div>
          </div>

          {/* Interactive Multi-Select Account Pills */}
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
            {filteredAccounts.map((account) => {
              const isSelected = selectedAccounts.includes(account.id);
              const color = account.color || DEFAULT_ACCOUNT_COLORS[account.id] || "#ff5537";

              return (
                <button
                  key={account.id}
                  onClick={() => handleToggleAccount(account.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm border ${
                    isSelected
                      ? "ring-2 ring-offset-1"
                      : "opacity-60 hover:opacity-100"
                  } ${
                    isDark ? "ring-offset-slate-900" : "ring-offset-white"
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${color}20` : isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isSelected ? color : isDark ? "#334155" : "#cbd5e1",
                    color: isSelected ? (isDark ? "#ffffff" : "#0f172a") : (isDark ? "#94a3b8" : "#64748b"),
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate max-w-[190px]">{account.label}</span>
                  {isSelected ? (
                    <Check className="w-3 h-3 flex-shrink-0" style={{ color }} />
                  ) : (
                    <PlusIcon className="w-3 h-3 flex-shrink-0 opacity-40" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Dynamic Interactive Line Chart Container */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100 shadow-xl" : "bg-white border-slate-200 text-slate-800 shadow-md"
      }`}>
        {/* Visual Scale Badge Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {scaleMode === "nominal" && (isEn ? "Nominal Values (Million USD / BRL)" : "Valores Nominais em R$ Milhões")}
              {scaleMode === "base100" && (isEn ? "Base 100 Index (Initial Period = 100)" : "Índice Base 100 (Período Inicial = 100)")}
              {scaleMode === "margin_pct" && (isEn ? "% Relative Margin on Net Revenue" : "% Margem Relativa s/ Receita Líquida")}
              {scaleMode === "growth_rate" && (isEn ? "Period-over-Period Growth Rate (%)" : "Taxa de Variação Período a Período (%)")}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-anaplan-coral/10 text-anaplan-coral font-bold border border-anaplan-coral/20">
              {selectedAccounts.length} {selectedAccounts.length === 1 ? (isEn ? "line plotted" : "linha plotada") : (isEn ? "lines plotted" : "linhas plotadas")}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {chartData.length} {isEn ? "fiscal periods analyzed" : "períodos fiscais analisados"}
          </div>
        </div>

        {/* Dynamic Chart Area */}
        <div className={compact ? "h-[320px]" : isFullscreen ? "h-[540px]" : "h-[400px]"}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={scaledChartData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                <defs>
                  {selectedAccounts.map(accId => {
                    const meta = availableAccounts.find(a => a.id === accId);
                    const color = meta?.color || DEFAULT_ACCOUNT_COLORS[accId] || "#ff5537";
                    return (
                      <linearGradient key={`grad-${accId}`} id={`grad-${accId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                      </linearGradient>
                    );
                  })}
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />}
                <XAxis
                  dataKey="period"
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={11}
                  className="font-mono font-semibold"
                  tickFormatter={(val) => {
                    const item = chartData.find(d => d.period === val);
                    return item?.period || val;
                  }}
                />
                <YAxis
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={11}
                  className="font-mono"
                  tickFormatter={(val) => formatValue(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="line"
                  iconSize={14}
                  wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                  formatter={(value) => {
                    const meta = availableAccounts.find(a => a.id === value);
                    return meta?.label || value;
                  }}
                />
                {showAverageLine && (
                  <ReferenceLine
                    y={overallAverage}
                    stroke="#00a3e0"
                    strokeDasharray="4 4"
                    label={{
                      value: `${isEn ? "Average: " : "Média Geral: "}${formatValue(overallAverage)}`,
                      fill: "#00a3e0",
                      fontSize: 10,
                      position: "insideTopRight"
                    }}
                  />
                )}
                {selectedAccounts.map(accId => {
                  const meta = availableAccounts.find(a => a.id === accId);
                  const color = meta?.color || DEFAULT_ACCOUNT_COLORS[accId] || "#ff5537";
                  return (
                    <Area
                      key={accId}
                      type="monotone"
                      dataKey={accId}
                      name={accId}
                      stroke={color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#grad-${accId})`}
                      dot={showDataPoints ? { r: 4, strokeWidth: 2, fill: isDark ? "#0f172a" : "#ffffff" } : false}
                      activeDot={{ r: 7, strokeWidth: 2 }}
                    />
                  );
                })}
              </AreaChart>
            ) : chartType === "bar_line" ? (
              <BarChart data={scaledChartData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />}
                <XAxis
                  dataKey="period"
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={11}
                  className="font-mono font-semibold"
                />
                <YAxis
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={11}
                  className="font-mono"
                  tickFormatter={(val) => formatValue(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="line"
                  iconSize={14}
                  wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                  formatter={(value) => {
                    const meta = availableAccounts.find(a => a.id === value);
                    return meta?.label || value;
                  }}
                />
                {selectedAccounts.map((accId, idx) => {
                  const meta = availableAccounts.find(a => a.id === accId);
                  const color = meta?.color || DEFAULT_ACCOUNT_COLORS[accId] || "#ff5537";
                  // Alternate between Bar and Line
                  if (idx === 0) {
                    return (
                      <Bar
                        key={accId}
                        dataKey={accId}
                        name={accId}
                        fill={color}
                        radius={[4, 4, 0, 0]}
                        opacity={0.85}
                      />
                    );
                  }
                  return (
                    <Line
                      key={accId}
                      type="monotone"
                      dataKey={accId}
                      name={accId}
                      stroke={color}
                      strokeWidth={3}
                      dot={showDataPoints ? { r: 4, strokeWidth: 2, fill: isDark ? "#0f172a" : "#ffffff" } : false}
                      activeDot={{ r: 7, strokeWidth: 2 }}
                    />
                  );
                })}
              </BarChart>
            ) : (
              <LineChart data={scaledChartData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />}
                <XAxis
                  dataKey="period"
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={11}
                  className="font-mono font-semibold"
                  tickFormatter={(val) => {
                    const item = chartData.find(d => d.period === val);
                    return item?.period || val;
                  }}
                />
                <YAxis
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={11}
                  className="font-mono"
                  tickFormatter={(val) => formatValue(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="line"
                  iconSize={14}
                  wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                  formatter={(value) => {
                    const meta = availableAccounts.find(a => a.id === value);
                    return meta?.label || value;
                  }}
                />
                {showAverageLine && (
                  <ReferenceLine
                    y={overallAverage}
                    stroke="#00a3e0"
                    strokeDasharray="4 4"
                    label={{
                      value: `${isEn ? "Average: " : "Média: "}${formatValue(overallAverage)}`,
                      fill: "#00a3e0",
                      fontSize: 10,
                      position: "insideTopRight"
                    }}
                  />
                )}
                {selectedAccounts.map(accId => {
                  const meta = availableAccounts.find(a => a.id === accId);
                  const color = meta?.color || DEFAULT_ACCOUNT_COLORS[accId] || "#ff5537";
                  return (
                    <Line
                      key={accId}
                      type={chartType === "step" ? "stepAfter" : "monotone"}
                      dataKey={accId}
                      name={accId}
                      stroke={color}
                      strokeWidth={3}
                      dot={showDataPoints ? { r: 4.5, strokeWidth: 2, stroke: color, fill: isDark ? "#0f172a" : "#ffffff" } : false}
                      activeDot={{ r: 7.5, strokeWidth: 2, stroke: isDark ? "#ffffff" : "#0f172a" }}
                    />
                  );
                })}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Dynamic Summary Cards for each plotted account */}
        <div className="mt-6 pt-5 border-t border-slate-800/40">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-anaplan-coral" />
            <span>{isEn ? "Performance & Summary Metrics by Selected Account" : "Métricas e Desempenho por Conta Selecionada"}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {statsSummary.map(stat => (
              <div
                key={stat.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDark ? "bg-slate-950/70 border-slate-800 hover:border-slate-700" : "bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stat.color }} />
                    <span className={`text-xs font-bold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`} title={stat.label}>
                      {stat.label}
                    </span>
                  </div>
                  <span className={`flex items-center gap-0.5 text-[10.5px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    stat.isPositive
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  }`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.totalGrowthPct >= 0 ? `+${stat.totalGrowthPct}%` : `${stat.totalGrowthPct}%`}
                  </span>
                </div>

                <div className="text-lg font-extrabold font-mono" style={{ color: stat.color }}>
                  {formatRawCurrency(stat.latestVal)}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/40">
                  <span>{isEn ? "Min: " : "Mín: "}{formatRawCurrency(stat.minVal)}</span>
                  <span>{isEn ? "Max: " : "Máx: "}{formatRawCurrency(stat.maxVal)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retractable Data Table View */}
        {showDataTable && (
          <div className="mt-6 pt-5 border-t border-slate-800/40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isEn ? "Period Data Table" : "Tabela de Dados dos Períodos"}
              </h4>
              <button
                onClick={handleExportCsv}
                className="text-[11px] font-semibold text-anaplan-coral hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> {isEn ? "Download Table (.csv)" : "Baixar Tabela (.csv)"}
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className={`border-b ${isDark ? "bg-slate-950 text-slate-200 border-slate-800" : "bg-slate-100 text-slate-800 border-slate-300"}`}>
                    <th className="py-2.5 px-4 font-bold">{isEn ? "Accounting Line" : "Conta Contábil"}</th>
                    {chartData.map(d => (
                      <th key={d.period} className="py-2.5 px-4 font-bold text-right font-mono">
                        {d.periodLabel || d.period}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800/60 text-slate-200" : "divide-slate-200 text-slate-800"}`}>
                  {selectedAccounts.map(accId => {
                    const meta = availableAccounts.find(a => a.id === accId);
                    return (
                      <tr key={accId} className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className="py-2 px-4 font-semibold flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta?.color || "#ff5537" }} />
                          <span>{meta?.label || accId}</span>
                        </td>
                        {chartData.map(d => (
                          <td key={d.period} className="py-2 px-4 text-right font-mono">
                            {formatRawCurrency(Number(d[accId]) || 0)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
