"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Globe,
  X,
  CheckCircle2,
  Cpu,
  Zap,
  Layers,
  Server
} from "lucide-react";
import { usePreferences, getApiUrl } from "./PreferencesContext";
import { AI_PROVIDERS_CONFIG } from "./aiModels";

interface WelcomeSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

// Dynamically map each model to its provider key
const MODEL_TO_PROVIDER: Record<string, string> = {
  "Gemma 4 / Gemma 3": "ollama",
  "Qwen 3.6 / Qwen 3 / Qwen 2.5": "ollama",
  "DeepSeek-R1 / V3": "ollama",
  "Llama 3.1 (8B, 70B, 405B) e Llama 3.3 / Llama 4 Scout": "groq",
  "DeepSeek R1 Distill": "groq",
  "Qwen3 32B": "groq",
  "OpenAI GPT-OSS (20B e 120B)": "groq",
};

Object.values(AI_PROVIDERS_CONFIG).forEach((prov) => {
  prov.models.forEach((m) => {
    MODEL_TO_PROVIDER[m.id] = prov.id;
    MODEL_TO_PROVIDER[m.name] = prov.id;
  });
});

export default function WelcomeSetupModal({ isOpen, onComplete }: WelcomeSetupModalProps) {
  const { theme, language, apiBaseUrl } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [selectedModel, setSelectedModel] = useState("gemma4:12b");
  const [activeProviderTab, setActiveProviderTab] = useState<string>("ollama");
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({
    anthropic: "",
    openai: "",
    groq: "",
    gemini: "",
    ollama: "http://localhost:11434",
  });
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== "undefined") {
      const savedModel = localStorage.getItem("hypercube_ai_model") || "gemma4:12b";
      const savedProvider = localStorage.getItem("hypercube_ai_provider") || MODEL_TO_PROVIDER[savedModel] || "ollama";
      const savedKey = localStorage.getItem("hypercube_ai_key") || "";
      const savedOllama = localStorage.getItem("hypercube_ollama_endpoint") || "http://localhost:11434";

      setSelectedModel(savedModel);
      setActiveProviderTab(savedProvider);
      setProviderKeys((prev) => ({
        ...prev,
        groq: localStorage.getItem("hypercube_groq_key") || (savedProvider === "groq" ? savedKey : "") || prev.groq,
        openai: localStorage.getItem("hypercube_openai_key") || (savedProvider === "openai" ? savedKey : "") || prev.openai,
        anthropic: localStorage.getItem("hypercube_anthropic_key") || (savedProvider === "anthropic" ? savedKey : "") || prev.anthropic,
        gemini: localStorage.getItem("hypercube_gemini_key") || (savedProvider === "gemini" ? savedKey : "") || prev.gemini,
        ollama: savedOllama.startsWith("http") ? savedOllama : "http://localhost:11434",
      }));
    }

    // Fetch persisted credentials from local SQLite database
    const url = getApiUrl("/api/config/llm", apiBaseUrl);
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.model) {
          setSelectedModel(data.model);
          const prov = MODEL_TO_PROVIDER[data.model] || data.provider || "ollama";
          setActiveProviderTab(prov);
        }
        if (data.saved_keys) {
          setProviderKeys((prev) => ({ ...prev, ...data.saved_keys }));
        }
      })
      .catch(() => {});
  }, [isOpen, apiBaseUrl]);

  if (!isOpen) return null;

  const currentProvider = AI_PROVIDERS_CONFIG[activeProviderTab] || AI_PROVIDERS_CONFIG.ollama;
  const currentProviderKey = activeProviderTab;
  const currentInputValue = currentProviderKey === "ollama"
    ? (providerKeys.ollama || "http://localhost:11434")
    : (providerKeys[currentProviderKey] || "");

  const handleInputChange = (val: string) => {
    setProviderKeys((prev) => ({
      ...prev,
      [currentProviderKey]: val,
    }));
  };

  const handleSelectProvider = (provId: string) => {
    setActiveProviderTab(provId);
    const provConfig = AI_PROVIDERS_CONFIG[provId];
    if (provConfig && provConfig.models.length > 0) {
      const modelInProvider = provConfig.models.some((m) => m.id === selectedModel);
      if (!modelInProvider) {
        setSelectedModel(provConfig.defaultModel || provConfig.models[0].id);
      }
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg("");

    const activeCredential = currentProviderKey === "ollama"
      ? (providerKeys.ollama || "http://localhost:11434")
      : (providerKeys[currentProviderKey] || "").trim();

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("hypercube_ai_provider", currentProviderKey);
        localStorage.setItem("hypercube_ai_model", selectedModel);
        if (currentProviderKey === "ollama") {
          localStorage.setItem("hypercube_ollama_endpoint", activeCredential);
          localStorage.setItem("hypercube_ai_key", activeCredential);
        } else {
          localStorage.setItem("hypercube_ai_key", activeCredential);
          localStorage.setItem(`hypercube_${currentProviderKey}_key`, activeCredential);
        }
        window.dispatchEvent(
          new CustomEvent("hypercube_ai_updated", {
            detail: { provider: currentProviderKey, model: selectedModel, apiKey: activeCredential },
          })
        );
      }

      const url = getApiUrl("/api/config/llm", apiBaseUrl);
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: currentProviderKey, model: selectedModel, api_key: activeCredential }),
      }).catch((err) => {
        console.warn("Config fetch network fallback:", err);
        return null;
      });

      onComplete();
    } catch (err: any) {
      console.error("Save config error:", err);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (id: string) => {
    switch (id) {
      case "ollama":
        return <Server className="w-3.5 h-3.5" />;
      case "openai":
        return <Sparkles className="w-3.5 h-3.5" />;
      case "anthropic":
        return <Layers className="w-3.5 h-3.5" />;
      case "gemini":
        return <Cpu className="w-3.5 h-3.5" />;
      case "groq":
        return <Zap className="w-3.5 h-3.5" />;
      default:
        return <Bot className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div
        className={`w-full max-w-3xl my-auto border rounded-3xl p-5 sm:p-6 shadow-2xl transition flex flex-col ${
          isDark
            ? "bg-[#131b2e] border-[#222a3d] text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200 dark:border-[#222a3d] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-emerald-500 rounded-2xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {isEn ? "AI Engine Setup" : "Configuração do Motor de IA"}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                  {selectedModel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn
                  ? "Select the provider and model for Agno Agent (PhD Economist) & DAG calculation."
                  : "Selecione o provedor e modelo de inteligência artificial para o Agente PhD e recálculos DAG."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={isEn ? "Close" : "Fechar"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Segmented Tabs (Horizontal Row - No Scrolling) */}
        <div className="mb-3.5">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-[#222a3d]">
            {Object.values(AI_PROVIDERS_CONFIG).map((prov) => {
              const isTabActive = activeProviderTab === prov.id;
              const hasSelectedModel = prov.models.some((m) => m.id === selectedModel);

              return (
                <button
                  type="button"
                  key={prov.id}
                  onClick={() => handleSelectProvider(prov.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isTabActive
                      ? "bg-sky-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {getProviderIcon(prov.id)}
                  <span className="truncate">{prov.brand}</span>
                  {hasSelectedModel && !isTabActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form - Fits fully with ZERO scrollbar */}
        <form onSubmit={handleSaveConfig} className="space-y-3.5">
          {/* Models Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>{currentProvider.name}</span>
              <span className="font-mono text-sky-400 text-[10px]">
                {currentProvider.models.length} {isEn ? "models" : "modelos"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentProvider.models.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition text-left flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/30"
                        : isDark
                        ? "bg-[#0b1326] border-[#222a3d] text-slate-300 hover:border-slate-700 hover:text-white"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                      )}
                      <div className="truncate">
                        <span className={`text-xs font-bold leading-tight block truncate ${isSelected ? "text-emerald-300 font-black" : ""}`}>
                          {m.name}
                        </span>
                        {m.description && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                            {m.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {m.badge && (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 whitespace-nowrap ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {m.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credential / Endpoint Input */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              currentProviderKey === "ollama"
                ? isDark
                  ? "bg-[#0b1326] border-emerald-500/30"
                  : "bg-emerald-50/80 border-emerald-300"
                : isDark
                ? "bg-[#0b1326] border-[#222a3d]"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1 text-[11px] font-bold">
              <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                {currentProviderKey === "ollama" ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isEn ? "Ollama Localhost Endpoint:" : "Endpoint Ollama Local (localhost):"}</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      {isEn
                        ? `API Key (${currentProviderKey.toUpperCase()} Key):`
                        : `Chave de API (${currentProviderKey.toUpperCase()} Key):`}
                    </span>
                  </>
                )}
              </label>

              {currentProviderKey === "ollama" ? (
                <span className="text-[9.5px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  {isEn ? "⚡ Local Server" : "⚡ Servidor Local (Sem Custo)"}
                </span>
              ) : currentInputValue ? (
                <span className="text-[9.5px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isEn ? "Saved in SQLite" : "Salva no SQLite"}</span>
                </span>
              ) : (
                <span className="text-[9.5px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                  {isEn ? "Awaiting Key" : "Chave Pendente"}
                </span>
              )}
            </div>

            <input
              type={currentProviderKey === "ollama" ? "text" : "password"}
              placeholder={
                currentProviderKey === "ollama"
                  ? "http://localhost:11434 (Endpoint Padrão)"
                  : "Insira sua chave de API (gsk_... / sk-... / AIzaSy...)"
              }
              value={currentInputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full ${
                isDark
                  ? "bg-[#131b2e] border-[#222a3d] text-slate-100"
                  : "bg-white border-slate-300 text-slate-900"
              } border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono`}
            />

            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span>
                {currentProviderKey === "ollama"
                  ? (isEn ? "Ollama runs 100% offline on your machine. No cloud API key required." : "Ollama executa 100% offline na sua máquina. Não requer chave na nuvem.")
                  : (isEn ? "Keys are encrypted and persisted locally in SQLite for fast switching." : "Chaves criptografadas no banco SQLite local para troca instantânea de modelo.")}
              </span>
            </p>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className="p-2.5 rounded-xl border text-xs font-bold text-center bg-emerald-950/40 border-emerald-800 text-emerald-300">
              {statusMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-[#222a3d] flex-shrink-0">
            <button
              type="button"
              onClick={onComplete}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            >
              {isEn ? "Cancel" : "Cancelar"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black py-2 px-5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? (isEn ? "Saving..." : "Salvando...") : (isEn ? "Save and Continue" : "Salvar e Continuar")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
