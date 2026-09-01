"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  Tag,
  ShieldCheck,
  FileText,
  RefreshCw,
  Download,
  Building2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  CheckCircle2
} from "lucide-react";
import { usePreferences, getApiUrl } from "./PreferencesContext";
import StatementNotFoundBanner from "./StatementNotFoundBanner";

interface NEPanelProps {
  onNavigate?: (mode: string) => void;
}

export default function NEPanel({ onNavigate }: NEPanelProps) {
  const { theme, language, apiBaseUrl, activeCompany } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [loading, setLoading] = useState(true);
  const [neData, setNeData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    7: true
  });

  const fetchNe = async () => {
    setLoading(true);
    try {
      const url = getApiUrl("/api/statements/ne", apiBaseUrl);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNeData(data);
      } else {
        setNeData({ has_data: false });
      }
    } catch (err) {
      console.error("Fetch NE error:", err);
      setNeData({ has_data: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNe();
  }, [apiBaseUrl, activeCompany?.id]);

  const toggleNote = (num: number) => {
    setExpandedNotes((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const expandAll = () => {
    if (!neData?.notes) return;
    const all: Record<number, boolean> = {};
    neData.notes.forEach((n: any) => { all[n.number] = true; });
    setExpandedNotes(all);
  };

  const collapseAll = () => {
    setExpandedNotes({});
  };

  // Collect all unique tags
  const allTags = useMemo(() => {
    if (!neData?.notes) return [];
    const tagsSet = new Set<string>();
    neData.notes.forEach((n: any) => {
      (n.tags || []).forEach((t: string) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [neData]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    if (!neData?.notes) return [];
    return neData.notes.filter((n: any) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = !selectedTag || (n.tags && n.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [neData, searchQuery, selectedTag]);

  const handleExportText = () => {
    if (!neData?.notes) return;
    let txt = `CADERNO DE NOTAS EXPLICATIVAS ÀS DEMONSTRAÇÕES FINANCEIRAS\n`;
    txt += `Companhia: ${neData.company?.name || "Empresa"}\n`;
    txt += `Em conformidade com a Resolução CVM nº 80/2022 e CPC 26 (R1)\n\n`;
    neData.notes.forEach((n: any) => {
      txt += `========================================================\n`;
      txt += `NOTA EXPLICATIVA Nº ${n.number} — ${n.title.toUpperCase()}\n`;
      txt += `Sumário: ${n.summary}\n`;
      txt += `Conteúdo:\n${n.content}\n\n`;
    });
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Notas_Explicativas_${neData.company?.name || "Empresa"}.txt`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">
          {isEn ? "Loading Explanatory Notes (NE)..." : "Carregando Notas Explicativas às Demonstrações Contábeis (NE)..."}
        </p>
      </div>
    );
  }

  if (!neData || neData.has_data === false) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <StatementNotFoundBanner
          statementName="NE"
          statementFullName={isEn ? "Explanatory Notes to Financial Statements (NE)" : "Notas Explicativas às Demonstrações Financeiras (NE)"}
          legalBasis="CPC 26 (R1), Art. 176, §§ 4º e 5º da Lei nº 6.404/76 e Resolução CVM nº 80/2022"
          companyName={activeCompany?.name || "Empresa Ativa"}
          reason={neData?.reason}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5 border-slate-700/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
              CPC 26 (R1) • Art. 176 Lei 6.404
            </span>
            <span className="text-xs font-mono text-slate-400">Resolução CVM nº 80/2022</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-sky-400" />
            <span>Notas Explicativas (NE)</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Detalhamento qualitativo e quantitativo das políticas contábeis, critérios de mensuração, riscos, covenants, contingências e partes relacionadas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchNe}
            className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportText}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isEn ? "Export Notes (.txt)" : "Exportar Caderno (.txt)"}</span>
          </button>
        </div>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isEn ? "Search in notes (e.g., covenants, IFRS, risks)..." : "Pesquisar nas notas (ex: covenants, goodwill, IFRS, litígios)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={expandAll}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
              isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Expandir Todas
          </button>
          <button
            onClick={collapseAll}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
              isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Recolher Todas
          </button>
        </div>
      </div>

      {/* Filter Tag Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs font-semibold mr-1 flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            <Tag className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
              selectedTag === null
                ? "bg-sky-600 text-white shadow-sm"
                : isDark ? "bg-slate-800/80 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
            }`}
          >
            Todas as Notas ({neData.notes?.length || 0})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                selectedTag === tag
                  ? "bg-sky-600 text-white shadow-sm"
                  : isDark ? "bg-slate-800/80 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Explanatory Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note: any) => {
          const isExpanded = Boolean(expandedNotes[note.number]);
          return (
            <div
              key={note.number}
              className={`rounded-2xl border transition-all shadow-sm overflow-hidden ${
                isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <button
                onClick={() => toggleNote(note.number)}
                className={`w-full p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 text-left transition cursor-pointer ${
                  isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs ${
                    isDark 
                      ? "bg-sky-500/15 text-sky-400 border-sky-500/30" 
                      : "bg-sky-100 text-sky-800 border-sky-300"
                  }`}>
                    {note.number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      Nota {note.number} — {note.title}
                    </h3>
                    <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
                      {note.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5">
                    {(note.tags || []).slice(0, 3).map((t: string) => (
                      <span key={t} className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                        isDark 
                          ? "bg-slate-800 text-slate-400 border-slate-700" 
                          : "bg-slate-100 text-slate-700 border-slate-200 font-semibold"
                      }`}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className={`px-5 pb-5 pt-3 border-t text-xs leading-relaxed font-sans ${
                  isDark ? "border-slate-800 text-slate-300 bg-slate-950/40" : "border-slate-100 text-slate-900 bg-slate-50/60 font-normal"
                }`}>
                  <p className="mb-4 whitespace-pre-line text-sm leading-relaxed">{note.content}</p>

                  <div className={`flex items-center justify-between pt-3 border-t flex-wrap gap-2 text-[11px] ${
                    isDark ? "border-slate-800/60 text-slate-400" : "border-slate-200 text-slate-600 font-medium"
                  }`}>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
                      <span>Conformidade CVM Res. 80/2022 • Lei 6.404/76</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(note.tags || []).map((t: string) => (
                        <span key={t} className={`px-2 py-0.5 rounded border font-mono text-[10px] ${
                          isDark 
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
                            : "bg-sky-100 text-sky-800 border-sky-300 font-bold"
                        }`}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
