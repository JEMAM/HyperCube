"""
Rolling Forecast Engine — HyperCube Enterprise FP&A
==================================================
Implements continuous rolling forecasting across an 8-quarter rolling horizon.
Blends closed historical quarters (Actuals) with continuous dynamic projections (Forecast).
Ensures causal cash flow roll-forward (Ending cash of Q_t = Beginning cash of Q_{t+1}).
"""

from typing import Dict, List, Any, Optional
import copy
from backend.app.engine.three_statement_engine import ThreeStatementEngine, COMPANIES_METADATA


class RollingQuarter:
    def __init__(
        self,
        quarter_id: str,
        year: int,
        quarter_num: int,
        period_type: str,  # "ACTUAL" or "FORECAST"
        revenue: float,
        cogs: float,
        gross_profit: float,
        opex_sales: float,
        opex_admin: float,
        ebitda: float,
        depreciation: float,
        ebit: float,
        financial_result: float,
        ebt: float,
        taxes: float,
        net_income: float,
        capex: float,
        fco: float,
        fci: float,
        fcf: float,
        cash_start: float,
        cash_end: float,
        debt_total: float,
        working_capital_ncg: float
    ):
        self.quarter_id = quarter_id
        self.year = year
        self.quarter_num = quarter_num
        self.period_type = period_type
        self.revenue = round(revenue, 2)
        self.cogs = round(cogs, 2)
        self.gross_profit = round(gross_profit, 2)
        self.opex_sales = round(opex_sales, 2)
        self.opex_admin = round(opex_admin, 2)
        self.ebitda = round(ebitda, 2)
        self.depreciation = round(depreciation, 2)
        self.ebit = round(ebit, 2)
        self.financial_result = round(financial_result, 2)
        self.ebt = round(ebt, 2)
        self.taxes = round(taxes, 2)
        self.net_income = round(net_income, 2)
        self.capex = round(capex, 2)
        self.fco = round(fco, 2)
        self.fci = round(fci, 2)
        self.fcf = round(fcf, 2)
        self.cash_start = round(cash_start, 2)
        self.cash_end = round(cash_end, 2)
        self.debt_total = round(debt_total, 2)
        self.working_capital_ncg = round(working_capital_ncg, 2)

    def to_dict(self) -> Dict[str, Any]:
        ebitda_margin = round((self.ebitda / self.revenue) * 100.0, 2) if self.revenue > 0 else 0.0
        net_margin = round((self.net_income / self.revenue) * 100.0, 2) if self.revenue > 0 else 0.0
        net_debt = max(0.0, self.debt_total - self.cash_end)
        annualized_ebitda = self.ebitda * 4.0
        leverage = round(net_debt / annualized_ebitda, 2) if annualized_ebitda > 0 else 0.0

        return {
            "quarter_id": self.quarter_id,
            "year": self.year,
            "quarter_num": self.quarter_num,
            "label": f"Q{self.quarter_num} {self.year}",
            "period_type": self.period_type,
            "is_actual": self.period_type == "ACTUAL",
            "revenue": self.revenue,
            "cogs": self.cogs,
            "gross_profit": self.gross_profit,
            "opex_sales": self.opex_sales,
            "opex_admin": self.opex_admin,
            "ebitda": self.ebitda,
            "ebitda_margin_pct": ebitda_margin,
            "depreciation": self.depreciation,
            "ebit": self.ebit,
            "financial_result": self.financial_result,
            "ebt": self.ebt,
            "taxes": self.taxes,
            "net_income": self.net_income,
            "net_margin_pct": net_margin,
            "capex": self.capex,
            "fco": self.fco,
            "fci": self.fci,
            "fcf": self.fcf,
            "cash_delta": round(self.fco + self.fci + self.fcf, 2),
            "cash_start": self.cash_start,
            "cash_end": self.cash_end,
            "debt_total": self.debt_total,
            "net_debt": round(net_debt, 2),
            "leverage_ratio": leverage,
            "working_capital_ncg": self.working_capital_ncg
        }


