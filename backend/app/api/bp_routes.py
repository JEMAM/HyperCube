from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from backend.app.bp.bp_engine import bp_engine
from backend.app.data.loader import get_active_company_info
from backend.app.agents.bp_agent import bp_agent

router = APIRouter(prefix="/bp", tags=["Balanço Patrimonial (BP)"])

_last_bp_sim_result: Optional[Dict[str, Any]] = None

class BPSimulateRequest(BaseModel):
    node: str = "contas_receber"
    variation_pct: float = 10.0
    period: Optional[str] = "Budget 2026"

class BPAskRequest(BaseModel):
    question: str

@router.get("/table")
def get_bp_table():
    """
    Returns the full Balance Sheet accounts table with Vertical (AV%)
    and Horizontal (AH%) multi-period analysis.
    """
    company_info = get_active_company_info()
    table = bp_engine.get_table_data()
    return {
        "company": company_info,
        "periods": bp_engine.periods,
        "rows": table
    }

@router.get("/kpis")
def get_bp_kpis():
    """
    Returns all key metrics adhering strictly to the 'analise-balanco-patrimonial' skill:
    - Liquidity (Corrente, Seca, Imediata, Geral)
    - Fleuriet Working Capital (NCG, CDG, ST and Classification)
    - Indebtedness & Capital Structure (Endividamento Geral, Composição, Debt-to-Equity, Imobilização)
    - Profitability & Dupont (ROE, ROA, ROIC, Dupont 3 Factors)
    - Activity / Efficiency (PME, PMR, PMP, Ciclo Operacional, Ciclo Financeiro)
    """
    company_info = get_active_company_info()
    kpis = bp_engine.get_kpis()
    kpis["company"] = company_info
    return kpis

@router.get("/dag")
def get_bp_dag():
    """
    Returns the topological dependency graph (nodes and edges) for the Balance Sheet DAG.
    """
    return bp_engine.get_dag_graph()

@router.post("/simulate/whatif")
def simulate_bp_whatif(req: BPSimulateRequest):
    """
    Executes an instantaneous What-If simulation on a Balance Sheet account
    with reactive topological propagation.
    """
    global _last_bp_sim_result
    res = bp_engine.simulate_whatif(
        node_id=req.node,
        variation_pct=req.variation_pct,
        period=req.period
    )
    _last_bp_sim_result = res
    return res

@router.post("/simulate/reset")
def reset_bp_simulation():
    """
    Restores all baseline Balance Sheet accounts.
    """
    global _last_bp_sim_result
    _last_bp_sim_result = None
    bp_engine.reset_simulation()
    return {"status": "ok", "message": "Balanço Patrimonial restaurado com sucesso."}

@router.get("/agent/explain")
def explain_bp_agent():
    """
    Gera o Parecer Executivo do Agente Especialista em Balanço Patrimonial
    utilizando a skill 'analise-balanco-patrimonial'.
    """
    global _last_bp_sim_result
    if _last_bp_sim_result:
        summary = bp_agent.explain_simulation(_last_bp_sim_result)
    else:
        summary = bp_agent.get_executive_summary()
    return {"summary": summary}

@router.post("/agent/ask")
def ask_bp_agent(req: BPAskRequest):
    """
    Chat interativo com o Agente Especialista em Balanço Patrimonial
    executando as diretrizes da skill 'analise-balanco-patrimonial'.
    """
    answer = bp_agent.ask(req.question)
    return {"answer": answer}
