"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePreferences } from "./PreferencesContext";
import { Bot, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, X, Sparkles } from "lucide-react";

export type AgentType = "dre" | "dfc" | "bp" | "valuation" | "economy";

export interface ChatMessage {
  q: string;
  a: string;
  timestamp?: number;
  taskId?: string;
  company?: string;
}

export interface AgentTaskStatus {
  task_id: string;
  agent_type: AgentType;
  question: string;
  status: "running" | "completed" | "error";
  answer?: string | null;
  error_message?: string | null;
  created_at: number;
  completed_at?: number | null;
  company_name?: string;
  notified?: boolean;
}

interface AgentExecutionContextType {
  submitTask: (agentType: AgentType, question: string, extra?: any) => Promise<string>;
  getChatHistory: (agentType: AgentType) => ChatMessage[];
  setChatHistory: (agentType: AgentType, updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  clearChatHistory: (agentType: AgentType) => void;
  isAgentRunning: (agentType: AgentType) => boolean;
  activeTasks: Record<string, AgentTaskStatus>;
  dismissTaskNotification: (taskId: string) => void;
}

const AgentExecutionContext = createContext<AgentExecutionContextType | undefined>(undefined);

const AGENT_NAMES: Record<AgentType, { pt: string; en: string; tab: string }> = {
  dre: { pt: "DRE / Resultado", en: "Income Statement (DRE)", tab: "DRE" },
  dfc: { pt: "Fluxo de Caixa (DFC)", en: "Cash Flow (DFC)", tab: "DFC" },
  bp: { pt: "Balanço Patrimonial (BP)", en: "Balance Sheet (BP)", tab: "BP" },
  valuation: { pt: "Valuation Corporativo", en: "Valuation Model", tab: "VALUATION" },
  economy: { pt: "Macroeconomia BCB", en: "Macroeconomics BCB", tab: "ECONOMY" },
};

export function AgentExecutionProvider({ children }: { children: React.ReactNode }) {
  const { apiBaseUrl, activeCompany, language, theme } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [activeTasks, setActiveTasks] = useState<Record<string, AgentTaskStatus>>({});
  const [chatLogs, setChatLogs] = useState<Record<string, ChatMessage[]>>({});
  const [notificationToast, setNotificationToast] = useState<AgentTaskStatus | null>(null);

  const activeCompanyRef = useRef(activeCompany);
  activeCompanyRef.current = activeCompany;

  const apiBaseUrlRef = useRef(apiBaseUrl);
  apiBaseUrlRef.current = apiBaseUrl;

  // Load chat logs and unfinished tasks from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedTasksStr = localStorage.getItem("hypercube_active_agent_tasks");
        if (storedTasksStr) {
          const parsed = JSON.parse(storedTasksStr);
          if (parsed && typeof parsed === "object") {
            setActiveTasks(parsed);
          }
        }
      } catch (e) {
        console.warn("Could not load stored agent tasks", e);
      }

