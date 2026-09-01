import pytest
from backend.app.graph.dag_builder import BankingFinancialDAG

def test_banking_dag_structure():
    dag = BankingFinancialDAG()
    assert "despesas_de_captacao" in dag.nx_graph
    assert "lucro_liquido" in dag.nx_graph
    assert dag.nx_graph.nodes["despesas_de_captacao"]["type"] == "input"
    assert dag.nx_graph.nodes["lucro_liquido"]["type"] == "target"

def test_affected_nodes_for_funding_expenses():
    dag = BankingFinancialDAG()
    affected = dag.get_affected_nodes(["despesas_de_captacao"])
    expected = ["despesas_de_captacao", "produto_da_intermediacao_financeira", "resultado_da_intermediacao_financeira", "resultado_antes_da_tributacao", "lucro_liquido"]
    assert affected == expected
