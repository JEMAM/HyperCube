"""
Debt Covenant & Governance Monitoring Engine — HyperCube Enterprise FP&A
========================================================================
Implements real-time covenant tracking, financial headroom calculations (EBITDA & Net Debt buffers),
and Early Warning breach detection across historical and forecast horizons.
"""

from typing import Dict, List, Any, Optional
from backend.app.engine.three_statement_engine import ThreeStatementEngine, COMPANIES_METADATA
from backend.app.engine.rolling_forecast_engine import RollingForecastEngine
from backend.app.engine.monte_carlo_engine import MonteCarloEngine


class CovenantRule:
    def __init__(
        self,
        covenant_id: str,
        name: str,
        description: str,
        operator: str,  # "<=" or ">="
        threshold: float,
        unit: str,
        category: str
    ):
        self.covenant_id = covenant_id
        self.name = name
        self.description = description
        self.operator = operator
        self.threshold = threshold
        self.unit = unit
        self.category = category

    def evaluate(self, current_value: float) -> Dict[str, Any]:
        """Evaluates compliance, headroom buffer percentage, and flag."""
        val = round(current_value, 2)
        if self.operator == "<=":
            is_compliant = val <= self.threshold
            # Buffer: how much below threshold we are
            buffer_pct = ((self.threshold - val) / self.threshold) * 100.0 if self.threshold > 0 else 0.0
            if not is_compliant:
                status = "BREACH"
            elif buffer_pct < 15.0:
                status = "WARNING"
            else:
                status = "SAFE"
        else:  # ">="
            is_compliant = val >= self.threshold
            # Buffer: how much above threshold we are
            buffer_pct = ((val - self.threshold) / self.threshold) * 100.0 if self.threshold > 0 else 0.0
            if not is_compliant:
                status = "BREACH"
            elif buffer_pct < 15.0:
                status = "WARNING"
            else:
                status = "SAFE"

        return {
            "covenant_id": self.covenant_id,
            "name": self.name,
            "description": self.description,
            "operator": self.operator,
            "threshold": self.threshold,
            "unit": self.unit,
            "category": self.category,
            "current_value": val,
            "is_compliant": is_compliant,
            "buffer_pct": round(buffer_pct, 2),
            "status": status
        }


