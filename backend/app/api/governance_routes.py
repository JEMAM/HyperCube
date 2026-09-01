"""
Governance & Board C-Level API Routes — HyperCube Enterprise FP&A
================================================================
Exposes endpoints for Covenant Monitoring, Headroom Calculations,
and Autonomous Board Advisor Executive Memoranda (Agno Agent).
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from backend.app.engine.covenant_monitor_engine import CovenantMonitorEngine
from backend.app.agents.board_advisor_agent import BoardAdvisorAgent
from backend.app.engine.three_statement_engine import COMPANIES_METADATA

router = APIRouter(prefix="/api/governance", tags=["Governance & Board Advisory"])


class BoardMemoRequest(BaseModel):
    company_id: str = Field(default="klabin", description="Target company ID")
    model_name: Optional[str] = Field(default=None, description="Optional LLM model name override")
    api_key: Optional[str] = Field(default=None, description="Optional API key override")


@router.get("/covenants")
def get_covenants_status(
    company_id: str = Query(default="klabin", description="Target company ID")
) -> Dict[str, Any]:
    """
    Evaluates compliance across all 4 debt covenants,
    calculates financial headrooms (EBITDA & Net Debt buffers),
    and provides timeline evolution over the 8-quarter Rolling Forecast.
    """
    norm_id = company_id.lower().strip()
    if norm_id not in COMPANIES_METADATA:
        norm_id = "klabin"

    engine = CovenantMonitorEngine(company_id=norm_id)
    return engine.evaluate_covenants()


@router.post("/board-memo")
def generate_board_memo(req: BoardMemoRequest) -> Dict[str, Any]:
    """
    Triggers the autonomous Board Advisor Agent (Agno) to synthesize 3-statement,
    working capital Fleuriet, and Monte Carlo VaR metrics into a formal Board of Directors memorandum.
    """
    norm_id = req.company_id.lower().strip()
    if norm_id not in COMPANIES_METADATA:
        norm_id = "klabin"

    agent = BoardAdvisorAgent(company_id=norm_id)
    return agent.generate_board_memo(
        model_name=req.model_name,
        api_key=req.api_key
    )


@router.get("/board-pack")
def get_board_pack_consolidated(
    company_id: str = Query(default="klabin", description="Target company ID")
) -> Dict[str, Any]:
    """
    Returns the complete Board-Ready executive presentation pack,
    including consolidated statement metrics, covenant status, risk profile, and executive memo.
    """
    norm_id = company_id.lower().strip()
    if norm_id not in COMPANIES_METADATA:
        norm_id = "klabin"

    cov_engine = CovenantMonitorEngine(company_id=norm_id)
    cov_data = cov_engine.evaluate_covenants()

    agent = BoardAdvisorAgent(company_id=norm_id)
    memo_data = agent.generate_board_memo()

    return {
        "company_id": norm_id,
        "company_name": COMPANIES_METADATA[norm_id]["name"],
        "ticker": COMPANIES_METADATA[norm_id]["ticker"],
        "sector": COMPANIES_METADATA[norm_id]["sector"],
        "covenants": cov_data,
        "memo": memo_data
    }
