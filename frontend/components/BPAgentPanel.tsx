"use client";

import React, { useState, useEffect } from "react";
import { Bot, Send, Sparkles, Scale, RefreshCw, AlertCircle, CheckCircle2, Building2 } from "lucide-react";
import { usePreferences } from "./PreferencesContext";
import { useAgentExecution } from "./AgentExecutionContext";

interface BPAgentPanelProps {
  summary?: string;
  onRefreshSummary?: () => void;
}

export default function BPAgentPanel({ summary: externalSummary, onRefreshSummary }: BPAgentPanelProps) {
  const { theme, t, language, apiBaseUrl, activeCompany } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const { submitTask, getChatHistory, isAgentRunning, activeTasks } = useAgentExecution();
  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState(externalSummary || "");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const chatLog = getChatHistory("bp");
  const isRunning = isAgentRunning("bp");

  const currentRunningTask = Object.values(activeTasks).find(
    (t) => t.agent_type === "bp" && t.status === "running"
  );

  // Fetch initial executive summary from BP Agent
  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${apiBaseUrl}/api/bp/agent/explain`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary || "");
      }
    } catch (err) {
      console.warn("Could not fetch BP Agent summary", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (externalSummary) {
      setSummary(externalSummary);
    } else {
      fetchSummary();
    }
  }, [externalSummary, apiBaseUrl]);

  const handleAsk = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const qText = customQuestion || question;
    if (!qText.trim() || isRunning) return;

    setQuestion("");
    await submitTask("bp", qText);
  };

  const quickQuestions = isEn
    ? [
        "How is the Liquidity and Fleuriet Model?",
        "Explain the Dupont 3-factor ROE decomposition",
        "What are the main balance sheet warning signals?",
      ]
    : [
        "Como está a Liquidez e o Modelo Fleuriet?",
        "Explique a decomposição Dupont do ROE",
        "Quais os principais sinais de alerta no Balanço?",
      ];

  return (
    <div
      className={`${
        isDark ? "bg-slate-900/95 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-md"
      } border rounded-2xl p-5 space-y-4 transition backdrop-blur-xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b pb-3 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-amber-500 dark:text-amber-400">
                {isEn ? "AI Balance Sheet Specialist Agent" : "Agente IA Especialista em Balanço Patrimonial"}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                Skill analise-balanco-patrimonial
              </span>
            </div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isEn
                ? "Fleuriet model, DuPont 3-factor ROE, liquidity ratios & working capital diagnosis"
                : "Modelo Fleuriet, Dupont 3 fatores ROE, índices de liquidez e diagnóstico de capital de giro"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Company Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 truncate max-w-[210px]">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{activeCompany.name}</span>
            {activeCompany.ticker && (
              <span className="opacity-75 font-mono text-[10px]">({activeCompany.ticker})</span>
            )}
          </div>

          <button
            onClick={() => {
              if (onRefreshSummary) onRefreshSummary();
              fetchSummary();
            }}
            disabled={loadingSummary}
            className={`p-1.5 rounded-lg border text-xs transition ${
              isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
            title="Atualizar Parecer do Balanço"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Executive Summary Box */}
      <div
        className={`p-4 rounded-xl border text-xs leading-relaxed transition ${
          isDark
            ? "bg-amber-950/20 border-amber-900/40 text-amber-100/90"
            : "bg-amber-50/80 border-amber-200 text-amber-950 font-medium"
        }`}
      >
        {loadingSummary ? (
          <div className="flex items-center gap-2 text-amber-400 py-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="font-mono text-xs">
              {isEn ? "Calculating balance sheet ratios..." : "Processando indicadores com skill analise-balanco-patrimonial..."}
            </span>
          </div>
        ) : (
          <div className="whitespace-pre-line">{summary || (isEn ? "Awaiting balance sheet data..." : "Aguardando dados do balanço...")}</div>
        )}
      </div>

      {/* Quick Question Buttons */}
      <div className="space-y-1.5 pt-1">
        <span className={`text-[10.5px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          {isEn ? "Suggested Prompts (Skill Knowledge):" : "Perguntas Sugeridas (Skill):"}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => handleAsk(e as any, q)}
              disabled={isRunning}
              className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition disabled:opacity-50 ${
                isDark
                  ? "border-slate-800 bg-slate-800/60 text-slate-300 hover:border-amber-500/50 hover:text-white"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:border-amber-400 hover:text-slate-900"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Log & Input */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/40">
        <div className="flex items-center justify-between">
          <div className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            {isEn ? "Interactive Chat with BP Agent:" : "Chat com o Especialista em Balanço Patrimonial:"}
          </div>
          <span className="text-[10px] text-slate-400">
            {isEn ? "Continuous background execution" : "Execução contínua em segundo plano"}
          </span>
        </div>

        {/* Persistent Chat Log */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {chatLog.map((chat, idx) => (
            <div key={idx} className="space-y-1.5 text-xs animate-fadeIn">
              <div className={`font-bold flex items-center justify-between ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Você: {chat.q}</span>
                </div>
                {chat.company && (
                  <span className="text-[9.5px] font-normal opacity-60">[{chat.company}]</span>
                )}
              </div>
              <div
                className={`p-3.5 rounded-xl border whitespace-pre-line leading-relaxed ${
                  isDark
                    ? "bg-slate-950/80 border-slate-800 text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                {chat.a}
              </div>
            </div>
          ))}

          {/* Running Indicator */}
          {isRunning && (
            <div className="space-y-1 text-xs">
              {currentRunningTask && (
                <div className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Você: {currentRunningTask.question}
                </div>
              )}
              <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 flex items-center gap-2.5 font-bold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>
                  {isEn
                    ? "BP Agent is analyzing in the background (you can navigate freely)..."
                    : "Agente BP analisando em segundo plano (você pode trocar de página livremente)..."}
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={(e) => handleAsk(e)} className="flex gap-2">
          <input
            type="text"
            placeholder={
              isEn
                ? "Ask about liquidity, Fleuriet NCG, debt, Dupont..."
                : "Pergunte sobre liquidez, Fleuriet NCG, endividamento, Dupont..."
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isRunning}
            className={`flex-1 ${
              isDark
                ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 font-semibold"
                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 font-semibold"
            } border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-60`}
          />
          <button
            type="submit"
            disabled={isRunning || !question.trim()}
            className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isEn ? "Send" : "Perguntar"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