class CovenantMonitorEngine:
    """
    Monitors 4 standard corporate debt covenants and calculates cash/EBITDA headroom.
    Integrates with ThreeStatementEngine, RollingForecast, and Monte Carlo.
    """

    DEFAULT_COVENANTS = [
        CovenantRule(
            covenant_id="net_debt_ebitda",
            name="Alavancagem Máxima (Dívida Líquida / EBITDA)",
            description="Cláusula restritiva limitando o endividamento líquido em relação à geração operacional.",
            operator="<=",
            threshold=3.5,
            unit="x",
            category="Alavancagem"
        ),
        CovenantRule(
            covenant_id="interest_coverage_ratio",
            name="Cobertura de Juros (ICJ: EBITDA / Despesa Financeira)",
            description="Capacidade de honrar juros bancários com o resultado operacional.",
            operator=">=",
            threshold=2.0,
            unit="x",
            category="Liquidez"
        ),
        CovenantRule(
            covenant_id="current_ratio",
            name="Liquidez Corrente Mínima (Ativo Circulante / Passivo Circulante)",
            description="Garantia de capacidade de pagamento de obrigações de curto prazo.",
            operator=">=",
            threshold=1.2,
            unit="x",
            category="Solvência"
        ),
        CovenantRule(
            covenant_id="equity_to_assets",
            name="Autonomia Financeira (Patrimônio Líquido / Ativo Total)",
            description="Participação mínima de capital próprio na estrutura de ativos da companhia.",
            operator=">=",
            threshold=0.30,
            unit="%",
            category="Estrutura de Capital"
        ),
    ]

    def __init__(self, company_id: str = "klabin"):
        self.company_id = company_id.lower().strip()
        if self.company_id not in COMPANIES_METADATA:
            self.company_id = "klabin"

        self.three_engine = ThreeStatementEngine(company_id=self.company_id)
        self.rolling_engine = RollingForecastEngine(company_id=self.company_id)

    def evaluate_covenants(
        self,
        covenants_override: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Evaluates current covenants compliance, headrooms, and timeline evolution.
        """
        p2025 = self.three_engine.p2025
        budget_2026 = self.three_engine.model_periods.get("Budget_2026", p2025)

        ebitda = budget_2026.get("ebitda", p2025["ebitda"])
        cash = budget_2026.get("caixa_equivalentes", p2025["caixa_equivalentes"])
        debt_total = budget_2026.get("passivo_circulante", p2025["passivo_circulante"]) + budget_2026.get("passivo_nao_circulante", p2025["passivo_nao_circulante"])
        net_debt = max(0.0, debt_total - cash)

        fin_exp = abs(budget_2026.get("resultado_financeiro", p2025["resultado_financeiro"]))
        if fin_exp == 0:
            fin_exp = debt_total * 0.08  # estimate 8% cost of debt

        current_assets = budget_2026.get("ativo_circulante", p2025["ativo_circulante"])
        current_liab = budget_2026.get("passivo_circulante", p2025["passivo_circulante"])
        total_assets = budget_2026.get("ativo_total", p2025["ativo_total"])
        equity = budget_2026.get("patrimonio_liquido", p2025["patrimonio_liquido"])

        # Metric calculations
        leverage_val = net_debt / ebitda if ebitda > 0 else 9.99
        icj_val = ebitda / fin_exp if fin_exp > 0 else 9.99
        cr_val = current_assets / current_liab if current_liab > 0 else 9.99
        autonomy_val = equity / total_assets if total_assets > 0 else 0.0

        current_values = {
            "net_debt_ebitda": leverage_val,
            "interest_coverage_ratio": icj_val,
            "current_ratio": cr_val,
            "equity_to_assets": autonomy_val
        }

        # Evaluate each covenant
        evaluated_covenants = []
        overall_status = "SAFE"

        for cov in self.DEFAULT_COVENANTS:
            # Check override threshold
            thresh = cov.threshold
            if covenants_override and cov.covenant_id in covenants_override:
                thresh = covenants_override[cov.covenant_id]

            rule = CovenantRule(
                covenant_id=cov.covenant_id,
                name=cov.name,
                description=cov.description,
                operator=cov.operator,
                threshold=thresh,
                unit=cov.unit,
                category=cov.category
            )
            res = rule.evaluate(current_values[cov.covenant_id])
            evaluated_covenants.append(res)

            if res["status"] == "BREACH":
                overall_status = "BREACH"
            elif res["status"] == "WARNING" and overall_status != "BREACH":
                overall_status = "WARNING"

        # Calculate Financial Headrooms in R$ Millions
        leverage_rule = next(c for c in evaluated_covenants if c["covenant_id"] == "net_debt_ebitda")
        max_leverage_limit = leverage_rule["threshold"]

        # EBITDA Headroom: How much EBITDA can decline before leverage reaches the limit
        min_required_ebitda = net_debt / max_leverage_limit if max_leverage_limit > 0 else 0.0
        ebitda_headroom_brl = round(max(0.0, ebitda - min_required_ebitda), 2)
        ebitda_headroom_pct = round((ebitda_headroom_brl / ebitda) * 100.0, 2) if ebitda > 0 else 0.0

        # Debt Headroom: How much additional net debt company can take on before breaching limit
        max_tolerable_debt = ebitda * max_leverage_limit
        debt_headroom_brl = round(max(0.0, max_tolerable_debt - net_debt), 2)

        # Interest Coverage Headroom
        icj_rule = next(c for c in evaluated_covenants if c["covenant_id"] == "interest_coverage_ratio")
        min_icj_limit = icj_rule["threshold"]
        max_tolerable_fin_exp = ebitda / min_icj_limit if min_icj_limit > 0 else 0.0
        fin_exp_headroom_brl = round(max(0.0, max_tolerable_fin_exp - fin_exp), 2)

        # Timeline evolution over 8 Rolling Quarters
        rf_summary = self.rolling_engine.get_summary()
        timeline_covenants = []
        for q in rf_summary["timeline"]:
            ann_ebitda = q["ebitda"] * 4.0
            q_net_debt = q["net_debt"]
            q_leverage = round(q_net_debt / ann_ebitda, 2) if ann_ebitda > 0 else 0.0
            q_compliant = q_leverage <= max_leverage_limit
            q_headroom_brl = round(max(0.0, (ann_ebitda * max_leverage_limit) - q_net_debt), 2)

            timeline_covenants.append({
                "quarter_id": q["quarter_id"],
                "label": q["label"],
                "period_type": q["period_type"],
                "is_actual": q["is_actual"],
                "leverage_ratio": q_leverage,
                "covenant_limit": max_leverage_limit,
                "is_compliant": q_compliant,
                "debt_headroom_brl": q_headroom_brl
            })

        return {
            "company_id": self.company_id,
            "company_name": COMPANIES_METADATA.get(self.company_id, {}).get("name", self.company_id.upper()),
            "ticker": COMPANIES_METADATA.get(self.company_id, {}).get("ticker", ""),
            "sector": COMPANIES_METADATA.get(self.company_id, {}).get("sector", ""),
            "currency": "BRL",
            "overall_status": overall_status,
            "headrooms": {
                "ebitda_headroom_brl": ebitda_headroom_brl,
                "ebitda_headroom_pct": ebitda_headroom_pct,
                "debt_headroom_brl": debt_headroom_brl,
                "fin_exp_headroom_brl": fin_exp_headroom_brl,
                "current_ebitda": round(ebitda, 2),
                "current_net_debt": round(net_debt, 2),
                "current_cash": round(cash, 2)
            },
            "covenants": evaluated_covenants,
            "timeline": timeline_covenants
        }
