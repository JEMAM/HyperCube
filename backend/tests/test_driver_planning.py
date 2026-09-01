"""
Unit & Integration Tests for Driver-Based Operational Planning Engine (Headcount & Capex Automático)
Module: test_driver_planning.py
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.engine.driver_planning_engine import (
    DriverPlanningEngine,
    DepartmentHeadcountPlan,
    CapexProject,
    get_driver_planning_engine,
    get_default_headcount_plans,
    get_default_capex_projects
)

client = TestClient(app)


def test_headcount_calculation_and_social_charges():
    """Validates workforce personnel formulas including Brazilian social charges & benefits."""
    dept = DepartmentHeadcountPlan(
        department_id="ops",
        department_name="Fábrica",
        category="OPERATIONS",
        current_headcount=100,
        hiring_plan=20,
        attrition_rate_pct=5.0,  # 100 * 5% = 5 turnover
        avg_salary_monthly=10000.0,
        avg_benefits_monthly=2000.0,
        fgts_pct=8.0,
        inss_patronal_pct=20.0,
        sistema_s_rat_pct=8.8,
        provisao_13_ferias_pct=19.44
    )

    metrics = dept.compute_metrics()

    # 100 + 20 - 5 = 115
    assert metrics["final_headcount"] == 115
    assert metrics["turnover_count"] == 5

    # Monthly base: 115 * 10,000 = 1,150,000
    assert metrics["monthly_base_payroll"] == 1150000.0
    # Annual base: 1,150,000 * 12 = 13,800,000
    assert metrics["annual_base_payroll"] == 13800000.0

    # Total charges: 8 + 20 + 8.8 + 19.44 = 56.24%
    assert round(metrics["total_charges_pct"], 2) == 56.24
    expected_charges = 13800000.0 * 0.5624
    assert abs(metrics["annual_charges"] - expected_charges) < 1.0

    # Annual benefits: 115 * 2,000 * 12 = 2,760,000
    assert metrics["annual_benefits"] == 2760000.0

    # Total annual cost: base + charges + benefits
    expected_total = 13800000.0 + expected_charges + 2760000.0
    assert abs(metrics["total_annual_cost"] - expected_total) < 2.0


def test_capex_depreciation_and_asset_schedule():
    """Validates asset capitalization, linear depreciation, and 5-year book value trajectory."""
    proj = CapexProject(
        project_id="c1",
        project_name="Nova Prensa Industrial",
        asset_category="MACHINERY",
        total_investment=10000.0,  # R$ 10,000k
        useful_life_years=10,
        residual_value_pct=10.0,  # 10% residual = R$ 1,000k
        start_year=2026,
        is_active=True
    )

    metrics = proj.compute_metrics()

    # Depreciable base: 10,000 * 90% = 9,000
    assert metrics["depreciable_base"] == 9000.0
    # Annual depreciation: 9,000 / 10 = 900
    assert metrics["annual_depreciation"] == 900.0
    # Monthly: 900 / 12 = 75
    assert metrics["monthly_depreciation"] == 75.0

    # 5-year trajectory check
    traj = metrics["trajectory_5y"]
    assert len(traj) == 5
    # Year 1: dep 900, accum 900, net book 9,100
    assert traj[0]["annual_depreciation"] == 900.0
    assert traj[0]["accumulated_depreciation"] == 900.0
    assert traj[0]["net_book_value"] == 9100.0
    # Year 5: accum 4,500, net book 5,500
    assert traj[4]["accumulated_depreciation"] == 4500.0
    assert traj[4]["net_book_value"] == 5500.0


@pytest.mark.parametrize("company_id", ["klabin", "vale", "petrobras", "weg", "banco_do_brasil"])
def test_closed_loop_3statement_balance_sheet_zero_delta(company_id):
    """
    Guarantees that driver-based planning simulations maintain ZERO DELTA
    balance sheet reconciliation across all calibrated company profiles.
    """
    engine = DriverPlanningEngine(company_id=company_id)
    sim = engine.simulate_integrated_financials(growth_pct_override=10.0)

    three_stmt = sim["three_statement"]
    # Closed loop verification
    assert three_stmt["balance_sheet_balanced"] is True
    assert abs(three_stmt["balance_sheet_delta"]) < 0.01

    # Assets == Liabilities + Equity
    ativo_tot = three_stmt["balanco"]["ativo_total"]
    passivo_pl_tot = three_stmt["balanco"]["passivo_total_pl"]
    assert round(ativo_tot - passivo_pl_tot, 2) == 0.0

    # Cash reconciles
    caixa_dfc = three_stmt["dfc"]["saldo_final_caixa"]
    caixa_bp = three_stmt["balanco"]["ativo_circulante"]["caixa_equivalentes"]
    assert abs(caixa_dfc - caixa_bp) < 0.01


def test_driver_variance_analysis():
    """Verifies that modifications to workforce and capex properly compute variances."""
    engine = DriverPlanningEngine(company_id="klabin")
    sim = engine.simulate_integrated_financials()

    variance = sim["driver_impact_variance"]
    assert "ebitda_base" in variance
    assert "ebitda_simulated" in variance
    assert "delta_ebitda" in variance
    assert "caixa_base" in variance
    assert "caixa_simulated" in variance
    assert "delta_caixa" in variance
    assert variance["balance_balanced_zero_delta"] is True


def test_driver_planning_api_endpoints():
    """Tests FastAPI REST endpoints for Driver Planning."""
    # 1. GET baseline
    res_base = client.get("/api/financials/planning/drivers?company_id=klabin")
    assert res_base.status_code == 200
    data_base = res_base.json()
    assert "workforce_summary" in data_base
    assert "capex_summary" in data_base
    assert "three_statement" in data_base

    # 2. GET companies
    res_comp = client.get("/api/financials/planning/drivers/companies")
    assert res_comp.status_code == 200
    comps = res_comp.json()["companies"]
    assert len(comps) == 5

    # 3. POST simulate
    payload = {
        "company_id": "klabin",
        "headcount_plans": [
            {
                "department_id": "ops",
                "department_name": "Operações",
                "category": "OPERATIONS",
                "current_headcount": 12000,
                "hiring_plan": 500,
                "attrition_rate_pct": 3.0,
                "avg_salary_monthly": 7500.0,
                "avg_benefits_monthly": 1800.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            }
        ],
        "capex_projects": [
            {
                "project_id": "c1",
                "project_name": "Nova Caldeira Biomassa",
                "asset_category": "MACHINERY",
                "total_investment": 3500.0,
                "useful_life_years": 10,
                "residual_value_pct": 5.0,
                "start_year": 2026,
                "is_active": True
            }
        ],
        "growth_pct_override": 9.0,
        "payout_pct_override": 40.0
    }

    res_sim = client.post("/api/financials/planning/drivers/simulate", json=payload)
    assert res_sim.status_code == 200
    data_sim = res_sim.json()
    assert data_sim["three_statement"]["balance_sheet_balanced"] is True
    assert data_sim["three_statement"]["balance_sheet_delta"] == 0.0
