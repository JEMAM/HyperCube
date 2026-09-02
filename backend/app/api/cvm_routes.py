"""
FastAPI REST API routes for CVM Open Data Watchdog & Company Analysis.
"""
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import Optional, Dict, Any, List
from backend.app.cvm.database import cvm_db
from backend.app.cvm.watchdog import cvm_watchdog
from backend.app.cvm.analysis import cvm_analyzer
from backend.app.engine.multidim_cube import global_cube

router = APIRouter(prefix="/cvm", tags=["CVM Open Data & Company Analysis"])

@router.get("/sectors", response_model=List[str])
def get_sectors():
    """Returns sorted list of distinct company sectors."""
    return cvm_db.get_sectors()

@router.get("/companies")
def get_companies(
    sector: Optional[str] = Query(None, description="Filter by sector"),
    search: Optional[str] = Query(None, description="Search by name, CNPJ or ticker")
):
    """Returns list of registered CVM companies."""
    return cvm_db.get_companies(sector=sector, search=search)

@router.get("/companies/{cod_cvm}")
def get_company_details(cod_cvm: int):
    """Returns company metadata by CVM code."""
    comp = cvm_db.get_company_by_code(cod_cvm)
    if not comp:
        raise HTTPException(status_code=404, detail=f"Company with CVM code {cod_cvm} not found")
    return comp

@router.get("/companies/{cod_cvm}/filings")
def get_company_filings(cod_cvm: int):
    """Returns filings history (ITR/DFP) for the specified company."""
    return cvm_db.get_company_filings(cod_cvm)

@router.get("/companies/{cod_cvm}/financials")
def get_company_financial_analysis(cod_cvm: int):
    """Returns normalized financial statements, historical time-series and executive KPIs."""
    analysis = cvm_analyzer.get_company_analysis(cod_cvm)
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Financial data for company {cod_cvm} not available")
    return analysis

@router.post("/companies/{cod_cvm}/load-cube")
def load_company_into_cube(
    cod_cvm: int,
    periodicity: Optional[str] = Query("ANUAL", description="ANUAL (DFP) or TRIMESTRAL (ITR)")
):
    """
    Injects the company's financial data into the reactive MultiDimCube engine,
    enabling full OLAP slices, DAG dependency calculation, and What-If simulation.
    """
    success = global_cube.load_cvm_company_dataset(cod_cvm, periodicity=periodicity)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to load company into Hyperblock Cube")
    
    from backend.app.data.loader import set_active_company_info
    analysis = cvm_analyzer.get_company_analysis(cod_cvm)
    comp = analysis.get("company", {}) if analysis else {}
    
    is_trimestral = periodicity and periodicity.upper() == "TRIMESTRAL"
    if is_trimestral:
        periods = ["1T24", "2T24", "3T24", "4T24", "1T25", "2T25"]
        desc_type = "Informações Trimestrais (ITR)"
    else:
        periods = ["2022", "2023", "2024", "2025", "Budget 2026"]
        desc_type = "Demonstrações Anuais Consolidadas (DFP)"

    new_active_info = {
        "id": f"cvm_{cod_cvm}",
        "name": global_cube.active_company_name,
        "ticker": comp.get("nome_pregao") or ("BRKM5" if cod_cvm == 4820 else f"CVM:{cod_cvm}"),
        "currency": "R$ Milhões",
        "periods": periods,
        "periodicity": "TRIMESTRAL" if is_trimestral else "ANUAL",
        "description": f"Companhia aberta listada na CVM ({global_cube.active_company_name}) - {desc_type} carregada via CVM Watch & Análise."
    }
    set_active_company_info(new_active_info)

    return {
        "status": "loaded",
        "cod_cvm": cod_cvm,
        "company_id": global_cube.active_company_id,
        "company_name": global_cube.active_company_name,
        "active_company": new_active_info,
        "dimensions": {k: d.to_dict() for k, d in global_cube.dimensions.items()},
        "message": f"Successfully loaded {global_cube.active_company_name} into HyperCube Calculation Engine"
    }


@router.get("/watchdog/status")
def get_watchdog_status():
    """Returns the latest CVM watchdog status, last run timestamp, and statistics."""
    return cvm_db.get_watch_status()

@router.post("/watchdog/run")
async def trigger_watchdog_run(background_tasks: BackgroundTasks):
    """Triggers an on-demand CVM watchdog detection cycle."""
    if cvm_watchdog.is_running:
        return {"status": "ALREADY_RUNNING", "message": "CVM Watchdog cycle is already in progress"}
    
    # Run cycle asynchronously
    background_tasks.add_task(cvm_watchdog.run_detection_cycle)
    return {"status": "TRIGGERED", "message": "CVM Watchdog detection cycle initiated"}
