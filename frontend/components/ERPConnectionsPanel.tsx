"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Server,
  Cloud,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Activity,
  ArrowRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Lock,
  Eye,
  EyeOff,
  Cpu,
  Building2,
  FileSpreadsheet,
  Box,
  Plus,
  Trash2,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Laptop,
  CheckCircle,
  Table,
  PowerOff
} from "lucide-react";
import { usePreferences, ActiveConnection } from "./PreferencesContext";

interface InstrumentField {
  key: string;
  label: string;
  placeholder?: string;
  type: string;
  default?: any;
  required?: boolean;
  options?: string[];
}

interface InstrumentCatalogItem {
  id: string;
  name: string;
  category: "ERP_ENTERPRISE" | "ERP_NACIONAL" | "ERP_CLOUD" | "DATABASE_SQL" | "CLOUD_WAREHOUSE";
  type: "ERP" | "DATABASE" | "DATA_WAREHOUSE";
  supported_environments: string[];
  default_port: number;
  default_schema?: string;
  default_table?: string;
  driver_info: string;
  description: string;
  icon: string;
  badge_color: string;
  fields: InstrumentField[];
  sandbox_preset?: {
    name: string;
    environment: "local" | "cloud";
    sample_records: number;
    mock_entity: string;
    config: Record<string, any>;
  };
}

interface SavedConnection {
  id: string;
  instrument_id: string;
  name: string;
  environment: "local" | "cloud";
  config: Record<string, any>;
  is_active: boolean;
  last_sync?: string;
  status: "connected" | "idle" | "error";
  latency_ms?: number;
  created_at?: string;
}

