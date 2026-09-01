"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  RefreshCw, 
  Info, 
  Maximize2,
  HelpCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";

interface WaterfallStep {
  id: string;
  label: string;
  category: "total" | "step";
  delta: number;
  running_total: number;
  is_positive: boolean;
  pct_impact: number;
}

interface WaterfallBridgeData {
  metric: string;
  base_period: string;
  target_period: string;
  base_version: string;
  target_version: string;
  base_value: number;
  target_value: number;
  total_delta: number;
  growth_pct: number;
  steps: WaterfallStep[];
}

interface WaterfallChartProps {
  basePeriod: string;
  targetPeriod: string;
  baseVersion: string;
  targetVersion: string;
  currency?: string;
  companyName?: string;
  filters?: {
    scenario?: string;
    entity?: string;
    product?: string;
  };
}

export default function WaterfallChart({
  basePeriod,
  targetPeriod,
  baseVersion,
  targetVersion,
  currency = "R$ M",
  companyName = "Empresa Consolidada",
  filters = {}
}: WaterfallChartProps) {
  const { theme, language, apiBaseUrl } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [metric, setMetric] = useState<"EBITDA" | "Receita_Liquida" | "Lucro_Liquido">("EBITDA");
  const [data, setData] = useState<WaterfallBridgeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<WaterfallStep | null>(null);

  const fetchWaterfall = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/variance/waterfall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_version: baseVersion,
          target_version: targetVersion,
          metric: metric,
          filters: {
            base_time: basePeriod,
            target_time: targetPeriod,
            ...filters
          }
        })
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch waterfall bridge", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterfall();
  }, [basePeriod, targetPeriod, baseVersion, targetVersion, metric, filters?.scenario, filters?.entity, filters?.product, apiBaseUrl]);

  const formatVal = (v: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(v);
  };

  const steps = data?.steps || [];

  // Calculate SVG scales
  const svgWidth = 960;
  const svgHeight = 360;
  const padding = { top: 45, right: 30, bottom: 65, left: 70 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Determine Y Domain (min & max among all running totals and bases)
  let yMin = 0;
  let yMax = 100;
  if (steps.length > 0) {
    const allVals: number[] = [];
    let currentY = 0;
    steps.forEach((s) => {
      if (s.category === "total") {
        allVals.push(s.delta);
        currentY = s.delta;
      } else {
        allVals.push(currentY);
        allVals.push(currentY + s.delta);
        currentY += s.delta;
      }
    });
    const computedMin = Math.min(0, ...allVals);
    const computedMax = Math.max(...allVals);
    const margin = (computedMax - computedMin) * 0.15 || 20;
    yMin = computedMin < 0 ? computedMin - margin : 0;
    yMax = computedMax + margin;
  }

  const yScale = (val: number) => {
    const range = yMax - yMin;
    if (range === 0) return chartHeight / 2;
    const norm = (val - yMin) / range;
    return chartHeight - norm * chartHeight;
  };

  const stepCount = steps.length || 1;
  const barWidth = Math.min(68, (chartWidth / stepCount) * 0.68);
  const stepGap = chartWidth / stepCount;

  // Find top positive & negative driver
  const intermediateSteps = steps.filter((s) => s.category === "step");
  const topPositive = [...intermediateSteps].sort((a, b) => b.delta - a.delta)[0];
  const topNegative = [...intermediateSteps].sort((a, b) => a.delta - b.delta)[0];

  return (
    <div className={`rounded-2xl border p-6 transition-all ${
      isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 shadow-sm text-slate-900"
    }`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-5 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-anaplan-coral/10 text-anaplan-coral font-black">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold tracking-tight">
              {isEn ? "Executive Variance Waterfall Bridge" : "Ponte Executiva de Variância (Gráfico Waterfall)"}
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {isEn ? "100% Closed Math" : "Fechamento Matemático 100%"}
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isEn
              ? `Step-by-step causal driver decomposition: ${basePeriod} → ${targetPeriod} (${companyName})`
              : `Decomposição causal de premissas e direcionadores: ${basePeriod} → ${targetPeriod} (${companyName})`}
          </p>
        </div>

        {/* Metric Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setMetric("EBITDA")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              metric === "EBITDA"
                ? "bg-anaplan-coral text-white shadow-sm"
                : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isEn ? "EBITDA Bridge" : "Ponte de EBITDA"}
          </button>
          <button
            onClick={() => setMetric("Receita_Liquida")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              metric === "Receita_Liquida"
                ? "bg-anaplan-coral text-white shadow-sm"
                : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isEn ? "Net Revenue" : "Receita Líquida"}
          </button>
          <button
            onClick={() => setMetric("Lucro_Liquido")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              metric === "Lucro_Liquido"
                ? "bg-anaplan-coral text-white shadow-sm"
                : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isEn ? "Net Income" : "Lucro Líquido"}
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {isEn ? `Base Value (${data.base_period})` : `Ponto de Partida (${data.base_period})`}
            </span>
            <span className="text-base font-extrabold font-mono mt-0.5 block">
              {currency} {formatVal(data.base_value)}
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-anaplan-coral block">
              {isEn ? `Target Value (${data.target_period})` : `Ponto de Chegada (${data.target_period})`}
            </span>
            <span className="text-base font-extrabold font-mono text-anaplan-coral mt-0.5 block">
              {currency} {formatVal(data.target_value)}
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {isEn ? "Total Variance Delta" : "Variação Líquida (Delta)"}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {data.total_delta >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-500" />
              )}
              <span className={`text-base font-extrabold font-mono ${data.total_delta >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                {data.total_delta >= 0 ? `+${currency} ${formatVal(data.total_delta)}` : `${currency} ${formatVal(data.total_delta)}`}
              </span>
              <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ml-1 ${
                data.growth_pct >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              }`}>
                {data.growth_pct >= 0 ? `+${data.growth_pct}%` : `${data.growth_pct}%`}
              </span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {isEn ? "Key Driver Summary" : "Principal Alavanca"}
            </span>
            <span className="text-xs font-bold truncate block text-slate-200 mt-1">
              {topPositive && topPositive.delta > 0
                ? `▲ ${topPositive.label} (+${formatVal(topPositive.delta)})`
                : (topNegative ? `▼ ${topNegative.label} (${formatVal(topNegative.delta)})` : "Estabilidade")}
            </span>
          </div>
        </div>
      )}

      {/* Interactive SVG Waterfall Chart */}
      <div className="relative w-full overflow-x-auto">
        {loading ? (
          <div className="h-80 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-anaplan-coral" />
            <span className="text-xs font-semibold">{isEn ? "Computing waterfall bridge..." : "Calculando ponte de variação..."}</span>
          </div>
        ) : (
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none min-w-[720px]">
            <defs>
              <linearGradient id="startBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="targetBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff5733" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#c0392b" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="positiveStepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="negativeStepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#e11d48" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* Zero Axis Line */}
            <line
              x1={padding.left}
              y1={padding.top + yScale(0)}
              x2={svgWidth - padding.right}
              y2={padding.top + yScale(0)}
              stroke={isDark ? "#334155" : "#cbd5e1"}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* SVG Bars & Connectors */}
            {(() => {
              let runningBase = 0;
              const elements: React.ReactNode[] = [];

              steps.forEach((step, idx) => {
                const xCenter = padding.left + idx * stepGap + stepGap / 2;
                const xLeft = xCenter - barWidth / 2;
                const isTotal = step.category === "total";

                let yTop = 0;
                let bHeight = 0;
                let prevY = 0;

                if (isTotal) {
                  // Total bar goes from 0 to step.delta
                  const val = step.delta;
                  const zeroY = yScale(0);
                  const valY = yScale(val);
                  yTop = Math.min(zeroY, valY);
                  bHeight = Math.max(4, Math.abs(zeroY - valY));
                  runningBase = val;
                  prevY = valY;
                } else {
                  // Step bar floats from runningBase to runningBase + step.delta
                  const startVal = runningBase;
                  const endVal = runningBase + step.delta;
                  const startY = yScale(startVal);
                  const endY = yScale(endVal);

                  yTop = Math.min(startY, endY);
                  bHeight = Math.max(4, Math.abs(startY - endY));

                  // Connector line from previous bar to this step's start
                  if (idx > 0) {
                    elements.push(
                      <line
                        key={`conn-${idx}`}
                        x1={xLeft - (stepGap - barWidth) / 2}
                        y1={padding.top + startY}
                        x2={xLeft}
                        y2={padding.top + startY}
                        stroke={isDark ? "#475569" : "#94a3b8"}
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    );
                  }

                  runningBase = endVal;
                  prevY = endY;
                }

                // Determine bar color gradient
                let fillGrad = "url(#positiveStepGrad)";
                if (step.id === "start") {
                  fillGrad = "url(#startBarGrad)";
                } else if (step.id === "target") {
                  fillGrad = "url(#targetBarGrad)";
                } else if (!step.is_positive) {
                  fillGrad = "url(#negativeStepGrad)";
                }

                const isHovered = hoveredStep?.id === step.id;

                elements.push(
                  <g
                    key={step.id}
                    className="cursor-pointer transition-transform"
                    onMouseEnter={() => setHoveredStep(step)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    {/* The Bar */}
                    <rect
                      x={xLeft}
                      y={padding.top + yTop}
                      width={barWidth}
                      height={bHeight}
                      rx="4"
                      fill={fillGrad}
                      stroke={isHovered ? (isDark ? "#ffffff" : "#0f172a") : "transparent"}
                      strokeWidth={isHovered ? "2" : "0"}
                      className="transition-all duration-200 opacity-95 hover:opacity-100"
                    />

                    {/* Value on Top of Bar */}
                    <text
                      x={xCenter}
                      y={padding.top + yTop - 7}
                      textAnchor="middle"
                      fill={isDark ? "#f1f5f9" : "#0f172a"}
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {!isTotal && step.delta > 0 ? `+${formatVal(step.delta)}` : formatVal(step.delta)}
                    </text>

                    {/* Step Label below X-axis */}
                    <text
                      x={xCenter}
                      y={svgHeight - 25}
                      textAnchor="middle"
                      fill={isTotal ? (isDark ? "#ff5733" : "#e03e1a") : (isDark ? "#94a3b8" : "#475569")}
                      fontSize="10"
                      fontWeight={isTotal ? "800" : "600"}
                      className="capitalize"
                    >
                      {step.label.length > 18 ? `${step.label.substring(0, 16)}...` : step.label}
                    </text>

                    {/* Sub-label for % impact */}
                    {!isTotal && Math.abs(step.pct_impact) > 0.1 && (
                      <text
                        x={xCenter}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        fill={step.is_positive ? "#10b981" : "#f43f5e"}
                        fontSize="9"
                        fontWeight="700"
                      >
                        {step.pct_impact > 0 ? `+${step.pct_impact}%` : `${step.pct_impact}%`}
                      </text>
                    )}
                  </g>
                );
              });

              return elements;
            })()}
          </svg>
        )}
      </div>

      {/* Detailed Tooltip Drawer on Hover */}
      {hoveredStep && (
        <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between transition-all ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              hoveredStep.category === "total" 
                ? (hoveredStep.id === "start" ? "bg-blue-500" : "bg-anaplan-coral")
                : (hoveredStep.is_positive ? "bg-emerald-500" : "bg-rose-500")
            }`} />
            <div>
              <span className="font-extrabold text-xs block">{hoveredStep.label}</span>
              <span className="text-[11px] text-slate-400">
                {hoveredStep.category === "total"
                  ? (isEn ? "Pillar balance" : "Valor total do período")
                  : (isEn ? `Causal impact: ${hoveredStep.pct_impact}% of total delta` : `Impacto causal: ${hoveredStep.pct_impact}% do delta total`)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold block">
              {hoveredStep.category === "total" ? `${currency} ${formatVal(hoveredStep.delta)}` : `${hoveredStep.delta >= 0 ? "+" : ""}${currency} ${formatVal(hoveredStep.delta)}`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {isEn ? "Subtotal: " : "Subtotal acumulado: "}{currency} {formatVal(hoveredStep.running_total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
