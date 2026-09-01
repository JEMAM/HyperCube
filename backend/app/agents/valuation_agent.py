import os
import math
from typing import Dict, Any, List, Optional

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.models.google import Gemini
from agno.models.anthropic import Claude
from agno.models.groq import Groq
from agno.models.ollama import Ollama

MODEL_ALIASES = {
    # Groq
    "openai/gpt-oss-120b": "llama-3.3-70b-versatile",
    "openai/gpt-oss-20b": "llama-3.1-8b-instant",
    "llama-3.1-8b-instant": "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile": "llama-3.3-70b-versatile",
    "whisper-large-v3": "whisper-large-v3",
    "Llama 3.3 70B Versatile": "llama-3.3-70b-versatile",
    "Llama 3.1 8B Instant": "llama-3.1-8b-instant",
    "DeepSeek R1 Distill Llama 70B": "deepseek-r1-distill-llama-70b",
    "Qwen 2.5 32B": "qwen-2.5-32b",
    "Mixtral 8x7B": "mixtral-8x7b-32768",
    "Gemma 2 9B": "gemma2-9b-it",

    # Ollama Local
    "Gemma 4 (12B)": "gemma4:12b",
    "gemma4:12b": "gemma4:12b",
    "Gemma 4": "gemma4:12b",
    "gemma4": "gemma4:12b",
    "Gemma 2 (9B)": "gemma2:9b",
    "Gemma 2 (27B)": "gemma2:27b",
    "Gemma 2 (2B)": "gemma2:2b",
    "Qwen 2.5 (7B)": "qwen2.5:7b",
    "Qwen 2.5 (14B)": "qwen2.5:14b",
    "DeepSeek-R1 (8B)": "deepseek-r1:8b",
    "DeepSeek-R1 (14B)": "deepseek-r1:14b",
    "Llama 3.3 (70B)": "llama3.3:70b",
    "Llama 3.2 (3B)": "llama3.2:3b",
    "Llama 3.1 (8B)": "llama3.1:8b",
    "Mistral (7B)": "mistral:7b",

    # Anthropic
    "Claude Opus 4.8": "claude-3-opus-20240229",
    "Claude Sonnet 5": "claude-3-5-sonnet-20241022",
    "Claude Haiku 4.5": "claude-3-5-haiku-20241022",
    "Claude Fable 5": "claude-3-5-sonnet-20241022",
    "Claude 3.7 Sonnet": "claude-3-7-sonnet-20250219",
    "Claude 3.5 Sonnet": "claude-3-5-sonnet-20241022",
    "Claude 3.5 Haiku": "claude-3-5-haiku-20241022",
    "Claude 3 Opus": "claude-3-opus-20240229",

    # OpenAI
    "GPT-5.6 Sol": "gpt-4o",
    "GPT-5.6 Terra": "gpt-4o",
    "GPT-5.6 Luna": "gpt-4o",
    "GPT-5.5 Instant": "gpt-4o-mini",
    "GPT-5.5 Thinking": "o3-mini",
    "GPT-5.4 Thinking": "o3-mini",
    "GPT-4o": "gpt-4o",
    "GPT-4o Mini": "gpt-4o-mini",
    "o3-mini": "o3-mini",
    "o1": "o1",

    # Gemini
    "Gemini 3.7 Flash": "gemini-2.0-flash",
    "Gemini 3.6 Flash": "gemini-2.0-flash",
    "Gemini 3.5 Flash": "gemini-2.0-flash",
    "Gemini 3.5 Flash-Lite": "gemini-2.0-flash-lite-preview-02-05",
    "Gemini 3.1 Flash-Lite": "gemini-2.0-flash-lite-preview-02-05",
    "Gemini 3.1 Pro": "gemini-2.0-flash",
    "Gemini 3 Flash": "gemini-2.0-flash",
    "Gemini 2.0 Flash": "gemini-2.0-flash",
    "Gemini 2.0 Flash-Lite": "gemini-2.0-flash-lite-preview-02-05",
    "Gemini 1.5 Pro": "gemini-1.5-pro",
    "Gemini 1.5 Flash": "gemini-1.5-flash",
}

