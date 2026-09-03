"""
Automated unit and integration test for official CVM Open Data ingestion.
Verifies that official DFP/ITR numbers for any listed company (tested with Banco Pine cod_cvm 20567)
are extracted directly from official CVM zip files with 100% fidelity to audited statements.
"""
import pytest
from backend.app.cvm.fetcher import cvm_fetcher
from backend.app.cvm.watchdog import cvm_watchdog
from backend.app.cvm.analysis import cvm_analyzer
from backend.app.engine.multidim_cube import global_cube
from backend.app.api.routes import get_dre_table, get_dfc_table

def test_official_pine_cvm_extraction():
    """Validates that CVM Watchdog retrieves exact official audited numbers for Banco Pine."""
    records = cvm_watchdog.ensure_company_financials_loaded(20567)
    assert len(records) > 50, "Should have loaded rich official CVM statement rows"

    analysis = cvm_analyzer.get_company_analysis(20567)
    assert analysis is not None
    ts_map = {ts["period"]: ts for ts in analysis["time_series"]}

    # Verify 2025 DFP
    assert "2025-12-31" in ts_map, "2025 annual DFP must be present"
    ts_2025 = ts_map["2025-12-31"]
    assert ts_2025["receita_liquida"] == 4773.52, f"Expected 4773.52, got {ts_2025['receita_liquida']}"
    assert ts_2025["lucro_liquido"] == 432.88, f"Expected 432.88, got {ts_2025['lucro_liquido']}"

    # Verify 2024 DFP
    assert "2024-12-31" in ts_map, "2024 annual DFP must be present"
    ts_2024 = ts_map["2024-12-31"]
    assert ts_2024["receita_liquida"] == 2804.43, f"Expected 2804.43, got {ts_2024['receita_liquida']}"
    assert ts_2024["lucro_liquido"] == 101.73, f"Expected 101.73, got {ts_2024['lucro_liquido']}"

def test_multidim_cube_annual_cvm_load():
    """Validates that global_cube loads CVM company in annual mode without double-counting quarters."""
    global_cube.load_cvm_company_dataset(20567, periodicity="ANUAL")
    slice_data = global_cube.query_slice(row_dim="account", col_dim="time")
    
    rows_map = {r["id"]: r["values"] for r in slice_data["rows"]}
    assert "Receita_Liquida" in rows_map
    assert "Lucro_Liquido" in rows_map

    # Annual values should reflect DFP full year
    assert rows_map["Receita_Liquida"]["2025"] == 4773.52
    assert rows_map["Lucro_Liquido"]["2025"] == 432.88
    assert rows_map["Lucro_Liquido"]["2024"] == 101.73

def test_dre_and_dfc_tables_for_cvm():
    """Validates that DRE and DFC tables output official CVM numbers."""
    dre = get_dre_table(company_id="cvm_20567", periodicity="ANUAL")
    assert "2025" in dre["periods"]
    rec_row = next(r for r in dre["rows"] if "Receita" in r["name"])
    assert rec_row["periods"]["2025"]["value"] == 4773.52

    ll_row = next(r for r in dre["rows"] if "Lucro / Preju" in r["name"])
    assert ll_row["periods"]["2025"]["value"] == 432.88

    dfc = get_dfc_table(company_id="cvm_20567", periodicity="ANUAL")
    assert "2025" in dfc["periods"]
    fco_row = next(r for r in dfc["rows"] if "FCO" in r["name"] and r["is_total"])
    assert fco_row["periods"]["2025"]["value"] == -1437.66
