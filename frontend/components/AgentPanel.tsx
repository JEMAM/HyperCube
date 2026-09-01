"use client";

import React, { useState } from "react";
import { Bot, Send, RefreshCw, Sparkles, Building2, CheckCircle2 } from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import { useAgentExecution, AgentType } from "./AgentExecutionContext";

interface AgentPanelProps {
  summary: string;
  agentType?: AgentType;
}

export default function AgentPanel({ summary, agentType = "dre" }: AgentPanelProps) {
  const { theme, t, activeCompany, language } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const { submitTask, getChatHistory, isAgentRunning, activeTasks } = useAgentExecution();
  const [question, setQuestion] = useState("");

  const chatLog = getChatHistory(agentType);
  const isRunning = isAgentRunning(agentType);

  // Find if there is a running task for this agent
  const currentRunningTask = Object.values(activeTasks).find(
    (t) => t.agent_type === agentType && t.status === "running"
  );

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isRunning) return;

    const qText = question;
    setQuestion("");

    await submitTask(agentType, qText);
  };

  return (
    <div className={`${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-md"} border rounded-xl p-5 space-y-4 transition`}>
      <div className="flex items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-purple-500 font-semibold text-base">
          <Bot className="w-5 h-5" />
          <span>{t("agentTitle")}</span>
        </div>

        {/* Company Active Tag */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 truncate max-w-[190px]">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{activeCompany.name}</span>
        </div>
      </div>

      <div className={`p-4 ${isDark ? "bg-purple-950/40 border-purple-800/60 text-purple-100" : "bg-purple-50 border-purple-200 text-purple-900"} border rounded-lg text-sm leading-relaxed whitespace-pre-line font-medium`}>
        {summary || t("agentPrompt")}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{t("askAgentLabel")}</div>
          <span className="text-[10px] text-slate-400">
            {isEn ? "Continuous background execution" : "Execução contínua em segundo plano"}
          </span>
        </div>

        {/* Persistent Chat History */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {chatLog.map((chat, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"} flex items-center justify-between`}>
                <span>You: {chat.q}</span>
                {chat.company && (
                  <span className="text-[9.5px] font-normal opacity-60">[{chat.company}]</span>
                )}
              </div>
              <div className={`${isDark ? "bg-purple-900/30 border-purple-700/50 text-purple-100" : "bg-purple-100 border-purple-200 text-purple-900"} p-2.5 rounded-lg border font-medium whitespace-pre-line leading-relaxed`}>
                {chat.a}
              </div>
            </div>
          ))}

          {/* Running Background State Indicator */}
          {isRunning && (
            <div className="space-y-1 text-xs">
              {currentRunningTask && (
                <div className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  You: {currentRunningTask.question}
                </div>
              )}
              <div className="p-3 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 flex items-center gap-2.5 font-bold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>
                  {isEn
                    ? "Agno Agent is processing in the background (you can navigate freely)..."
                    : "Agente IA processando em segundo plano (você pode trocar de página livremente)..."}
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            placeholder={t("askPlaceholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isRunning}
            className={`flex-1 ${isDark ? "bg-slate-800 border-slate-700 text-slate-100 font-semibold placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 font-semibold placeholder-slate-400"} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60`}
          />
          <button
            type="submit"
            disabled={isRunning || !question.trim()}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-lg text-sm transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
