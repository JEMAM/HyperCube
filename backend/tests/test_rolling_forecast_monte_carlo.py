"""
Unit & Integration Tests for Rolling Forecast and Monte Carlo Stochastic Engine
=============================================================================
Validates temporal continuity, stochastic convergence, percentile monotonicity,
Value at Risk (VaR 95%), histogram binning, and REST API contracts.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.engine.rolling_forecast_engine import RollingForecastEngine
from backend.app.engine.monte_carlo_engine import MonteCarloEngine


@pytest.fixture
def client():
    return TestClient(app)


class TestRollingForecastEngine:
    def test_rolling_forecast_generation(self):
        engine = RollingForecastEngine(company_id="klabin")
        summary = engine.get_summary()

        assert summary["company_id"] == "klabin"
        assert summary["quarters_count"] == 8
        assert summary["actuals_count"] == 4
        assert summary["forecast_count"] == 4

        timeline = summary["timeline"]
        assert len(timeline) == 8

        # Verify first 4 are ACTUAL, last 4 are FORECAST
        for i in range(4):
            assert timeline[i]["is_actual"] is True
            assert timeline[i]["period_type"] == "ACTUAL"

        for i in range(4, 8):
            assert timeline[i]["is_actual"] is False
            assert timeline[i]["period_type"] == "FORECAST"

    def test_cash_flow_temporal_continuity(self):
        """Verifies that ending cash of quarter t becomes beginning cash of quarter t+1."""
        engine = RollingForecastEngine(company_id="klabin")
        summary = engine.get_summary()
        timeline = summary["timeline"]

        for i in range(len(timeline) - 1):
            curr_end = timeline[i]["cash_end"]
            next_start = timeline[i + 1]["cash_start"]
            assert curr_end == pytest.approx(next_start, abs=0.01), (
                f"Cash discontinuity between {timeline[i]['quarter_id']} and {timeline[i+1]['quarter_id']}: "
                f"{curr_end} vs {next_start}"
            )

    def test_kpis_calculation(self):
        engine = RollingForecastEngine(company_id="vale")
        summary = engine.get_summary()
        kpis = summary["kpis"]

        assert kpis["annual_actual_revenue"] > 0
        assert kpis["annual_forecast_revenue"] > 0
        assert kpis["annual_actual_ebitda"] > 0
        assert kpis["annual_forecast_ebitda"] > 0
        assert kpis["ending_cash"] > 0


class TestMonteCarloEngine:
    def test_monte_carlo_stochastic_simulation(self):
        engine = MonteCarloEngine(company_id="klabin", iterations=1000, random_seed=42)
        res = engine.run_simulation(
            revenue_volatility_pct=8.0,
            cogs_inflation_mode_pct=5.0,
            selic_shock_bps_std=150.0,
            capex_uncertainty_pct=10.0
        )

        assert res["iterations"] == 1000
        assert "risk_metrics" in res
        assert "distributions" in res
        assert "histograms" in res
        assert "fan_charts" in res

        # Check risk metrics
        metrics = res["risk_metrics"]
        assert metrics["var_95_ebitda"] > 0, "VaR 95% should be positive"
        assert metrics["median_ebitda"] > 0
        assert 0.0 <= metrics["prob_cash_negative_pct"] <= 100.0
        assert 0.0 <= metrics["prob_covenant_breach_pct"] <= 100.0

    def test_percentile_monotonicity(self):
        """P1 < P5 < P10 < P25 < P50 < P75 < P90 < P95 < P99 must hold strictly."""
        engine = MonteCarloEngine(company_id="petrobras", iterations=1500, random_seed=123)
        res = engine.run_simulation()
        pcts = res["distributions"]["ebitda"]["percentiles"]

        assert pcts["p1"] <= pcts["p5"]
        assert pcts["p5"] <= pcts["p10"]
        assert pcts["p10"] <= pcts["p25"]
        assert pcts["p25"] <= pcts["p50"]
        assert pcts["p50"] <= pcts["p75"]
        assert pcts["p75"] <= pcts["p90"]
        assert pcts["p90"] <= pcts["p95"]
        assert pcts["p95"] <= pcts["p99"]

    def test_histogram_distribution_integrity(self):
        engine = MonteCarloEngine(company_id="weg", iterations=1200, random_seed=99)
        res = engine.run_simulation()
        hist = res["histograms"]["ebitda"]

        assert hist["total_samples"] == 1200
        assert len(hist["bins"]) == 30

        # Sum of counts must equal total samples
        total_counted = sum(b["count"] for b in hist["bins"])
        assert total_counted == 1200

        # Cumulative probability of last bin should be approx 1.0
        assert hist["bins"][-1]["cumulative_probability"] == pytest.approx(1.0, abs=0.01)

    def test_fan_chart_trajectories(self):
        engine = MonteCarloEngine(company_id="klabin", iterations=1000)
        res = engine.run_simulation()
        fan_ebitda = res["fan_charts"]["ebitda"]

        assert len(fan_ebitda) == 8

        # First 4 (Actuals) have p10 == p50 == p90 (deterministic)
        for i in range(4):
            assert fan_ebitda[i]["p10"] == fan_ebitda[i]["p50"] == fan_ebitda[i]["p90"]

        # Last 4 (Forecast) have stochastic dispersion: p10 < p50 < p90
        for i in range(4, 8):
            assert fan_ebitda[i]["p10"] <= fan_ebitda[i]["p50"] <= fan_ebitda[i]["p90"]


class TestForecastAPIRoutes:
    def test_get_companies(self, client):
        response = client.get("/api/financials/forecast/companies")
        assert response.status_code == 200
        data = response.json()
        assert "companies" in data
        assert len(data["companies"]) >= 5

    def test_get_rolling_forecast_endpoint(self, client):
        response = client.get("/api/financials/forecast/rolling?company_id=klabin")
        assert response.status_code == 200
        data = response.json()
        assert data["company_id"] == "klabin"
        assert len(data["timeline"]) == 8

    def test_post_monte_carlo_endpoint(self, client):
        payload = {
            "company_id": "klabin",
            "iterations": 1000,
            "revenue_volatility_pct": 7.5,
            "cogs_inflation_mode_pct": 4.5,
            "selic_shock_bps_std": 120.0,
            "capex_uncertainty_pct": 8.0,
            "covenant_leverage_limit": 3.5
        }
        response = client.post("/api/financials/forecast/monte-carlo", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["company_id"] == "klabin"
        assert data["iterations"] == 1000
        assert "risk_metrics" in data
        assert "distributions" in data
        assert "fan_charts" in data
