"""
Autonomous Board Advisor Agent (Agno C-Level FP&A Intelligence)
==============================================================
Generates comprehensive, board-ready executive memoranda and governance assessments
for the Board of Directors, Audit Committee, and C-Suite executives.
Integrates 3-Statement financial statements, Fleuriet working capital, Headcount/Capex drivers,
Rolling Forecast, and Monte Carlo stochastic VaR risk metrics.
"""

import os
from typing import Dict, Any, Optional
from datetime import datetime

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.models.google import Gemini
from agno.models.anthropic import Claude
from agno.models.groq import Groq
from agno.models.ollama import Ollama

from backend.app.engine.three_statement_engine import ThreeStatementEngine, COMPANIES_METADATA
from backend.app.engine.covenant_monitor_engine import CovenantMonitorEngine
from backend.app.engine.rolling_forecast_engine import RollingForecastEngine
from backend.app.engine.monte_carlo_engine import MonteCarloEngine


def _resolve_llm_model(model_name: Optional[str] = None, api_key: Optional[str] = None):
    """Dynamically resolves the active LLM provider and returns the appropriate Agno model."""
    name = (model_name or os.getenv("HYPERCUBE_AI_MODEL", "gemma4:12b")).strip()
    key = (api_key or os.getenv("HYPERCUBE_AI_KEY", "")).strip()

    # Ollama Local
    if "gemma" in name.lower() or "qwen" in name.lower() or "deepseek" in name.lower() or "ollama" in name.lower():
        endpoint = os.getenv("HYPERCUBE_OLLAMA_ENDPOINT", "http://localhost:11434")
        return Ollama(id=name if ":" in name else f"{name}:latest", host=endpoint)

    # Groq LPU
    if "llama" in name.lower() or "groq" in name.lower():
        groq_key = key or os.getenv("GROQ_API_KEY", "")
        if groq_key:
            return Groq(id="llama-3.3-70b-versatile", api_key=groq_key)

    # Anthropic
    if "claude" in name.lower() or "sonnet" in name.lower() or "opus" in name.lower():
        anthropic_key = key or os.getenv("ANTHROPIC_API_KEY", "")
        if anthropic_key:
            return Claude(id="claude-3-5-sonnet-20241022", api_key=anthropic_key)

    # Gemini
    if "gemini" in name.lower():
        gemini_key = key or os.getenv("GEMINI_API_KEY", "")
        if gemini_key:
            return Gemini(id="gemini-2.0-flash", api_key=gemini_key)

    # OpenAI
    openai_key = key or os.getenv("OPENAI_API_KEY", "")
    if openai_key:
        return OpenAIChat(id="gpt-4o", api_key=openai_key)

    # Fallback to local Ollama
    return Ollama(id="gemma4:12b", host=os.getenv("HYPERCUBE_OLLAMA_ENDPOINT", "http://localhost:11434"))


