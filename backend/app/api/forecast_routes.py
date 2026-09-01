"""
Forecast & Monte Carlo API Routes — HyperCube Enterprise FP&A
============================================================
Exposes Rolling Forecast and Vectorized Monte Carlo Stochastic Risk Simulation.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from backend.app.engine.rolling_forecast_engine import RollingForecastEngine
from backend.app.engine.monte_carlo_engine import MonteCarloEngine
from backend.app.engine.three_statement_engine import COMPANIES_METADATA

router = APIRouter(prefix="/api/financials/forecast", tags=["Rolling Forecast & Monte Carlo"])


class MonteCarloRequest(BaseModel):
    company_id: str = Field(default="klabin", description="Target company ID")
    iterations: int = Field(default=3000, ge=500, le=10000, description="Number of Monte Carlo iterations")
    revenue_volatility_pct: float = Field(default=8.0, ge=0.5, le=50.0, description="Revenue growth standard deviation %")
    cogs_inflation_mode_pct: float = Field(default=5.0, ge=-10.0, le=40.0, description="Expected COGS inflation mode %")
    selic_shock_bps_std: float = Field(default=150.0, ge=0.0, le=1000.0, description="Selic interest rate shock std in bps")
    capex_uncertainty_pct: float = Field(default=10.0, ge=0.0, le=60.0, description="Capex overrun uncertainty std %")
    covenant_leverage_limit: float = Field(default=3.5, ge=1.0, le=10.0, description="Covenant Net Debt / EBITDA threshold")


@router.get("/companies")
def list_forecast_companies() -> Dict[str, Any]:
    """Returns the list of enterprise companies configured for continuous forecasting."""
    return {
        "companies": [
            {
                "id": cid,
                "name": meta["name"],
                "ticker": meta["ticker"],
                "sector": meta["sector"],
                "badge": meta.get("badge", "Enterprise")
            }
            for cid, meta in COMPANIES_METADATA.items()
        ]
    }


@router.get("/rolling")
def get_rolling_forecast(
    company_id: str = Query(default="klabin", description="Target company ID")
) -> Dict[str, Any]:
    """
    Returns the continuous 8-quarter Rolling Forecast (4 Actuals + 4 Forecast)
    with cash continuity and timeline metrics.
    """
    norm_id = company_id.lower().strip()
    if norm_id not in COMPANIES_METADATA:
        norm_id = "klabin"

    engine = RollingForecastEngine(company_id=norm_id)
    return engine.get_summary()


@router.post("/monte-carlo")
def run_monte_carlo_simulation(req: MonteCarloRequest) -> Dict[str, Any]:
    """
    Runs a vectorized Monte Carlo simulation with N iterations.
    Returns probability distributions, VaR 95%, covenants, and Fan Chart trajectories.
    """
    norm_id = req.company_id.lower().strip()
    if norm_id not in COMPANIES_METADATA:
        norm_id = "klabin"

    engine = MonteCarloEngine(
        company_id=norm_id,
        iterations=req.iterations
    )

    return engine.run_simulation(
        revenue_volatility_pct=req.revenue_volatility_pct,
        cogs_inflation_mode_pct=req.cogs_inflation_mode_pct,
        selic_shock_bps_std=req.selic_shock_bps_std,
        capex_uncertainty_pct=req.capex_uncertainty_pct,
        covenant_leverage_limit=req.covenant_leverage_limit
    )
