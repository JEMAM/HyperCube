"use client";

import React, { useState } from "react";
import { 
  Upload, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText, 
  ArrowRight, 
  Layers, 
  BarChart2, 
  Activity, 
  Scale, 
  Info, 
  Sparkles,
  SlidersHorizontal,
  PieChart,
  BookOpen
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";

export type StatementType = "DRE" | "DFC" | "BP" | "DRA" | "DMPL" | "DVA" | "NE" | "ALL";

export interface UploadProgressState {
  status: "idle" | "uploading" | "extracting" | "compiling" | "completed" | "error";
  percent: number;
  message: string;
}

interface IngestionPanelProps {
  onUploadSuccess?: (targetMode?: "DRE" | "DFC" | "BP" | "DRA" | "DMPL" | "DVA" | "NE" | "PLANNING") => void;
  onUploadProgress?: (progress: UploadProgressState) => void;
}

export default function IngestionPanel({ onUploadSuccess, onUploadProgress }: IngestionPanelProps) {
  const { theme, language, apiBaseUrl } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [statementType, setStatementType] = useState<StatementType>("ALL");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [details, setDetails] = useState<{ rows?: number; columns?: number; filename?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("");
      setUploadSuccess(false);
      setDetails(null);
    }
  };

  const handleUploadFile = async () => {
    if (!file) return;
    setUploadLoading(true);
    setUploadStatus("");
    setUploadSuccess(false);

    onUploadProgress?.({
      status: "uploading",
      percent: 25,
      message: isEn 
        ? `Uploading ${file.name} to calculation engine...` 
        : `Enviando ${file.name} ao motor de cálculo...`
    });

    const timer1 = setTimeout(() => {
      onUploadProgress?.({
        status: "extracting",
        percent: 50,
        message: isEn 
          ? "Extracting accounting lines, OCR & standardizing accounts..." 
          : "Extraindo rubricas contábeis, OCR e padronização das contas CVM..."
      });
    }, 700);

    const timer2 = setTimeout(() => {
      onUploadProgress?.({
        status: "compiling",
        percent: 75,
        message: isEn 
          ? "Compiling topological DAG & propagating Hyperblock formulas..." 
          : "Compilando Grafo DAG topológico e propagando fórmulas nos Hyperblocks..."
      });
    }, 1600);

    try {
      const formData = new FormData();
      formData.append("file", file);

      let endpoint = `${apiBaseUrl}/api/upload-dre`;
      if (statementType === "DFC") {
        endpoint = `${apiBaseUrl}/api/upload-dfc`;
      } else if (statementType === "BP") {
        endpoint = `${apiBaseUrl}/api/upload-bp`;
      } else if (statementType === "DRA") {
        endpoint = `${apiBaseUrl}/api/upload-dra`;
      } else if (statementType === "DMPL") {
        endpoint = `${apiBaseUrl}/api/upload-dmpl`;
      } else if (statementType === "DVA") {
        endpoint = `${apiBaseUrl}/api/upload-dva`;
      } else if (statementType === "NE") {
        endpoint = `${apiBaseUrl}/api/upload-ne`;
      } else if (statementType === "ALL") {
        endpoint = `${apiBaseUrl}/api/upload-all`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res.ok) {
        setUploadSuccess(true);
        const stLabel = getStatementTitle();

        setUploadStatus(
          isEn
            ? `${stLabel} processed successfully! (${data.rows || 3} periods imported).`
            : `${stLabel} processada com sucesso! (${data.rows || 3} períodos importados).`
        );
        setDetails({
          rows: data.rows,
          columns: data.columns,
          filename: file.name,
        });

        onUploadProgress?.({
          status: "completed",
          percent: 100,
          message: isEn 
            ? "Execution complete! All statements and pages fully populated." 
            : "Execução concluída! Todas as demonstrações e páginas preenchidas."
        });

        setFile(null);
        if (onUploadSuccess) {
          if (statementType === "BP") {
            onUploadSuccess("BP");
          } else if (statementType === "DFC") {
            onUploadSuccess("DFC");
          } else if (statementType === "DRA") {
            onUploadSuccess("DRA");
          } else if (statementType === "DMPL") {
            onUploadSuccess("DMPL");
          } else if (statementType === "DVA") {
            onUploadSuccess("DVA");
          } else if (statementType === "NE") {
            onUploadSuccess("NE");
          } else if (statementType === "ALL") {
            onUploadSuccess("PLANNING");
          } else {
            onUploadSuccess("DRE");
          }
        }
      } else {
        onUploadProgress?.({
          status: "error",
          percent: 0,
          message: isEn ? `Error: ${data.detail || "Failed to process file."}` : `Erro: ${data.detail || "Falha no processamento do arquivo."}`
        });
        setUploadStatus(
          isEn
            ? `Error: ${data.detail || "Failed to process file."}`
            : `Erro: ${data.detail || "Falha no processamento do arquivo."}`
        );
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error(err);
      onUploadProgress?.({
        status: "error",
        percent: 0,
        message: isEn ? "Error connecting to backend for upload." : "Erro ao conectar com o backend para upload."
      });
      setUploadStatus(
        isEn
          ? "Error connecting to backend for upload."
          : "Erro ao conectar com o backend para upload."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatementTitle = () => {
    switch (statementType) {
      case "DRE":
        return isEn ? "Income Statement (DRE)" : "DRE (Resultado)";
      case "DFC":
        return isEn ? "Cash Flow (DFC)" : "DFC (Fluxo de Caixa)";
      case "BP":
        return isEn ? "Balance Sheet (BP)" : "BP (Balanço Patrimonial)";
      case "DRA":
        return isEn ? "Comprehensive Income (DRA)" : "DRA (Resultado Abrangente)";
      case "DMPL":
        return isEn ? "Changes in Equity (DMPL)" : "DMPL (Mutações do PL)";
      case "DVA":
        return isEn ? "Added Value (DVA)" : "DVA (Valor Adicionado)";
      case "NE":
        return isEn ? "Explanatory Notes (NE)" : "NE (Notas Explicativas)";
      case "ALL":
        return isEn ? "All Statements (CVM Package)" : "Todas as Demonstrações (Pacote CVM)";
    }
  };

  const getDropzoneLabel = () => {
    if (file) return file.name;
    switch (statementType) {
      case "DRE":
        return isEn ? "Click or drag the Income Statement (DRE) file here" : "Clique ou arraste o arquivo DRE (Resultado)";
      case "DFC":
        return isEn ? "Click or drag the Cash Flow (DFC) file here" : "Clique ou arraste o arquivo DFC (Fluxo de Caixa)";
      case "BP":
        return isEn ? "Click or drag the Balance Sheet (BP) file here" : "Clique ou arraste o arquivo do Balanço Patrimonial (BP)";
      case "DRA":
        return isEn ? "Click or drag the Comprehensive Income (DRA) file here" : "Clique ou arraste o arquivo da DRA (Resultado Abrangente)";
      case "DMPL":
        return isEn ? "Click or drag the Changes in Equity (DMPL) file here" : "Clique ou arraste o arquivo da DMPL (Mutações do PL)";
      case "DVA":
        return isEn ? "Click or drag the Added Value (DVA) file here" : "Clique ou arraste o arquivo da DVA (Valor Adicionado)";
      case "NE":
        return isEn ? "Click or drag the Explanatory Notes (NE) file here" : "Clique ou arraste o arquivo de Notas Explicativas (NE)";
      case "ALL":
        return isEn ? "Click or drag the consolidated package (All Statements DFP/ITR)" : "Clique ou arraste o arquivo com Todas as Demonstrações (DFP/ITR CVM)";
    }
  };

  const statementOptions: Array<{
    id: StatementType;
    label: string;
    sublabel: string;
    icon: any;
    badge?: string;
  }> = [
    {
      id: "ALL",
      label: isEn ? "All Statements (CVM Package)" : "Pacote Completo CVM",
      sublabel: isEn ? "All 7 Statements (DFP / ITR)" : "Todas as 7 Demonstrações (DFP/ITR)",
      icon: Sparkles,
      badge: isEn ? "Recommended" : "Recomendado"
    },
    {
      id: "DRE",
      label: isEn ? "DRE (Income Statement)" : "DRE (Resultado do Exercício)",
      sublabel: isEn ? "Revenues, Costs, Margins & Net Income" : "Receitas, Custos, Margens e Lucro",
      icon: BarChart2
    },
    {
      id: "DFC",
      label: isEn ? "DFC (Cash Flow Statement)" : "DFC (Fluxo de Caixa)",
      sublabel: isEn ? "Operating, Investing & Financing Cash Flow" : "Atividades Operacionais, Investimento e Financiamento",
      icon: Activity
    },
    {
      id: "BP",
      label: isEn ? "BP (Balance Sheet)" : "BP (Balanço Patrimonial)",
      sublabel: isEn ? "Assets, Liabilities & Shareholders' Equity" : "Ativo Circulante, Passivo e Patrimônio Líquido",
      icon: Scale
    },
    {
      id: "DRA",
      label: isEn ? "DRA (Comprehensive Income)" : "DRA (Resultado Abrangente)",
      sublabel: isEn ? "CPC 26 • Equity Valuation & Cash Flow Hedge" : "CPC 26 • Ajustes de Avaliação Patrimonial e Hedge",
      icon: FileSpreadsheet
    },
    {
      id: "DMPL",
      label: isEn ? "DMPL (Changes in Equity)" : "DMPL (Mutações do Patrimônio Líquido)",
      sublabel: isEn ? "Art. 186 Lei 6.404 • Profit & Capital Reserves" : "Art. 186 Lei 6.404 • Reservas de Lucro e Capital",
      icon: SlidersHorizontal
    },
    {
      id: "DVA",
      label: isEn ? "DVA (Value Added Statement)" : "DVA (Valor Adicionado)",
      sublabel: isEn ? "CPC 09 • Wealth Generation & Distribution" : "CPC 09 • Geração e Distribuição de Riqueza",
      icon: PieChart
    },
    {
      id: "NE",
      label: isEn ? "NE (Explanatory Notes)" : "NE (Notas Explicativas)",
      sublabel: isEn ? "Accounting Policies, Debentures & Covenants" : "Políticas Contábeis, Debêntures e Covenants",
      icon: BookOpen
    }
  ];

  return (
    <div className={`${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"} border rounded-xl p-6 flex flex-col justify-between h-full space-y-6 transition`}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-anaplan-coral">
            <FileSpreadsheet className="w-4 h-4 text-anaplan-coral" />
            <span>{isEn ? "Financial Statement Ingestion" : "Ingestão de Demonstrações Contábeis"}</span>
          </div>
          <span className={`text-[10.5px] px-2 py-0.5 rounded font-mono ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>
            PDF / Excel / CSV / ZIP
          </span>
        </div>

        {/* Statement Selector (All 8 possibilities per CVM requirements) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className={`block text-xs font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              {isEn ? "Select Statement to Ingest:" : "Selecione a Demonstração para Ingestão:"}
            </label>
            <span className={`text-[11px] font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              8 opções disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {statementOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = statementType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setStatementType(opt.id);
                    setUploadStatus("");
                    setUploadSuccess(false);
                  }}
                  className={`p-3 sm:p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer min-h-[86px] ${
                    isSelected
                      ? "border-anaplan-coral bg-anaplan-coral/10 text-anaplan-coral shadow-sm ring-1 ring-anaplan-coral/40"
                      : isDark
                      ? "border-slate-800 bg-slate-800/60 text-slate-200 hover:text-white hover:bg-slate-800"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="w-full space-y-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${
                          isSelected
                            ? "text-anaplan-coral"
                            : opt.id === "ALL"
                            ? "text-emerald-400"
                            : isDark
                            ? "text-slate-300"
                            : "text-slate-600"
                        }`} />
                        <span className={`font-bold text-xs sm:text-[12.5px] leading-tight ${
                          isSelected
                            ? "text-anaplan-coral"
                            : isDark
                            ? "text-white"
                            : "text-slate-900"
                        }`}>
                          {opt.label}
                        </span>
                      </div>
                      {opt.badge && (
                        <span className="text-[9.5px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30 flex-shrink-0 uppercase tracking-wide">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-snug font-medium ${
                      isSelected
                        ? "text-anaplan-coral/90"
                        : isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}>
                      {opt.sublabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className={`p-4 rounded-xl border border-dashed transition ${
          file
            ? "border-anaplan-coral bg-anaplan-coral/5"
            : isDark
            ? "border-slate-700 hover:border-slate-500 bg-slate-800/40"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/70"
        }`}>
          <input
            type="file"
            accept=".pdf,.xlsx,.xls,.csv,.txt,.zip"
            onChange={handleFileChange}
            className="hidden"
            id="overview-file-upload"
          />
          <label htmlFor="overview-file-upload" className="cursor-pointer flex flex-col items-center justify-center text-center space-y-2 py-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              file
                ? "bg-anaplan-coral/20 text-anaplan-coral"
                : isDark ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"
            }`}>
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                {getDropzoneLabel()}
              </p>
              <p className={`text-[11px] mt-0.5 font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                {statementType === "ALL"
                  ? (isEn ? "Supports files or packages in .pdf, .xlsx, .xls, .csv, or .zip" : "Suporta arquivos ou pacotes em .pdf, .xlsx, .xls, .csv ou .zip")
                  : (isEn ? "Supports statements in .pdf, .xlsx, .xls, .csv, or .txt" : "Suporta Demonstrações em .pdf, .xlsx, .xls, .csv ou .txt")}
              </p>
            </div>
          </label>

          {file && (
            <div className="pt-3 border-t border-slate-700/40 flex items-center justify-between">
              <span className={`text-[11px] font-mono font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                onClick={handleUploadFile}
                disabled={uploadLoading}
                className="px-4 py-2 rounded-lg bg-anaplan-coral hover:bg-[#e03e22] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {uploadLoading
                    ? isEn ? "Processing and Compiling DAG..." : "Processando e Compilando DAG..."
                    : isEn ? `Import ${getStatementTitle()}` : `Importar ${statementType === 'ALL' ? 'Todas' : statementType}`}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Upload Status Feedback */}
        {uploadStatus && (
          <div className={`text-xs p-3 rounded-lg border flex items-start gap-2 ${
            uploadSuccess
              ? "bg-emerald-950/50 border-emerald-700 text-emerald-200 font-medium"
              : "bg-rose-950/50 border-rose-700 text-rose-200 font-medium"
          }`}>
            {uploadSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : <Info className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <p className="font-bold">{uploadStatus}</p>
              {details && (
                <p className="text-[11px] opacity-90 font-medium">
                  {isEn
                    ? `File: ${details.filename} • ${details.rows} periods • ${details.columns} accounts mapped`
                    : `Arquivo: ${details.filename} • ${details.rows} períodos • ${details.columns} contas mapeadas`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ingestion Info */}
      <div className={`p-3.5 rounded-lg border text-[11px] flex items-start gap-2 leading-relaxed ${
        isDark ? "bg-slate-800/50 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700 font-medium"
      }`}>
        <Info className="w-4 h-4 text-anaplan-coral flex-shrink-0 mt-0.5" />
        <span className="font-medium">
          {isEn
            ? "The file will be structured in vectorized memory (Polars + DuckDB) and compiled into the corresponding DAG graph for connected planning and analysis."
            : "O arquivo é processado e estruturado na memória vetorizada (Polars + DuckDB) e compilado no Grafo DAG para alimentar todas as páginas do HyperCube."}
        </span>
      </div>
    </div>
  );
}
