"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Search,
  Download,
  Printer,
  ChevronRight,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  X
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";

interface StructuredStatementTableProps {
  statementType: "DRE" | "DFC" | "BP";
  className?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export default function StructuredStatementTable({
  statementType,
  className = "",
  onClose,
  isModal = false,
}: StructuredStatementTableProps) {
  const { theme, language, apiBaseUrl } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<{
    company?: any;
    periods: string[];
    rows: any[];
  }>({
    periods: [],
    rows: []
  });

  useEffect(() => {
    let isMounted = true;
    const fetchTable = async () => {
      setLoading(true);
      try {
        const endpoint = `${apiBaseUrl}/api/${statementType.toLowerCase()}/table`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setTableData({
              company: data.company,
              periods: data.periods || [],
              rows: data.rows || []
            });
          }
        }
      } catch (err) {
        console.warn(`Could not load /api/${statementType.toLowerCase()}/table:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTable();
    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl, statementType]);

  const company = tableData.company || {
    name: "Empresa",
    ticker: "TICK3",
    currency: "R$ Milhões"
  };

  const statementTitle = statementType === "DFC"
    ? (isEn ? "Cash Flow Statement (DFC) — Consolidated" : "Demonstração do Fluxo de Caixa (DFC) — Consolidada")
    : statementType === "BP"
    ? (isEn ? "Statement of Financial Position (Balance Sheet)" : "Balanço Patrimonial (BP) — Consolidado")
    : (isEn ? "Income Statement (DRE) — Consolidated" : "Demonstração do Resultado do Exercício (DRE) — Consolidada");

  const legalBasis = statementType === "DFC"
    ? "CPC 03 (R2) / IAS 7 & Resolução CVM nº 80/2022"
    : statementType === "BP"
    ? "CPC 26 (R1) / IAS 1 & Lei nº 6.404/76"
    : "CPC 26 (R1) / IAS 1 & Lei nº 6.404/76 (Art. 187)";

  // Filter rows based on search
  const filteredRows = tableData.rows.filter((row: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = (row.name || "").toLowerCase().includes(term);
    const codeMatch = (row.code || "").toLowerCase().includes(term);
    return nameMatch || codeMatch;
  });

  const handleExportCsv = () => {
    if (!tableData.rows.length) return;
    const periods = tableData.periods || [];
    const headers = [
      "Código",
      "Conta Contábil",
      ...periods.flatMap((p) => [`${p} Valor`, `${p} AV (%)`, `${p} AH (%)`])
    ];

    const csvRows = [headers.join(";")];
    filteredRows.forEach((r: any) => {
      const rowVals = [
        `"${r.code || ""}"`,
        `"${r.name || ""}"`
      ];
      periods.forEach((p) => {
        const pData = r.periods?.[p] || { value: 0, av_pct: 0, ah_pct: 0 };
        rowVals.push(
          Number(pData.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
          `${pData.av_pct?.toFixed(1) || "0.0"}%`,
          `${pData.ah_pct?.toFixed(1) || "0.0"}%`
        );
      });
      csvRows.push(rowVals.join(";"));
    });

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Demonstrativo_${statementType}_${company.name.replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-xl transition ${
      isDark ? "bg-[#0b1329]/95 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900 shadow-xl"
    } ${className}`}>
      {/* Top Header */}
      <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-4 ${
        isDark ? "border-slate-800 bg-[#070e1b]" : "border-slate-200 bg-slate-50"
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
              statementType === "DFC"
                ? "bg-sky-600"
                : statementType === "BP"
                ? "bg-emerald-600"
                : "bg-[#ff5722]"
            }`}>
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {statementTitle}
              </h3>
              <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {company.name} ({company.ticker}) • {legalBasis}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Currency Pill */}
          <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border shadow-sm ${
            statementType === "DFC"
              ? isDark ? "bg-sky-500/10 text-sky-400 border-sky-500/30" : "bg-sky-50 text-sky-700 border-sky-300"
              : statementType === "BP"
              ? isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-300"
              : isDark ? "bg-orange-500/10 text-[#ff5722] border-orange-500/30" : "bg-orange-50 text-[#ff5722] border-orange-300"
          }`}>
            {company.currency || "R$ Milhões"}
          </span>

          {/* Search Box */}
          <div className={`relative flex items-center rounded-xl border px-2.5 py-1 ${
            isDark ? "bg-[#0f172a] border-slate-700" : "bg-white border-slate-300"
          }`}>
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="text"
              placeholder={isEn ? "Filter accounts..." : "Filtrar contas contábeis..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs outline-none w-32 sm:w-48 placeholder-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-200">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
            }`}
            title={isEn ? "Export statement to CSV" : "Exportar demonstrativo para CSV"}
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          {/* Close button if in modal */}
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Analysis Legend Bar */}
      <div className={`px-5 py-2 text-[11px] font-medium border-b flex flex-wrap items-center justify-between gap-2 ${
        isDark ? "bg-[#060c18] border-slate-800/80 text-slate-400" : "bg-slate-100/80 border-slate-200 text-slate-600"
      }`}>
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-slate-200 font-bold">AV (%)</strong>: {isEn ? "Vertical Analysis (% of Net Sales / Base)" : "Análise Vertical (% sobre a Base do Demonstrativo)"}
          </span>
          <span>
            <strong className="text-slate-200 font-bold">AH (%)</strong>: {isEn ? "Horizontal Analysis (% growth vs base period)" : "Análise Horizontal (% de crescimento nominal vs período base)"}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{isEn ? "Growth (+)" : "Variação Positiva (+)"}</span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#ff5722] ml-2"></span>
          <span>{isEn ? "Reduction (-)" : "Variação Negativa (-)"}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400">
              {isEn ? "Loading financial statement table..." : "Carregando dados estruturados do demonstrativo contábil..."}
            </p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            {isEn ? "No accounts found matching your query." : "Nenhuma conta contábil encontrada para o filtro informado."}
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 shadow-md">
              <tr className={`border-b ${
                isDark ? "border-slate-800 bg-[#070e1b] text-slate-200" : "border-slate-300 bg-slate-100 text-slate-900 font-black"
              }`}>
                <th className="py-3 px-4 font-black w-24">Código</th>
                <th className="py-3 px-4 font-black min-w-[280px]">Conta Contábil</th>
                {tableData.periods.map((p) => (
                  <th
                    key={p}
                    colSpan={3}
                    className={`py-3 px-3 font-black text-center border-l ${
                      isDark ? "border-slate-800" : "border-slate-300"
                    }`}
                  >
                    {p}
                  </th>
                ))}
              </tr>
              <tr className={`border-b text-[10.5px] ${
                isDark ? "border-slate-800/80 bg-[#050b18] text-slate-400" : "border-slate-300 bg-slate-200/80 text-slate-800 font-bold"
              }`}>
                <th className="py-1 px-4"></th>
                <th className="py-1 px-4"></th>
                {tableData.periods.map((p) => (
                  <React.Fragment key={`${p}-sub`}>
                    <th className={`py-1.5 px-2 text-right border-l font-bold ${
                      isDark ? "border-slate-800 text-slate-300" : "border-slate-300 text-slate-800"
                    }`}>
                      Valor
                    </th>
                    <th className="py-1.5 px-2 text-right font-bold">AV (%)</th>
                    <th className="py-1.5 px-2 text-right font-bold">AH (%)</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-200"}`}>
              {filteredRows.map((row: any) => {
                const isTopHeader = row.level === 0;
                const isSubHeader = row.level === 1 && !row.is_total;
                const isTotalRow = row.is_total && row.level > 0;

                return (
                  <tr
                    key={row.id || row.code}
                    className={`transition ${
                      isTopHeader
                        ? isDark ? "bg-[#0e1b38] font-black text-white" : "bg-slate-200/90 font-black text-slate-950"
                        : isTotalRow
                        ? isDark ? "bg-[#09152b] font-bold text-sky-200" : "bg-sky-50/90 font-black text-sky-950"
                        : isSubHeader
                        ? isDark ? "hover:bg-slate-800/40 text-slate-200" : "hover:bg-slate-50 text-slate-900 font-medium"
                        : isDark ? "hover:bg-slate-800/30 text-slate-300" : "hover:bg-slate-50 text-slate-800 font-normal"
                    }`}
                  >
                    {/* Código */}
                    <td className={`py-2.5 px-4 font-mono font-bold ${
                      isTopHeader
                        ? statementType === "DFC" ? "text-sky-400" : "text-[#ff5722]"
                        : isDark ? "text-slate-400" : "text-slate-600"
                    }`}>
                      {row.code}
                    </td>

                    {/* Nome da Conta */}
                    <td className="py-2.5 px-4" style={{ paddingLeft: `${(row.level || 0) * 16 + 16}px` }}>
                      <span className={isTopHeader ? "text-sm font-black" : isTotalRow ? "font-bold text-sky-400 dark:text-sky-300" : ""}>
                        {row.name}
                      </span>
                    </td>

                    {/* Períodos */}
                    {tableData.periods.map((p, idx) => {
                      const pData = row.periods?.[p] || { value: 0, av_pct: 0, ah_pct: 0 };
                      const val = Number(pData.value);
                      const isNegative = val < 0;

                      return (
                        <React.Fragment key={`${row.id || row.code}-${p}`}>
                          {/* Valor */}
                          <td className={`py-2.5 px-2 text-right font-mono font-bold border-l ${
                            isDark ? "border-slate-800 text-white" : "border-slate-300 text-slate-950"
                          } ${isNegative ? "text-[#f87171] dark:text-[#fb7185]" : ""}`}>
                            {val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>

                          {/* AV (%) */}
                          <td className={`py-2.5 px-2 text-right font-mono text-[11px] font-bold ${
                            isTopHeader
                              ? isDark ? "text-white" : "text-slate-900"
                              : isDark ? "text-slate-300" : "text-slate-600"
                          }`}>
                            {pData.av_pct !== undefined ? `${pData.av_pct.toFixed(1)}%` : "-"}
                          </td>

                          {/* AH (%) */}
                          <td className={`py-2.5 px-2 text-right font-mono text-[11px] font-black ${
                            pData.ah_pct > 0
                              ? "text-emerald-500 dark:text-emerald-400"
                              : pData.ah_pct < 0
                              ? "text-[#d84315] dark:text-[#ff5722]"
                              : isDark ? "text-slate-400" : "text-slate-500"
                          }`}>
                            {idx === 0 ? "-" : `${pData.ah_pct > 0 ? "+" : ""}${pData.ah_pct.toFixed(1)}%`}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className={`p-3.5 px-5 border-t flex items-center justify-between text-xs font-semibold ${
        isDark ? "border-slate-800 bg-[#070e1b] text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>
            {isEn
              ? `Displaying ${filteredRows.length} official accounting lines compiled from canonical financial reporting.`
              : `Exibindo ${filteredRows.length} linhas contábeis compiladas com base nos relatórios financeiros oficiais.`}
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          HyperCube Connected Planning Engine v3.0
        </span>
      </div>
    </div>
  );
}
