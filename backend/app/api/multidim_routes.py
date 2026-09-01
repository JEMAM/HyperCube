"""
FastAPI Routes for N-Dimensional Connected Planning Cube,
Cell Write-Back, Breakback, DSL Rules, Calculation Trace, and Variance Analysis.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional

from backend.app.engine.multidim_cube import global_cube
from backend.app.engine.formula_dsl import global_dsl_engine
from backend.app.engine.writeback import global_writeback_engine
from backend.app.engine.version_manager import global_version_manager
from backend.app.engine.audit_tracer import global_audit_tracer
from backend.app.engine.waterfall_decomposer import global_waterfall_decomposer

router = APIRouter(prefix="/api/multidim", tags=["MultiDimensional Connected Planning"])


# Request Models
class WaterfallBridgeRequest(BaseModel):
    base_version: str = "Actuals"
    target_version: str = "Actuals"
    metric: str = "EBITDA"  # "EBITDA", "Receita_Liquida", "Lucro_Liquido"
    filters: Dict[str, str] = Field(default_factory=dict)

class QuerySliceRequest(BaseModel):
    row_dim: str = "account"
    col_dim: str = "time"
    filters: Dict[str, str] = Field(default_factory=lambda: {
        "version": "Actuals",
        "scenario": "Base",
        "entity": "Total_Company",
        "product": "Total_Products"
    })


class WriteCellRequest(BaseModel):
    time: str
    version: str
    scenario: str = "Base"
    entity: str = "Total_Company"
    account: str
    product: str = "Total_Products"
    value: float
    spread_method: str = "proportional"  # "proportional", "equal", "leaf_only"
    user: str = "Jane Doe (Finance)"


class CellTraceRequest(BaseModel):
    time: str
    version: str
    scenario: str = "Base"
    entity: str = "Total_Company"
    account: str
    product: str = "Total_Products"


class CloneVersionRequest(BaseModel):
    source_version_id: str
    new_version_id: str
    new_label: str
    growth_factor: float = 1.0
    author: str = "Finance Team"


class VarianceRequest(BaseModel):
    base_version: str = "Actuals"
    target_version: str = "Budget_2026"
    filters: Dict[str, str] = Field(default_factory=lambda: {
        "time": "2026",
        "scenario": "Base",
        "entity": "Total_Company",
        "product": "Total_Products"
    })


class RuleRequest(BaseModel):
    target_account: str
    expression: str
    description: str = ""


# Endpoints
@router.get("/dimensions")
def get_dimensions():
    """Returns metadata for all 6 orthogonal dimensions (Time, Version, Scenario, Entity, Account, Product)."""
    return {
        dim_name: dim.to_dict()
        for dim_name, dim in global_cube.dimensions.items()
    }


@router.post("/query")
def query_cube_slice(req: QuerySliceRequest):
    """Executes a 2D Pivot slice & dice query over the N-Dimensional Cube."""
    try:
        return global_cube.query_slice(req.row_dim, req.col_dim, req.filters)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/cell/write")
def write_cell(req: WriteCellRequest):
    """Executes a cell write-back transaction with Breakback (top-down distribution) & DAG recalculations."""
    try:
        result = global_writeback_engine.write_cell(
            time_id=req.time,
            version_id=req.version,
            scenario_id=req.scenario,
            entity_id=req.entity,
            account_id=req.account,
            product_id=req.product,
            new_value=req.value,
            spread_method=req.spread_method,
            user=req.user
        )
        # Record audit trail
        global_audit_tracer.record_edit(
            user=req.user,
            coords={
                "time": req.time,
                "version": req.version,
                "scenario": req.scenario,
                "entity": req.entity,
                "account": req.account,
                "product": req.product
            },
            old_val=result["old_value"],
            new_val=result["new_value"],
            spread_method=req.spread_method
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/cell/trace")
def trace_cell_calculation(req: CellTraceRequest):
    """Generates an Anaplan-grade Calculation Trace tree for any cell in the cube."""
    try:
        return global_audit_tracer.trace_cell(
            time_id=req.time,
            version_id=req.version,
            scenario_id=req.scenario,
            entity_id=req.entity,
            account_id=req.account,
            product_id=req.product
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/versions")
def list_versions():
    """Lists all available planning versions and scenarios."""
    return {
        "versions": global_version_manager.list_versions(),
        "scenarios": global_version_manager.list_scenarios()
    }


@router.post("/versions/clone")
def clone_version(req: CloneVersionRequest):
    """Branches and clones a version into an independent scenario with optional multiplier."""
    try:
        return global_version_manager.clone_version(
            source_version_id=req.source_version_id,
            new_version_id=req.new_version_id,
            new_label=req.new_label,
            growth_factor=req.growth_factor,
            author=req.author
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/variance")
def compute_variance(req: VarianceRequest):
    """Computes Variance Analysis comparing two versions with absolute and percentage deltas."""
    try:
        return global_version_manager.compute_variance(
            base_version=req.base_version,
            target_version=req.target_version,
            filters=req.filters
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/variance/waterfall")
def compute_variance_waterfall(req: WaterfallBridgeRequest):
    """Computes Waterfall Decomposition Bridge (EBITDA, Revenue, or Net Income) with 100% mathematical closure."""
    try:
        return global_waterfall_decomposer.compute_bridge(
            base_version=req.base_version,
            target_version=req.target_version,
            metric=req.metric,
            filters=req.filters
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/dsl/rules")
def list_rules():
    """Returns all active DSL formula rules and their topological dependencies."""
    return {
        "rules": global_dsl_engine.get_rules(),
        "topological_order": global_dsl_engine.get_topological_order()
    }


@router.post("/dsl/rules")
def add_or_update_rule(req: RuleRequest):
    """Adds or updates a custom formula rule in Anaplan DSL and recalculates the cube."""
    try:
        rule = global_dsl_engine.add_rule(req.target_account, req.expression, req.description)
        global_cube.recalculate_all_cubes()
        return {
            "success": True,
            "rule": rule.to_dict(),
            "topological_order": global_dsl_engine.get_topological_order()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/audit/history")
def get_audit_history(limit: int = Query(default=30, le=100)):
    """Returns the recent audit trail history of cell edits."""
    return {
        "history": global_audit_tracer.get_history(limit)
    }


@router.post("/cells/clear")
def clear_all_cells():
    """
    Clears all cells in the Connected Planning cube (zeros out all figures),
    leaving the structure completely pristine for a client to start analysis in production.
    """
    try:
        return global_cube.clear_all_cells()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/cells/restore-demo")
def restore_demo_cells():
    """Restores baseline demo figures for the current active company or default enterprise."""
    try:
        return global_cube.restore_demo_cells()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

