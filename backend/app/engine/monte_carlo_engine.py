"""
Monte Carlo Stochastic Risk Simulation Engine — HyperCube Enterprise FP&A
========================================================================
High-performance vectorized Monte Carlo simulation (1,000 to 10,000 runs)
using NumPy. Models uncertainty across revenue, cost inflation, Selic interest rates,
and capex execution. Generates full probability distributions, Value-at-Risk (VaR 95%),
covenant breach probabilities, histogram bins, and Fan Chart trajectories.
"""

from typing import Dict, List, Any, Optional
import numpy as np
from scipy import stats
from backend.app.engine.rolling_forecast_engine import RollingForecastEngine
from backend.app.engine.three_statement_engine import COMPANIES_METADATA


class MonteCarloEngine:
    def __init__(
        self,
        company_id: str = "klabin",
        iterations: int = 3000,
        random_seed: Optional[int] = 42
    ):
        self.company_id = company_id.lower().strip()
        if self.company_id not in COMPANIES_METADATA:
            self.company_id = "klabin"

        self.iterations = max(500, min(10000, iterations))
        self.random_seed = random_seed
        self.rolling_engine = RollingForecastEngine(company_id=self.company_id)

    def run_simulation(
        self,
        revenue_volatility_pct: float = 8.0,
        cogs_inflation_mode_pct: float = 5.0,
        selic_shock_bps_std: float = 150.0,
        capex_uncertainty_pct: float = 10.0,
        covenant_leverage_limit: float = 3.5
    ) -> Dict[str, Any]:
        """
        Executes vectorized Monte Carlo simulation with N iterations.
        """
        if self.random_seed is not None:
            np.random.seed(self.random_seed)

        n = self.iterations
        rf_baseline = self.rolling_engine.get_summary()
        kpis = rf_baseline["kpis"]
        base_revenue = kpis["annual_forecast_revenue"]
        base_ebitda = kpis["annual_forecast_ebitda"]
        base_cash = kpis["ending_cash"]
        base_leverage = kpis["ending_leverage"]

        # Extract quarterly baseline vectors for the 4 forecast quarters
        forecast_quarters = [q for q in rf_baseline["timeline"] if not q["is_actual"]]
        q_base_rev = np.array([q["revenue"] for q in forecast_quarters])
        q_base_cogs = np.array([q["cogs"] for q in forecast_quarters])
        q_base_opex = np.array([q["opex_sales"] + q["opex_admin"] for q in forecast_quarters])
        q_base_depr = np.array([q["depreciation"] for q in forecast_quarters])
        q_base_capex = np.array([q["capex"] for q in forecast_quarters])
        q_base_debt = np.array([q["debt_total"] for q in forecast_quarters])

        # 1. Stochastic Distributions Sampling (Vectorized)
        # Revenue Growth Shocks: Normal distribution around 1.0 with std = revenue_volatility_pct
        rev_std = max(0.01, revenue_volatility_pct / 100.0)
        rev_shocks = np.random.normal(loc=1.0, scale=rev_std, size=(n, 1))

        # COGS Inflation Shocks: Triangular distribution [0%, mode, max]
        cogs_mode = cogs_inflation_mode_pct / 100.0
        cogs_min = max(-0.02, cogs_mode - 0.05)
        cogs_max = cogs_mode + 0.08
        cogs_shocks = 1.0 + np.random.triangular(left=cogs_min, mode=cogs_mode, right=cogs_max, size=(n, 1))

        # Selic / Interest Rate Shock in BPS: Normal distribution
        selic_shocks_bps = np.random.normal(loc=0.0, scale=selic_shock_bps_std, size=(n, 1))

        # Capex Overrun / Delay Shocks: Triangular distribution
        cx_std = max(0.02, capex_uncertainty_pct / 100.0)
        capex_shocks = 1.0 + np.random.triangular(left=-cx_std, mode=0.0, right=cx_std * 1.5, size=(n, 1))

        # 2. Vectorized 4-Quarter Propagation (N x 4 matrices)
        sim_q_rev = rev_shocks * q_base_rev.reshape(1, 4)
        sim_q_cogs = cogs_shocks * q_base_cogs.reshape(1, 4)
        sim_q_gp = sim_q_rev - sim_q_cogs
        sim_q_ebitda = sim_q_gp - q_base_opex.reshape(1, 4)
        sim_q_ebit = sim_q_ebitda - q_base_depr.reshape(1, 4)

        interest_impact = (q_base_debt.reshape(1, 4) * (selic_shocks_bps / 10000.0)) / 4.0
        sim_q_fin = -(q_base_debt.reshape(1, 4) * 0.0275) - interest_impact
        sim_q_ebt = sim_q_ebit + sim_q_fin
        sim_q_taxes = np.maximum(0.0, sim_q_ebt * 0.25)
        sim_q_ni = sim_q_ebt - sim_q_taxes

        sim_q_capex = capex_shocks * q_base_capex.reshape(1, 4)
        sim_q_fco = sim_q_ebitda * 0.88
        sim_q_fci = -sim_q_capex
        sim_q_fcf = -np.maximum(0.0, sim_q_ni * 0.35)
        sim_q_cash_delta = sim_q_fco + sim_q_fci + sim_q_fcf

        # Vectorized Cash Cumulative Flow across Q1..Q4
        initial_cash = forecast_quarters[0]["cash_start"]
        sim_cash_trajectories = np.zeros((n, 4))
        for q_idx in range(4):
            if q_idx == 0:
                sim_cash_trajectories[:, q_idx] = np.maximum(10.0, initial_cash + sim_q_cash_delta[:, q_idx])
            else:
                sim_cash_trajectories[:, q_idx] = np.maximum(10.0, sim_cash_trajectories[:, q_idx - 1] + sim_q_cash_delta[:, q_idx])

        # Annual Aggregated Simulated Totals (N length arrays)
        ann_rev = np.sum(sim_q_rev, axis=1)
        ann_ebitda = np.sum(sim_q_ebitda, axis=1)
        ann_ni = np.sum(sim_q_ni, axis=1)
        ann_ending_cash = sim_cash_trajectories[:, 3]
        ending_debt = q_base_debt[3]
        ann_net_debt = np.maximum(0.0, ending_debt - ann_ending_cash)
        ann_leverage = np.where(ann_ebitda > 0, ann_net_debt / ann_ebitda, 9.99)

        # 3. Statistical Calculations and Risk Metrics
        stats_ebitda = self._calc_distribution_stats(ann_ebitda, base_ebitda)
        stats_rev = self._calc_distribution_stats(ann_rev, base_revenue)
        stats_ni = self._calc_distribution_stats(ann_ni, base_ebitda * 0.4)
        stats_cash = self._calc_distribution_stats(ann_ending_cash, base_cash)

        # Value at Risk (VaR)
        var_95_ebitda = round(float(base_ebitda - stats_ebitda["percentiles"]["p5"]), 2)
        var_99_ebitda = round(float(base_ebitda - stats_ebitda["percentiles"]["p1"]), 2)
        var_95_cash = round(float(base_cash - stats_cash["percentiles"]["p5"]), 2)

        # Probabilities
        prob_cash_negative = round(float(np.mean(ann_ending_cash < 150.0)) * 100.0, 2)
        prob_ebitda_below_budget = round(float(np.mean(ann_ebitda < base_ebitda)) * 100.0, 2)
        prob_covenant_breach = round(float(np.mean(ann_leverage > covenant_leverage_limit)) * 100.0, 2)

        # Histograms
        hist_ebitda = self._calc_histogram(ann_ebitda, bins_count=30)
        hist_cash = self._calc_histogram(ann_ending_cash, bins_count=25)

        # 4. Fan Chart Trajectory Time Series (P10, P25, P50, P75, P90 per quarter)
        fan_chart_ebitda = []
        fan_chart_cash = []

        # First add actual quarters (deterministic)
        for q in rf_baseline["timeline"]:
            if q["is_actual"]:
                fan_chart_ebitda.append({
                    "label": q["label"],
                    "quarter_id": q["quarter_id"],
                    "period_type": "ACTUAL",
                    "p10": q["ebitda"],
                    "p25": q["ebitda"],
                    "p50": q["ebitda"],
                    "p75": q["ebitda"],
                    "p90": q["ebitda"]
                })
                fan_chart_cash.append({
                    "label": q["label"],
                    "quarter_id": q["quarter_id"],
                    "period_type": "ACTUAL",
                    "p10": q["cash_end"],
                    "p25": q["cash_end"],
                    "p50": q["cash_end"],
                    "p75": q["cash_end"],
                    "p90": q["cash_end"]
                })

        # Next add forecast quarters with stochastic confidence bands
        for q_idx in range(4):
            lbl = forecast_quarters[q_idx]["label"]
            qid = forecast_quarters[q_idx]["quarter_id"]

            ebitda_q_slice = sim_q_ebitda[:, q_idx]
            cash_q_slice = sim_cash_trajectories[:, q_idx]

            fan_chart_ebitda.append({
                "label": lbl,
                "quarter_id": qid,
                "period_type": "FORECAST",
                "p10": round(float(np.percentile(ebitda_q_slice, 10)), 2),
                "p25": round(float(np.percentile(ebitda_q_slice, 25)), 2),
                "p50": round(float(np.percentile(ebitda_q_slice, 50)), 2),
                "p75": round(float(np.percentile(ebitda_q_slice, 75)), 2),
                "p90": round(float(np.percentile(ebitda_q_slice, 90)), 2),
            })

            fan_chart_cash.append({
                "label": lbl,
                "quarter_id": qid,
                "period_type": "FORECAST",
                "p10": round(float(np.percentile(cash_q_slice, 10)), 2),
                "p25": round(float(np.percentile(cash_q_slice, 25)), 2),
                "p50": round(float(np.percentile(cash_q_slice, 50)), 2),
                "p75": round(float(np.percentile(cash_q_slice, 75)), 2),
                "p90": round(float(np.percentile(cash_q_slice, 90)), 2),
            })

        return {
            "company_id": self.company_id,
            "company_name": COMPANIES_METADATA.get(self.company_id, {}).get("name", self.company_id.upper()),
            "iterations": self.iterations,
            "parameters": {
                "revenue_volatility_pct": revenue_volatility_pct,
                "cogs_inflation_mode_pct": cogs_inflation_mode_pct,
                "selic_shock_bps_std": selic_shock_bps_std,
                "capex_uncertainty_pct": capex_uncertainty_pct,
                "covenant_leverage_limit": covenant_leverage_limit
            },
            "risk_metrics": {
                "var_95_ebitda": var_95_ebitda,
                "var_99_ebitda": var_99_ebitda,
                "var_95_cash": var_95_cash,
                "prob_cash_negative_pct": prob_cash_negative,
                "prob_ebitda_below_budget_pct": prob_ebitda_below_budget,
                "prob_covenant_breach_pct": prob_covenant_breach,
                "median_ebitda": stats_ebitda["median"],
                "median_ending_cash": stats_cash["median"],
                "median_leverage": round(float(np.median(ann_leverage)), 2)
            },
            "distributions": {
                "ebitda": stats_ebitda,
                "revenue": stats_rev,
                "net_income": stats_ni,
                "ending_cash": stats_cash
            },
            "histograms": {
                "ebitda": hist_ebitda,
                "ending_cash": hist_cash
            },
            "fan_charts": {
                "ebitda": fan_chart_ebitda,
                "ending_cash": fan_chart_cash
            }
        }

    def _calc_distribution_stats(self, values: np.ndarray, baseline_ref: float) -> Dict[str, Any]:
        """Calculates descriptive statistics and parametric/non-parametric percentiles."""
        mean = float(np.mean(values))
        std = float(np.std(values))
        median = float(np.median(values))
        skewness = float(stats.skew(values))
        kurtosis = float(stats.kurtosis(values))

        p1 = float(np.percentile(values, 1))
        p5 = float(np.percentile(values, 5))
        p10 = float(np.percentile(values, 10))
        p25 = float(np.percentile(values, 25))
        p50 = median
        p75 = float(np.percentile(values, 75))
        p90 = float(np.percentile(values, 90))
        p95 = float(np.percentile(values, 95))
        p99 = float(np.percentile(values, 99))

        return {
            "baseline": round(baseline_ref, 2),
            "mean": round(mean, 2),
            "median": round(median, 2),
            "std_dev": round(std, 2),
            "min": round(float(np.min(values)), 2),
            "max": round(float(np.max(values)), 2),
            "skewness": round(skewness, 3),
            "kurtosis": round(kurtosis, 3),
            "percentiles": {
                "p1": round(p1, 2),
                "p5": round(p5, 2),
                "p10": round(p10, 2),
                "p25": round(p25, 2),
                "p50": round(p50, 2),
                "p75": round(p75, 2),
                "p90": round(p90, 2),
                "p95": round(p95, 2),
                "p99": round(p99, 2),
            }
        }

    def _calc_histogram(self, values: np.ndarray, bins_count: int = 30) -> Dict[str, Any]:
        """Builds histogram frequency bins with probability density."""
        counts, bin_edges = np.histogram(values, bins=bins_count)
        total_samples = len(values)
        bin_width = float(bin_edges[1] - bin_edges[0])

        bins_data = []
        cum_prob = 0.0

        for idx in range(len(counts)):
            x0 = float(bin_edges[idx])
            x1 = float(bin_edges[idx + 1])
            mid = round((x0 + x1) / 2.0, 2)
            cnt = int(counts[idx])
            prob = cnt / total_samples
            cum_prob += prob

            bins_data.append({
                "bin_index": idx,
                "range_label": f"{int(x0):,}..{int(x1):,}",
                "midpoint": mid,
                "count": cnt,
                "probability": round(prob, 4),
                "cumulative_probability": round(cum_prob, 4)
            })

        return {
            "total_samples": total_samples,
            "bins_count": bins_count,
            "bin_width": round(bin_width, 2),
            "bins": bins_data
        }