      // Load chats for current company
      const types: AgentType[] = ["dre", "dfc", "bp", "valuation", "economy"];
      const loadedChats: Record<string, ChatMessage[]> = {};
      types.forEach((type) => {
        const key = `hypercube_agent_chats_${type}`;
        try {
          const item = localStorage.getItem(key);
          if (item) {
            loadedChats[type] = JSON.parse(item);
          }
        } catch {}
      });
      setChatLogs(loadedChats);
    }
  }, []);

  // Sync activeTasks to localStorage whenever it updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hypercube_active_agent_tasks", JSON.stringify(activeTasks));
      } catch {}
    }
  }, [activeTasks]);

  // Background poller for any running tasks
  useEffect(() => {
    const runningTasks = Object.values(activeTasks).filter((t) => t.status === "running");
    if (runningTasks.length === 0) return;

    const interval = setInterval(async () => {
      const currentUrl = apiBaseUrlRef.current || "http://127.0.0.1:8000";

      for (const task of runningTasks) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(`${currentUrl}/api/agent/task/status/${task.task_id}`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data: AgentTaskStatus = await res.json();
            if (data.status === "completed" || data.status === "error") {
              // Task finished!
              setActiveTasks((prev) => ({
                ...prev,
                [task.task_id]: {
                  ...data,
                  notified: false,
                },
              }));

              // Update chat history
              const agentType = task.agent_type;
              const newMsg: ChatMessage = {
                q: task.question,
                a: data.status === "completed" 
                  ? (data.answer || "") 
                  : `⚠️ ${isEn ? "Agent execution error" : "Erro na execução do agente"}: ${data.error_message || ""}`,
                timestamp: Date.now(),
                taskId: task.task_id,
                company: task.company_name,
              };

              setChatLogs((prev) => {
                const currentList = prev[agentType] || [];
                // Avoid duplicating message if taskId already exists
                if (currentList.some((m) => m.taskId === task.task_id)) {
                  return prev;
                }
                const updated = [...currentList, newMsg];
                if (typeof window !== "undefined") {
                  try {
                    localStorage.setItem(`hypercube_agent_chats_${agentType}`, JSON.stringify(updated));
                  } catch {}
                }
                return {
                  ...prev,
                  [agentType]: updated,
                };
              });

              // Show completion toast
              setNotificationToast({
                ...data,
                notified: true,
              });
            }
          }
        } catch {
          // Keep polling next cycle
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTasks, isEn]);

  // Submit a task to the background runner
  const submitTask = async (agentType: AgentType, question: string, extra: any = {}): Promise<string> => {
    const currentUrl = apiBaseUrlRef.current || "http://127.0.0.1:8000";
    const company = activeCompanyRef.current;

    let clientKey = "";
    let clientProvider = "groq";
    let clientModel = "Llama 3.3 70B Versatile";
    if (typeof window !== "undefined") {
      clientProvider = localStorage.getItem("hypercube_ai_provider") || "groq";
      clientModel = localStorage.getItem("hypercube_ai_model") || "Llama 3.3 70B Versatile";
      clientKey = localStorage.getItem(`hypercube_${clientProvider}_key`) || localStorage.getItem("hypercube_ai_key") || "";
    }

    const payload = {
      agent_type: agentType,
      question: question.trim(),
      valuation_context: extra.valuation_context,
      history: extra.history,
      api_key: clientKey,
      provider: clientProvider,
      model: clientModel,
    };

    let taskId = `task_${Date.now()}_local`;
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (clientKey) headers["x-api-key"] = clientKey;
      if (clientProvider) headers["x-provider"] = clientProvider;
      if (clientModel) headers["x-model"] = clientModel;

      const res = await fetch(`${currentUrl}/api/agent/task/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        taskId = data.task_id;
      }
    } catch (e) {
      console.warn("Direct task submission fallback:", e);
    }

    const newTask: AgentTaskStatus = {
      task_id: taskId,
      agent_type: agentType,
      question: question.trim(),
      status: "running",
      created_at: Date.now() / 1000,
      company_name: company.name,
      notified: false,
    };

    setActiveTasks((prev) => ({
      ...prev,
      [taskId]: newTask,
    }));

    return taskId;
  };

  const getChatHistory = (agentType: AgentType): ChatMessage[] => {
    return chatLogs[agentType] || [];
  };

  const setChatHistory = (agentType: AgentType, updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setChatLogs((prev) => {
      const current = prev[agentType] || [];
      const updated = updater(current);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`hypercube_agent_chats_${agentType}`, JSON.stringify(updated));
        } catch {}
      }
      return {
        ...prev,
        [agentType]: updated,
      };
    });
  };

  const clearChatHistory = (agentType: AgentType) => {
    setChatLogs((prev) => {
      const updated = { ...prev, [agentType]: [] };
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(`hypercube_agent_chats_${agentType}`);
        } catch {}
      }
      return updated;
    });
  };

  const isAgentRunning = (agentType: AgentType): boolean => {
    return Object.values(activeTasks).some(
      (t) => t.agent_type === agentType && t.status === "running"
    );
  };

  const dismissTaskNotification = (taskId: string) => {
    setActiveTasks((prev) => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
    if (notificationToast?.task_id === taskId) {
      setNotificationToast(null);
    }
  };

  const runningTaskList = Object.values(activeTasks).filter((t) => t.status === "running");

  return (
    <AgentExecutionContext.Provider
      value={{
        submitTask,
        getChatHistory,
        setChatHistory,
        clearChatHistory,
        isAgentRunning,
        activeTasks,
        dismissTaskNotification,
      }}
    >
      {children}

      {/* Floating Background Agent Status Indicator / Toast */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {/* Running background tasks pill */}
        {runningTaskList.map((task) => {
          const agentMeta = AGENT_NAMES[task.agent_type] || { pt: "Agente IA", en: "AI Agent", tab: "DRE" };
          return (
            <div
              key={task.task_id}
              className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 animate-fadeIn backdrop-blur-xl transition-all ${
                isDark
                  ? "bg-slate-900/95 border-purple-800/80 text-white"
                  : "bg-white/95 border-purple-200 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center flex-shrink-0 animate-spin">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-400">
                    <Sparkles className="w-3 h-3" />
                    <span>{isEn ? agentMeta.en : agentMeta.pt}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      ({isEn ? "Background execution" : "Executando..."})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    "{task.question}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("hypercube_navigate_tab", { detail: agentMeta.tab }));
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white transition flex-shrink-0 shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <span>{isEn ? "View" : "Ver"}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Completion Toast Notification */}
        {notificationToast && (
          <div
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start justify-between gap-3 animate-bounce backdrop-blur-xl transition-all ${
              isDark
                ? "bg-slate-900/95 border-emerald-500/60 text-white"
                : "bg-white/95 border-emerald-300 text-slate-900"
            }`}
          >
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="overflow-hidden space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-500">
                  <span>{isEn ? "Agent Analysis Ready!" : "Análise do Agente Concluída!"}</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isEn
                    ? AGENT_NAMES[notificationToast.agent_type]?.en
                    : AGENT_NAMES[notificationToast.agent_type]?.pt}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                  "{notificationToast.question}"
                </p>

                <div className="pt-1.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const tab = AGENT_NAMES[notificationToast.agent_type]?.tab || "DRE";
                      window.dispatchEvent(new CustomEvent("hypercube_navigate_tab", { detail: tab }));
                      setNotificationToast(null);
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>{isEn ? "View Answer" : "Ver Resposta"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setNotificationToast(null)}
                    className="text-xs text-slate-400 hover:text-slate-200 px-1 py-0.5"
                  >
                    {isEn ? "Dismiss" : "Fechar"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setNotificationToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </AgentExecutionContext.Provider>
  );
}

export function useAgentExecution() {
  const context = useContext(AgentExecutionContext);
  if (!context) {
    throw new Error("useAgentExecution must be used within an AgentExecutionProvider");
  }
  return context;
}
