from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Union

from backend.app.agents.valuation_agent import valuation_agent
from backend.app.cvm.analysis import cvm_analyzer
from backend.app.cvm.database import cvm_db
from backend.app.data.loader import get_active_company_info

router = APIRouter(prefix="/valuation", tags=["Valuation"])

class ValuationCalculateRequest(BaseModel):
    source_type: str = "upload" # "upload" | "cvm"
    identifier: Optional[Union[str, int]] = "casas_bahia"
    wacc_override: Optional[float] = None
    g_override: Optional[float] = None
    beta_override: Optional[float] = None
    rf_override: Optional[float] = None
    mrp_override: Optional[float] = None
    kd_override: Optional[float] = None
    tax_override: Optional[float] = None
    debt_ratio_override: Optional[float] = None
    ebit_margin_override: Optional[float] = None
    growth_rate_override: Optional[float] = None
    capex_ratio_override: Optional[float] = None
    nwc_ratio_override: Optional[float] = None
    exit_multiple_override: Optional[float] = None
    peer_pe_override: Optional[float] = None
    pvp_override: Optional[float] = None

class ValuationChatRequest(BaseModel):
    question: str
    valuation_context: Dict[str, Any]
    history: Optional[List[Dict[str, str]]] = None

@router.post("/calculate")
def calculate_valuation_endpoint(req: ValuationCalculateRequest):
    """
    Calculates comprehensive valuation (DCF, Multiples, Asset-based, Sensitivity)
    for either an uploaded/active company or a CVM listed company with granular What-If parameters.
    """
    company_data: Dict[str, Any] = {}

    if req.source_type == "cvm" and req.identifier:
        try:
            cod_cvm = int(req.identifier)
            analysis = cvm_analyzer.get_company_analysis(cod_cvm)
            if not analysis:
                raise HTTPException(status_code=404, detail=f"CVM Company {cod_cvm} not found")
            
            comp_info = analysis.get("company", {})
            kpis = analysis.get("kpis", {})
            
            company_data = {
                "name": comp_info.get("denom_social", comp_info.get("nome_pregao", f"CVM {cod_cvm}")),
                "ticker": comp_info.get("nome_pregao", "CVM"),
                "sector": comp_info.get("setor", "Geral"),
                "receita_liquida": float(kpis.get("receita_liquida", 12000.0)),
                "margem_bruta": float(kpis.get("margem_bruta", 35.0)),
                "margem_ebit": float(kpis.get("margem_ebit", 15.0)),
                "margem_liquida": float(kpis.get("margem_liquida", 8.0))
            }
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid CVM code")
    else:
        # Default Active / Uploaded company
        active_info = get_active_company_info()
        cid = (active_info.get("id") or "").lower()
        name = active_info.get("name") or "Vale S.A."
        ticker = active_info.get("ticker") or "VALE3"
        
        if "master" in cid or "master" in name.lower():
            company_data = {
                "name": "Banco Master S.A.",
                "ticker": "BANCO MASTER",
                "sector": "Instituições Financeiras / Bancos Comerciais",
                "receita_liquida": 7259.5,
                "margem_bruta": 31.5,
                "margem_ebit": 27.9,
                "margem_liquida": 14.7
            }
        elif "klabin" in cid or "klabin" in name.lower():
            company_data = {
                "name": "Klabin S.A.",
                "ticker": "KLBN11",
                "sector": "Papel e Celulose / Florestal",
                "receita_liquida": 20697.5,
                "margem_bruta": 35.4,
                "margem_ebit": 21.6,
                "margem_liquida": 8.1
            }
        elif "vale" in cid or "vale" in name.lower():
            company_data = {
                "name": "Vale S.A.",
                "ticker": "VALE3",
                "sector": "Mineração e Metalurgia",
                "receita_liquida": 41800.0,
                "margem_bruta": 44.0,
                "margem_ebit": 31.0,
                "margem_liquida": 21.0
            }
        else:
            company_data = {
                "name": name,
                "ticker": ticker,
                "sector": "Comércio Varejista / E-commerce",
                "receita_liquida": 29800.0,
                "margem_bruta": 28.5,
                "margem_ebit": 4.5,
                "margem_liquida": -2.5
            }

    result = valuation_agent.calculate_valuation(
        company_data=company_data,
        wacc_override=req.wacc_override,
        g_override=req.g_override,
        beta_override=req.beta_override,
        rf_override=req.rf_override,
        mrp_override=req.mrp_override,
        kd_override=req.kd_override,
        tax_override=req.tax_override,
        debt_ratio_override=req.debt_ratio_override,
        ebit_margin_override=req.ebit_margin_override,
        growth_rate_override=req.growth_rate_override,
        capex_ratio_override=req.capex_ratio_override,
        nwc_ratio_override=req.nwc_ratio_override,
        exit_multiple_override=req.exit_multiple_override,
        peer_pe_override=req.peer_pe_override,
        pvp_override=req.pvp_override
    )
    return result

@router.post("/chat")
def valuation_chat_endpoint(req: ValuationChatRequest):
    """
    Interacts with the Agno AI Valuation Agent to analyze assumptions, WACC, and sensitivity.
    """
    if not req.question:
        raise HTTPException(status_code=400, detail="Question is required")

    answer = valuation_agent.chat(
        question=req.question,
        valuation_context=req.valuation_context,
        history=req.history
    )
    return {"answer": answer}
