"""
FastAPI Routes for Closed-Loop 3-Statement Modeling (DRE ↔ DFC ↔ BP).
Guarantees continuous mathematical reconciliation, cash flow integration, and Fleuriet working capital analysis.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from backend.app.engine.three_statement_engine import global_three_statement_engine

router = APIRouter(prefix="/financials/3statement", tags=["Closed-Loop 3-Statement Model"])


class SimulateDriversRequest(BaseModel):
    growth_pct: float = Field(default=8.5, description="Percentual de crescimento projetado da receita líquida")
    pmr_dias: float = Field(default=42.0, description="Prazo Médio de Recebimento (dias)")
    pme_dias: float = Field(default=86.0, description="Prazo Médio de Estocagem (dias)")
    pmp_dias: float = Field(default=66.0, description="Prazo Médio de Pagamento a Fornecedores (dias)")
    capex_val: float = Field(default=7200.0, description="Volume total de investimentos Capex")
    payout_pct: float = Field(default=40.0, description="Percentual de distribuição de dividendos sobre o lucro líquido")
    company_id: Optional[str] = Field(default=None, description="Identificador da empresa (vale, petrobras, klabin, weg, banco_do_brasil)")


@router.get("/model")
def get_three_statement_model(company_id: Optional[str] = Query(None, description="ID da empresa")):
    """
    Returns the complete multi-period closed-loop model containing:
    - Income Statement (DRE)
    - Cash Flow Statement (DFC)
    - Balance Sheet (BP)
    - Fleuriet Working Capital (NCG, CDG, ST) & 6 Tipologias
    - Efeito Tesoura / Overtrading Early Warning
    - DuPont 3-Factor Decomposition
    - Causal Waterfall Bridge
    - Strict Balance Sheet Reconciliation (Delta 0.00)
    """
    try:
        return global_three_statement_engine.get_full_model(company_id=company_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/simulate")
def simulate_three_statement_drivers(req: SimulateDriversRequest):
    """
    Simulates operational drivers and regenerates the 3-Statement model in real-time,
    guaranteeing closed-loop balance sheet reconciliation and working capital metrics.
    """
    try:
        return global_three_statement_engine.simulate_drivers(
            growth_pct=req.growth_pct,
            pmr_dias=req.pmr_dias,
            pme_dias=req.pme_dias,
            pmp_dias=req.pmp_dias,
            capex_val=req.capex_val,
            payout_pct=req.payout_pct,
            company_id=req.company_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/companies")
def list_available_companies():
    """Returns list of pre-calibrated companies available for the 3-Statement model."""
    try:
        model = global_three_statement_engine.get_full_model()
        return {
            "companies": model.get("available_companies", []),
            "active_company": model.get("company_id")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
