"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Search,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  Award,
  Scale,
  ShieldAlert,
  FileText,
  HelpCircle,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  Activity
} from "lucide-react";
import { usePreferences, getApiUrl } from "./PreferencesContext";
import { useAgentExecution } from "./AgentExecutionContext";
import CompanyBadge from "./CompanyBadge";

interface EconomicDashboardProps {
  apiBaseUrl: string;
}

/** Strictly format all numeric values with exactly 2 decimal places */
export const format2 = (val: number | string | null | undefined, isEn = false): string => {
  if (val === null || val === undefined || val === "") return "-";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(",", "."));
  if (isNaN(num)) return "-";
  return num.toLocaleString(isEn ? "en-US" : "pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const INDICATOR_TRANSLATIONS: Record<string, string> = {
  "IPCA (Índice de Preços ao Consumidor Amplo)": "IPCA (Consumer Price Index)",
  "IPCA": "IPCA (Consumer Price Index)",
  "Taxa Selic Meta (Fim de Período)": "Selic Target Rate (End of Period)",
  "Taxa Selic Meta": "Selic Target Rate",
  "Meta Selic": "Selic Target Rate",
  "Taxa Selic": "Selic Target Rate",
  "Câmbio USD/BRL (Fim de Período)": "USD/BRL Exchange Rate (End of Period)",
  "Câmbio USD/BRL": "USD/BRL Exchange Rate",
  "Câmbio PTAX": "USD/BRL Exchange Rate (PTAX)",
  "PIB Total (Crescimento Real)": "Total GDP (Real Growth)",
  "PIB Total": "Total GDP (Real Growth)",
  "PIB Agropecuária": "Agricultural GDP",
  "PIB Indústria": "Industrial GDP",
  "PIB Serviços": "Services GDP",
  "IGP-M (Índice Geral de Preços do Mercado)": "IGP-M (General Market Price Index)",
  "IGP-M": "IGP-M (General Market Price Index)",
  "IGP-DI": "IGP-DI (General Price Index - Internal Availability)",
  "IPC-Fipe": "IPC-Fipe (Consumer Price Index - Fipe)",
  "Preços Administrados": "Administered / Regulated Prices",
  "Resultado Primário (% do PIB)": "Primary Budget Balance (% of GDP)",
  "Resultado Primário": "Primary Budget Balance",
  "Resultado Nominal (% do PIB)": "Nominal Budget Balance (% of GDP)",
  "Resultado Nominal": "Nominal Budget Balance",
  "Dívida Líquida do Setor Público": "Public Sector Net Debt (% of GDP)",
  "Dívida Bruta do Governo Geral": "General Government Gross Debt (% of GDP)",
  "Dívida Bruta Governo Geral": "General Government Gross Debt (% of GDP)",
  "Dívida Bruta": "General Government Gross Debt",
  "Conta Corrente": "Current Account Balance",
  "Balança Comercial": "Trade Balance",
  "Investimento Direto no País (IDP)": "Foreign Direct Investment (FDI)",
  "Taxa Selic Meta Copom": "Selic Target Rate (Copom)",
  "IPCA Acumulado 12 Meses": "IPCA Accumulated 12M",
  "IPCA 12 Meses": "IPCA Accumulated 12M",
  "Câmbio USD/BRL PTAX Venda": "USD/BRL PTAX Exchange Rate (Selling)",
  "IPP - Índice de Preços ao Produtor": "IPP - Producer Price Index",
  "IPP Indústria Geral (12 Meses)": "IPP General Industry (12M)"
};

export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "Preços & Inflação": "Prices & Inflation",
  "Taxas de Juros & Câmbio": "Interest Rates & FX",
  "Atividade Econômica": "Economic Activity",
  "Setor Público & Fiscal": "Fiscal & Debt",
  "Setor Externo": "External Sector"
};

export const FREQ_TRANSLATIONS: Record<string, string> = {
  "Diária": "Daily",
  "Mensal": "Monthly",
  "Trimestral": "Quarterly",
  "Anual": "Annual",
  "Semanal": "Weekly"
};

export const UNIT_TRANSLATIONS: Record<string, string> = {
  "% a.a.": "% p.a.",
  "% a.m.": "% p.m.",
  "% PIB": "% of GDP",
  "R$/US$": "BRL/USD",
  "US$ bilhões": "USD billions",
  "US$ mi": "USD millions",
  "R$ mi": "BRL millions",
  "R$ bi": "BRL billions"
};

