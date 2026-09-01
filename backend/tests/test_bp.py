import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.bp.bp_engine import bp_engine

client = TestClient(app)

def test_balance_sheet_accounting_equation():
    """Validates that Ativo Total == Passivo Total + PL for all periods."""
    for p in bp_engine.periods:
        ativo = bp_engine.current_data[p]["ativo_total"]
        passivo_pl = bp_engine.current_data[p]["passivo_total_pl"]
        assert abs(ativo - passivo_pl) < 0.01, f"Equilíbrio patrimonial violado no período {p}: Ativo={ativo}, Passivo+PL={passivo_pl}"

def test_fleuriet_working_capital_model():
    """Validates Fleuriet identity: ST == CDG - NCG == ACF - PCF."""
    kpis = bp_engine.get_kpis()
    for p in bp_engine.periods:
        f = kpis["by_period"][p]["fleuriet"]
        calculated_st = round(f["cdg"] - f["ncg"], 2)
        assert abs(f["st"] - calculated_st) < 0.05
        assert f["badge"] in ["Excelente", "Sólida", "Insatisfatória", "Alto Risco", "Monitoramento"]

def test_dupont_roe_decomposition():
    """Validates Dupont 3-factor identity: ROE == Margem Liq * Giro * Alavancagem."""
    kpis = bp_engine.get_kpis()
    for p in bp_engine.periods:
        d = kpis["by_period"][p]["dupont_rentabilidade"]
        m_liq = d["margem_liquida_pct"] / 100.0
        giro = d["giro_ativo"]
        alav = d["alavancagem_financeira"]
        dupont_roe = round(m_liq * giro * alav * 100.0, 2)
        assert abs(d["roe"] - dupont_roe) < 0.5, f"Dupont diverge no período {p}: ROE={d['roe']}, Decomposto={dupont_roe}"

def test_whatif_topological_propagation():
    """Tests reactive propagation of a shock to contas_receber."""
    base_kpis = bp_engine.get_kpis()
    base_lc = base_kpis["summary"]["liquidez"]["corrente"]

    res = bp_engine.simulate_whatif(node_id="contas_receber", variation_pct=20.0, period="Budget 2026")
    assert res["node"] == "contas_receber"
    assert res["variation_pct"] == 20.0
    assert res["elapsed_ms"] > 0
    assert res["affected_nodes_count"] >= 3
    assert res["new_kpis"]["liquidez"]["corrente"] > base_lc

    # Reset
    bp_engine.reset_simulation()
    restored_kpis = bp_engine.get_kpis()
    assert restored_kpis["summary"]["liquidez"]["corrente"] == base_lc

def test_bp_api_endpoints():
    # 1. Table endpoint
    res_tbl = client.get("/api/bp/table")
    assert res_tbl.status_code == 200
    data_tbl = res_tbl.json()
    assert "rows" in data_tbl
    assert len(data_tbl["rows"]) >= 20

    # 2. KPIs endpoint
    res_kpi = client.get("/api/bp/kpis")
    assert res_kpi.status_code == 200
    data_kpi = res_kpi.json()
    assert "summary" in data_kpi
    assert "liquidez" in data_kpi["summary"]
    assert "fleuriet" in data_kpi["summary"]

    # 3. DAG endpoint
    res_dag = client.get("/api/bp/dag")
    assert res_dag.status_code == 200
    data_dag = res_dag.json()
    assert "nodes" in data_dag
    assert "edges" in data_dag
    assert len(data_dag["nodes"]) >= 15

    # 4. Simulate endpoint
    res_sim = client.post("/api/bp/simulate/whatif", json={"node": "estoques", "variation_pct": 10.0})
    assert res_sim.status_code == 200
    data_sim = res_sim.json()
    assert data_sim["node"] == "estoques"

    # 5. Reset endpoint
    res_reset = client.post("/api/bp/simulate/reset")
    assert res_reset.status_code == 200
