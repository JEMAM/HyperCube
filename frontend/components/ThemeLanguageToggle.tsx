"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Languages, Bot, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import AISettingsModal from "./AISettingsModal";

import { AI_PROVIDERS_CONFIG } from "./aiModels";

const MODEL_TO_PROVIDER: Record<string, string> = {
  // Fallbacks
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

export default function ThemeLanguageToggle() {
  const { language, theme, setLanguage, setTheme, t, apiBaseUrl } = usePreferences();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState("Llama 3.3 70B Versatile");
  const [isActive, setIsActive] = useState(false);
  const [activeProvider, setActiveProvider] = useState("groq");

  useEffect(() => {
    const updateFromStorage = () => {
      if (typeof window !== "undefined") {
        const savedModel = localStorage.getItem("hypercube_ai_model") || "Llama 3.3 70B Versatile";
        const savedProvider = localStorage.getItem("hypercube_ai_provider") || MODEL_TO_PROVIDER[savedModel] || "groq";
        
        let providerKey = localStorage.getItem(`hypercube_${savedProvider}_key`) || "";
        if (!providerKey && localStorage.getItem("hypercube_ai_provider") === savedProvider) {
          providerKey = localStorage.getItem("hypercube_ai_key") || "";
        }

        setCurrentModel(savedModel);
        setActiveProvider(savedProvider);

        const hasKey = savedProvider === "ollama" ? true : Boolean(providerKey && providerKey.trim().length > 0);
        setIsActive(hasKey);
      }
    };

    updateFromStorage();

    fetch(`${apiBaseUrl}/api/config/llm`)
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (!cfg) return;
        const localSavedModel = typeof window !== "undefined" ? localStorage.getItem("hypercube_ai_model") : null;
        const localSavedProvider = typeof window !== "undefined" ? localStorage.getItem("hypercube_ai_provider") : null;
        if (localSavedModel) {
          setCurrentModel(localSavedModel);
        } else if (cfg.model) {
          setCurrentModel(cfg.model);
        }
        if (localSavedProvider) {
          setActiveProvider(localSavedProvider);
        } else if (cfg.provider) {
          setActiveProvider(cfg.provider);
        }
        if (typeof cfg.has_key === "boolean") {
          const hasLocalKey = Boolean(typeof window !== "undefined" && (localStorage.getItem("hypercube_ai_key") || localStorage.getItem(`hypercube_${localSavedProvider || "groq"}_key`)));
          setIsActive(cfg.has_key || hasLocalKey);
        }
      })
      .catch(() => {});

    window.addEventListener("hypercube_ai_updated", updateFromStorage);
    window.addEventListener("storage", updateFromStorage);
    return () => {
      window.removeEventListener("hypercube_ai_updated", updateFromStorage);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, [isAiModalOpen, apiBaseUrl]);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* AI Engine & Model Selector Button with Functional/Active Status Pill */}
        <div className="flex items-center">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 shadow-sm ${
              theme === "dark"
                ? "bg-slate-900/90 border-slate-700/80 text-emerald-300 hover:bg-slate-800 hover:border-emerald-500/50"
                : "bg-white border-slate-300 text-emerald-900 hover:bg-slate-50 hover:border-emerald-500"
            }`}
            title={language === "en" ? "Configure AI Provider and Model" : "Configurar Provedor e Modelo de IA"}
          >
            <Bot className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="max-w-[130px] truncate">{currentModel}</span>

            {/* Status Pill Indicator Right next to the Model */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide border transition-all ${
                isActive
                  ? theme === "dark"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-emerald-100 text-emerald-950 border-emerald-300"
                  : theme === "dark"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-amber-100 text-amber-950 border-amber-300"
              }`}
              title={isActive ? (language === "en" ? "AI Engine Active & Functional" : "Motor de IA Ativo & Funcional") : (language === "en" ? "Awaiting API Key / Inactive" : "Aguardando Chave / Inativo")}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              {isActive ? t("aiActive") : t("aiInactive")}
            </span>
          </button>
        </div>

        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 shadow-sm ${
            theme === "dark"
              ? "bg-slate-900/90 border-slate-700/80 text-sky-300 hover:bg-slate-800 hover:border-sky-500/50"
              : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-sky-500"
          }`}
        >
          <Languages className="w-4 h-4 text-sky-600" />
          <span>{language === "pt" ? "PT-BR" : "EN-US"}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 shadow-sm ${
            theme === "dark"
              ? "bg-slate-900/90 border-slate-700/80 text-amber-400 hover:bg-slate-800 hover:border-amber-400/50"
              : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-indigo-500"
          }`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </div>

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          if (typeof window !== "undefined") {
            const savedModel = localStorage.getItem("hypercube_ai_model") || "Llama 3.1 (8B, 70B, 405B) e Llama 3.3 / Llama 4 Scout";
            const savedKey = localStorage.getItem("hypercube_ai_key") || "";
            setCurrentModel(savedModel);
            setIsActive(true);
          }
        }}
      />
    </>
  );
}
