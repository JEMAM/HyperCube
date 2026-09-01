"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Cpu, CheckCircle2, AlertCircle, Code } from "lucide-react";
import { usePreferences } from "./PreferencesContext";

interface RuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRuleUpdated?: () => void;
}

export default function RuleEditorModal({ isOpen, onClose, onRuleUpdated }: RuleEditorModalProps) {
  const { theme, apiBaseUrl } = usePreferences();
  const isDark = theme === "dark";

  const [rules, setRules] = useState<any[]>([]);
  const [targetAccount, setTargetAccount] = useState("");
  const [expression, setExpression] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRules = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/dsl/rules`);
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error("Error fetching rules:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRules();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccount.trim() || !expression.trim()) {
      setError("Preencha a conta de destino e a fórmula de modelagem.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/multidim/dsl/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_account: targetAccount.trim(),
          expression: expression.trim(),
          description: description.trim() || `Regra declarativa para ${targetAccount}`
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao salvar fórmula DSL");
      }
      setSuccess(`Fórmula para '${targetAccount}' compilada e aplicada com sucesso!`);
      setTargetAccount("");
      setExpression("");
      setDescription("");
      await fetchRules();
      if (onRuleUpdated) onRuleUpdated();
    } catch (err: any) {
      setError(err.message || "Erro de compilação da fórmula");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Editor de Fórmulas DSL (Connected Planning)</h2>
              <p className="text-xs text-slate-600 dark:text-slate-200 font-medium">Regras de modelagem financeira declarativa compiladas para o DAG topológico</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Active Rules List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-amber-500" />
              Regras Ativas no Modelo ({rules.length})
            </h3>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {rules.map((rule) => (
                <div key={rule.target_account} className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-500 font-mono text-[13px]">{rule.target_account}</span>
                    <span className="text-[10.5px] text-slate-600 dark:text-slate-300 font-semibold">{rule.dependencies?.length || 0} dependência(s)</span>
                  </div>
                  <div className="font-mono text-sky-400 bg-slate-900 px-2 py-1 rounded border border-slate-800/80 font-semibold">
                    = {rule.expression}
                  </div>
                  {rule.description && (
                    <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium">{rule.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form to Add New Rule */}
          <form onSubmit={handleSaveRule} className={`p-5 rounded-xl border space-y-4 ${
            isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Nova Regra de Modelagem</h4>
            
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Conta de Destino (Target Account)</label>
                <input
                  type="text"
                  placeholder="ex: EBITDA, Margem_Liquida"
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-mono font-semibold border outline-none ${
                    isDark ? "bg-slate-900 border-slate-700 text-white focus:border-amber-500" : "bg-white border-slate-300 focus:border-amber-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Descrição Negocial</label>
                <input
                  type="text"
                  placeholder="ex: EBITDA = Margem Bruta - SG&A"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium border outline-none ${
                    isDark ? "bg-slate-900 border-slate-700 text-white focus:border-amber-500" : "bg-white border-slate-300 focus:border-amber-500"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Expressão DSL (Sintaxe Anaplan: <code className="text-amber-400">[Conta]</code> e <code className="text-sky-400">IF/THEN/ELSE</code>)
              </label>
              <textarea
                rows={2}
                placeholder="ex: [Margem_Bruta] - [Despesas_Vendas] - [Despesas_Gerais_Admin]"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-mono font-semibold border outline-none ${
                  isDark ? "bg-slate-900 border-slate-700 text-white focus:border-amber-500" : "bg-white border-slate-300 focus:border-amber-500"
                }`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-200 hover:text-white hover:bg-slate-800 transition"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {loading ? "Compilando..." : "Compilar e Salvar Regra"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
