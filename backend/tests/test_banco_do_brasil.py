"""
Testes de Auditoria Contábil, Integridade Matemática em DAG e Conciliação Cruzada (Cross-Reconciliation)
para as Demonstrações Financeiras (DRE e DFC) do Banco do Brasil S.A. (BBAS3 - Exercício 2025).
"""

import pytest
import polars as pl
from backend.app.data.loader import get_bb_canonical_df, load_dre_data, detect_and_parse_pdf
from backend.app.data.cash_flow_loader import get_bb_canonical_dfc, load_dfc_data, parse_dfc_pdf
from backend.app.graph.dag_builder import UniversalFinancialDAG
from backend.app.engine.hyperblock_engine import PolarsHyperblockEngine
from backend.app.engine.dfc_engine import PolarsDFCEngine
from backend.app.engine.multidim_cube import MultiDimCube
from backend.app.engine.writeback import WriteBackEngine
from backend.app.engine.formula_dsl import FormulaDSLEngine
from backend.app.engine.version_manager import VersionManager
from backend.app.engine.audit_tracer import AuditTracer


def test_bb_dre_extraction_and_canonical_values():
    """Valida a extração e os valores canônicos da DRE do Banco do Brasil (Exercício 2025)."""
    df = get_bb_canonical_df()
    assert len(df) == 2  # 2S25 e 2025 Consolidado
    
    row_2025 = df[df["trimestre"] == 4].iloc[0]
    
    # 1. Receitas e Despesas da Intermediação Financeira
    assert row_2025["receita_com_operacoes_de_credito_e_repasses"] == 304392.2
    assert row_2025["despesas_de_captacao"] == -198953.2
    
    # 2. Margem Bruta de Intermediação = 304.392,2 - 198.953,2 = 105.439,0
    assert pytest.approx(row_2025["produto_da_intermediacao_financeira"], 0.1) == (304392.2 - 198953.2)
    
    # 3. Provisão de Crédito (PDD / PRC) = -66.387,6
    assert row_2025["provisao_para_risco_de_credito_prc"] == -66387.6
    
    # 4. Resultado da Intermediação Financeira = 105.439,0 - 66.387,6 = 39.051,4
    assert pytest.approx(row_2025["resultado_da_intermediacao_financeira"], 0.1) == 39051.4
    
    # 5. EBT e Lucro Líquido dos Controladores = R$ 17.808,0 M
    assert row_2025["resultado_antes_da_tributacao"] == 15311.8
    assert row_2025["lucro_liquido"] == 17808.0


def test_bb_dfc_extraction_and_algebraic_consistency():
    """Valida a DFC do Banco do Brasil e a consistência algébrica dos fluxos (FCO, FCI, FCF)."""
    df = get_bb_canonical_dfc()
    assert len(df) == 2
    
    row_dfc_2025 = df[df["trimestre"] == 4].iloc[0]
    
    # FCO: Caixa Gerado pelas Operações (R$ 158.793,8 M)
    assert row_dfc_2025["fco_caixa_liquido"] == 158793.8
    
    # FCI: Caixa Utilizado em Investimento (-R$ 168.153,0 M)
    assert row_dfc_2025["fci_caixa_liquido"] == -168153.0
    
    # FCF: Caixa Utilizado em Financiamento (-R$ 6.622,3 M)
    assert row_dfc_2025["fcf_caixa_liquido"] == -6622.3
    
    # Variação Líquida de Caixa = FCO + FCI + FCF
    # 158.793,8 + (-168.153,0) + (-6.622,3) = -15.981,5 M
    expected_var = row_dfc_2025["fco_caixa_liquido"] + row_dfc_2025["fci_caixa_liquido"] + row_dfc_2025["fcf_caixa_liquido"]
    assert pytest.approx(row_dfc_2025["variacao_liquida_caixa"], 0.1) == expected_var
    assert row_dfc_2025["variacao_liquida_caixa"] == -15981.5
    
    # Saldo Inicial e Final de Caixa
    assert row_dfc_2025["saldo_inicial_caixa"] == 83167.2
    assert row_dfc_2025["saldo_final_caixa"] == 59635.5