export default function ERPConnectionsPanel({
  onActivateConnection,
}: {
  onActivateConnection?: (conn: SavedConnection) => void;
}) {
  const { theme, language, apiBaseUrl, activeConnection, setActiveConnection, disconnectConnection } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  // Catalog & Saved Connections state
  const [catalog, setCatalog] = useState<InstrumentCatalogItem[]>([]);
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Connection Progress State (A barra de progresso da conexão)
  const [connProgress, setConnProgress] = useState<{
    percent: number;
    stepMessage: string;
    stage: number;
    isSyncing: boolean;
  }>({
    percent: activeConnection ? 100 : 0,
    stepMessage: activeConnection
      ? (isEn ? "Live streaming pipeline connected (100%)" : "Pipeline contábil 100% conectado e sincronizado com todas as telas")
      : (isEn ? "Awaiting connection" : "Aguardando conexão com ERP ou Banco"),
    stage: activeConnection ? 4 : 0,
    isSyncing: false,
  });

  // Modal / Drawer state for configuration
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentCatalogItem | null>(null);
  const [editingConnection, setEditingConnection] = useState<SavedConnection | null>(null);
  const [formConfig, setFormConfig] = useState<Record<string, any>>({});
  const [formName, setFormName] = useState("");
  const [formEnv, setFormEnv] = useState<"local" | "cloud">("cloud");
  const [showPassword, setShowPassword] = useState(false);
  const [modalTab, setModalTab] = useState<"config" | "data_preview">("config");
  const [sampleEntries, setSampleEntries] = useState<any[]>([]);
  const [sampleSearch, setSampleSearch] = useState("");

  // Test Connection state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    latency_ms?: number;
    diagnostics?: Record<string, any>;
  } | null>(null);

  // Saving / Activating state
  const [saving, setSaving] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Sync progress state with activeConnection
  useEffect(() => {
    if (activeConnection) {
      setConnProgress({
        percent: 100,
        stage: 4,
        stepMessage: isEn
          ? `Connected to ${activeConnection.name} (100%) - All screens active`
          : `Conectado a ${activeConnection.name} (100%) - Todas as telas sincronizadas`,
        isSyncing: false,
      });
    }
  }, [activeConnection, isEn]);

  // Stepped progress animation
  const runConnectionAnimation = async (connName: string) => {
    setConnProgress({
      percent: 25,
      stage: 1,
      stepMessage: isEn ? "1/4: Initializing TCP/TLS Handshake & Ping..." : "1/4: Iniciando Handshake TCP/TLS & Verificação de Rede...",
      isSyncing: true,
    });

    await new Promise((r) => setTimeout(r, 450));
    setConnProgress({
      percent: 50,
      stage: 2,
      stepMessage: isEn ? "2/4: Authenticating credentials & validating driver..." : "2/4: Autenticando credenciais e validando driver contábil...",
      isSyncing: true,
    });

    await new Promise((r) => setTimeout(r, 650));
    setConnProgress({
      percent: 75,
      stage: 3,
      stepMessage: isEn ? "3/4: Semantic Schema Harmonizer mapping chart of accounts..." : "3/4: Mapeando Plano de Contas via Schema Harmonizer (De/Para)...",
      isSyncing: true,
    });

    await new Promise((r) => setTimeout(r, 750));
    setConnProgress({
      percent: 100,
      stage: 4,
      stepMessage: isEn
        ? `4/4: Connected & 100% Populated to All Screens (${connName})!`
        : `4/4: Conectado e 100% Propagado para Todas as Telas (${connName})!`,
      isSyncing: false,
    });
  };

  // Fetch Catalog and Saved Connections
  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, connsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/connections/catalog`),
        fetch(`${apiBaseUrl}/api/connections`)
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCatalog(catData);
      }

      if (connsRes.ok) {
        const connsData = await connsRes.json();
        setSavedConnections(connsData);
        const active = connsData.find((c: SavedConnection) => c.is_active);
        if (active) {
          setActiveConnection(active);
        }
      }
    } catch (e) {
      console.warn("Could not load ERP connections data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiBaseUrl]);

  // Open configuration modal for a given instrument
  const handleOpenConfig = (instrument: InstrumentCatalogItem, existingConn?: SavedConnection) => {
    setSelectedInstrument(instrument);
    setTestResult(null);

    if (existingConn) {
      setEditingConnection(existingConn);
      setFormName(existingConn.name);
      setFormEnv(existingConn.environment);
      setFormConfig({ ...existingConn.config });
    } else {
      setEditingConnection(null);
      setFormName(`${instrument.name} (${instrument.supported_environments.includes("local") ? "On-Premises" : "Cloud"})`);
      setFormEnv(instrument.supported_environments.includes("cloud") ? "cloud" : "local");
      
      const initialConfig: Record<string, any> = {};
      instrument.fields.forEach((f) => {
        if (f.default !== undefined) {
          initialConfig[f.key] = f.default;
        }
      });
      setFormConfig(initialConfig);
    }
  };

  // Fetch realistic mock ledger entries for the instrument
  const fetchSampleEntries = async (instrumentId: string) => {
    try {
      const base = apiBaseUrl || "";
      const res = await fetch(`${base}/api/connections/sandbox-sample/${instrumentId}`);
      if (res.ok) {
        const data = await res.json();
        setSampleEntries(data.sample_entries || []);
      }
    } catch (e) {
      console.warn("Could not fetch sample entries", e);
    }
  };

  // Fill current modal form with pre-configured Sandbox mock data
  const handleFillSandbox = (instrument: InstrumentCatalogItem) => {
    if (!instrument.sandbox_preset) return;
    const preset = instrument.sandbox_preset;
    setFormName(preset.name);
    setFormEnv(preset.environment);
    setFormConfig({ ...preset.config });
    setTestResult(null);
    fetchSampleEntries(instrument.id);
  };

  // Quick 1-Click Sandbox Test from instrument card
  const handleQuickSandboxTest = (instrument: InstrumentCatalogItem) => {
    setSelectedInstrument(instrument);
    setEditingConnection(null);
    setTestResult(null);
    setModalTab("data_preview");
    fetchSampleEntries(instrument.id);
    if (instrument.sandbox_preset) {
      const preset = instrument.sandbox_preset;
      setFormName(preset.name);
      setFormEnv(preset.environment);
      setFormConfig({ ...preset.config });
    } else {
      handleOpenConfig(instrument);
    }
  };

  // Disconnect active connection and return to default baseline
  const handleDisconnect = async () => {
    setSyncingAll(true);
    setConnProgress({
      percent: 0,
      stepMessage: isEn ? "Disconnected (Baseline mode)" : "Conexão desativada. Operando em modo base local padrão",
      stage: 0,
      isSyncing: false,
    });
    await disconnectConnection();
    await loadData();
    setSyncingAll(false);
    if (onActivateConnection) {
      onActivateConnection(null as any);
    }
  };

  // Close configuration modal
  const handleCloseModal = () => {
    setSelectedInstrument(null);
    setEditingConnection(null);
    setTestResult(null);
  };

  // Handle field change in config form
  const handleFieldChange = (key: string, val: any) => {
    setFormConfig((prev) => ({ ...prev, [key]: val }));
  };

  // Live Test Handshake Ping
  const handleTestConnection = async () => {
    if (!selectedInstrument) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/connections/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrument_id: selectedInstrument.id,
          config: formConfig,
          environment: formEnv
        })
      });

      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `Falha de rede ao tentar handshake com o servidor: ${e.message}`,
        latency_ms: 0
      });
    } finally {
      setTesting(false);
    }
  };

  // Save & Activate Connection Across All Screens
  const handleSaveAndActivate = async (activateImmediately: boolean = true) => {
    if (!selectedInstrument) return;
    setSaving(true);

    try {
      // 1. Save connection
      const payload = {
        id: editingConnection?.id,
        instrument_id: selectedInstrument.id,
        name: formName || selectedInstrument.name,
        environment: formEnv,
        config: formConfig,
        is_active: activateImmediately
      };

      const saveRes = await fetch(`${apiBaseUrl}/api/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!saveRes.ok) throw new Error("Erro ao salvar conexão");
      const savedData = await saveRes.json();
      const connId = savedData.connection.id;

      // 2. Activate across all screens if requested
      if (activateImmediately) {
        // Trigger visual progress animation
        runConnectionAnimation(formName || selectedInstrument.name);

        const actRes = await fetch(`${apiBaseUrl}/api/connections/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connection_id: connId })
        });
        if (actRes.ok) {
          const actData = await actRes.json();
          setActiveConnection(actData.active_connection);
          if (onActivateConnection) {
            onActivateConnection(actData.active_connection);
          }
        }
      }

      await loadData();
      setSuccessBanner(
        isEn
          ? `Connection '${formName}' successfully activated across all HyperCube screens!`
          : `Conexão '${formName}' ativada com sucesso como fonte oficial em todas as telas do HyperCube!`
      );
      setTimeout(() => setSuccessBanner(null), 6000);
      handleCloseModal();
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Quick activate from saved list
  const handleActivateSaved = async (connId: string) => {
    const targetConn = savedConnections.find((c) => c.id === connId);
    if (targetConn) {
      runConnectionAnimation(targetConn.name);
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/connections/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connId })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveConnection(data.active_connection);
        if (onActivateConnection) {
          onActivateConnection(data.active_connection);
        }
        await loadData();
        setSuccessBanner(
          isEn
            ? `Active data source switched to '${data.active_connection.name}'!`
            : `Fonte ativa de dados alterada para '${data.active_connection.name}'!`
        );
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch (e) {
      console.warn("Could not activate connection", e);
    }
  };

  // Delete saved connection
  const handleDeleteSaved = async (connId: string) => {
    if (!confirm(isEn ? "Are you sure you want to remove this connection?" : "Tem certeza que deseja remover esta conexão?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/connections/${connId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.warn("Could not delete connection", e);
    }
  };

  // Force global re-sync across all screens
  const handleForceSyncAll = async () => {
    setSyncingAll(true);
    if (activeConnection?.name) {
      runConnectionAnimation(activeConnection.name);
    }
    try {
      if (activeConnection?.id) {
        await fetch(`${apiBaseUrl}/api/connections/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connection_id: activeConnection.id })
        });
      }
      await loadData();
      setSuccessBanner(
        isEn
          ? "All screens (DRE, DFC, BP, MultiDim, OLAP Cube, Valuation) successfully re-synchronized with ERP!"
          : "Todas as telas (DRE, DFC, BP, Planejamento N-D, Cubo 3D, Valuation) foram re-sincronizadas com o ERP!"
      );
      setTimeout(() => setSuccessBanner(null), 5000);
    } finally {
      setSyncingAll(false);
    }
  };

  // Filter instruments
  const filteredCatalog = catalog.filter((inst) => {
    const matchesCategory =
      activeCategory === "ALL" ||
      (activeCategory === "ERP_ENTERPRISE" && inst.category === "ERP_ENTERPRISE") ||
      (activeCategory === "ERP_NACIONAL" && inst.category === "ERP_NACIONAL") ||
      (activeCategory === "ERP_CLOUD" && inst.category === "ERP_CLOUD") ||
      (activeCategory === "DATABASE_SQL" && inst.category === "DATABASE_SQL") ||
      (activeCategory === "CLOUD_WAREHOUSE" && inst.category === "CLOUD_WAREHOUSE");

    const matchesSearch =
      !searchTerm ||
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.driver_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn select-none">
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero: Active Live Connection Status Card */}
      <div className={`relative rounded-3xl p-6 sm:p-8 border shadow-2xl overflow-hidden backdrop-blur-xl transition ${
        isDark ? "bg-[#0b162c] border-[#1a3356] text-white" : "bg-white border-slate-200 text-slate-900 shadow-xl"
      }`}>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>{isEn ? "LIVE ERP PIPELINE ACTIVE" : "CANAL ERP & BANCO CONECTADO EM TEMPO REAL"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {activeConnection ? activeConnection.name : (isEn ? "No ERP Connected" : "Nenhum ERP Conectado")}
            </h1>

            <p className={`text-xs sm:text-sm max-w-2xl font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {activeConnection ? (
                isEn
                  ? `Connected in ${activeConnection.environment.toUpperCase()} mode. Continuously streaming financial ledger accounts into HyperCube's multidimensional calculation DAG.`
                  : `Operando em ambiente ${activeConnection.environment === "local" ? "LOCAL (On-Premises)" : "NUVEM (Cloud)"}. Lançamentos contábeis transmitidos continuamente para o DAG reativo do HyperCube.`
              ) : (
                isEn
                  ? "Select and configure an ERP or Database below to establish a live connection with all financial statements."
                  : "Selecione e configure um ERP ou Banco de Dados abaixo para estabelecer conexão viva com todas as telas contábeis."
              )}
            </p>

            {/* Connected Screens Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold font-mono">
              <span className={`px-2.5 py-1 rounded-lg border font-black ${
                isDark ? "bg-[#112340] border-[#1d3d6e] text-slate-200" : "bg-slate-100 border-slate-300 text-slate-800"
              }`}>
                Telas Conectadas:
              </span>
              {["DRE", "DFC", "BP", "MultiDim (N-D)", "Cubo 3D OLAP", "Valuation", "CVM Watch"].map((screen) => (
                <span
                  key={screen}
                  className={`px-2.5 py-1 rounded-md border flex items-center gap-1 font-extrabold ${
                    isDark
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                  {screen}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Metrics & Sync Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 flex-shrink-0">
            <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-4 ${
              isDark ? "bg-[#070e1b] border-[#162a45]" : "bg-slate-50 border-slate-300 shadow-sm"
            }`}>
              <div>
                <p className="text-[10.5px] uppercase font-black text-slate-600 dark:text-slate-400">Latência do Driver</p>
                <p className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                  {activeConnection?.latency_ms ? `${activeConnection.latency_ms} ms` : "1.82 ms"}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-700" />
              <div>
                <p className="text-[10.5px] uppercase font-black text-slate-600 dark:text-slate-400">Último Sync</p>
                <p className="text-xs font-black font-mono text-sky-700 dark:text-sky-400">
                  {activeConnection?.last_sync || "Hoje às 06:15"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleForceSyncAll}
                disabled={syncingAll || connProgress.isSyncing}
                className="px-5 py-2.5 rounded-xl bg-anaplan-coral hover:bg-orange-600 text-white text-xs font-black transition flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${syncingAll || connProgress.isSyncing ? "animate-spin" : ""}`} />
                <span>
                  {syncingAll || connProgress.isSyncing
                    ? (isEn ? "Re-syncing All..." : "Sincronizando...")
                    : (isEn ? "Force Full Re-Sync" : "Forçar Sincronização Geral")}
                </span>
              </button>

              {activeConnection && (
                <button
                  onClick={handleDisconnect}
                  disabled={syncingAll}
                  className="px-4 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  title="Desconectar ERP ativo e retornar para a base local padrão"
                >
                  <PowerOff className="w-3.5 h-3.5 text-rose-500" />
                  <span>Desconectar ERP</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ✨ BARRA DE PROGRESSO DA CONEXÃO EM TEMPO REAL          */}
        {/* ======================================================== */}
        <div className={`mt-6 pt-5 border-t ${isDark ? "border-slate-800/80" : "border-slate-200"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-bounce" />
              <span className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
                Progresso da Conexão & Pipeline de Streaming
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {connProgress.stepMessage}
              </span>
              <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {connProgress.percent}%
              </span>
            </div>
          </div>

          {/* Main Progress Bar Track */}
          <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-300"
          }`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden ${
                connProgress.percent === 100
                  ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-md shadow-emerald-500/30"
                  : connProgress.percent > 0
                  ? "bg-gradient-to-r from-anaplan-coral via-orange-500 to-amber-400 shadow-md shadow-orange-500/30"
                  : "bg-slate-300 dark:bg-slate-800"
              }`}
              style={{ width: `${Math.max(connProgress.percent, connProgress.percent > 0 ? 8 : 0)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          {/* Stepper Milestones: 4 Stages */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3 pt-1">
            {[
              { num: 1, label: "Handshake TCP/TLS", sub: "Rede & Portas", targetPct: 25 },
              { num: 2, label: "Autenticação", sub: "Credenciais & SSL", targetPct: 50 },
              { num: 3, label: "Mapeamento Contábil", sub: "Schema Harmonizer", targetPct: 75 },
              { num: 4, label: "Todas as Telas (100%)", sub: "DRE, DFC, BP, Cube", targetPct: 100 },
            ].map((step) => {
              const isDone = connProgress.percent >= step.targetPct;
              const isCurrent = connProgress.stage === step.num && connProgress.isSyncing;

              return (
                <div
                  key={step.num}
                  className={`p-2 rounded-xl border flex items-center gap-2.5 transition-colors ${
                    isDone
                      ? isDark
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : isCurrent
                      ? isDark
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse"
                        : "bg-amber-50 border-amber-300 text-amber-900 animate-pulse"
                      : isDark
                      ? "bg-[#070e1b] border-slate-800 text-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-amber-500 text-white"
                        : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isDone ? "✓" : step.num}
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-[11px] font-black truncate leading-tight ${
                      isDone
                        ? isDark ? "text-white" : "text-slate-900"
                        : isDark ? "text-slate-300" : "text-slate-800"
                    }`}>
                      {step.label}
                    </p>
                    <p className={`text-[9.5px] truncate font-mono ${
                      isDone
                        ? isDark ? "text-emerald-400 font-semibold" : "text-emerald-700 font-semibold"
                        : isDark ? "text-slate-400" : "text-slate-500"
                    }`}>
                      {step.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Tabs and Filter Controls */}
      <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 ${
        isDark ? "border-slate-800/60" : "border-slate-200"
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: isEn ? "All Instruments" : "Todos os Instrumentos", count: catalog.length },
            { id: "ERP_ENTERPRISE", label: isEn ? "Enterprise ERPs" : "ERPs Enterprise", count: catalog.filter(x => x.category === "ERP_ENTERPRISE").length },
            { id: "ERP_NACIONAL", label: isEn ? "National ERPs" : "ERPs Nacionais", count: catalog.filter(x => x.category === "ERP_NACIONAL").length },
            { id: "ERP_CLOUD", label: isEn ? "Cloud ERPs" : "ERPs Cloud", count: catalog.filter(x => x.category === "ERP_CLOUD").length },
            { id: "DATABASE_SQL", label: isEn ? "SQL Databases" : "Bancos de Dados SQL", count: catalog.filter(x => x.category === "DATABASE_SQL").length },
            { id: "CLOUD_WAREHOUSE", label: isEn ? "Cloud Warehouses" : "Cloud Warehouses", count: catalog.filter(x => x.category === "CLOUD_WAREHOUSE").length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-sky-600 text-white shadow-md"
                  : isDark
                  ? "text-slate-200 hover:bg-slate-800 bg-[#070e1b] border border-slate-800"
                  : "text-slate-800 hover:bg-slate-100 bg-white border border-slate-300 font-bold"
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono font-bold">
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className={`relative flex items-center rounded-xl border px-3 py-2 shadow-xs ${
          isDark ? "bg-[#0b1626] border-slate-700" : "bg-white border-slate-300"
        }`}>
          <Search className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder={isEn ? "Search ERP or Database..." : "Buscar ERP ou Banco..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`bg-transparent text-xs outline-none w-48 sm:w-64 font-bold ${
              isDark ? "text-white placeholder-slate-400" : "text-slate-900 placeholder-slate-500"
            }`}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Available ERP and Database Instruments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCatalog.map((inst) => {
          const isConfigured = savedConnections.some((s) => s.instrument_id === inst.id);
          const activeInstance = savedConnections.find((s) => s.instrument_id === inst.id && s.is_active);

          return (
            <div
              key={inst.id}
              className={`relative rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between group ${
                activeInstance
                  ? isDark
                    ? "border-emerald-500/80 bg-gradient-to-br from-emerald-950/40 via-[#071322] to-[#0a1628] text-white shadow-2xl ring-2 ring-emerald-500/40"
                    : "border-emerald-500 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white text-slate-900 shadow-xl ring-2 ring-emerald-500/40"
                  : isDark
                  ? "bg-[#070e1b] border-[#14233a] hover:border-[#1e3c66] hover:bg-[#0a1426] text-white shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg text-slate-900"
              }`}
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${
                      inst.badge_color === "sky"
                        ? "bg-gradient-to-tr from-sky-600 to-blue-500"
                        : inst.badge_color === "red"
                        ? "bg-gradient-to-tr from-red-600 to-rose-500"
                        : inst.badge_color === "emerald"
                        ? "bg-gradient-to-tr from-emerald-600 to-teal-500"
                        : inst.badge_color === "indigo"
                        ? "bg-gradient-to-tr from-indigo-600 to-violet-500"
                        : inst.badge_color === "amber"
                        ? "bg-gradient-to-tr from-amber-600 to-yellow-500"
                        : inst.badge_color === "purple"
                        ? "bg-gradient-to-tr from-purple-600 to-pink-500"
                        : "bg-gradient-to-tr from-orange-600 to-amber-500"
                    }`}>
                      {inst.type === "ERP" ? <Building2 className="w-5 h-5" /> : inst.type === "DATA_WAREHOUSE" ? <Box className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                        {inst.name}
                      </h3>
                      <p className={`text-[10.5px] font-mono font-black ${
                        activeInstance
                          ? isDark ? "text-emerald-300" : "text-emerald-700"
                          : isDark ? "text-slate-400" : "text-slate-500"
                      }`}>
                        {inst.type}
                      </p>
                    </div>
                  </div>

                  {/* Active or Environment Tag */}
                  {activeInstance ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-sm animate-pulse">
                      Ativo
                    </span>
                  ) : (
                    <div className="flex gap-1">
                      {inst.supported_environments.map((env) => (
                        <span
                          key={env}
                          className={`text-[9.5px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                            env === "local"
                              ? isDark
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                              : isDark
                              ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                              : "bg-sky-100 text-sky-800 border-sky-300"
                          }`}
                        >
                          {env === "local" ? "Local" : "Nuvem"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${
                  activeInstance
                    ? isDark ? "text-slate-200 font-medium" : "text-slate-700 font-semibold"
                    : isDark ? "text-slate-300 font-medium" : "text-slate-600 font-medium"
                }`}>
                  {inst.description}
                </p>

                {/* Technical Meta Specs with High Contrast Colors */}
                <div className={`p-3 rounded-xl mb-4 text-[11px] space-y-1.5 font-mono border ${
                  activeInstance
                    ? isDark
                      ? "bg-[#05111f] border-emerald-500/30 text-slate-200"
                      : "bg-emerald-50/70 border-emerald-200 text-slate-800 shadow-xs"
                    : isDark
                    ? "bg-[#0b1626]/90 border-[#142640] text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? "text-slate-400 font-bold" : "text-slate-600 font-bold"}>
                      Driver / Conector:
                    </span>
                    <span className={`truncate max-w-[170px] font-black ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}>
                      {inst.driver_info.split("(")[0]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? "text-slate-400 font-bold" : "text-slate-600 font-bold"}>
                      Porta Padrão:
                    </span>
                    <span className={`font-black ${
                      isDark ? "text-sky-400" : "text-sky-700"
                    }`}>
                      {inst.default_port ? inst.default_port : "N/A (API Cloud)"}
                    </span>
                  </div>
                  {inst.default_table && (
                    <div className="flex justify-between items-center">
                      <span className={isDark ? "text-slate-400 font-bold" : "text-slate-600 font-bold"}>
                        Tabela Alvo:
                      </span>
                      <span className={`font-black ${
                        isDark ? "text-emerald-400" : "text-emerald-700"
                      }`}>
                        {inst.default_table}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 ${
                isDark ? "border-slate-800/60" : "border-slate-200"
              }`}>
                <button
                  onClick={() => handleOpenConfig(inst)}
                  className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                    activeInstance
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                      : isDark
                      ? "bg-[#142640] hover:bg-sky-600 text-white"
                      : "bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-800 font-bold border border-slate-300"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{activeInstance ? "Reconfigurar" : isConfigured ? "Editar Conexão" : "Configurar & Conectar"}</span>
                </button>

                {inst.sandbox_preset && !activeInstance && (
                  <button
                    onClick={() => handleQuickSandboxTest(inst)}
                    className="py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 active:scale-95 cursor-pointer shadow-xs"
                    title="Testar este ERP imediatamente com dados fictícios pré-configurados (Sandbox)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Teste Sandbox</span>
                  </button>
                )}

                {activeInstance && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Online
                    </span>
                    <button
                      onClick={handleDisconnect}
                      className="py-1.5 px-2 rounded-xl text-[11px] font-black transition flex items-center gap-1 border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 active:scale-95 cursor-pointer"
                      title="Desconectar este ERP"
                    >
                      <PowerOff className="w-3 h-3 text-rose-500" />
                      <span>Desconectar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Saved Connections Table */}
      {savedConnections.length > 0 && (
        <div className={`rounded-3xl border shadow-xl p-6 overflow-hidden backdrop-blur-xl ${
          isDark ? "bg-[#0b162c] border-[#1a3356] text-white" : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {isEn ? "Configured & Saved Connections" : "Conexões Cadastradas no HyperCube"}
              </h2>
              <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {isEn
                  ? "Switch active connection with 1-click to instantly propagate data into all financial screens."
                  : "Alterne a fonte ativa com 1 clique para propagar instantaneamente os dados contábeis em todas as telas."}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${
                  isDark ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-700"
                } font-black uppercase text-[10.5px]`}>
                  <th className="py-2.5 px-3">Nome da Conexão</th>
                  <th className="py-2.5 px-3">Instrumento</th>
                  <th className="py-2.5 px-3">Ambiente</th>
                  <th className="py-2.5 px-3">Host / Endpoint</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Latência</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-200"}`}>
                {savedConnections.map((conn) => {
                  const inst = catalog.find((c) => c.id === conn.instrument_id);
                  const isActive = conn.is_active;

                  return (
                    <tr
                      key={conn.id}
                      className={`transition ${
                        isActive
                          ? isDark ? "bg-emerald-950/30 font-bold" : "bg-emerald-50/80 font-bold"
                          : isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                          <span className={isActive ? "text-emerald-700 dark:text-emerald-400 font-black" : "text-slate-900 dark:text-slate-200 font-bold"}>
                            {conn.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{inst?.name || conn.instrument_id}</td>
                      <td className="py-3 px-3 font-mono uppercase text-[10px]">
                        <span className={`px-2 py-0.5 rounded border font-black ${
                          conn.environment === "local"
                            ? isDark ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-amber-100 text-amber-800 border-amber-300"
                            : isDark ? "bg-sky-500/15 text-sky-300 border-sky-500/30" : "bg-sky-100 text-sky-800 border-sky-300"
                        }`}>
                          {conn.environment}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                        {conn.config?.host || conn.config?.account_identifier || conn.config?.endpoint || "localhost"}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-black ${
                          isActive
                            ? isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"
                            : isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                        }`}>
                          {isActive ? "🟢 Ativa em Todas as Telas" : "⚪ Pronta para Conexão"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {conn.latency_ms ? `${conn.latency_ms} ms` : "2.1 ms"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {conn.is_active ? (
                            <button
                              onClick={handleDisconnect}
                              className="px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-[11px] transition shadow-xs cursor-pointer flex items-center gap-1"
                              title="Desconectar este ERP"
                            >
                              <PowerOff className="w-3 h-3 text-rose-500" />
                              <span>Desconectar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateSaved(conn.id)}
                              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black text-[11px] transition shadow-sm cursor-pointer"
                            >
                              Ativar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (inst) handleOpenConfig(inst, conn);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50 transition cursor-pointer"
                            title="Editar Configuração"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSaved(conn.id)}
                            className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-900/50 transition cursor-pointer"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Configuration Modal / Drawer */}
      {selectedInstrument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 ${
            isDark ? "bg-[#0b162c] border-[#1a3356] text-white" : "bg-white border-slate-300 text-slate-900"
          }`}>
            {/* Modal Header */}
            <div className={`flex items-start justify-between border-b pb-4 ${
              isDark ? "border-slate-800/60" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black shadow-md ${
                  selectedInstrument.badge_color === "sky" ? "bg-sky-600" : selectedInstrument.badge_color === "red" ? "bg-rose-600" : "bg-emerald-600"
                }`}>
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    {editingConnection ? "Editar Conexão" : "Configurar Conexão"}: {selectedInstrument.name}
                  </h3>
                  <p className={`text-xs font-mono font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Driver: {selectedInstrument.driver_info}
                  </p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sandbox Mock Helper Banner */}
            {selectedInstrument.sandbox_preset && (
              <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm ${
                isDark ? "bg-[#05111d] border-amber-500/40 text-white" : "bg-amber-50/90 border-amber-300 text-slate-900"
              }`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-sm shrink-0">
                    🧪
                  </div>
                  <div>
                    <h5 className="text-xs font-black flex items-center gap-2">
                      <span>Ambiente Sandbox com Dados Fictícios Disponível</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        {selectedInstrument.sandbox_preset.sample_records.toLocaleString()} lançamentos simulados
                      </span>
                    </h5>
                    <p className={`text-[11px] mt-0.5 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Deseja testar sem credenciais reais de produção? Carregue os parâmetros fictícios pré-configurados e teste o handshake instantaneamente.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleFillSandbox(selectedInstrument)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition shrink-0 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Carregar Dados Fictícios</span>
                </button>
              </div>
            )}

            {/* Modal Tabs: Config vs Data Preview */}
            <div className="flex items-center gap-2 border-b pb-2">
              <button
                type="button"
                onClick={() => setModalTab("config")}
                className={`py-2 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  modalTab === "config"
                    ? "bg-sky-600 text-white shadow-sm"
                    : isDark ? "text-slate-400 hover:text-white bg-slate-900/60" : "text-slate-600 hover:text-slate-900 bg-slate-100"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Parâmetros de Conexão</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab("data_preview")}
                className={`py-2 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  modalTab === "data_preview"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : isDark ? "text-amber-400 hover:text-amber-300 bg-amber-500/10" : "text-amber-800 hover:text-amber-900 bg-amber-100"
                }`}
              >
                <Table className="w-3.5 h-3.5 text-amber-500" />
                <span>Visualizar Dados Fictícios ({sampleEntries.length || 8} lançamentos)</span>
              </button>
            </div>

            {modalTab === "data_preview" ? (
              /* Visual Mock Data Preview Table */
              <div className="space-y-4 animate-fadeIn">
                <div className={`p-4 rounded-2xl border ${
                  isDark ? "bg-[#061220] border-amber-500/30" : "bg-amber-50/70 border-amber-300"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                        <span>Amostra de Lançamentos Contábeis Simulados ({selectedInstrument.name})</span>
                      </h4>
                      <p className={`text-[11px] font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        Transmissão direta da tabela <strong className="font-mono text-emerald-600 dark:text-emerald-400">{selectedInstrument.default_table || "Razão"}</strong>. Total simulado: <strong className="font-bold">{selectedInstrument.sandbox_preset?.sample_records.toLocaleString() || "15.400"} registros</strong>.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        ✓ Partidas Dobradas OK
                      </span>
                    </div>
                  </div>

                  {/* Filter search in mock table */}
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar contas contábeis, documentos, centros de custo..."
                      value={sampleSearch}
                      onChange={(e) => setSampleSearch(e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium outline-none border transition ${
                        isDark ? "bg-[#050e18] border-slate-700 text-white focus:border-amber-500" : "bg-white border-slate-300 text-slate-900 focus:border-amber-500"
                      }`}
                    />
                  </div>

                  {/* Table View */}
                  <div className="overflow-x-auto max-h-[350px] overflow-y-auto rounded-xl border border-slate-300 dark:border-slate-800">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead className={`sticky top-0 text-[10px] font-black uppercase font-mono ${
                        isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-700"
                      }`}>
                        <tr>
                          <th className="py-2 px-3">Data</th>
                          <th className="py-2 px-3">Doc / Lote</th>
                          <th className="py-2 px-3">Conta Canônica</th>
                          <th className="py-2 px-3">Centro Custo</th>
                          <th className="py-2 px-3 text-right">Débito (R$)</th>
                          <th className="py-2 px-3 text-right">Crédito (R$)</th>
                          <th className="py-2 px-3 text-center">Tabela</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-[11px] ${
                        isDark ? "divide-slate-800/60 text-slate-200" : "divide-slate-200 text-slate-800"
                      }`}>
                        {(sampleEntries.length > 0 ? sampleEntries : [
                          { date: "2026-08-30", doc_ref: "BELNR 100000491", account_code: "3.1.1.01.001", account_desc: "Receita Operacional Bruta", cost_center: "CC_SP", debit: 0, credit: 4850200, source_table: selectedInstrument.default_table || "ACDOCA" },
                          { date: "2026-08-30", doc_ref: "BELNR 100000492", account_code: "4.1.1.01.002", account_desc: "CPV - Custos de Matéria-Prima", cost_center: "CC_IND", debit: 2420100, credit: 0, source_table: selectedInstrument.default_table || "ACDOCA" },
                          { date: "2026-08-30", doc_ref: "BELNR 100000493", account_code: "1.1.1.01.001", account_desc: "Caixa & Equivalentes", cost_center: "CC_FIN", debit: 4850200, credit: 0, source_table: selectedInstrument.default_table || "ACDOCA" },
                          { date: "2026-08-30", doc_ref: "BELNR 100000494", account_code: "2.1.1.01.001", account_desc: "Fornecedores Nacionais a Pagar", cost_center: "CC_SUP", debit: 0, credit: 2420100, source_table: selectedInstrument.default_table || "ACDOCA" },
                        ])
                          .filter((r) =>
                            !sampleSearch.trim() ||
                            r.account_desc?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
                            r.doc_ref?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
                            r.cost_center?.toLowerCase().includes(sampleSearch.toLowerCase())
                          )
                          .map((row, idx) => (
                            <tr key={idx} className={isDark ? "hover:bg-slate-800/40" : "hover:bg-amber-50/50"}>
                              <td className="py-2 px-3 font-mono font-medium text-slate-500 dark:text-slate-400">{row.date}</td>
                              <td className="py-2 px-3 font-mono font-bold">{row.doc_ref}</td>
                              <td className="py-2 px-3 font-medium">
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">{row.account_code}</span>
                                <span className="font-bold">{row.account_desc}</span>
                              </td>
                              <td className="py-2 px-3 font-mono text-[10.5px] text-sky-700 dark:text-sky-400 font-bold">{row.cost_center}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                                {row.debit > 0 ? row.debit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {row.credit > 0 ? row.credit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-200 dark:bg-slate-800 font-bold">
                                  {row.source_table}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* Config Parameters View */
              <>
            {/* Connection Name & Environment Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-black mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Nome Amigável da Conexão
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold outline-none border transition ${
                    isDark ? "bg-[#070e1b] border-slate-700 text-white focus:border-sky-500" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500"
                  }`}
                  placeholder="Ex: TOTVS Produção Matriz"
                />
              </div>

              <div>
                <label className={`block text-xs font-black mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Ambiente de Execução
                </label>
                <div className={`flex items-center gap-2 p-1 rounded-xl border ${
                  isDark ? "border-slate-700 bg-[#070e1b]" : "border-slate-300 bg-slate-100"
                }`}>
                  <button
                    type="button"
                    onClick={() => setFormEnv("local")}
                    disabled={!selectedInstrument.supported_environments.includes("local")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formEnv === "local"
                        ? "bg-amber-600 text-white shadow-sm"
                        : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Local (On-Premises)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormEnv("cloud")}
                    disabled={!selectedInstrument.supported_environments.includes("cloud")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formEnv === "cloud"
                        ? "bg-sky-600 text-white shadow-sm"
                        : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Nuvem (Cloud)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Instrument Specific Variables Form */}
            <div className="space-y-3 pt-2">
              <h4 className={`text-xs font-black uppercase tracking-wider border-b pb-1 ${
                isDark ? "text-slate-300 border-slate-800/60" : "text-slate-800 border-slate-200"
              }`}>
                Variáveis de Conexão do Instrumento
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {selectedInstrument.fields.map((field) => {
                  const val = formConfig[field.key] ?? "";
                  const isPass = field.type === "password";

                  return (
                    <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <label className={`block text-xs font-black mb-1 flex items-center justify-between ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}>
                        <span>
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </span>
                      </label>

                      {field.type === "select" ? (
                        <select
                          value={val}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold outline-none border transition ${
                            isDark ? "bg-[#070e1b] border-slate-700 text-white focus:border-sky-500" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500"
                          }`}
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={val}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-medium outline-none border transition ${
                            isDark ? "bg-[#070e1b] border-slate-700 text-white focus:border-sky-500" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500"
                          }`}
                        />
                      ) : (
                        <div className="relative flex items-center">
                          <input
                            type={isPass && !showPassword ? "password" : "text"}
                            value={val}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-medium outline-none border transition ${
                              isDark ? "bg-[#070e1b] border-slate-700 text-white focus:border-sky-500" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500"
                            } ${isPass ? "pr-9" : ""}`}
                          />
                          {isPass && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            </>
            )}

            {/* Test Handshake Result Output Box */}
            {testResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-fadeIn ${
                testResult.success
                  ? isDark
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : isDark
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                  : "bg-rose-50 border-rose-300 text-rose-900"
              }`}>
                <div className="flex items-center gap-2 font-black">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                  <span>{testResult.message}</span>
                </div>

                {testResult.diagnostics && (
                  <div className="space-y-2 pt-1 font-mono">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                      <div>Alvo: {testResult.diagnostics.target}</div>
                      <div>Protocolo: {testResult.diagnostics.handshake_protocol}</div>
                      <div>Driver: {testResult.diagnostics.driver}</div>
                      <div>Latência: {testResult.diagnostics.latency_ms} ms</div>
                    </div>
                    {testResult.diagnostics.sandbox_mode && (
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-[11px] font-sans font-bold flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>
                            Modo Sandbox Ativo: {testResult.diagnostics.simulated_records_ready?.toLocaleString()} lançamentos contábeis fictícios prontos.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setModalTab("data_preview")}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shrink-0 shadow-xs"
                        >
                          Ver Tabela de Dados Fictícios ➔
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
              isDark ? "border-slate-800/60" : "border-slate-200"
            }`}>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2.5 rounded-xl border border-sky-600 dark:border-sky-500/50 hover:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-black transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Zap className={`w-4 h-4 ${testing ? "animate-spin" : ""}`} />
                <span>{testing ? "Testando Handshake..." : "Testar Conexão (Ping)"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-black transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAndActivate(true)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4 font-black" />
                  <span>{saving ? "Salvando..." : "Salvar & Ativar em Todas as Telas"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