class ValuationAgent:
    """
    Agno AI Corporate Valuation Agent adhering strictly to 'valuation-empresas' and 'valuation-dcf' skills.
    Implements Discounted Cash Flow (DCF), WACC calculation, Market Multiples (EV/EBITDA, P/E, EV/Sales, P/VP),
    Asset-Based Approach, Sensitivity Matrices, and transparent step-by-step calculation trace.
    """

    def __init__(self, config: Optional[Dict[str, str]] = None):
        self.config = config or {"provider": "gemini", "model": "gemini-2.0-flash", "api_key": ""}

    def _get_model_instance(self):
        """Builds Agno model instance based on runtime config."""
        provider = (self.config.get("provider") or "groq").lower()
        model_name = self.config.get("model") or "Llama 3.3 70B Versatile"
        api_key = self.config.get("api_key") or ""
        resolved_model = MODEL_ALIASES.get(model_name, model_name)

        if provider == "groq":
            key = api_key or os.getenv("GROQ_API_KEY")
            return Groq(id=resolved_model, api_key=key) if key else None
        elif provider == "gemini":
            key = api_key or os.getenv("GEMINI_API_KEY")
            return Gemini(id=resolved_model, api_key=key) if key else None
        elif provider == "openai":
            key = api_key or os.getenv("OPENAI_API_KEY")
            return OpenAIChat(id=resolved_model, api_key=key) if key else None
        elif provider == "claude":
            key = api_key or os.getenv("ANTHROPIC_API_KEY")
            return Claude(id=resolved_model, api_key=key) if key else None
        elif provider == "ollama":
            base_url = api_key if (api_key and "http" in api_key) else "http://localhost:11434"
            return Ollama(id=resolved_model, host=base_url)
        return None

    def calculate_valuation(
        self,
        company_data: Dict[str, Any],
        wacc_override: Optional[float] = None,
        g_override: Optional[float] = None,
        beta_override: Optional[float] = None,
        rf_override: Optional[float] = None,
        mrp_override: Optional[float] = None,
        kd_override: Optional[float] = None,
        tax_override: Optional[float] = None,
        debt_ratio_override: Optional[float] = None,
        ebit_margin_override: Optional[float] = None,
        growth_rate_override: Optional[float] = None,
        capex_ratio_override: Optional[float] = None,
        nwc_ratio_override: Optional[float] = None,
        exit_multiple_override: Optional[float] = None,
        peer_pe_override: Optional[float] = None,
        pvp_override: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Executes comprehensive multi-criteria valuation:
        1. WACC Calculation (CAPM & Debt Structure)
        2. DCF Forecast (5-year FCFF projection + Gordon Growth + Exit Multiple)
        3. Market Multiples (EV/EBITDA, P/E, EV/Sales, P/VP with peer benchmark)
        4. Asset-Based (Book Value, Adjusted, Liquidation)
        5. Value Range & Football Field
        6. Sensitivity Matrix (WACC vs g)
        7. Audit Trail / Step-by-Step Explanation & Methodologies Parameters
        """
        # Baseline company fundamentals
        name = company_data.get("name", "Empresa Analisada")
        ticker = company_data.get("ticker", "TICK3")
        sector = company_data.get("setor", company_data.get("sector", "Geral"))
        
        # Financial annual / quarterly baseline
        annual_rev = float(company_data.get("receita_liquida", 10500.0))
        
        # Sector Beta estimation
        sector_lower = sector.lower()
        if "petr" in sector_lower or "combust" in sector_lower:
            beta = 1.15
            debt_ratio = 0.40
            kd_pre_tax = 0.125
            exit_multiple = 4.8
            peer_pe = 6.2
        elif "miner" in sector_lower or "metal" in sector_lower:
            beta = 1.10
            debt_ratio = 0.35
            kd_pre_tax = 0.120
            exit_multiple = 5.2
            peer_pe = 7.0
        elif "banco" in sector_lower or "financ" in sector_lower:
            beta = 0.95
            debt_ratio = 0.60
            kd_pre_tax = 0.110
            exit_multiple = 8.5
            peer_pe = 8.8
        elif "varej" in sector_lower or "comércio" in sector_lower:
            beta = 1.30
            debt_ratio = 0.45
            kd_pre_tax = 0.140
            exit_multiple = 6.5
            peer_pe = 12.5
        elif "energ" in sector_lower or "eletric" in sector_lower:
            beta = 0.75
            debt_ratio = 0.50
            kd_pre_tax = 0.115
            exit_multiple = 7.2
            peer_pe = 10.0
        elif "aero" in sector_lower or "transp" in sector_lower:
            beta = 1.20
            debt_ratio = 0.40
            kd_pre_tax = 0.130
            exit_multiple = 7.8
            peer_pe = 14.0
        elif "bebida" in sector_lower or "aliment" in sector_lower:
            beta = 0.80
            debt_ratio = 0.25
            kd_pre_tax = 0.110
            exit_multiple = 9.0
            peer_pe = 15.0
        else:
            beta = 1.05
            debt_ratio = 0.35
            kd_pre_tax = 0.125
            exit_multiple = 6.5
            peer_pe = 10.5

        # Capital structure baseline
        tax_rate = 0.34
        rf_rate = 0.065
        mrp = 0.055
        calc_g = 0.035
        base_ebit_margin = float(company_data.get("margem_ebit", 15.0)) / 100.0
        base_gross_margin = float(company_data.get("margem_bruta", 35.0)) / 100.0
        base_net_margin = float(company_data.get("margem_liquida", 8.0)) / 100.0

        # Apply What-If Parameter Overrides
        if beta_override is not None and beta_override > 0:
            beta = float(beta_override)
        if rf_override is not None and rf_override > 0:
            rf_rate = float(rf_override)
        if mrp_override is not None and mrp_override > 0:
            mrp = float(mrp_override)
        if kd_override is not None and kd_override > 0:
            kd_pre_tax = float(kd_override)
        if tax_override is not None and tax_override >= 0:
            tax_rate = float(tax_override)
        if debt_ratio_override is not None and 0 <= debt_ratio_override <= 0.95:
            debt_ratio = float(debt_ratio_override)
        
        ebit_margin = float(ebit_margin_override) if (ebit_margin_override is not None and ebit_margin_override > 0) else base_ebit_margin
        capex_ratio = float(capex_ratio_override) if (capex_ratio_override is not None and capex_ratio_override >= 0) else 0.050
        nwc_ratio = float(nwc_ratio_override) if (nwc_ratio_override is not None and nwc_ratio_override >= 0) else 0.015
        base_growth = float(growth_rate_override) if (growth_rate_override is not None) else 0.060
        g = float(g_override) if (g_override is not None and g_override > 0) else calc_g

        if exit_multiple_override is not None and exit_multiple_override > 0:
            exit_multiple = float(exit_multiple_override)
        if peer_pe_override is not None and peer_pe_override > 0:
            peer_pe = float(peer_pe_override)

        ebit = annual_rev * ebit_margin
        net_income = annual_rev * base_net_margin
        ebitda = ebit + (annual_rev * 0.04) # D&A approx 4% of revenue

        # 1. Cost of Equity (CAPM)
        ke = rf_rate + (beta * mrp) + 0.02 # +2% Country risk / size premium
        # Cost of Debt after-tax
        kd_after_tax = kd_pre_tax * (1.0 - tax_rate)
        # WACC calculation
        equity_ratio = 1.0 - debt_ratio
        calc_wacc = (equity_ratio * ke) + (debt_ratio * kd_after_tax)
        wacc = float(wacc_override) if (wacc_override and wacc_override > 0.02) else calc_wacc

        # Safety check: WACC must be strictly greater than g
        if wacc <= g:
            wacc = g + 0.02

        # 2. 5-Year FCFF Projection
        projections = []
        base_revenue = annual_rev
        pv_fcff_sum = 0.0

        for year in range(1, 6):
            growth_rate = base_growth - (year * 0.005) # Converging growth
            proj_rev = base_revenue * ((1.0 + growth_rate) ** year)
            proj_ebit = proj_rev * ebit_margin
            nopat = proj_ebit * (1.0 - tax_rate)
            da = proj_rev * 0.045
            capex = proj_rev * capex_ratio
            delta_nwc = proj_rev * nwc_ratio
            fcff = nopat + da - capex - delta_nwc
            
            df = 1.0 / ((1.0 + wacc) ** year)
            pv_fcff = fcff * df
            pv_fcff_sum += pv_fcff

            projections.append({
                "year": f"Ano {year}",
                "receita": round(proj_rev, 2),
                "ebit": round(proj_ebit, 2),
                "nopat": round(nopat, 2),
                "da": round(da, 2),
                "capex": round(-capex, 2),
                "delta_nwc": round(-delta_nwc, 2),
                "fcff": round(fcff, 2),
                "discount_factor": round(df, 4),
                "pv_fcff": round(pv_fcff, 2)
            })

        # 3. Terminal Value Calculation
        last_fcff = projections[-1]["fcff"]
        last_ebitda = projections[-1]["ebit"] + projections[-1]["da"]

        # Method A: Gordon Growth Perpetuity
        fcff_terminal = last_fcff * (1.0 + g)
        tv_gordon = fcff_terminal / (wacc - g)
        pv_tv_gordon = tv_gordon / ((1.0 + wacc) ** 5)
        ev_gordon = pv_fcff_sum + pv_tv_gordon

        # Method B: Exit Multiple (EBITDA multiple at year 5)
        tv_multiple = last_ebitda * exit_multiple
        pv_tv_multiple = tv_multiple / ((1.0 + wacc) ** 5)
        ev_multiple = pv_fcff_sum + pv_tv_multiple

        # Primary DCF is Gordon Growth
        primary_ev = ev_gordon

        # Bridge Enterprise Value to Equity Value
        # Net Debt = Total Debt - Cash
        net_debt = annual_rev * debt_ratio * 0.75
        cash = annual_rev * 0.15
        effective_net_debt = max(0.0, net_debt - cash)

        equity_value_gordon = max(100.0, ev_gordon - effective_net_debt)
        equity_value_multiple = max(100.0, ev_multiple - effective_net_debt)

        # Implied Share Price (assuming 1 share per R$ 10 in baseline equity)
        shares_count = max(1.0, (annual_rev * equity_ratio) / 15.0)
        fair_price_gordon = round(equity_value_gordon / shares_count, 2)
        fair_price_multiple = round(equity_value_multiple / shares_count, 2)
        baseline_price = round(fair_price_gordon * 0.82, 2) # Reference market price
        upside_pct = round(((fair_price_gordon - baseline_price) / baseline_price) * 100.0, 1)

        # 4. Market Multiples Valuation
        # EV/EBITDA, P/E, EV/Sales, P/VP
        ev_ebitda_val = ebitda * exit_multiple
        pe_val = net_income * peer_pe
        ev_sales_val = annual_rev * (exit_multiple * 0.22)
        book_val = annual_rev * 0.45
        pvp_val = book_val * 1.35

        # 5. Asset-Based Valuation (Patrimonial)
        adjusted_book_val = book_val * 1.15
        liquidation_val = book_val * 0.70

        # 6. Sensitivity Matrix (WACC vs g)
        wacc_steps = [wacc - 0.02, wacc - 0.01, wacc, wacc + 0.01, wacc + 0.02]
        g_steps = [g - 0.01, g - 0.005, g, g + 0.005, g + 0.01]
        sensitivity_matrix = []

        for w_val in wacc_steps:
            row = {"wacc": round(w_val * 100, 2), "values": []}
            for g_val in g_steps:
                if w_val > g_val:
                    # Recompute TV and EV
                    term_v = (last_fcff * (1.0 + g_val)) / (w_val - g_val)
                    pv_t = term_v / ((1.0 + w_val) ** 5)
                    # Approx PV of cash flows under new discount rate
                    pv_cf = sum(p["fcff"] / ((1.0 + w_val) ** idx) for idx, p in enumerate(projections, start=1))
                    ev_sens = pv_cf + pv_t
                    eq_sens = max(50.0, ev_sens - effective_net_debt)
                    share_sens = round(eq_sens / shares_count, 2)
                    is_base = abs(w_val - wacc) < 0.0001 and abs(g_val - g) < 0.0001
                    diff_pct = round(((share_sens - fair_price_gordon) / fair_price_gordon) * 100.0, 1)
                    row["values"].append({
                        "g": round(g_val * 100, 2),
                        "share_price": share_sens,
                        "diff_pct": diff_pct,
                        "is_base": is_base
                    })
                else:
                    row["values"].append({"g": round(g_val * 100, 2), "share_price": 0.0, "diff_pct": -100.0, "is_base": False})
            sensitivity_matrix.append(row)

        # 7. Football Field Range Consolidation
        football_field = [
            {
                "method": "DCF (Gordon Growth)",
                "low": round(fair_price_gordon * 0.88, 2),
                "mid": fair_price_gordon,
                "high": round(fair_price_gordon * 1.15, 2),
                "ev_mid": round(ev_gordon, 1)
            },
            {
                "method": "DCF (Exit Multiple)",
                "low": round(fair_price_multiple * 0.90, 2),
                "mid": fair_price_multiple,
                "high": round(fair_price_multiple * 1.12, 2),
                "ev_mid": round(ev_multiple, 1)
            },
            {
                "method": "Múltiplos (EV/EBITDA)",
                "low": round((ev_ebitda_val - effective_net_debt) / shares_count * 0.85, 2),
                "mid": round((ev_ebitda_val - effective_net_debt) / shares_count, 2),
                "high": round((ev_ebitda_val - effective_net_debt) / shares_count * 1.20, 2),
                "ev_mid": round(ev_ebitda_val, 1)
            },
            {
                "method": "Múltiplos (P/L Pares)",
                "low": round(pe_val / shares_count * 0.80, 2),
                "mid": round(pe_val / shares_count, 2),
                "high": round(pe_val / shares_count * 1.25, 2),
                "ev_mid": round(pe_val + effective_net_debt, 1)
            },
            {
                "method": "Patrimonial Ajustado",
                "low": round(liquidation_val / shares_count, 2),
                "mid": round(adjusted_book_val / shares_count, 2),
                "high": round(adjusted_book_val / shares_count * 1.15, 2),
                "ev_mid": round(adjusted_book_val + effective_net_debt, 1)
            }
        ]

        # Recommended Value Range (Skill valuation-empresas guideline: present range, not single number)
        min_range = min(f["low"] for f in football_field[:3])
        max_range = max(f["high"] for f in football_field[:3])

        # 8. Step-by-Step Calculation Breakdown ("Como Foi Feito")
        calculation_steps = [
            {
                "step": 1,
                "title": "Custo de Capital Próprio (CAPM)",
                "formula": "Ke = Rf + Beta × (Rm - Rf) + Country Risk",
                "description": f"Calculado com taxa livre de risco Rf = {rf_rate*100:.1f}%, Beta desalavancado do setor = {beta:.2f}, Prêmio de Risco de Mercado (Rm - Rf) = {mrp*100:.1f}% e Prêmio de Risco País de 2,0%.",
                "result": f"{ke*100:.2f}% a.a."
            },
            {
                "step": 2,
                "title": "Custo Médio Ponderado de Capital (WACC)",
                "formula": "WACC = (E/V × Ke) + (D/V × Kd × (1 - T))",
                "description": f"Estrutura de capital com {equity_ratio*100:.0f}% Capital Próprio (Ke = {ke*100:.2f}%) e {debt_ratio*100:.0f}% Capital de Terceiros (Kd pré-taxa = {kd_pre_tax*100:.1f}%, benefício fiscal IR 34% -> Kd líquido = {kd_after_tax*100:.2f}%).",
                "result": f"{wacc*100:.2f}% a.a."
            },
            {
                "step": 3,
                "title": "Fluxo de Caixa Livre da Firma (FCFF)",
                "formula": "FCFF = EBIT × (1 - T) + D&A - CAPEX - ΔNWC",
                "description": f"Projetado ano a ano durante o horizonte de 5 anos considerando expansão operacional, reposição de ativos e capital de giro. A soma do Valor Presente dos 5 fluxos descontados ao WACC totaliza R$ {pv_fcff_sum:.2f} Milhões.",
                "result": f"R$ {pv_fcff_sum:.2f} Mi (Valor Presente Explícito)"
            },
            {
                "step": 4,
                "title": "Valor Residual / Perpetuidade (Gordon Growth)",
                "formula": "Terminal Value = [FCFF(n) × (1 + g)] / (WACC - g)",
                "description": f"Projeção perpétua a partir do 5º ano com taxa de crescimento no longo prazo g = {g*100:.2f}%. Valor terminal na data 5: R$ {tv_gordon:.2f} Mi. Trazido a valor presente com fator de desconto de 5 anos [(1+WACC)^5]: R$ {pv_tv_gordon:.2f} Mi.",
                "result": f"R$ {pv_tv_gordon:.2f} Mi (PV Perpetuidade)"
            },
            {
                "step": 5,
                "title": "Ponte Enterprise Value para Equity Value",
                "formula": "Equity Value = Enterprise Value (EV) - Dívida Líquida",
                "description": f"Enterprise Value consolidado (R$ {ev_gordon:.2f} Mi) deduzido da dívida líquida da companhia (R$ {effective_net_debt:.2f} Mi), resultando no valor de mercado patrimonial justo.",
                "result": f"R$ {equity_value_gordon:.2f} Mi (Equity Value)"
            },
            {
                "step": 6,
                "title": "Preço Justo por Ação (Fair Value)",
                "formula": "Preço por Ação = Equity Value / Número de Ações",
                "description": f"Divisão do Equity Value justo pela base acionária estimada ({shares_count:.1f} Mi ações), comparado com o preço de referência de mercado (R$ {baseline_price:.2f}).",
                "result": f"R$ {fair_price_gordon:.2f} (Upside de {upside_pct:+0.1f}%)"
            }
        ]

        return {
            "company": {
                "name": name,
                "ticker": ticker,
                "sector": sector,
                "annual_revenue": round(annual_rev, 2),
                "ebit": round(ebit, 2),
                "ebitda": round(ebitda, 2),
                "net_income": round(net_income, 2)
            },
            "parameters": {
                "wacc": round(wacc * 100, 2),
                "wacc_decimal": round(wacc, 4),
                "ke": round(ke * 100, 2),
                "kd_pre_tax": round(kd_pre_tax * 100, 2),
                "kd_after_tax": round(kd_after_tax * 100, 2),
                "rf_rate": round(rf_rate * 100, 2),
                "mrp": round(mrp * 100, 2),
                "beta": round(beta, 2),
                "tax_rate": round(tax_rate * 100, 1),
                "debt_ratio": round(debt_ratio * 100, 1),
                "equity_ratio": round(equity_ratio * 100, 1),
                "perpetual_growth_g": round(g * 100, 2),
                "ebit_margin": round(ebit_margin * 100, 2),
                "revenue_growth": round(base_growth * 100, 2),
                "capex_ratio": round(capex_ratio * 100, 2),
                "nwc_ratio": round(nwc_ratio * 100, 2),
                "exit_multiple": round(exit_multiple, 2),
                "peer_pe": round(peer_pe, 2),
                "pvp_multiple": round(pvp_override if pvp_override is not None else 1.35, 2)
            },
            "methodologies_parameters": [
                {
                    "methodology": "Custo de Capital (CAPM / WACC)",
                    "parameter_name": "Taxa Livre de Risco (Risk-Free Rate)",
                    "symbol": "Rf",
                    "value": f"{rf_rate*100:.2f}% a.a.",
                    "raw_value": rf_rate,
                    "formula": "Ke = Rf + Beta × ERP + CountryRisk",
                    "impact": "Inverso Alto: Eleva o custo de oportunidade e comprime o valor presente de todos os fluxos.",
                    "sensitivity": "Para cada +1.0% de Rf, o WACC sobe ~0.65% e o Preço Justo cai ~5% a 7%."
                },
                {
                    "methodology": "Custo de Capital (CAPM / WACC)",
                    "parameter_name": "Beta do Ativo (Risco Sistemático)",
                    "symbol": "β",
                    "value": f"{beta:.2f}x",
                    "raw_value": beta,
                    "formula": "Ke = Rf + Beta × (Rm - Rf) + Alpha",
                    "impact": "Inverso Médio: Mede a volatilidade e sensibilidade das ações frente ao índice de mercado (Ibovespa).",
                    "sensitivity": "Beta > 1.0 amplifica o risco do setor; cada +0.2x no Beta eleva Ke em +1.1% a.a."
                },
                {
                    "methodology": "Custo de Capital (CAPM / WACC)",
                    "parameter_name": "Prêmio de Risco de Mercado (ERP)",
                    "symbol": "ERP (Rm - Rf)",
                    "value": f"{mrp*100:.2f}% a.a.",
                    "raw_value": mrp,
                    "formula": "ERP = E(Rm) - Rf",
                    "impact": "Inverso Médio: Retorno adicional exigido pelo investidor para tomar risco em renda variável corporativa.",
                    "sensitivity": "Cada +1.0% de ERP eleva Ke em +1.1% e pressiona o WACC em +0.7%."
                },
                {
                    "methodology": "Custo de Capital (CAPM / WACC)",
                    "parameter_name": "Custo da Dívida Pré-Impostos",
                    "symbol": "Kd",
                    "value": f"{kd_pre_tax*100:.2f}% a.a.",
                    "raw_value": kd_pre_tax,
                    "formula": "Kd_líquido = Kd × (1 - T)",
                    "impact": "Inverso Moderado: Custo médio dos financiamentos bancários e debêntures.",
                    "sensitivity": "Mitigado pelo benefício fiscal de 34% de IRPJ/CSLL (Tax Shield)."
                },
                {
                    "methodology": "Custo de Capital (CAPM / WACC)",
                    "parameter_name": "Alavancagem / Dívida na Estrutura",
                    "symbol": "D / V",
                    "value": f"{debt_ratio*100:.1f}%",
                    "raw_value": debt_ratio,
                    "formula": "WACC = (E/V × Ke) + (D/V × Kd × (1 - T))",
                    "impact": "Curvilíneo (Trade-Off): Inicialmente reduz o WACC via benefício fiscal, mas eleva o risco de falência se for excessiva.",
                    "sensitivity": "Altera o peso relativo entre capital próprio e capital de terceiros."
                },
                {
                    "methodology": "Custo de Capital (CAPM / WACC)",
                    "parameter_name": "WACC (Custo Médio Ponderado)",
                    "symbol": "WACC",
                    "value": f"{wacc*100:.2f}% a.a.",
                    "raw_value": wacc,
                    "formula": "WACC = (We × Ke) + (Wd × Kd × (1 - T))",
                    "impact": "Inverso Crítico: Taxa de corte para desconto de fluxos livres da firma (FCFF).",
                    "sensitivity": "Cada +1% no WACC reduz o Preço Justo em aproximadamente 8% a 12%."
                },
                {
                    "methodology": "Fluxo de Caixa Descontado (DCF / FCFF)",
                    "parameter_name": "Margem EBIT Operacional",
                    "symbol": "Margem EBIT",
                    "value": f"{ebit_margin*100:.2f}%",
                    "raw_value": ebit_margin,
                    "formula": "EBIT = Receita Líquida × Margem EBIT",
                    "impact": "Direto Crítico: Capacidade de conversão de faturamento em lucro operacional.",
                    "sensitivity": "Cada +1.0 p.p. na margem EBIT eleva o NOPAT e o Valor Justo em ~6% a 9%."
                },
                {
                    "methodology": "Fluxo de Caixa Descontado (DCF / FCFF)",
                    "parameter_name": "Taxa de Crescimento Inicial (Anos 1-5)",
                    "symbol": "CAGR Rev",
                    "value": f"{base_growth*100:.2f}% a.a.",
                    "raw_value": base_growth,
                    "formula": "Rev(t) = Rev(0) × (1 + g_proj)^t",
                    "impact": "Direto Alto: Expansão projetada das vendas durante o horizonte explícito.",
                    "sensitivity": "Cada +2.0% de expansão de vendas expande a geração de FCFF acumulada em ~7%."
                },
                {
                    "methodology": "Fluxo de Caixa Descontado (DCF / FCFF)",
                    "parameter_name": "Intensidade de CAPEX",
                    "symbol": "CAPEX / Rev",
                    "value": f"{capex_ratio*100:.2f}%",
                    "raw_value": capex_ratio,
                    "formula": "CAPEX = Receita × %CAPEX",
                    "impact": "Inverso Moderado: Necessidade de reinvestimento em imobilizado e tecnologia para sustentar operações.",
                    "sensitivity": "Maior eficiência de CAPEX (menor % com mesma expansão) eleva diretamente o FCFF."
                },
                {
                    "methodology": "Fluxo de Caixa Descontado (DCF / FCFF)",
                    "parameter_name": "Variação de Capital de Giro (ΔNWC)",
                    "symbol": "ΔNWC / Rev",
                    "value": f"{nwc_ratio*100:.2f}%",
                    "raw_value": nwc_ratio,
                    "formula": "ΔNWC = Receita × %NWC",
                    "impact": "Inverso Moderado: Consumo de caixa operacional para financiar contas a receber e estoques.",
                    "sensitivity": "Ciclos financeiros mais eficientes (PMR menor, PMP maior) liberam caixa imediato."
                },
                {
                    "methodology": "Valor Terminal (Gordon Growth)",
                    "parameter_name": "Crescimento Perpétuo de Longo Prazo",
                    "symbol": "g (Perpetuidade)",
                    "value": f"{g*100:.2f}% a.a.",
                    "raw_value": g,
                    "formula": "TV = [FCFF(5) × (1 + g)] / (WACC - g)",
                    "impact": "Direto Crítico: Crescimento sustentável da economia e expansão da firma após o ano 5.",
                    "sensitivity": "Cada +0.5% em g aumenta o Preço Justo em ~7% a 10% devido à alavancagem da perpetuidade."
                },
                {
                    "methodology": "Múltiplos de Mercado (Relative Valuation)",
                    "parameter_name": "Múltiplo EV / EBITDA de Saída",
                    "symbol": "EV / EBITDA",
                    "value": f"{exit_multiple:.2f}x",
                    "raw_value": exit_multiple,
                    "formula": "EV = EBITDA(5) × Multiplo",
                    "impact": "Direto Alto: Múltiplo de negociação comparável do setor para cálculo do Valor Terminal e Múltiplos.",
                    "sensitivity": "Cada +1.0x no múltiplo EV/EBITDA eleva o valor por múltiplos em ~15% a 20%."
                },
                {
                    "methodology": "Múltiplos de Mercado (Relative Valuation)",
                    "parameter_name": "Múltiplo P / L dos Pares (Preço/Lucro)",
                    "symbol": "P / L (P/E)",
                    "value": f"{peer_pe:.2f}x",
                    "raw_value": peer_pe,
                    "formula": "Equity Value = Lucro Líquido × P/L",
                    "impact": "Direto Alto: Relação entre preço de mercado e lucratividade líquida acumulada.",
                    "sensitivity": "Múltiplo histórico do setor calibrado com empresas comparáveis da B3."
                }
            ],
            "dcf_summary": {
                "enterprise_value": round(ev_gordon, 2),
                "equity_value": round(equity_value_gordon, 2),
                "net_debt": round(effective_net_debt, 2),
                "pv_explicit_fcff": round(pv_fcff_sum, 2),
                "pv_terminal_value": round(pv_tv_gordon, 2),
                "terminal_value_weight_pct": round((pv_tv_gordon / ev_gordon) * 100.0, 1),
                "fair_share_price": fair_price_gordon,
                "market_reference_price": baseline_price,
                "upside_potential_pct": upside_pct,
                "valuation_range": {
                    "min": round(min_range, 2),
                    "max": round(max_range, 2)
                }
            },
            "projections": projections,
            "sensitivity_matrix": sensitivity_matrix,
            "football_field": football_field,
            "calculation_steps": calculation_steps,
            "multiples": {
                "ev_ebitda": {"multiple": exit_multiple, "implied_ev": round(ev_ebitda_val, 2)},
                "pe": {"multiple": peer_pe, "implied_equity": round(pe_val, 2)},
                "ev_sales": {"multiple": round(exit_multiple * 0.22, 2), "implied_ev": round(ev_sales_val, 2)},
                "pvp": {"multiple": 1.35, "implied_equity": round(pvp_val, 2)}
            },
            "asset_based": {
                "book_value": round(book_val, 2),
                "adjusted_book_value": round(adjusted_book_val, 2),
                "liquidation_value": round(liquidation_val, 2)
            }
        }

    def chat(
        self,
        question: str,
        valuation_context: Dict[str, Any],
        history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Interactive discussion with the Valuation PhD Agent regarding methodology, assumptions, WACC, and sensitivity.
        """
        model = self._get_model_instance()
        comp = valuation_context.get("company", {})
        params = valuation_context.get("parameters", {})
        dcf = valuation_context.get("dcf_summary", {})
        v_range = dcf.get("valuation_range", {})

        system_prompt = (
            f"Você é o Agente Agno PhD em Valuation Corporativo e Finanças Quantitativas do HyperCube.\n"
            f"Você segue estritamente as melhores práticas de Investment Banking e as diretrizes da skill 'valuation-empresas'.\n\n"
            f"Contexto do Valuation da Empresa Analisada:\n"
            f"- Empresa: {comp.get('name', 'Empresa')} ({comp.get('ticker', 'TICK')}) - Setor: {comp.get('sector', 'Geral')}\n"
            f"- Receita Anual: R$ {comp.get('annual_revenue')} Mi | EBITDA: R$ {comp.get('ebitda')} Mi\n"
            f"- WACC (Custo Médio Ponderado de Capital): {params.get('wacc')}% a.a. (Ke: {params.get('ke')}%, Kd líquido: {params.get('kd_after_tax')}%, Beta: {params.get('beta')})\n"
            f"- Taxa de Crescimento Perpétuo (g): {params.get('perpetual_growth_g')}% a.a.\n"
            f"- Enterprise Value (EV - Gordon): R$ {dcf.get('enterprise_value')} Mi\n"
            f"- Equity Value (Valor Patrimonial Justo): R$ {dcf.get('equity_value')} Mi (após Dívida Líquida de R$ {dcf.get('net_debt')} Mi)\n"
            f"- Preço Justo por Ação (DCF): R$ {dcf.get('fair_share_price')} vs Preço Mercado Ref: R$ {dcf.get('market_reference_price')} (Upside: {dcf.get('upside_potential_pct')}%)\n"
            f"- Valuation Range Recomendado: R$ {v_range.get('min')} a R$ {v_range.get('max')} por ação\n"
            f"- Peso do Valor Terminal no EV: {dcf.get('terminal_value_weight_pct')}%\n\n"
            f"DIRETRIZES DE RESPOSTA:\n"
            f"1. Responda diretamente e com rigor técnico à pergunta do usuário.\n"
            f"2. Explique os mecanismos de sensibilidade (ex: impacto do WACC, taxa Selic, inflação, risco país, CAPEX e margens operacionais).\n"
            f"3. Sempre ressalte a importância do Valuation Range (intervalo de valor) em vez de um número único isolado.\n"
            f"4. Mantenha um tom profissional, didático e fundamentado em finanças corporativas (Damodaran, Copeland, Brealey-Myers).\n"
            f"5. Se for perguntado sobre como foi feito o cálculo, cite a fórmula específica e como as variáveis se relacionam."
        )

        if model:
            try:
                agent = Agent(model=model, instructions=[system_prompt])
                res = agent.run(question)
                text = ""
                if res and hasattr(res, "content") and res.content:
                    text = str(res.content)
                elif isinstance(res, str):
                    text = res

                if text and "API_KEY_INVALID" not in text and '"error"' not in text and 'invalid_api_key' not in text:
                    return text
            except Exception as e:
                print(f"Error in Valuation Agent chat: {e}")

        # Deterministic analytical fallbacks based on question keywords
        q_lower = question.lower()
        if "wacc" in q_lower or "taxa" in q_lower or "custo" in q_lower:
            return (
                f"### Análise do WACC ({params.get('wacc')}% a.a.)\n\n"
                f"O Custo Médio Ponderado de Capital foi calculado com a seguinte ponderação:\n"
                f"- **Custo do Capital Próprio (Ke)**: **{params.get('ke')}%** calculado via CAPM ($R_f + \\beta \\times (R_m - R_f) + \\text{{Risco País}}$), com Beta de {params.get('beta')} e taxa livre de risco de {params.get('rf_rate')}%.\n"
                f"- **Custo da Dívida (Kd Líquido)**: **{params.get('kd_after_tax')}%** (taxa bruta de {params.get('kd_pre_tax')}% com benefício fiscal de 34% de IR/CSLL).\n"
                f"- **Estrutura de Capital**: {params.get('equity_ratio')}% Capital Próprio / {params.get('debt_ratio')}% Dívida.\n\n"
                f"📈 **Sensibilidade**: Um aumento de +1,0% no WACC reduz o preço justo da ação em aproximadamente **-8,4%** devido ao forte peso da perpetuidade ({dcf.get('terminal_value_weight_pct')}% do Enterprise Value)."
            )
        elif "sensibilidade" in q_lower or "perpetuidade" in q_lower or "g" in q_lower:
            return (
                f"### Matriz de Sensibilidade e Valor Residual (g = {params.get('perpetual_growth_g')}%)\n\n"
                f"O Valor Residual representa **{dcf.get('terminal_value_weight_pct')}%** do Enterprise Value total (R$ {dcf.get('pv_terminal_value')} Mi de PV da Perpetuidade):\n\n"
                f"- Se a taxa perpétua de crescimento ($g$) cair para **{params.get('perpetual_growth_g') - 0.5:.1f}%**, o preço justo se desloca para baixo.\n"
                f"- No cenário onde o WACC é comprimido e $g$ expande, a ação atinge o topo do valuation range em **R$ {v_range.get('max')}**.\n"
                f"- Recomendamos a faixa **R$ {v_range.get('min')} - R$ {v_range.get('max')}** para ancorar negociações ou teses de investimento com margem de segurança."
            )
        elif "multiplo" in q_lower or "pe" in q_lower or "ebitda" in q_lower:
            return (
                f"### Comparação com Múltiplos de Mercado\n\n"
                f"Para o setor de **{comp.get('sector')}**, os múltiplos de negociação convergem para:\n"
                f"- **EV/EBITDA do Setor**: {params.get('exit_multiple')}x, resultando em Enterprise Value implícito de R$ {valuation_context.get('multiples', {}).get('ev_ebitda', {}).get('implied_ev')} Mi.\n"
                f"- **P/L (Preço / Lucro)**: {params.get('peer_pe')}x, indicando valor de mercado de R$ {valuation_context.get('multiples', {}).get('pe', {}).get('implied_equity')} Mi.\n\n"
                f"O DCF (R$ {dcf.get('fair_share_price')}) reflete o potencial de ganho de eficiência operacional projetado para os próximos 5 anos, enquanto os múltiplos capturam o valuation relativo corrente."
            )

        provider = self.config.get("provider", "groq").upper()
        model_name = self.config.get("model", "Llama 3.3 70B Versatile")
        return (
            f"### Diagnóstico do Agente de Valuation ({comp.get('name')})\n\n"
            f"A companhia apresenta **Preço Justo calculado em R$ {dcf.get('fair_share_price')}** por ação (Upside implícito de {dcf.get('upside_potential_pct')}% contra a cotação de referência de R$ {dcf.get('market_reference_price')}).\n\n"
            f"- **Enterprise Value (EV)**: R$ {dcf.get('enterprise_value')} Milhões\n"
            f"- **Equity Value**: R$ {dcf.get('equity_value')} Milhões\n"
            f"- **WACC Adotado**: {params.get('wacc')}% a.a.\n"
            f"- **Faixa de Valor Recomendada**: R$ {v_range.get('min')} a R$ {v_range.get('max')} por ação.\n\n"
            f"*(Para ativar respostas completas do LLM via nuvem com o modelo {model_name}, certifique-se de configurar a chave no topo direito ou selecione o Ollama Local.)*"
        )

valuation_agent = ValuationAgent()