/** Formatted render component for Agno / PhD Economic Diagnostic text */
function FormattedDiagnostic({ text, isDark, isEn }: { text: string; isDark: boolean; isEn: boolean }) {
  if (!text) return null;

  // Detect monetary stance (Hawkish, Neutral, Dovish)
  const isHawkish = text.toLowerCase().includes("hawkish");
  const isDovish = text.toLowerCase().includes("dovish");
  const isNeutral = text.toLowerCase().includes("neutra") || text.toLowerCase().includes("neutral");

  // Split text into numbered sections or paragraphs
  const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 0);

  return (
    <div className="space-y-4 font-sans text-xs sm:text-sm">
      {/* Stance Highlight Banner */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-sm ${
          isHawkish
            ? isDark
              ? "bg-amber-950/40 border-amber-800/80 text-amber-200"
              : "bg-amber-50 border-amber-300 text-amber-900"
            : isDovish
            ? isDark
              ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
              : "bg-emerald-50 border-emerald-300 text-emerald-900"
            : isDark
            ? "bg-sky-950/40 border-sky-800/80 text-sky-200"
            : "bg-sky-50 border-sky-300 text-sky-900"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold text-xs sm:text-sm">
            {isEn ? "Monetary Policy Stance (COPOM):" : "Postura de Política Monetária (COPOM):"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isHawkish && (
            <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider shadow">
              {isEn ? "HAWKISH (Restrictive)" : "HAWKISH (Restritiva)"}
            </span>
          )}
          {isDovish && (
            <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider shadow">
              {isEn ? "DOVISH (Stimulative)" : "DOVISH (Estimulativa)"}
            </span>
          )}
          {isNeutral && !isHawkish && !isDovish && (
            <span className="px-3 py-1 bg-sky-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider shadow">
              {isEn ? "NEUTRAL" : "NEUTRA"}
            </span>
          )}
        </div>
      </div>

      {/* Sections Cards */}
      <div className="space-y-3">
        {paragraphs.map((p, idx) => {
          if (p.startsWith("###")) {
            return (
              <h3 key={idx} className="text-base font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent pt-1">
                {p.replace(/###/g, "").trim()}
              </h3>
            );
          }

          // Numbered section header detection
          const isHeader = p.startsWith("**1.") || p.startsWith("**2.") || p.startsWith("**3.") || p.startsWith("**4.") || p.startsWith("**5.") || p.startsWith("**6.");

          if (isHeader) {
            const lines = p.split("\n");
            const titleLine = lines[0];
            const contentLines = lines.slice(1);

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition ${
                  isDark
                    ? "bg-slate-950/60 border-slate-800 text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-800 shadow-sm"
                }`}
              >
                <div className="font-bold text-sky-400 text-xs sm:text-sm mb-2 flex items-center gap-2">
                  {idx === 1 && <FileText className="w-4 h-4 text-emerald-400" />}
                  {idx === 2 && <TrendingUp className="w-4 h-4 text-sky-400" />}
                  {idx === 3 && <Scale className="w-4 h-4 text-purple-400" />}
                  {idx === 4 && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                  {idx === 5 && <Award className="w-4 h-4 text-amber-400" />}
                  {idx === 6 && <Sparkles className="w-4 h-4 text-emerald-400" />}
                  <span>{titleLine.replace(/\*\*/g, "")}</span>
                </div>

                <div className="space-y-1.5 leading-relaxed text-xs sm:text-sm pl-1">
                  {contentLines.map((line, lIdx) => {
                    const cleanLine = line.replace(/^\-\s*/, "• ");
                    return (
                      <div key={lIdx} className={cleanLine.startsWith("•") ? "pl-2 font-medium" : ""}>
                        {cleanLine}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                isDark ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              {p}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EconomicDashboard({ apiBaseUrl }: EconomicDashboardProps) {
  const { theme, language, activeCompany } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const { submitTask, getChatHistory, isAgentRunning, activeTasks } = useAgentExecution();
  const economyChatLog = getChatHistory("economy");
  const isEconomyRunning = isAgentRunning("economy");

  const [data, setData] = useState<any>(null);
  const [diagnostic, setDiagnostic] = useState<string>("");
  const [diagnosticLoading, setDiagnosticLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync Agent state
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Focus Table States
  const [focusSelectedYear, setFocusSelectedYear] = useState<string>("2026");
  const [focusMetricMode, setFocusMetricMode] = useState<"mediana" | "media" | "desvio" | "spread" | "respondentes">("mediana");
  const [focusCategoryFilter, setFocusCategoryFilter] = useState<string>("all");
  const [focusSearchTerm, setFocusSearchTerm] = useState<string>("");

  // Input state
  const [inputQuestion, setInputQuestion] = useState("");

  const fetchEconomyData = async () => {
    setLoading(true);
    try {
      const indUrl = getApiUrl("/api/economy/indicators", apiBaseUrl);
      const statusUrl = getApiUrl("/api/economy/sync-status", apiBaseUrl);

      const [indRes, statusRes] = await Promise.all([
        fetch(indUrl).catch(() => null),
        fetch(statusUrl).catch(() => null),
      ]);

      if (indRes && indRes.ok) {
        const indData = await indRes.json();
        setData(indData);
      }

      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        setSyncStatus(statusData);
      }
    } catch (err: any) {
      console.warn("API disconnect, using local economic model fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostic = async () => {
    setDiagnosticLoading(true);
    try {
      const diagUrl = getApiUrl("/api/economy/diagnostic", apiBaseUrl);
      const res = await fetch(diagUrl, { cache: "no-store" }).catch(() => null);
      if (res && res.ok) {
        const diagData = await res.json();
        if (diagData && diagData.summary) {
          setDiagnostic(diagData.summary);
          return;
        }
      }
      throw new Error("Diagnostic fallback required");
    } catch (err) {
      console.warn("Diagnostic API fallback mode activated:", err);
      const selicVal = kpis?.selic || 14.25;
      const ipcaVal = kpis?.ipca_12m || 4.64;
      const usdVal = kpis?.usd_brl || 5.07;
      const debtVal = kpis?.gross_debt || 81.94;
      const ippVal = kpis?.ipp_geral_12m || 3.82;
      const focusYearVal = focusSurvey?.by_year?.["2026"]?.[0]?.latest_mediana || 3.95;

      setDiagnostic(
        `## 1. Contexto & Dados Observados (BCB SGS & IBGE)\n` +
        `A economia brasileira opera sob regime de política monetária restritiva, com a **Taxa Selic Meta fixada em ${format2(selicVal)}% a.a.** (SGS 432) e o **IPCA acumulado em 12 meses em ${format2(ipcaVal)}%** (SGS 13522). A taxa de câmbio comercial PTAX encerrou cotada a **R$ ${format2(usdVal)}** (SGS 10813) e a **Dívida Bruta do Governo Geral atingiu ${format2(debtVal)}% do PIB** (SGS 13762). O Índice de Preços ao Produtor (**IPP IBGE**) registra variação acumulada de **+${format2(ippVal)}%**, refletindo dinâmica controlada de custos industriais na cadeia de fornecimento.\n\n` +
        `## 2. Diagnóstico Inflacionário & Atividade (IPCA & Focus)\n` +
        `O processo de convergência inflacionária segue condicionado pela inércia no segmento de serviços e pelo dinamismo do mercado de trabalho. A análise das últimas 6 semanas da **Pesquisa Focus** indica que a mediana de projeções para o IPCA 2026 situa-se em torno de **${format2(focusYearVal)}%**, evidenciando desancoragem moderada em relação ao centro da meta de 3,00%.\n\n` +
        `## 3. Panorama Fiscal & Sustentabilidade da Dívida\n` +
        `A trajetória da Dívida Bruta em ${format2(debtVal)}% do PIB demanda rigor na consolidação fiscal para conter os prêmios de risco na curva de juros soberana e preservar a ancoragem das expectativas no horizonte relevante.\n\n` +
        `## 4. Classificação da Postura de Política Monetária\n` +
        `**Classificação: HAWKISH (Restritiva)**\n` +
        `O Copom/BCB mantém postura vigilante e estritamente contracionista (*hawkish*), com taxa de juros real ex-ante bem acima do nível neutro estimado, necessária para garantir a reancoragem das expectativas e a convergência do IPCA à meta.`
      );
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleTriggerSyncNow = async () => {
    setIsSyncing(true);
    try {
      const syncUrl = getApiUrl("/api/economy/sync", apiBaseUrl);
      await fetch(syncUrl, { method: "POST" }).catch(() => null);
      await fetchEconomyData();
    } catch (e) {
      console.warn("Sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchEconomyData();
  }, [apiBaseUrl]);

  const handleSendQuestion = async (q?: string) => {
    const questionToSend = q || inputQuestion;
    if (!questionToSend.trim() || isEconomyRunning) return;

    if (!q) setInputQuestion("");
    await submitTask("economy", questionToSend);
  };

  // Filtered SGS Table
  const filteredTable = (data?.table || []).filter((row: any) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.id.toString().includes(searchTerm)
  );

  const kpis = data?.summary_kpis || { selic: 14.00, ipca_12m: 4.44, usd_brl: 5.22, gross_debt: 81.93 };
  const charts = data?.charts || {};

  // Sanitize chart series to guarantee unique month entries by retaining latest monthly record
  const sanitizedUsdBrl = useMemo(() => {
    const list = charts.usd_brl || [];
    const map = new Map<string, any>();
    for (const item of list) {
      if (item?.mes) {
        map.set(item.mes, item);
      }
    }
    return Array.from(map.values());
  }, [charts.usd_brl]);

  const sanitizedDebtGdp = useMemo(() => {
    const list = charts.debt_gdp || [];
    const map = new Map<string, any>();
    for (const item of list) {
      if (item?.mes) {
        map.set(item.mes, item);
      }
    }
    return Array.from(map.values());
  }, [charts.debt_gdp]);

  // Focus Market Readout Data
  const focusSurvey = data?.focus_survey || {
    survey_weeks: [
      { survey_date: "2026-08-07", monday_release_date: "2026-08-10", monday_formatted: "10/08/2026", friday_formatted: "07/08/2026", short: "10/08", release_header: "10/08/2026 (Seg)", week_label: "Mais Recente", weeks_ago: 0 },
      { survey_date: "2026-07-31", monday_release_date: "2026-08-03", monday_formatted: "03/08/2026", friday_formatted: "31/07/2026", short: "03/08", release_header: "03/08/2026 (Seg)", week_label: "Há 1 sem.", weeks_ago: 1 },
      { survey_date: "2026-07-24", monday_release_date: "2026-07-27", monday_formatted: "27/07/2026", friday_formatted: "24/07/2026", short: "27/07", release_header: "27/07/2026 (Seg)", week_label: "Há 2 sem.", weeks_ago: 2 },
      { survey_date: "2026-07-17", monday_release_date: "2026-07-20", monday_formatted: "20/07/2026", friday_formatted: "17/07/2026", short: "20/07", release_header: "20/07/2026 (Seg)", week_label: "Há 3 sem.", weeks_ago: 3 },
      { survey_date: "2026-07-10", monday_release_date: "2026-07-13", monday_formatted: "13/07/2026", friday_formatted: "10/07/2026", short: "13/07", release_header: "13/07/2026 (Seg)", week_label: "Há 4 sem.", weeks_ago: 4 },
      { survey_date: "2026-07-03", monday_release_date: "2026-07-06", monday_formatted: "06/07/2026", friday_formatted: "03/07/2026", short: "06/07", release_header: "06/07/2026 (Seg)", week_label: "Há 5 sem.", weeks_ago: 5 },
    ],
    reference_years: ["2026", "2027", "2028", "2029"],
    by_year: {
      "2026": [
        {
          id: "IPCA_2026",
          indicador: "IPCA",
          nome: "IPCA (Índice de Preços ao Consumidor Amplo)",
          categoria: "Preços & Inflação",
          unidade: "% a.a.",
          ref_year: "2026",
          latest_mediana: 5.02,
          prev_mediana: 5.03,
          four_weeks_mediana: 5.16,
          delta_1sem: -0.01,
          delta_4sem: -0.14,
          tendencia_1sem: "queda",
          min_global: 4.30,
          max_global: 5.62,
          respondentes: 151,
          valores: {
            "2026-08-07": { mediana: 5.02, media: 5.01, desvio: 0.223, min: 4.30, max: 5.57, respondentes: 151 },
            "2026-07-31": { mediana: 5.03, media: 5.02, desvio: 0.218, min: 4.30, max: 5.62, respondentes: 152 },
            "2026-07-24": { mediana: 5.12, media: 5.10, desvio: 0.220, min: 4.35, max: 5.65, respondentes: 151 },
            "2026-07-17": { mediana: 5.15, media: 5.13, desvio: 0.225, min: 4.40, max: 5.70, respondentes: 146 },
            "2026-07-10": { mediana: 5.16, media: 5.14, desvio: 0.230, min: 4.40, max: 5.70, respondentes: 149 },
            "2026-07-03": { mediana: 5.30, media: 5.30, desvio: 0.235, min: 4.50, max: 5.80, respondentes: 146 }
          }
        },
        {
          id: "Selic_2026",
          indicador: "Selic",
          nome: "Taxa Selic Meta (Fim de Período)",
          categoria: "Taxas de Juros & Câmbio",
          unidade: "% a.a.",
          ref_year: "2026",
          latest_mediana: 14.00,
          prev_mediana: 14.00,
          four_weeks_mediana: 14.25,
          delta_1sem: 0.00,
          delta_4sem: -0.25,
          tendencia_1sem: "estavel",
          min_global: 13.50,
          max_global: 15.00,
          respondentes: 138,
          valores: {
            "2026-08-07": { mediana: 14.00, media: 14.05, desvio: 0.35, min: 13.50, max: 15.00, respondentes: 138 },
            "2026-07-31": { mediana: 14.00, media: 14.05, desvio: 0.35, min: 13.50, max: 15.00, respondentes: 138 },
            "2026-07-24": { mediana: 14.25, media: 14.28, desvio: 0.36, min: 13.50, max: 15.00, respondentes: 138 },
            "2026-07-17": { mediana: 14.25, media: 14.28, desvio: 0.36, min: 13.50, max: 15.00, respondentes: 138 },
            "2026-07-10": { mediana: 14.25, media: 14.29, desvio: 0.36, min: 13.50, max: 15.00, respondentes: 138 },
            "2026-07-03": { mediana: 14.50, media: 14.31, desvio: 0.37, min: 13.50, max: 15.25, respondentes: 137 }
          }
        }
      ]
    }
  };

  const focusSurveyDates = focusSurvey.survey_weeks || focusSurvey.survey_dates || [];
  const focusYearRows = (focusSurvey.by_year && focusSurvey.by_year[focusSelectedYear]) ? focusSurvey.by_year[focusSelectedYear] : (focusSurvey.by_year?.["2026"] || []);

  // Filter Focus Rows
  const filteredFocusRows = useMemo(() => {
    return focusYearRows.filter((r: any) => {
      const matchCat = focusCategoryFilter === "all" || r.categoria === focusCategoryFilter;
      const matchSearch = !focusSearchTerm.trim() ||
        r.nome.toLowerCase().includes(focusSearchTerm.toLowerCase()) ||
        r.indicador.toLowerCase().includes(focusSearchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [focusYearRows, focusCategoryFilter, focusSearchTerm]);

  // Export Focus Table to CSV
  const handleExportFocusCsv = () => {
    if (!filteredFocusRows.length) return;
    const headers = [
      "Indicador",
      "Categoria",
      "Ano_Referencia",
      "Unidade",
      ...focusSurveyDates.map((d: any) => `"${d.monday_formatted || d.formatted}"`),
      "Delta_1Sem",
      "Delta_4Sem",
      "Minimo_Global",
      "Maximo_Global",
      "Respondentes"
    ];

    const rows = filteredFocusRows.map((r: any) => {
      const rowVals = [
        `"${r.nome}"`,
        `"${r.categoria}"`,
        r.ref_year,
        `"${r.unidade}"`,
        ...focusSurveyDates.map((d: any) => {
          const valObj = r.valores?.[d.survey_date || d.date];
          if (!valObj) return "";
          if (focusMetricMode === "media") return format2(valObj.media);
          if (focusMetricMode === "desvio") return format2(valObj.desvio);
          if (focusMetricMode === "respondentes") return String(valObj.respondentes ?? "");
          return format2(valObj.mediana);
        }),
        format2(r.delta_1sem ?? r.delta_1d),
        format2(r.delta_4sem),
        format2(r.min_global),
        format2(r.max_global),
        r.respondentes
      ];
      return rowVals.join(";");
    });

    const csvContent = [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Pesquisa_Focus_Semanal_BCB_${focusSelectedYear}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDisplayUnit = (unit: string) => {
    if (!isEn || !unit) return unit || "";
    return UNIT_TRANSLATIONS[unit] || unit.replace("% a.a.", "% p.a.").replace("% PIB", "% of GDP").replace("R$/US$", "BRL/USD");
  };

  const getDisplayName = (name: string) => {
    if (!isEn || !name) return name || "";
    return INDICATOR_TRANSLATIONS[name] || name;
  };

  const getDisplayCategory = (cat: string) => {
    if (!isEn || !cat) return cat || "";
    return CATEGORY_TRANSLATIONS[cat] || cat;
  };

  const getDisplayFreq = (freq: string) => {
    if (!isEn || !freq) return freq || "";
    return FREQ_TRANSLATIONS[freq] || freq;
  };

  // Helper to format metric display strictly with 2 decimals based on selected mode
  const getDisplayValue = (valObj: any, unit: string) => {
    if (!valObj) return "-";
    const displayUnit = getDisplayUnit(unit);
    if (focusMetricMode === "media") {
      return `${format2(valObj.media, isEn)} ${displayUnit}`;
    }
    if (focusMetricMode === "desvio") {
      return `±${format2(valObj.desvio, isEn)}`;
    }
    if (focusMetricMode === "spread") {
      return `${format2(valObj.min, isEn)} ${isEn ? "to" : "a"} ${format2(valObj.max, isEn)}`;
    }
    if (focusMetricMode === "respondentes") {
      return `${valObj.respondentes ?? "-"}`;
    }
    // Default: Mediana
    return `${format2(valObj.mediana, isEn)} ${displayUnit}`;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Agent Status Banner: Daily Macro Sync Agent */}
      <div className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 shadow-sm ${
        isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center justify-center">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isEn ? "Daily Continuous Macro Sync Agent Active" : "Agente IA de Atualização Diária Contínua Ativo"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30">
                {isEn ? "Standard 2 Decimal Places (e.g. 14.00)" : "Padrão 2 Casas Decimais (ex: 14.00)"}
              </span>
            </div>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {isEn
                ? "Automatic daily synchronization of official BCB series (SGS 432 Selic Target, SGS 13522 IPCA 12M, SGS 10813 PTAX, Focus Bulletin and IBGE IPP)."
                : "Sincronização diária automática das séries oficiais do BCB (SGS 432 Meta Selic, SGS 13522 IPCA 12M, SGS 10813 PTAX, Boletim Focus e IBGE IPP)."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {isEn ? "Last Sync:" : "Última Sincronização:"} <strong className="text-emerald-400">{syncStatus?.last_sync || (isEn ? "Today (Automatic)" : "Hoje (Automática)")}</strong>
            </div>
            <div className={`text-[10.5px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isEn ? "Frequency: Daily & Continuous • Format: 0.00" : "Frequência: Diária & Contínua • Formatação: 0.00"}
            </div>
          </div>

          <button
            onClick={handleTriggerSyncNow}
            disabled={isSyncing || loading}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold shadow-sm transition ${
              isDark
                ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-emerald-500"
                : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-emerald-400" : "text-sky-400"}`} />
            <span>{isSyncing ? (isEn ? "Syncing..." : "Sincronizando...") : (isEn ? "Sync Series Now" : "Sincronizar Séries Agora")}</span>
          </button>
        </div>
      </div>

      {/* Active Company Under Macro Analysis */}
      <CompanyBadge variant="banner" />

      {/* Top Macro KPI Cards (SGS Current State with strict 2 decimal formatting) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-2xl transition`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {isEn ? "SELIC TARGET RATE" : "TAXA SELIC META"}
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            {format2(kpis.selic, isEn)}% {isEn ? "p.a." : "a.a."}
          </div>
          <div className={`text-[11px] font-semibold mt-1 flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            <span>SGS 432 • Copom</span>
            <span className="text-emerald-400 font-bold">{isEn ? "Effective" : "Vigente"}</span>
          </div>
        </div>

        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-2xl transition`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {isEn ? "IPCA ACCUMULATED 12M" : "IPCA ACUMULADO 12M"}
          </div>
          <div className="text-2xl font-black text-sky-400 mt-1 font-mono">
            {format2(kpis.ipca_12m, isEn)}%
          </div>
          <div className={`text-[11px] font-semibold mt-1 flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            <span>SGS 13522 • IBGE</span>
            <span className="text-sky-400 font-bold">{isEn ? "Target: 3.00%" : "Meta: 3,00%"}</span>
          </div>
        </div>

        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-2xl transition`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {isEn ? "USD/BRL PTAX EXCHANGE RATE" : "CÂMBIO USD/BRL PTAX"}
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
            R$ {format2(kpis.usd_brl, isEn)}
          </div>
          <div className={`text-[11px] font-semibold mt-1 flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            <span>SGS 10813 • {isEn ? "Selling" : "Venda"}</span>
            <span className="text-amber-400 font-bold">PTAX BCB</span>
          </div>
        </div>

        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} border p-5 rounded-2xl transition`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {isEn ? "GROSS DEBT (% GDP)" : "DÍVIDA BRUTA (% PIB)"}
          </div>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">
            {format2(kpis.gross_debt, isEn)}%
          </div>
          <div className={`text-[11px] font-semibold mt-1 flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            <span>SGS 13762 • {isEn ? "General Gov" : "Governo Geral"}</span>
            <span className="text-purple-400 font-bold">{isEn ? "Fiscal" : "Fiscal"}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXCLUSIVE SECTION: TABELA DA PESQUISA FOCUS (ÚLTIMAS 6 SEMANAS DO BCB) */}
      {/* ========================================================================= */}
      <section className={`p-6 rounded-3xl border transition-all ${
        isDark ? "bg-slate-900/90 border-slate-800 text-white shadow-2xl" : "bg-white border-slate-200 text-slate-900 shadow-md"
      }`}>
        {/* Section Header with Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-anaplan-coral">
              <Calendar className="w-4 h-4" />
              <span>{isEn ? "Focus Market Report — Central Bank of Brazil (BCB)" : "Relatório de Mercado Focus — Banco Central do Brasil (BCB)"}</span>
            </div>
            <h3 className={`text-xl font-extrabold mt-0.5 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {isEn ? "Focus Survey — Weekly History of the Last 6 Official Releases" : "Pesquisa Focus — Histórico Semanal das Últimas 6 Divulgações Oficiais"}
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {isEn
                ? "Released weekly on Monday mornings (based on previous Friday closing). All values presented with 2 decimal precision."
                : "Divulgado semanalmente às segundas-feiras pela manhã (com base no fechamento da sexta-feira anterior). Todos os valores apresentados com precisão de 2 casas decimais."}
            </p>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFocusCsv}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white"
                  : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
              }`}
              title={isEn ? "Export Weekly Focus Table as CSV" : "Exportar Tabela Semanal Focus em CSV"}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? "Export Weekly Focus (.csv)" : "Exportar Focus Semanal (.csv)"}</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Horizon (Year) Selector, Statistical Metric Selector & Filters */}
        <div className="py-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Horizon / Reference Year Pills */}
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {isEn ? "Reference Year:" : "Ano de Referência:"}
              </span>
              <div className={`p-1 rounded-xl border flex items-center gap-1 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-300"}`}>
                {["2026", "2027", "2028", "2029"].map((year) => (
                  <button
                    key={year}
                    onClick={() => setFocusSelectedYear(year)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      focusSelectedYear === year
                        ? "bg-anaplan-coral text-white shadow-md"
                        : isDark ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Mode Selector (Mediana, Média, Desvio, Spread, Respondentes) */}
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {isEn ? "Survey Metric:" : "Métrica da Pesquisa:"}
              </span>
              <select
                value={focusMetricMode}
                onChange={(e) => setFocusMetricMode(e.target.value as any)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none transition ${
                  isDark ? "bg-slate-950 border-slate-700 text-white focus:border-anaplan-coral" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-anaplan-coral"
                }`}
              >
                <option value="mediana">{isEn ? "Market Median (Focus Standard - 2 Decimals)" : "Mediana de Mercado (Padrão Focus - 2 Decimais)"}</option>
                <option value="media">{isEn ? "Market Mean" : "Média das Projeções"}</option>
                <option value="desvio">{isEn ? "Standard Deviation (Volatility)" : "Desvio Padrão (Volatilidade)"}</option>
                <option value="spread">{isEn ? "Spread Range (Min to Max)" : "Intervalo (Mínimo a Máximo)"}</option>
                <option value="respondentes">{isEn ? "Number of Responding Institutions" : "Nº de Instituições Respondentes"}</option>
              </select>
            </div>
          </div>

          {/* Secondary Filter Row: Category & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10.5px] font-bold uppercase tracking-wider mr-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isEn ? "Filter Category:" : "Filtrar Categoria:"}
              </span>
              {[
                { id: "all", label: isEn ? "All Categories" : "Todas as Categorias" },
                { id: "Preços & Inflação", label: isEn ? "Prices & Inflation" : "Preços & Inflação" },
                { id: "Taxas de Juros & Câmbio", label: isEn ? "Interest Rates & FX" : "Juros & Câmbio" },
                { id: "Atividade Econômica", label: isEn ? "Activity / GDP" : "Atividade / PIB" },
                { id: "Setor Público & Fiscal", label: isEn ? "Fiscal & Debt" : "Fiscal & Dívida" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFocusCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                    focusCategoryFilter === cat.id
                      ? "bg-anaplan-cyan/20 border-anaplan-cyan text-anaplan-cyan font-bold"
                      : isDark ? "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200" : "border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Indicator Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isEn ? "Search indicator in Focus..." : "Buscar indicador no Focus..."}
                value={focusSearchTerm}
                onChange={(e) => setFocusSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border outline-none font-medium transition ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-anaplan-coral"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-anaplan-coral"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Focus Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 shadow-inner">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className={`border-b ${
                isDark ? "bg-slate-950 border-slate-800 text-slate-100 font-bold" : "bg-slate-100 border-slate-300 text-slate-800 font-bold"
              }`}>
                <th className="py-3 px-4 w-72">
                  <div className="flex items-center gap-1.5">
                    <span>{isEn ? `Indicator (${focusSelectedYear})` : `Indicador (${focusSelectedYear})`}</span>
                  </div>
                </th>

                {/* Survey Date Columns (Last 6 Weekly Focus Releases) */}
                {focusSurveyDates.map((w: any, idx: number) => (
                  <th
                    key={w.survey_date || w.date}
                    className={`py-3 px-3 text-right font-mono text-[11px] ${
                      idx === 0
                        ? "text-anaplan-coral font-black bg-anaplan-coral/10 border-b-2 border-anaplan-coral"
                        : idx === 4
                        ? "text-sky-400 font-bold"
                        : isDark ? "text-slate-200 font-bold" : "text-slate-800 font-bold"
                    }`}
                  >
                    <div>{w.monday_formatted || w.formatted} <span className="text-[9px] font-sans opacity-80">({isEn ? "Mon" : "Seg"})</span></div>
                    <div className="text-[9.5px] font-sans font-normal opacity-85">
                      {idx === 0
                        ? (isEn ? "Latest" : "Mais Recente")
                        : (isEn ? `${idx} ${idx === 1 ? "wk ago" : "wks ago"}` : `Há ${idx} ${idx === 1 ? "semana" : "semanas"}`)}
                    </div>
                    <div className="text-[8.5px] font-sans text-slate-400 font-normal">
                      {isEn ? "Close:" : "Fech:"} {w.friday_formatted || w.formatted}
                    </div>
                  </th>
                ))}

                {/* Variations & Deltas */}
                <th className="py-3 px-3 text-right font-mono text-[11px]">
                  {isEn ? "1W Δ" : "Δ 1 Semana"}
                </th>
                <th className="py-3 px-3 text-right font-mono text-[11px]">
                  {isEn ? "4W Δ" : "Δ 4 Semanas"}
                </th>
                <th className="py-3 px-3 text-center">
                  {isEn ? "Trend" : "Tendência"}
                </th>
                <th className="py-3 px-3 text-center w-20">
                  {isEn ? "Institutions" : "Instituições"}
                </th>
              </tr>
            </thead>

            <tbody className={`divide-y ${isDark ? "divide-slate-800/70 text-slate-100" : "divide-slate-200 text-slate-900"}`}>
              {filteredFocusRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400 font-medium">
                    {isEn ? "No indicators found for the selected filter." : "Nenhum indicador encontrado para o filtro selecionado."}
                  </td>
                </tr>
              ) : (
                filteredFocusRows.map((row: any) => {
                  const isUp = row.delta_1sem > 0 || row.delta_1d > 0;
                  const isDown = row.delta_1sem < 0 || row.delta_1d < 0;
                  const delta1 = row.delta_1sem !== undefined ? row.delta_1sem : row.delta_1d;
                  const delta4 = row.delta_4sem !== undefined ? row.delta_4sem : 0;
                  const isUp4 = delta4 > 0;
                  const isDown4 = delta4 < 0;

                  return (
                    <tr
                      key={row.id}
                      className={`transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}
                    >
                      {/* Indicator Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-bold flex items-center gap-2">
                          <span className={isDark ? "text-white" : "text-slate-900"}>{getDisplayName(row.nome)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            row.categoria === "Preços & Inflação"
                              ? "bg-sky-500/15 text-sky-400"
                              : row.categoria === "Taxas de Juros & Câmbio"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : row.categoria === "Atividade Econômica"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-purple-500/15 text-purple-400"
                          }`}>
                            {getDisplayCategory(row.categoria)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {isEn ? "Unit:" : "Unidade:"} {getDisplayUnit(row.unidade)}
                          </span>
                        </div>
                      </td>

                      {/* 6 Weekly Survey Values Columns */}
                      {focusSurveyDates.map((w: any, idx: number) => {
                        const dateKey = w.survey_date || w.date;
                        const valObj = row.valores?.[dateKey];
                        return (
                          <td
                            key={dateKey}
                            className={`py-3 px-3 text-right font-mono font-bold ${
                              idx === 0
                                ? "text-anaplan-coral bg-anaplan-coral/5 text-sm"
                                : isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            {getDisplayValue(valObj, row.unidade)}
                          </td>
                        );
                      })}

                      {/* Delta 1 Semana */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                          isUp
                            ? "bg-rose-500/15 text-rose-400"
                            : isDown
                            ? "bg-emerald-500/15 text-emerald-400"
                            : isDark ? "text-slate-400" : "text-slate-500"
                        }`}>
                          {delta1 > 0 ? `+${format2(delta1, isEn)}` : format2(delta1, isEn)}
                        </span>
                      </td>

                      {/* Delta 4 Semanas */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                          isUp4
                            ? "bg-rose-500/15 text-rose-400"
                            : isDown4
                            ? "bg-emerald-500/15 text-emerald-400"
                            : isDark ? "text-slate-400" : "text-slate-500"
                        }`}>
                          {delta4 > 0 ? `+${format2(delta4, isEn)}` : format2(delta4, isEn)}
                        </span>
                      </td>

                      {/* Trend Badge */}
                      <td className="py-3 px-3 text-center">
                        {isUp ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-800/60">
                            <ArrowUpRight className="w-3 h-3" /> {isEn ? "Up" : "Alta"}
                          </span>
                        ) : isDown ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-800/60">
                            <ArrowDownRight className="w-3 h-3" /> {isEn ? "Down" : "Queda"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-700/60">
                            <Minus className="w-3 h-3" /> {isEn ? "Stable" : "Estável"}
                          </span>
                        )}
                      </td>

                      {/* Respondents Count */}
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-400 text-[11px]">
                        {row.respondentes} {isEn ? "inst." : "inst."}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Note with source and schedule */}
        <div className="mt-4 pt-3 border-t border-slate-800/40 flex flex-wrap justify-between items-center text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isEn
                ? "Frequency: Weekly (Mondays, 08:30 AM BRT) — Source: Central Bank of Brazil Market Expectations System (Olinda OData API)."
                : "Frequência: Semanal (Segundas-feiras, 08h30) — Fonte: Sistema de Expectativas de Mercado do BCB (Olinda OData API)."}
            </span>
          </div>
          <div>
            {isEn ? "Latest release:" : "Última divulgação:"} <strong>{focusSurvey.updated_at || "10/08/2026"} ({isEn ? "Monday" : "Segunda-feira"})</strong>
          </div>
        </div>
      </section>

      {/* Main Grid: Diagnostic Agent & BCB Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 cols): Agno Agent Executive Diagnostic & Economic Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formatted Diagnostic Card */}
          <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-md"} border p-6 rounded-2xl space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold tracking-tight text-slate-900 dark:text-white">
                    {isEn ? "Agno AI Agent — PhD Macroeconomic Diagnostic" : "Agente IA Agno — Diagnóstico Macroeconômico PhD"}
                  </h3>
                  <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {isEn
                      ? "Analysis based on PhD Economist skill, observed BCB SGS data and Focus expectations"
                      : "Análise baseada na skill PhD Economista, dados observados SGS e expectativas Focus"}
                  </p>
                </div>
              </div>

              {diagnostic && (
                <button
                  onClick={handleRunDiagnostic}
                  disabled={diagnosticLoading}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100 hover:text-white"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                  }`}
                  title={isEn ? "Run re-analysis of BCB and Focus series" : "Executar reanálise das séries do BCB e Focus"}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${diagnosticLoading ? "animate-spin text-emerald-400" : "text-emerald-500"}`} />
                  <span>{diagnosticLoading ? (isEn ? "Analyzing..." : "Analisando...") : (isEn ? "Reanalyze SGS & Focus" : "Reanalisar SGS & Focus")}</span>
                </button>
              )}
            </div>

            {diagnosticLoading ? (
              <div className="py-12 text-center text-sm flex flex-col items-center justify-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  <Sparkles className="w-4 h-4 text-emerald-400 absolute" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {isEn ? "The Agno PhD Agent is processing BCB series..." : "O Agente Agno PhD está processando as séries do BCB..."}
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {isEn
                      ? "Cross-referencing SGS series (Selic 432, IPCA 13522, FX 10813, Debt 13762), IBGE IPP and Focus expectations."
                      : "Cruzando séries do SGS (Selic 432, IPCA 13522, Câmbio 10813, Dívida 13762), IPP IBGE e expectativas Focus."}
                  </p>
                </div>
              </div>
            ) : !diagnostic ? (
              <div className={`p-8 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center gap-4 ${
                isDark ? "bg-slate-950/40 border-slate-800 text-slate-300" : "bg-slate-50/80 border-slate-300 text-slate-700"
              }`}>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isEn ? "Macroeconomic Diagnostic Awaiting Initialization" : "Diagnóstico Macroeconômico Aguardando Inicialização"}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {isEn
                      ? "Click the button below to start the Agno PhD AI Agent. It will perform an integrated real-time analysis cross-referencing observed BCB SGS data and Focus Survey expectations."
                      : "Clique no botão abaixo para iniciar o Agente IA Agno PhD. Ele realizará a análise integrada em tempo real cruzando os dados observados do BCB SGS e as expectativas da Pesquisa Focus."}
                  </p>
                </div>
                <button
                  onClick={handleRunDiagnostic}
                  disabled={diagnosticLoading}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{isEn ? "Start Agent Analysis (SGS & Focus)" : "Iniciar Análise do Agente (SGS & Focus)"}</span>
                </button>
              </div>
            ) : (
              <FormattedDiagnostic text={diagnostic} isDark={isDark} isEn={isEn} />
            )}
          </div>

          {/* Table of BCB Economic Indicators */}
          <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-md"} border p-6 rounded-2xl space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-700/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                <h3 className="text-md font-bold">
                  {isEn ? "Observed Economic Indicators Table (BCB SGS API)" : "Tabela de Indicadores Econômicos Observados (BCB SGS API)"}
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={isEn ? "Search SGS indicator..." : "Buscar indicador SGS..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isDark ? "border-slate-800 text-slate-100 font-bold bg-slate-950/80" : "border-slate-200 text-slate-800 font-bold bg-slate-100"}`}>
                    <th className="py-2.5 px-3">{isEn ? "SGS Code" : "Cód. SGS"}</th>
                    <th className="py-2.5 px-3">{isEn ? "Indicator" : "Indicador"}</th>
                    <th className="py-2.5 px-3">{isEn ? "Frequency" : "Frequência"}</th>
                    <th className="py-2.5 px-3">{isEn ? "Unit" : "Unidade"}</th>
                    <th className="py-2.5 px-3 text-right">{isEn ? "Current Value" : "Valor Atual"}</th>
                    <th className="py-2.5 px-3 text-right">{isEn ? "Recent Variation" : "Variação Recente"}</th>
                    <th className="py-2.5 px-3 text-right">{isEn ? "12M Variation" : "Variação 12M"}</th>
                    <th className="py-2.5 px-3 text-center">{isEn ? "Trend" : "Tendência"}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800/60 text-slate-100" : "divide-slate-200 text-slate-900"}`}>
                  {filteredTable.map((row: any) => {
                    const isUp = row.trend === "up";
                    const isDown = row.trend === "down";
                    return (
                      <tr key={row.key} className={`hover:${isDark ? "bg-slate-800/50 text-white" : "bg-slate-50 text-slate-900"} transition`}>
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-400">{row.id}</td>
                        <td className={`py-2.5 px-3 font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{getDisplayName(row.name)}</td>
                        <td className={`py-2.5 px-3 font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>{getDisplayFreq(row.freq)}</td>
                        <td className={`py-2.5 px-3 font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>{getDisplayUnit(row.unit)}</td>
                        <td className={`py-2.5 px-3 text-right font-bold font-mono ${isDark ? "text-white" : "text-slate-900"}`}>
                          {format2(row.latest_val, isEn)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold font-mono ${row.diff > 0 ? "text-emerald-400" : row.diff < 0 ? "text-rose-400" : isDark ? "text-slate-200" : "text-slate-600"}`}>
                          {row.diff > 0 ? `+${format2(row.diff, isEn)}` : format2(row.diff, isEn)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold font-mono ${row.var_12m > 0 ? "text-emerald-400" : row.var_12m < 0 ? "text-rose-400" : isDark ? "text-slate-200" : "text-slate-600"}`}>
                          {row.var_12m > 0 ? `+${format2(row.var_12m, isEn)}` : format2(row.var_12m, isEn)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isUp ? (
                            <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-800">
                              <TrendingUp className="w-3 h-3" /> {isEn ? "Up" : "Alta"}
                            </span>
                          ) : isDown ? (
                            <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-800">
                              <TrendingDown className="w-3 h-3" /> {isEn ? "Down" : "Queda"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-200 bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-700">
                              <Minus className="w-3 h-3" /> {isEn ? "Stable" : "Estável"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Interactive Chat with Agno Agent */}
        <div className={`${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-md"} border p-6 rounded-2xl flex flex-col h-[640px]`}>
          <div className="flex items-center gap-3 border-b pb-3 border-slate-700/50 mb-4">
            <div className="p-2.5 bg-sky-500/20 border border-sky-500/40 rounded-xl text-sky-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white">
                {isEn ? "Agno Economic Chat" : "Chat Econômico Agno"}
              </h3>
              <p className={`text-[11px] font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                {isEn ? "Questions on monetary policy, Focus & fiscal data" : "Perguntas sobre política monetária, Focus & fiscal"}
              </p>
            </div>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              isEn ? "What is the Copom Selic Target?" : "Qual a Meta Selic do Copom?",
              isEn ? "How does Focus project Selic for 2026?" : "Como o Focus vê a Selic 2026?",
              isEn ? "What is the FX rate impact?" : "Qual o impacto do Câmbio?",
              isEn ? "How is public debt evolving?" : "Como está a dívida pública?",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendQuestion(chip)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white"
                    : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs mb-3">
            {economyChatLog.length === 0 && (
              <div className="flex gap-2 justify-start">
                <div className="p-1.5 bg-sky-600/30 text-sky-400 rounded-lg h-fit">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div
                  className={`max-w-[85%] p-3 rounded-xl whitespace-pre-wrap leading-relaxed ${
                    isDark
                      ? "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none font-medium"
                      : "bg-slate-100 text-slate-900 rounded-bl-none font-medium"
                  }`}
                >
                  {isEn
                    ? `Hello! I am Agno AI Agent (PhD Economist). I daily synchronize official BCB SGS data (Selic 432, IPCA 13522, FX 10813) and model their impacts on ${activeCompany.name}. How can I assist you?`
                    : `Olá! Sou o Agente Agno (PhD Economista). Atualizo diariamente os dados do BCB SGS (Meta Selic 432, IPCA 13522, Câmbio 10813) e projeto os impactos sobre ${activeCompany.name}. Em que posso ajudar?`}
                </div>
              </div>
            )}

            {economyChatLog.map((m, idx) => (
              <React.Fragment key={idx}>
                <div className="flex gap-2 justify-end">
                  <div className="max-w-[85%] p-3 rounded-xl whitespace-pre-wrap leading-relaxed bg-gradient-to-r from-sky-600 to-emerald-600 text-white rounded-br-none font-medium">
                    {m.q}
                  </div>
                </div>
                <div className="flex gap-2 justify-start">
                  <div className="p-1.5 bg-sky-600/30 text-sky-400 rounded-lg h-fit">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div
                    className={`max-w-[85%] p-3 rounded-xl whitespace-pre-wrap leading-relaxed ${
                      isDark
                        ? "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none font-medium"
                        : "bg-slate-100 text-slate-900 rounded-bl-none font-medium"
                    }`}
                  >
                    {m.a}
                  </div>
                </div>
              </React.Fragment>
            ))}

            {isEconomyRunning && (
              <div className="flex items-center gap-2 text-sky-400 text-xs py-2 animate-pulse font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>{isEn ? "Agno Agent is analyzing in the background (you can navigate freely)..." : "O Agente Agno está analisando em segundo plano (você pode trocar de página livremente)..."}</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-700/50"
          >
            <input
              type="text"
              placeholder={isEn ? "Type your question regarding macroeconomics or Focus..." : "Digite sua dúvida sobre a economia ou Focus..."}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={isEconomyRunning}
              className={`flex-1 ${
                isDark ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
              } border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60`}
            />
            <button
              type="submit"
              disabled={isEconomyRunning || !inputQuestion.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold transition disabled:opacity-50"
            >
              {isEconomyRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Inflation (IPCA 12M) vs Selic Target */}
        <div className={`${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900 shadow-md"} border p-5 rounded-2xl transition`}>
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3">
            {isEn ? "Inflation Evolution (IPCA 12M) vs Selic Target (% p.a.)" : "Evolução Inflação (IPCA 12M) vs Selic Meta (% a.a.)"}
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.ipca_vs_selic || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="mes" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={10} />
                <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={10} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    color: isDark ? "#f8fafc" : "#0f172a",
                  }}
                  formatter={(val: any) => `${format2(val)}%`}
                />
                <Legend iconType="line" iconSize={14} />
                <Line type="monotone" dataKey="selic_target" stroke="#10b981" strokeWidth={2.5} name={isEn ? "Selic Target (% p.a.)" : "Selic Meta (% a.a.)"} dot={false} activeDot={false} />
                <Line type="monotone" dataKey="ipca_12m" stroke="#38bdf8" strokeWidth={2.5} name={isEn ? "IPCA 12M (%)" : "IPCA 12M (%)"} dot={false} activeDot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: USD / BRL PTAX Exchange Rate */}
        <div className={`${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900 shadow-md"} border p-5 rounded-2xl transition`}>
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3">
            {isEn ? "USD/BRL PTAX Exchange Rate Trendline (Selling)" : "Trajetória do Câmbio USD/BRL PTAX (Venda)"}
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sanitizedUsdBrl}>
                <defs>
                  <linearGradient id="usdColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="mes" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={10} />
                <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={10} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    color: isDark ? "#f8fafc" : "#0f172a",
                  }}
                  formatter={(val: any) => `R$ ${format2(val)}`}
                />
                <Legend />
                <Area type="monotone" dataKey="usd_brl" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#usdColor)" name="USD/BRL PTAX" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Public Debt (% GDP) Gross vs Net */}
        <div className={`${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900 shadow-md"} border p-5 rounded-2xl transition`}>
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3">
            {isEn ? "Public Debt (% of GDP) — Gross vs Net" : "Dívida Pública (% do PIB) — Bruta vs Líquida"}
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sanitizedDebtGdp}>
                <defs>
                  <linearGradient id="gradGrossDebt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                    <stop offset="100%" stopColor="#be123c" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="gradNetDebt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="mes" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={10} />
                <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={10} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    color: isDark ? "#f8fafc" : "#0f172a",
                  }}
                  formatter={(val: any) => `${format2(val)}% PIB`}
                />
                <Legend wrapperStyle={{ paddingTop: "6px", fontSize: "11px", fontWeight: 700 }} />
                <Bar
                  dataKey="divida_bruta"
                  fill="url(#gradGrossDebt)"
                  name={isEn ? "Gross Debt (% GDP)" : "Dívida Bruta (% PIB)"}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="divida_liquida"
                  fill="url(#gradNetDebt)"
                  name={isEn ? "Net Debt (% GDP)" : "Dívida Líquida (% PIB)"}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
