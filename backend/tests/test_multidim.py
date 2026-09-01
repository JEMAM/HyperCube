"""
Automated Unit & Integration Tests for N-Dimensional Connected Planning Cube,
Formula DSL Engine, Write-Back / Breakback, and Version Variance Analysis.
"""

import pytest
from backend.app.engine.multidim_cube import NDimensionalCube
from backend.app.engine.formula_dsl import FormulaDSLEngine
from backend.app.engine.writeback import WriteBackEngine
from backend.app.engine.version_manager import VersionManager
from backend.app.engine.audit_tracer import AuditTracer


def test_ndim_cube_dimensions_and_rollups():
    cube = NDimensionalCube()
    
    # Verify dimensions exist
    assert "time" in cube.dimensions
    assert "version" in cube.dimensions
    assert "scenario" in cube.dimensions
    assert "entity" in cube.dimensions
    assert "account" in cube.dimensions
    assert "product" in cube.dimensions

    # Verify hierarchical roll-up across time (2026 = Q1 + Q2 + Q3 + Q4)
    val_2026 = cube.get_cell("2026", "Actuals", "Base", "Total_Company", "Receita_Bruta", "Total_Products")
    val_q1 = cube.get_cell("2026_Q1", "Actuals", "Base", "Total_Company", "Receita_Bruta", "Total_Products")
    val_q2 = cube.get_cell("2026_Q2", "Actuals", "Base", "Total_Company", "Receita_Bruta", "Total_Products")
    val_q3 = cube.get_cell("2026_Q3", "Actuals", "Base", "Total_Company", "Receita_Bruta", "Total_Products")
    val_q4 = cube.get_cell("2026_Q4", "Actuals", "Base", "Total_Company", "Receita_Bruta", "Total_Products")

    assert val_2026 > 0
    assert pytest.approx(val_2026, 0.01) == (val_q1 + val_q2 + val_q3 + val_q4)


def test_formula_dsl_parser_and_topological_eval():
    dsl = FormulaDSLEngine()
    
    # Verify default rules are loaded
    rules = dsl.get_rules()
    assert len(rules) >= 5
    
    # Test topological sorting order
    order = dsl.get_topological_order()
    assert order.index("Receita_Liquida") < order.index("Margem_Bruta")
    assert order.index("Margem_Bruta") < order.index("EBITDA")
    assert order.index("EBITDA") < order.index("EBIT")
    assert order.index("EBIT") < order.index("EBT")
    assert order.index("EBT") < order.index("Lucro_Liquido")

    # Test evaluation with dummy context
    ctx = {
        "Receita_Bruta": 1000.0,
        "Deducoes_Receita": 100.0,
        "CMV": 400.0,
        "Despesas_Vendas": 100.0,
        "Despesas_Gerais_Admin": 100.0,
        "Depreciacao_Amortizacao": 50.0,
        "Resultado_Financeiro": -20.0
    }
    evaluated = dsl.evaluate_all(ctx)
    assert evaluated["Receita_Liquida"] == 900.0
    assert evaluated["Margem_Bruta"] == 500.0
    assert evaluated["EBITDA"] == 300.0
    assert evaluated["EBIT"] == 250.0
    assert evaluated["EBT"] == 230.0
    assert evaluated["Impostos_Lucro"] == round(230.0 * 0.34, 4)
    assert evaluated["Lucro_Liquido"] == round(230.0 - (230.0 * 0.34), 4)


def test_leaf_writeback_and_dag_recalc():
    cube = NDimensionalCube()
    dsl = FormulaDSLEngine()
    wb = WriteBackEngine(cube, dsl)

    # 1. Update leaf input: Receita_Bruta in 2026_Q1, Branch_SP, Varejo_Fisico
    res = wb.write_cell(
        time_id="2026_Q1",
        version_id="Actuals",
        scenario_id="Base",
        entity_id="Branch_SP",
        account_id="Receita_Bruta",
        product_id="Varejo_Fisico",
        new_value=2000000.0
    )
    assert res["success"] is True
    assert res["new_value"] == 2000000.0

    # Verify that Receita_Liquida was recomputed for that leaf
    deducoes = cube.get_cell("2026_Q1", "Actuals", "Base", "Branch_SP", "Deducoes_Receita", "Varejo_Fisico")
    rec_liq = cube.get_cell("2026_Q1", "Actuals", "Base", "Branch_SP", "Receita_Liquida", "Varejo_Fisico")
    assert pytest.approx(rec_liq, 0.01) == (2000000.0 - deducoes)