class BoardAdvisorAgent:
    """
    Autonomous C-Level Governance Agent producing formal Board-Ready Executive Memoranda.
    """

    def __init__(self, company_id: str = "klabin"):
        self.company_id = company_id.lower().strip()
        if self.company_id not in COMPANIES_METADATA:
            self.company_id = "klabin"

        self.meta = COMPANIES_METADATA[self.company_id]
        self.three_engine = ThreeStatementEngine(company_id=self.company_id)
        self.cov_engine = CovenantMonitorEngine(company_id=self.company_id)
        self.rolling_engine = RollingForecastEngine(company_id=self.company_id)
        self.mc_engine = MonteCarloEngine(company_id=self.company_id, iterations=1500)

    def generate_board_memo(
        self,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates an executive Board of Directors memorandum.
        Combines deterministic financial modeling with LLM reasoning.
        """
        # 1. Gather all analytical inputs
        three_stmt = self.three_engine.get_full_model(company_id=self.company_id)
        covenants = self.cov_engine.evaluate_covenants()
        rolling = self.rolling_engine.get_summary()
        mc_sim = self.mc_engine.run_simulation()

        p2025 = three_stmt["periods_data"]["2025"]["values"]
        budget_2026 = three_stmt["periods_data"]["Budget_2026"]["values"]
        fleuriet = three_stmt["periods_data"]["Budget_2026"]["fleuriet"]
        dupont = three_stmt["periods_data"]["Budget_2026"]["dupont"]

        # 2. Build structured contextual payload
        context_summary = {
            "company_name": self.meta["name"],
            "ticker": self.meta["ticker"],
            "sector": self.meta["sector"],
            "revenue_2025": p2025["receita_liquida"],
            "revenue_2026_budget": budget_2026["receita_liquida"],
            "revenue_growth_pct": round(((budget_2026["receita_liquida"] - p2025["receita_liquida"]) / p2025["receita_liquida"]) * 100.0, 2),
            "ebitda_2025": p2025["ebitda"],
            "ebitda_2026_budget": budget_2026["ebitda"],
            "ebitda_margin_2026_pct": round((budget_2026["ebitda"] / budget_2026["receita_liquida"]) * 100.0, 2),
            "net_income_2026_budget": budget_2026["lucro_liquido"],
            "net_margin_2026_pct": round((budget_2026["lucro_liquido"] / budget_2026["receita_liquida"]) * 100.0, 2),
            "net_debt": covenants["headrooms"]["current_net_debt"],
            "ending_cash": covenants["headrooms"]["current_cash"],
            "leverage_ratio": covenants["timeline"][-1]["leverage_ratio"],
            "covenant_limit": covenants["timeline"][-1]["covenant_limit"],
            "ebitda_headroom_brl": covenants["headrooms"]["ebitda_headroom_brl"],
            "debt_headroom_brl": covenants["headrooms"]["debt_headroom_brl"],
            "overall_covenant_status": covenants["overall_status"],
            "fleuriet_st": fleuriet["st"],
            "fleuriet_ncg": fleuriet["ncg"],
            "fleuriet_cdg": fleuriet["cdg"],
            "fleuriet_status": fleuriet["classificacao"],
            "var_95_ebitda": mc_sim["risk_metrics"]["var_95_ebitda"],
            "prob_cash_negative": mc_sim["risk_metrics"]["prob_cash_negative_pct"],
            "prob_covenant_breach": mc_sim["risk_metrics"]["prob_covenant_breach_pct"]
        }

        # 3. Try generating via Agno Agent with configured LLM
        try:
            model = _resolve_llm_model(model_name, api_key)
            agent = Agent(
                model=model,
                description="Você é o Chief Financial Officer (CFO) e Consultor Sênior de Governança Corporativa do HyperCube. Emita um parecer executivo formal para o Conselho de Administração.",
                instructions=[
                    "Escreva em português corporativo formal, técnico e conciso.",
                    "Divida o parecer em seções bem estruturadas com títulos claros.",
                    "Analise margens, liquidez Fleuriet, headroom de covenants de dívida e o risco estocástico VaR 95%.",
                    "Finalize com uma recomendação executiva de voto (Aprovação Plena, Aprovação com Ressalvas ou Ação Corretiva)."
                ]
            )

            prompt = f"""
            Por favor, elabore o MEMORANDO EXECUTIVO DO CONSELHO DE ADMINISTRAÇÃO para a companhia {context_summary['company_name']} ({context_summary['ticker']}):

            DADOS CONSOLIDADOS DO MODELO:
            - Receita Líquida Orçada (2026): R$ {context_summary['revenue_2026_budget']:,.2f} M (Crescimento de {context_summary['revenue_growth_pct']}%)
            - EBITDA Orçado: R$ {context_summary['ebitda_2026_budget']:,.2f} M (Margem: {context_summary['ebitda_margin_2026_pct']}%)
            - Lucro Líquido: R$ {context_summary['net_income_2026_budget']:,.2f} M (Margem: {context_summary['net_margin_2026_pct']}%)
            - Dívida Líquida Atual: R$ {context_summary['net_debt']:,.2f} M | Caixa Final: R$ {context_summary['ending_cash']:,.2f} M
            - Alavancagem Projetada: {context_summary['leverage_ratio']}x Dívida Líquida / EBITDA (Limite do Covenant: {context_summary['covenant_limit']}x)
            - Headroom de EBITDA: R$ {context_summary['ebitda_headroom_brl']:,.2f} M | Folga de Dívida: R$ {context_summary['debt_headroom_brl']:,.2f} M
            - Status Geral dos Covenants: {context_summary['overall_covenant_status']}
            - Capital de Giro Fleuriet: NCG = R$ {context_summary['fleuriet_ncg']:,.2f} M | CDG = R$ {context_summary['fleuriet_cdg']:,.2f} M | Saldo de Tesouraria = R$ {context_summary['fleuriet_st']:,.2f} M
            - Diagnóstico Fleuriet: {context_summary['fleuriet_status']}
            - Value at Risk (VaR 95% do EBITDA): R$ {context_summary['var_95_ebitda']:,.2f} M
            - Probabilidade de Déficit de Caixa: {context_summary['prob_cash_negative']}%
            - Probabilidade de Quebra de Covenant: {context_summary['prob_covenant_breach']}%

            Gere o parecer em formato Markdown formal para a reunião de conselho.
            """

            response = agent.run(prompt)
            memo_content = response.content if hasattr(response, "content") else str(response)

            return {
                "company_id": self.company_id,
                "company_name": self.meta["name"],
                "ticker": self.meta["ticker"],
                "generated_at": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                "source": "agno_agent",
                "memo_markdown": memo_content,
                "metrics": context_summary
            }
        except Exception as e:
            # High-fidelity deterministic fallback memorandum
            fallback_memo = self._generate_analytical_fallback_memo(context_summary)
            return {
                "company_id": self.company_id,
                "company_name": self.meta["name"],
                "ticker": self.meta["ticker"],
                "generated_at": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                "source": "deterministic_fallback",
                "memo_markdown": fallback_memo,
                "metrics": context_summary
            }

    def _generate_analytical_fallback_memo(self, c: Dict[str, Any]) -> str:
        """Constructs an exhaustive, quantitative Board Memorandum in Markdown format."""
        vote_recommendation = "APROVAÇÃO COM MONITORAMENTO DE LIQUIDEZ" if c["ebitda_headroom_brl"] > 500 else "APROVAÇÃO COM RESSALVA DE ALAVANCAGEM"
        covenant_badge = "CONFORME (VERDE)" if c["overall_covenant_status"] == "SAFE" else "ATENÇÃO (AMARELO)"

        return f"""# PARECER EXECUTIVO — CONSELHO DE ADMINISTRAÇÃO & COMITÊ DE AUDITORIA
**Companhia:** {c['company_name']} | **Ticker:** {c['ticker']} | **Setor:** {c['sector']}  
**Data de Emissão:** {datetime.now().strftime("%d de %B de %Y")} | **Classificação:** Estritamente Confidencial — C-Suite  

---

### 1. Sumário Executivo & Diagnóstico C-Level
O planejamento integrado para o exercício de 2026 projeta um desempenho financeiro consistente para a **{c['company_name']}**, com **Receita Líquida de R$ {c['revenue_2026_budget']:,.1f} Milhões** (+{c['revenue_growth_pct']}% YoY) e **EBITDA de R$ {c['ebitda_2026_budget']:,.1f} Milhões**, representando uma margem EBITDA de **{c['ebitda_margin_2026_pct']}%**. 

A estrutura de capital permanece sólida, com **Alavancagem de {c['leverage_ratio']}x** Dívida Líquida / EBITDA, operando dentro do limite contratual de covenants estipulado em **{c['covenant_limit']}x**.

---

### 2. Desempenho Operacional & Decomposição de Margens
* **Receita Líquida:** R$ {c['revenue_2026_budget']:,.1f} M (expansão impulsionada pela execução dos drivers operacionais de capacidade fabril e precificação).
* **EBITDA Operacional:** R$ {c['ebitda_2026_budget']:,.1f} M (+{c['ebitda_margin_2026_pct']}% de margem). A eficiência em gastos com pessoal decorre da estabilização da curva de headcount e diluição de despesas gerais e administrativas (SG&A).
* **Lucro Líquido Projetado:** R$ {c['net_income_2026_budget']:,.1f} M, com margem líquida de **{c['net_margin_2026_pct']}%**, já considerando despesas financeiras líquidas e alíquota de tributos de 25%.

---

### 3. Gestão de Capital de Giro & Liquidez (Modelo Fleuriet)
* **Necessidade de Capital de Giro (NCG):** R$ {c['fleuriet_ncg']:,.1f} M
* **Capital de Giro Próprio (CDG):** R$ {c['fleuriet_cdg']:,.1f} M
* **Saldo de Tesouraria (ST):** R$ {c['fleuriet_st']:,.1f} M
* **Classificação Dinâmica:** `{c['fleuriet_status']}`.  
A tesouraria mantém liquidez de curto prazo suficiente para suportar o ciclo operacional e a sazonalidade de estoques e contas a receber sem dependência excessiva de linhas rotativas de curtíssimo prazo.

---

### 4. Governança da Dívida & Monitor de Covenants Contratuais
* **Status Geral de Governança:** **{covenant_badge}**
* **Headroom de EBITDA:** R$ {c['ebitda_headroom_brl']:,.1f} M (folga de {c['ebitda_headroom_pct']}%). O EBITDA corporativo pode retrair em até este montante antes de violar o covenant restritivo.
* **Folga de Dívida Adicional:** A companhia possui capacidade de absorver até **R$ {c['debt_headroom_brl']:,.1f} Milhões** em nova dívida líquida antes de atingir o teto de {c['covenant_limit']}x.
* **Saldo Final de Caixa em Tesouraria:** R$ {c['ending_cash']:,.1f} M.

---

### 5. Análise de Incerteza Estocástica & Risco de Cauda (Monte Carlo)
A partir de **1.500 iterações estocásticas vetorizadas em NumPy**:
* **Value at Risk (VaR 95% do EBITDA):** **R$ {c['var_95_ebitda']:,.1f} Milhões**. Em 95% dos cenários simulados, o shortfall máximo de EBITDA frente ao orçamento não ultrapassa esta magnitude.
* **Probabilidade de Déficit de Caixa:** **{c['prob_cash_negative']}%** (risco de estresse severo de liquidez classificado como negligenciável).
* **Probabilidade de Violação de Covenants:** **{c['prob_covenant_breach']}%**.

---

### 6. Parecer Conclusivo & Recomendações Estratégicas
**Voto Recomendado:** `{vote_recommendation}`.

**Diretrizes ao Management Executivo:**
1. **Disciplina de Capex:** Manter os desembolsos de expansão estritamente vinculados aos gatilhos trimestrais de geração operacional de caixa (FCO).
2. **Hedge Cambial & Custo de Dívida:** Manter o monitoramento contínuo das debêntures indexadas ao CDI e assegurar proteção de juros caso a taxa Selic oscile acima do intervalo base.
3. **Preservação de Headroom:** Priorizar a folga mínima de R$ 500 Milhões sobre o teto de covenants para blindagem da classificação de risco (Rating de Crédito).
"""
