"""
HyperCube Operational Driver Planning API Routes
Module: driver_planning_routes.py

Exposes REST endpoints for:
- Retrieving baseline workforce (Headcount) and Capex asset investment plans.
- Simulating Driver-Based Operational Planning and propagating into Closed-Loop 3-Statement Model.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.app.engine.driver_planning_engine import (
    DriverPlanningEngine,
    get_driver_planning_engine,
    get_default_headcount_plans,
    get_default_capex_projects
)
from backend.app.engine.three_statement_engine import COMPANIES_METADATA

router = APIRouter(prefix="/api/financials/planning/drivers", tags=["Driver-Based Operational Planning"])


class DepartmentPlanInput(BaseModel):
    department_id: str
    department_name: str
    category: str = Field(default="OPERATIONS", description="OPERATIONS, SALES, ADMIN, RD")
    current_headcount: int = Field(ge=0)
    hiring_plan: int = Field(default=0)
    attrition_rate_pct: float = Field(default=3.0, ge=0.0, le=100.0)
    avg_salary_monthly: float = Field(ge=0.0)
    avg_benefits_monthly: float = Field(default=1800.0, ge=0.0)
    fgts_pct: float = Field(default=8.0, ge=0.0)
    inss_patronal_pct: float = Field(default=20.0, ge=0.0)
    sistema_s_rat_pct: float = Field(default=8.8, ge=0.0)
    provisao_13_ferias_pct: float = Field(default=19.44, ge=0.0)


class CapexProjectInput(BaseModel):
    project_id: str
    project_name: str
    asset_category: str = Field(default="MACHINERY", description="MACHINERY, SOFTWARE, VEHICLES, BUILDINGS")
    total_investment: float = Field(ge=0.0)
    useful_life_years: int = Field(default=10, ge=1)
    residual_value_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    start_year: int = Field(default=2026)
    is_active: bool = Field(default=True)


class DriverSimulateRequest(BaseModel):
    company_id: str = Field(default="klabin")
    headcount_plans: List[DepartmentPlanInput]
    capex_projects: List[CapexProjectInput]
    growth_pct_override: Optional[float] = Field(default=None, description="Optional override for net revenue growth %")
    payout_pct_override: Optional[float] = Field(default=None, description="Optional override for dividend payout %")


class SectorGenerateRequest(BaseModel):
    company_id: str = "cvm_20796"
    company_name: Optional[str] = "BANCO PINE S.A."
    ticker: Optional[str] = "PINE4"
    sector_hint: Optional[str] = ""


@router.get("")
def get_driver_planning_baseline(
    company_id: str = Query(default="klabin", description="Company ID (vale, petrobras, klabin, weg, cvm_20796, cyrela, etc.)")
) -> Dict[str, Any]:
    """
    Returns the baseline operational driver model (Workforce Headcount + Capex Projects),
    including summaries and causal 3-statement integration for the requested company.
    """
    norm_id = company_id.lower().strip()
    engine = get_driver_planning_engine(company_id=norm_id)
    return engine.simulate_integrated_financials()


@router.post("/generate-sector")
def generate_sector_drivers(req: SectorGenerateRequest) -> Dict[str, Any]:
    """
    Invokes the SectorDriverAgent with Gemini to classify company sector
    and generate tailored departments and capex assets.
    """
    from backend.app.agents.sector_driver_agent import SectorDriverAgent
    agent = SectorDriverAgent()
    return agent.analyze_and_build(
        company_id=req.company_id,
        company_name=req.company_name or req.company_id,
        ticker=req.ticker or "",
        sector_hint=req.sector_hint or ""
    )


@router.post("/simulate")
def simulate_driver_planning(req: DriverSimulateRequest) -> Dict[str, Any]:
    """
    Simulates modifications to department headcounts, salary/charge rates, and capex projects.
    Returns the recomputed workforce summary, capex depreciation schedule, and closed-loop 3-statement model.
    """
    norm_id = req.company_id.lower().strip()

    hc_dicts = [p.model_dump() for p in req.headcount_plans]
    cx_dicts = [p.model_dump() for p in req.capex_projects]

    engine = get_driver_planning_engine(
        company_id=norm_id,
        headcount_plans=hc_dicts,
        capex_projects=cx_dicts
    )

    return engine.simulate_integrated_financials(
        growth_pct_override=req.growth_pct_override,
        payout_pct_override=req.payout_pct_override
    )


@router.get("/companies")
def list_supported_companies() -> Dict[str, Any]:
    """Lists companies calibrated for Driver-Based Planning with their sector metadata."""
    return {
        "companies": [
            {
                "id": cid,
                "name": meta["name"],
                "ticker": meta["ticker"],
                "sector": meta["sector"],
                "default_currency": "BRL"
            }
            for cid, meta in COMPANIES_METADATA.items()
        ]
    }