def test_breakback_proportional_spread():
    cube = NDimensionalCube()
    dsl = FormulaDSLEngine()
    wb = WriteBackEngine(cube, dsl)

    # Write to a consolidated parent (e.g. Total_Company for Receita_Bruta)
    prev_total = cube.get_cell("2026_Q1", "Actuals", "Base", "Total_Company", "Receita_Bruta", "Total_Products")
    target_new_total = prev_total * 1.25  # +25% top-down increase

    res = wb.write_cell(
        time_id="2026_Q1",
        version_id="Actuals",
        scenario_id="Base",
        entity_id="Total_Company",
        account_id="Receita_Bruta",
        product_id="Total_Products",
        new_value=target_new_total,
        spread_method="proportional"
    )
    assert res["success"] is True
    assert res["is_consolidated"] is True

    # Check updated total
    updated_total = cube.get_cell("2026_Q1", "Actuals", "Base", "Total_Company", "Receita_Bruta", "Total_Products")
    assert pytest.approx(updated_total, 1.0) == target_new_total


def test_version_cloning_and_variance():
    cube = NDimensionalCube()
    vm = VersionManager(cube)

    # Clone Actuals to Budget_Optimistic with 1.10 growth factor
    clone_res = vm.clone_version("Actuals", "Budget_Optimistic", "Orçamento Otimista (+10%)", growth_factor=1.10)
    assert clone_res["success"] is True
    assert "Budget_Optimistic" in cube.dimensions["version"].members

    # Compute variance between Actuals and Budget_Optimistic
    var_res = vm.compute_variance("Actuals", "Budget_Optimistic", {"time": "2026"})
    assert var_res["base_version"] == "Actuals"
    assert var_res["target_version"] == "Budget_Optimistic"
    assert len(var_res["rows"]) > 0

    # Ensure delta is positive for revenue
    rev_row = next(r for r in var_res["rows"] if r["account_id"] == "Receita_Bruta")
    assert rev_row["delta"] > 0
    assert pytest.approx(rev_row["variance_pct"], 0.1) == 10.0


def test_calculation_trace():
    cube = NDimensionalCube()
    dsl = FormulaDSLEngine()
    tracer = AuditTracer(cube, dsl)

    # Trace a calculated account: Margem_Bruta
    trace = tracer.trace_cell("2026_Q1", "Actuals", "Base", "Total_Company", "Margem_Bruta", "Total_Products")
    assert trace["is_calculated"] is True
    assert trace["formula"] is not None
    assert trace["formula"]["expression"] == "[Receita_Liquida] - [CMV]"
    assert len(trace["precedents"]) == 2
    assert any(p["account_id"] == "Receita_Liquida" for p in trace["precedents"])
    assert any(p["account_id"] == "CMV" for p in trace["precedents"])


def test_clear_all_cells_for_production_and_restore():
    cube = NDimensionalCube()
    dsl = FormulaDSLEngine()
    wb = WriteBackEngine(cube, dsl)

    # Initially has seed cells
    assert len(cube.cells) > 0
    slice_before = cube.query_slice("account", "time")
    assert any(row["values"]["2026_Q1"] > 0 for row in slice_before["rows"])

    # 1. Clear all cells for production handover
    clear_res = cube.clear_all_cells()
    assert clear_res["status"] == "success"
    assert clear_res["cleared_cells_count"] > 0
    assert len(cube.cells) == 0
    assert len(cube.calculated_cells) == 0

    # 2. Query slice should return 0.0 for every cell
    slice_after = cube.query_slice("account", "time")
    for row in slice_after["rows"]:
        for col in slice_after["columns"]:
            assert row["values"][col["id"]] == 0.0

    # 3. Test Write-back after clearing: client enters fresh budget/actual
    wb_res = wb.write_cell(
        time_id="2026_Q1",
        version_id="Actuals",
        scenario_id="Base",
        entity_id="Branch_SP",
        account_id="Receita_Bruta",
        product_id="Varejo_Fisico",
        new_value=500000.0
    )
    assert wb_res["success"] is True
    assert wb_res["new_value"] == 500000.0
    assert cube.get_cell("2026_Q1", "Actuals", "Base", "Branch_SP", "Receita_Bruta", "Varejo_Fisico") == 500000.0

    # 4. Restore demo cells
    restore_res = cube.restore_demo_cells()
    assert restore_res["status"] == "success"
    assert len(cube.cells) > 0

