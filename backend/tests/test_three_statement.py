"""
Unit tests for Closed-Loop 3-Statement Modeling Engine (DRE ↔ DFC ↔ BP) & Fleuriet Capital de Giro.
Guarantees mathematical reconciliation: Ativo Total == Passivo Total + PL (0.00 delta),
DuPont 3-factor decomposition, and Fleuriet 6-typology working capital consistency.
"""

import pytest
from backend.app.engine.three_statement_engine import ThreeStatementEngine


def test_three_statement_baseline_reconciliation():
    engine = ThreeStatementEngine()
    model = engine.get_full_model()

    assert "periods_data" in model
    for p in model["periods"]:
        p_data = model["periods_data"][p]
        recon = p_data["reconciliation"]
        
        # Verify Ativo Total == Passivo Total + PL with zero delta
        assert recon["is_balanced"] is True, f"Period {p} is not balanced: Delta = {recon['delta']}"
        assert abs(recon["delta"]) < 0.01

        # Verify Fleuriet working capital identity: CDG = NCG + ST  =>  ST = CDG - NCG
        fleuriet = p_data["fleuriet"]
        assert "ncg" in fleuriet
        assert "cdg" in fleuriet
        assert "st" in fleuriet
        assert abs(fleuriet["cdg"] - fleuriet["ncg"] - fleuriet["st"]) < 0.02


def test_three_statement_driver_simulation_reconciliation():
    engine = ThreeStatementEngine()

    # Simulate an aggressive growth with stretched payment terms and high capex
    res = engine.simulate_drivers(
        growth_pct=25.0,
        pmr_dias=65.0,
        pme_dias=95.0,
        pmp_dias=50.0,
        capex_val=9500.0,
        payout_pct=50.0
    )

    budget_data = res["periods_data"]["Budget_2026"]
    recon = budget_data["reconciliation"]

    # Must preserve 100% closed-loop reconciliation
    assert recon["is_balanced"] is True
    assert abs(recon["delta"]) < 0.01

    # Check that DFC cash flow reconciled with balance sheet cash change
    vals = budget_data["values"]
    expected_caixa = round(vals["caixa_inicial"] + vals["dfc_variacao_liquida_caixa"], 2)
    assert abs(vals["caixa_equivalentes"] - expected_caixa) < 0.02


def test_three_statement_fleuriet_working_capital_health():
    engine = ThreeStatementEngine()
    model = engine.get_full_model()

    p2024_fl = model["periods_data"]["2024"]["fleuriet"]
    assert p2024_fl["badge"] in ["Sólida", "Excelente", "Estável", "Atenção", "Efeito Tesoura", "Crítica", "Atípica"]
    assert isinstance(p2024_fl["alerta_tesoura"], bool)
    assert "tipo" in p2024_fl
    assert p2024_fl["tipo"] in [1, 2, 3, 4, 5, 6]


def test_three_statement_dupont_decomposition():
    engine = ThreeStatementEngine()
    model = engine.get_full_model()

    for p in model["periods"]:
        dupont = model["periods_data"][p]["dupont"]
        assert "margem_liquida_pct" in dupont
        assert "giro_ativo" in dupont
        assert "alavancagem_financeira" in dupont
        assert "roe_pct" in dupont

        # Mathematical verification: ROE ≈ Margem Líquida × Giro Ativo × Alavancagem
        # Margem = (Lucro / Rec), Giro = (Rec / Ativo), Alav = (Ativo / PL) => Product = (Lucro / PL)
        calc_roe = (dupont["margem_liquida_pct"] / 100.0) * dupont["giro_ativo"] * dupont["alavancagem_financeira"] * 100.0
        assert abs(calc_roe - dupont["roe_pct"]) < 0.15


def test_three_statement_multi_company_reconciliation():
    companies = ["vale", "petrobras", "klabin", "weg", "banco_do_brasil"]
    for cid in companies:
        engine = ThreeStatementEngine(company_id=cid)
        model = engine.get_full_model()

        assert model["company_id"] == cid
        for p in model["periods"]:
            recon = model["periods_data"][p]["reconciliation"]
            assert recon["is_balanced"] is True, f"Failed for {cid} in {p} with delta {recon['delta']}"
            assert abs(recon["delta"]) < 0.01

            fleuriet = model["periods_data"][p]["fleuriet"]
            assert abs(fleuriet["cdg"] - fleuriet["ncg"] - fleuriet["st"]) < 0.02


def test_three_statement_causal_waterfall_bridge():
    engine = ThreeStatementEngine()
    model = engine.get_full_model()

    p_data = model["periods_data"]["Budget_2026"]
    bridge = p_data["bridge"]
    assert len(bridge) == 12
    # Verify the last step is Ending Cash matching the Balance Sheet
    assert bridge[-1]["category"] == "BP Final"
    assert abs(bridge[-1]["amount"] - p_data["values"]["caixa_equivalentes"]) < 0.02