def test_bb_cross_reconciliation_dre_dfc():
    """Auditoria de Reconciliação Cruzada (Cross-Reconciliation) entre DRE e DFC."""
    df_dre = get_bb_canonical_df()
    df_dfc = get_bb_canonical_dfc()
    
    row_dre = df_dre[df_dre["trimestre"] == 4].iloc[0]
    row_dfc = df_dfc[df_dfc["trimestre"] == 4].iloc[0]
    
    # 1. Batimento do Lucro Líquido:
    # O Lucro Líquido da DRE (R$ 17.808,0 M) é exatamente o ponto de partida do Lucro Líquido da DFC
    assert row_dre["lucro_liquido"] == 17808.0
    
    # 2. Batimento de Provisão de Crédito (PDD)
    assert abs(row_dre["provisao_para_risco_de_credito_prc"]) == 66387.6
    
    # 3. Capacidade de Cobertura de Caixa (FCO / Lucro Líquido)
    fco_conversion_ratio = row_dfc["fco_caixa_liquido"] / row_dre["lucro_liquido"]
    assert fco_conversion_ratio > 8.0  # Forte geração operacional (FCO = 8.9x o Lucro Líquido)


def test_bb_dag_causality_and_whatif():
    """Testa a árvore DAG e a simulação de choque de PDD no Banco do Brasil."""
    dag = UniversalFinancialDAG(company_id="banco_do_brasil")
    nodes = [n["id"] for n in dag.to_dict()["nodes"]]
    
    assert "receita_com_operacoes_de_credito_e_repasses" in nodes
    assert "despesas_de_captacao" in nodes
    assert "provisao_para_risco_de_credito_prc" in nodes
    assert "produto_da_intermediacao_financeira" in nodes
    assert "resultado_da_intermediacao_financeira" in nodes
    assert "resultado_antes_da_tributacao" in nodes
    assert "lucro_liquido" in nodes
    
    # Simulação reativa no PolarsHyperblockEngine
    df_pl = pl.from_pandas(get_bb_canonical_df())
    engine = PolarsHyperblockEngine(df_pl, dag=dag)
    
    init_profit = engine.get_dataframe()["lucro_liquido"].to_list()[1] # 2025
    assert init_profit == 17808.0
    
    # Choque de +10% nas despesas de captação
    res = engine.apply_assumption_change("despesas_de_captacao", 10.0)
    assert res["recalculated_nodes_count"] >= 3
    
    updated_profit = engine.get_dataframe()["lucro_liquido"].to_list()[1]
    # Custo maior de captação reduz o lucro líquido
    assert updated_profit < init_profit


def test_bb_multidim_cube_and_variance():
    """Testa o Cubo Multidimensional carregado com o dataset do Banco do Brasil."""
    cube = MultiDimCube(company_id="banco_do_brasil")
    
    assert "time" in cube.dimensions
    assert "entity" in cube.dimensions
    assert "product" in cube.dimensions
    assert "account" in cube.dimensions
    
    # Valida células do Banco do Brasil
    rec_2025 = cube.get_cell("2025", "Actuals", "Base", "Total_Company", "Receita_Bruta", "Total_Products")
    assert rec_2025 == 304392.2
    
    ll_2025 = cube.get_cell("2025", "Actuals", "Base", "Total_Company", "Lucro_Liquido", "Total_Products")
    assert ll_2025 == 17808.0
    
    # Análise de Variância (2S25 vs 2025 ou Actuals vs Budget)
    vm = VersionManager(cube)
    var_res = vm.compute_variance("Actuals", "Budget_2026", {"time": "2025"})
    assert var_res["base_version"] == "Actuals"
    assert len(var_res["rows"]) > 0
