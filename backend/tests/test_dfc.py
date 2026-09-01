import pytest
from backend.app.data.cash_flow_loader import generate_synthetic_dfc_data
from backend.app.graph.dfc_dag_builder import CashFlowDAG
from backend.app.engine.dfc_engine import PolarsDFCEngine
from backend.app.olap.dfc_duckdb import DuckDBDFCAnalytics

def test_dfc_dag_structure():
    dag = CashFlowDAG()
    topological_nodes = dag.get_topological_sort()
    assert "fco_caixa_liquido" in topological_nodes
    assert "fci_caixa_liquido" in topological_nodes
    assert "fcf_caixa_liquido" in topological_nodes
    assert "variacao_liquida_caixa" in topological_nodes
    assert "saldo_final_caixa" in topological_nodes

    impact = dag.get_downstream_impact("recebimento_vendas")
    assert "fco_caixa_liquido" in impact
    assert "variacao_liquida_caixa" in impact
    assert "saldo_final_caixa" in impact

def test_dfc_engine_recalculation():
    df = generate_synthetic_dfc_data()
    engine = PolarsDFCEngine(df)
    
    # Calculate baseline FCO for first record
    row0 = engine.get_dataframe().to_dicts()[0]
    expected_fco = row0["recebimento_vendas"] - (
        row0["pagamento_fornecedores"] +
        row0["pagamento_salarios"] +
        row0["pagamento_despesas_operacionais"] +
        row0["pagamento_impostos"]
    )
    assert abs(row0["fco_caixa_liquido"] - expected_fco) < 0.01

    # Apply what-if simulation on recebimento_vendas +10%
    engine.apply_what_if("recebimento_vendas", 10.0)
    row0_sim = engine.get_dataframe().to_dicts()[0]
    assert row0_sim["recebimento_vendas"] > row0["recebimento_vendas"]
    assert row0_sim["fco_caixa_liquido"] > row0["fco_caixa_liquido"]

def test_dfc_duckdb_olap():
    df = generate_synthetic_dfc_data()
    analytics = DuckDBDFCAnalytics(df)
    kpis = analytics.summary_kpis()
    assert "Total_FCO" in kpis
    assert "Saldo_Final_Atual" in kpis
