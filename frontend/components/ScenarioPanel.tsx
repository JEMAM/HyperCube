"use client";

import React, { useState } from "react";
import { Play, RotateCcw, Zap } from "lucide-react";
import { usePreferences } from "./PreferencesContext";

interface ScenarioPanelProps {
  viewMode?: "DRE" | "DFC";
  onSimulate: (data: any) => void;
  onReset: () => void;
  lastMetrics: any;
  loading: boolean;
}

export default function ScenarioPanel({ viewMode = "DRE", onSimulate, onReset, lastMetrics, loading }: ScenarioPanelProps) {
  const { theme, language, t, apiBaseUrl } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [node, setNode] = useState(viewMode === "DFC" ? "recebimento_vendas" : "despesas_de_captacao");
  const [changePct, setChangePct] = useState(10);
  const [startYear, setStartYear] = useState(2024);
  const [endYear, setEndYear] = useState(2025);
  const [dynamicInputNodes, setDynamicInputNodes] = useState<{ id: string; label: string }[]>([]);

  const fetchInputNodes = async () => {
    try {
      const endpoint = viewMode === "DFC" ? `${apiBaseUrl}/api/dfc/dag/input-nodes` : `${apiBaseUrl}/api/dag-inputs`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDynamicInputNodes(data);
          if (!node || !data.some((n: any) => n.id === node)) {
            setNode(data[0].id);
          }
        }
      }
    } catch (e) {
      console.warn("Input nodes fetch fallback (backend connecting or offline)");
    }
  };

  React.useEffect(() => {
    fetchInputNodes();
  }, [viewMode, apiBaseUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate({
      node,
      change_pct: changePct,
      start_year: startYear || null,
      end_year: endYear || null,
    });
  };

  return (
    <div className={`${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-md"} border rounded-xl p-5 shadow-lg space-y-5 transition`}>
      {/* Scenario Header */}
      <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
        <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>
            {isEn ? "What-If Simulation Panel" : "Painel What-If"} ({viewMode === "DFC" ? (isEn ? "Cash Flow" : "Fluxo de Caixa") : (isEn ? "Income Statement" : "DRE")})
          </span>
        </div>
      </div>

      {/* Simulation Form (Premissa / Nó de Entrada) */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"} mb-1`}>
            {t("inputNodeLabel")}
          </label>
          <select
            value={node}
            onChange={(e) => setNode(e.target.value)}
            className={`w-full ${isDark ? "bg-slate-800 border-slate-700 text-slate-100 font-semibold" : "bg-slate-50 border-slate-300 text-slate-900 font-semibold"} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500`}
          >
            {dynamicInputNodes.length > 0 ? (
              dynamicInputNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {t(n.id) !== n.id ? t(n.id) : (n.label || n.id)}
                </option>
              ))
            ) : viewMode === "DRE" ? (
              <>
                <option value="despesas_de_captacao">{t("fundingExpenseOpt")}</option>
                <option value="provisao_para_risco_de_credito_prc">{t("creditRiskOpt")}</option>
                <option value="receita_com_operacoes_de_credito_e_repasses">{t("creditRevOpt")}</option>
                <option value="despesas_pessoal_e_administrativas">{t("adminExpenseOpt")}</option>
              </>
            ) : (
              <>
                <option value="recebimento_vendas">
                  {isEn ? "(+) Customer Collections / Sales Receipts" : "(+) Recebimento de Vendas de Produtos / Serviços"}
                </option>
                <option value="pagamento_fornecedores">
                  {isEn ? "(-) Supplier Payments" : "(-) Pagamento a Fornecedores"}
                </option>
                <option value="pagamento_salarios">
                  {isEn ? "(-) Payroll & Employee Benefits" : "(-) Pagamento de Salários e Encargos"}
                </option>
                <option value="pagamento_despesas_operacionais">
                  {isEn ? "(-) Operating Expense Payments" : "(-) Pagamento de Despesas Operacionais"}
                </option>
                <option value="pagamento_impostos">
                  {isEn ? "(-) Income Tax & Duty Payments" : "(-) Pagamento de Impostos e Tributos"}
                </option>
                <option value="aquisicao_ativos_imobilizados">
                  {isEn ? "(-) CapEx / PP&E Acquisitions" : "(-) Aquisição de Ativos Imobilizados"}
                </option>
                <option value="compra_imoveis_veiculos">
                  {isEn ? "(-) Property / Vehicle Purchases" : "(-) Compra de Imóveis ou Veículos"}
                </option>
                <option value="venda_ativos_equipamentos">
                  {isEn ? "(+) Asset / Equipment Disposals" : "(+) Venda de Ativos / Equipamentos"}
                </option>
                <option value="aporte_capital">
                  {isEn ? "(+) Capital Contributions" : "(+) Aporte de Capital dos Sócios"}
                </option>
                <option value="captacao_emprestimos">
                  {isEn ? "(+) Debt Issuance / Borrowings" : "(+) Captação de Empréstimos/Financiamentos"}
                </option>
                <option value="amortizacao_dividas">
                  {isEn ? "(-) Principal Debt Repayments" : "(-) Amortização de Dívidas"}
                </option>
                <option value="pagamento_dividendos_jcp">
                  {isEn ? "(-) Dividend & Interest on Equity Distributions" : "(-) Pagamento de Dividendos / JCP"}
                </option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className={`block text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"} mb-1`}>
            {t("variationLabel")}
          </label>
          <input
            type="number"
            value={changePct}
            onChange={(e) => setChangePct(Number(e.target.value))}
            className={`w-full ${isDark ? "bg-slate-800 border-slate-700 text-slate-100 font-bold font-mono" : "bg-slate-50 border-slate-300 text-slate-900 font-bold font-mono"} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"} mb-1`}>
              {t("startYearLabel")}
            </label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className={`w-full ${isDark ? "bg-slate-800 border-slate-700 text-slate-100 font-semibold font-mono" : "bg-slate-50 border-slate-300 text-slate-900 font-semibold font-mono"} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"} mb-1`}>
              {t("endYearLabel")}
            </label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              className={`w-full ${isDark ? "bg-slate-800 border-slate-700 text-slate-100 font-semibold font-mono" : "bg-slate-50 border-slate-300 text-slate-900 font-semibold font-mono"} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition shadow-sm"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? t("simulating") : t("runSimulation")}</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition ${
              isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-slate-100 border-slate-300 hover:bg-slate-200"
            }`}
            title={t("resetSimulation")}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {lastMetrics && lastMetrics.elapsed_ms !== undefined && (
        <div className={`p-3 rounded-lg border text-xs space-y-1 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <div className="text-amber-500 font-bold">{t("reactivityBadge")}</div>
          <div className="flex justify-between">
            <span>{isEn ? "Modified Node:" : "Nó Alterado:"}</span>
            <span className="font-semibold text-sky-400">{lastMetrics.node}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("recalcTime")}:</span>
            <span className="font-semibold text-amber-400">{lastMetrics.elapsed_ms.toFixed(2)} ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