class RollingForecastEngine:
    """
    Continuous Rolling Forecast Engine managing 8 continuous quarters (Q1 2025 to Q4 2026).
    Default cut-off point: Q4 2025 (4 Actuals quarters + 4 Forecast quarters).
    """

    SEASONALITY_WEIGHTS = [0.22, 0.24, 0.26, 0.28]  # Q1..Q4 typical corporate seasonality

    def __init__(self, company_id: str = "klabin", cut_off_quarter: str = "Q4_2025"):
        self.company_id = company_id.lower().strip()
        if self.company_id not in COMPANIES_METADATA:
            self.company_id = "klabin"

        self.cut_off_quarter = cut_off_quarter
        self.base_engine = ThreeStatementEngine(company_id=self.company_id)
        self.quarters: List[RollingQuarter] = []
        self._build_rolling_horizon()

    def _build_rolling_horizon(
        self,
        growth_multiplier: float = 1.0,
        cogs_multiplier: float = 1.0,
        interest_rate_delta_bps: float = 0.0,
        capex_multiplier: float = 1.0
    ):
        """Constructs the 8-quarter timeline with strict temporal cash continuity."""
        self.quarters = []
        p2024 = self.base_engine.p2024
        p2025 = self.base_engine.p2025
        base_budget_2026 = self.base_engine.model_periods.get("Budget_2026", {})

        # Baseline annual values
        rev_2025 = p2025["receita_liquida"]
        cogs_2025 = p2025["cpv"]
        ebitda_2025 = p2025["ebitda"]
        depr_2025 = p2025["depreciacao_amortizacao"]
        res_fin_2025 = p2025["resultado_financeiro"]
        net_inc_2025 = p2025["lucro_liquido"]
        fco_2025 = p2025.get("fco_total", p2025.get("ebitda", 0) * 0.85)
        fci_2025 = p2025.get("fci_total", -p2025.get("imobilizado_liquido", 0) * 0.1)
        fcf_2025 = p2025.get("fcf_total", -p2025.get("lucro_liquido", 0) * 0.3)
        cash_initial = p2024["caixa_equivalentes"]
        debt_2025 = p2025["passivo_circulante"] + p2025["passivo_nao_circulante"]

        current_cash = cash_initial

        # Generate 4 quarters of 2025 (ACTUALS)
        for q_idx in range(1, 5):
            q_id = f"Q{q_idx}_2025"
            weight = self.SEASONALITY_WEIGHTS[q_idx - 1]

            q_rev = rev_2025 * weight
            q_cogs = cogs_2025 * weight
            q_gp = q_rev - q_cogs
            q_sales = (p2025["despesas_vendas"] * weight)
            q_admin = (p2025["despesas_admin"] * weight)
            q_ebitda = q_gp - q_sales - q_admin
            q_depr = depr_2025 / 4.0
            q_ebit = q_ebitda - q_depr
            q_fin = res_fin_2025 / 4.0
            q_ebt = q_ebit + q_fin
            q_tax = q_ebt * 0.25 if q_ebt > 0 else 0.0
            q_ni = q_ebt - q_tax

            q_fco = fco_2025 * weight
            q_fci = fci_2025 * weight
            q_fcf = fcf_2025 * weight
            q_delta_cash = q_fco + q_fci + q_fcf
            q_cash_start = current_cash
            q_cash_end = max(100.0, q_cash_start + q_delta_cash)
            current_cash = q_cash_end

            rq = RollingQuarter(
                quarter_id=q_id,
                year=2025,
                quarter_num=q_idx,
                period_type="ACTUAL",
                revenue=q_rev,
                cogs=q_cogs,
                gross_profit=q_gp,
                opex_sales=q_sales,
                opex_admin=q_admin,
                ebitda=q_ebitda,
                depreciation=q_depr,
                ebit=q_ebit,
                financial_result=q_fin,
                ebt=q_ebt,
                taxes=q_tax,
                net_income=q_ni,
                capex=abs(q_fci) * 0.9,
                fco=q_fco,
                fci=q_fci,
                fcf=q_fcf,
                cash_start=q_cash_start,
                cash_end=q_cash_end,
                debt_total=debt_2025 * 0.5,
                working_capital_ncg=p2025["contas_receber"] * weight
            )
            self.quarters.append(rq)

        # 2026 Forecast Baseline with dynamic parameters
        rev_2026_base = base_budget_2026.get("receita_liquida", rev_2025 * 1.085) * growth_multiplier
        cogs_2026_base = base_budget_2026.get("cpv", cogs_2025 * 1.06) * cogs_multiplier
        depr_2026_base = base_budget_2026.get("depreciacao_amortizacao", depr_2025 * 1.05)
        debt_2026_base = base_budget_2026.get("passivo_exigivel_total", debt_2025 * 0.95)

        interest_rate_impact = (debt_2026_base * (interest_rate_delta_bps / 10000.0)) / 4.0

        for q_idx in range(1, 5):
            q_id = f"Q{q_idx}_2026"
            weight = self.SEASONALITY_WEIGHTS[q_idx - 1]

            q_rev = rev_2026_base * weight
            q_cogs = cogs_2026_base * weight
            q_gp = q_rev - q_cogs
            q_sales = (base_budget_2026.get("despesas_vendas", p2025["despesas_vendas"] * 1.05) * weight)
            q_admin = (base_budget_2026.get("despesas_admin", p2025["despesas_admin"] * 1.04) * weight)
            q_ebitda = q_gp - q_sales - q_admin
            q_depr = depr_2026_base / 4.0
            q_ebit = q_ebitda - q_depr
            q_fin = (base_budget_2026.get("resultado_financeiro", res_fin_2025) / 4.0) - interest_rate_impact
            q_ebt = q_ebit + q_fin
            q_tax = q_ebt * 0.25 if q_ebt > 0 else 0.0
            q_ni = q_ebt - q_tax

            q_capex = (base_budget_2026.get("fci_capex", 1200.0) / 4.0) * capex_multiplier
            q_fco = q_ebitda * 0.88
            q_fci = -abs(q_capex)
            q_fcf = -(q_ni * 0.35) if q_ni > 0 else 0.0
            q_delta_cash = q_fco + q_fci + q_fcf
            q_cash_start = current_cash
            q_cash_end = max(50.0, q_cash_start + q_delta_cash)
            current_cash = q_cash_end

            rq = RollingQuarter(
                quarter_id=q_id,
                year=2026,
                quarter_num=q_idx,
                period_type="FORECAST",
                revenue=q_rev,
                cogs=q_cogs,
                gross_profit=q_gp,
                opex_sales=q_sales,
                opex_admin=q_admin,
                ebitda=q_ebitda,
                depreciation=q_depr,
                ebit=q_ebit,
                financial_result=q_fin,
                ebt=q_ebt,
                taxes=q_tax,
                net_income=q_ni,
                capex=q_capex,
                fco=q_fco,
                fci=q_fci,
                fcf=q_fcf,
                cash_start=q_cash_start,
                cash_end=q_cash_end,
                debt_total=debt_2026_base * 0.5,
                working_capital_ncg=q_rev * 0.18
            )
            self.quarters.append(rq)

    def get_summary(self) -> Dict[str, Any]:
        """Returns the full 8-quarter rolling forecast dataset and metrics."""
        quarters_data = [q.to_dict() for q in self.quarters]
        actuals = [q for q in quarters_data if q["is_actual"]]
        forecasts = [q for q in quarters_data if not q["is_actual"]]

        tot_actual_rev = sum(q["revenue"] for q in actuals)
        tot_forecast_rev = sum(q["revenue"] for q in forecasts)
        tot_actual_ebitda = sum(q["ebitda"] for q in actuals)
        tot_forecast_ebitda = sum(q["ebitda"] for q in forecasts)

        return {
            "company_id": self.company_id,
            "company_name": COMPANIES_METADATA.get(self.company_id, {}).get("name", self.company_id.upper()),
            "ticker": COMPANIES_METADATA.get(self.company_id, {}).get("ticker", ""),
            "sector": COMPANIES_METADATA.get(self.company_id, {}).get("sector", ""),
            "currency": "BRL",
            "cut_off_quarter": self.cut_off_quarter,
            "quarters_count": len(self.quarters),
            "actuals_count": len(actuals),
            "forecast_count": len(forecasts),
            "kpis": {
                "annual_actual_revenue": round(tot_actual_rev, 2),
                "annual_forecast_revenue": round(tot_forecast_rev, 2),
                "revenue_growth_pct": round(((tot_forecast_rev - tot_actual_rev) / tot_actual_rev) * 100.0, 2) if tot_actual_rev > 0 else 0.0,
                "annual_actual_ebitda": round(tot_actual_ebitda, 2),
                "annual_forecast_ebitda": round(tot_forecast_ebitda, 2),
                "ebitda_growth_pct": round(((tot_forecast_ebitda - tot_actual_ebitda) / tot_actual_ebitda) * 100.0, 2) if tot_actual_ebitda > 0 else 0.0,
                "ending_cash": quarters_data[-1]["cash_end"],
                "ending_leverage": quarters_data[-1]["leverage_ratio"]
            },
            "timeline": quarters_data
        }
