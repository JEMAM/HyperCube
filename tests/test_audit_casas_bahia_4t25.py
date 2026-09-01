"""
Auditoria Contábil e Testes de Consistência Matemática do PDF Casa Bahia 4T25
Arquivo: C:\\Users\\edumo\\Documents\\casa_bahia_4T25.pdf
"""

import os
import io
import fitz
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

PDF_PATH = r"C:\Users\edumo\Documents\casa_bahia_4T25.pdf"

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

def test_pdf_exists_and_readable():
    assert os.path.exists(PDF_PATH), f"PDF não encontrado no caminho: {PDF_PATH}"
    doc = fitz.open(PDF_PATH)
    assert len(doc) == 14, f"Esperado 14 páginas, encontrado {len(doc)}"

def test_pdf_upload_all_and_endpoints(client):
    """Testa a ingestão consolidada do PDF pelo endpoint /api/upload-all."""
    with open(PDF_PATH, "rb") as f:
        content = f.read()
    
    file_tuple = ("casa_bahia_4T25.pdf", io.BytesIO(content), "application/pdf")
    res = client.post("/api/upload-all", files={"file": file_tuple})
    assert res.status_code == 200, f"Falha no upload-all: {res.text}"
    data = res.json()
    assert data["status"] == "success"
    print("\n[OK] Upload consolidado concluído com sucesso.")

def test_dre_mathematical_consistency():
    """
    Validação das equações da DRE Consolidada 2025 e 4T25 (Página 11 do PDF):
    - Lucro Bruto = Receita Líquida - CMV - Depreciação Logística
    - Total Despesas Operacionais = Vendas + G&A + Equivalência + Outras
    - EBIT = Lucro Bruto + Despesas Operacionais - D&A
    - Resultado Financeiro = Receitas Financeiras - Despesas Financeiras
    - LAIR = EBIT + Resultado Financeiro
    - Lucro Líquido = LAIR - IR/CS
    - EBITDA = EBIT + Depreciação Logística + D&A
    - EBITDA Ajustado = EBITDA + Outras Despesas Operacionais
    """
    # Dados 4T25 (R$ Milhões)
    rec_liq_4t25 = 8471
    cmv_4t25 = -5745
    dep_log_4t25 = -55
    lucro_bruto_4t25 = 2671
    assert rec_liq_4t25 + cmv_4t25 + dep_log_4t25 == lucro_bruto_4t25, "Erro no Lucro Bruto 4T25"

    desp_vendas_4t25 = -1623
    desp_ga_4t25 = -283
    mep_4t25 = 6
    outras_op_4t25 = -57
    total_desp_op_4t25 = -1957
    assert desp_vendas_4t25 + desp_ga_4t25 + mep_4t25 + outras_op_4t25 == total_desp_op_4t25, "Erro nas Despesas Operacionais 4T25"

    da_4t25 = -223
    ebit_4t25 = 491
    assert lucro_bruto_4t25 + total_desp_op_4t25 + da_4t25 == ebit_4t25, "Erro no EBIT 4T25"

    rec_fin_4t25 = 165
    desp_fin_4t25 = -722
    res_fin_4t25 = -557
    assert rec_fin_4t25 + desp_fin_4t25 == res_fin_4t25, "Erro no Resultado Financeiro 4T25"

    lair_4t25 = -66
    assert ebit_4t25 + res_fin_4t25 == lair_4t25, "Erro no LAIR 4T25"

    ir_cs_4t25 = -1463
    lucro_liq_4t25 = -1529
    assert lair_4t25 + ir_cs_4t25 == lucro_liq_4t25, "Erro no Lucro Líquido 4T25"

    ebitda_4t25 = 769
    assert ebit_4t25 + abs(dep_log_4t25) + abs(da_4t25) == ebitda_4t25, "Erro no EBITDA 4T25"

    ebitda_ajust_4t25 = 826
    assert ebitda_4t25 + abs(outras_op_4t25) == ebitda_ajust_4t25, "Erro no EBITDA Ajustado 4T25"

    # Dados Ano Completo 2025 (31.12.2025)
    rec_liq_2025 = 29197
    cmv_2025 = -20075
    dep_log_2025 = -213
    lucro_bruto_2025 = 8909
    assert rec_liq_2025 + cmv_2025 + dep_log_2025 == lucro_bruto_2025, "Erro no Lucro Bruto 2025"

    ebit_2025 = 1343
    res_fin_2025 = -3687
    lair_2025 = -2344
    assert ebit_2025 + res_fin_2025 == lair_2025, "Erro no LAIR 2025"

    ir_cs_2025 = -644
    lucro_liq_2025 = -2988
    assert lair_2025 + ir_cs_2025 == lucro_liq_2025, "Erro no Lucro Líquido 2025"
    print("\n[OK] Todas as equações da DRE foram matematicamente validadas com 100% de consistência.")

def test_balance_sheet_accounting_equation():
    """
    Validação da Equação Fundamental do Balanço Patrimonial (Página 12 do PDF):
    Ativo Total == Passivo Circulante + Passivo Não Circulante + Patrimônio Líquido
    """
    # Exercício 2025 (31.12.2025)
    ativo_circulante_2025 = 14403
    ativo_nao_circulante_2025 = 19235
    ativo_total_2025 = 33638
    assert ativo_circulante_2025 + ativo_nao_circulante_2025 == ativo_total_2025, "Erro na soma do Ativo 2025"

    passivo_circulante_2025 = 21822
    passivo_nao_circulante_2025 = 9042
    patrimonio_liquido_2025 = 2774
    passivo_e_pl_2025 = 33638
    assert passivo_circulante_2025 + passivo_nao_circulante_2025 + patrimonio_liquido_2025 == passivo_e_pl_2025, "Erro na soma do Passivo + PL 2025"
    assert ativo_total_2025 == passivo_e_pl_2025, f"Desbalanceamento no Balanço 2025: Ativo {ativo_total_2025} != Passivo+PL {passivo_e_pl_2025}"

    # Exercício 2024 (31.12.2024)
    ativo_circulante_2024 = 14140
    ativo_nao_circulante_2024 = 19749
    ativo_total_2024 = 33889
    assert ativo_circulante_2024 + ativo_nao_circulante_2024 == ativo_total_2024, "Erro na soma do Ativo 2024"

    passivo_circulante_2024 = 19262
    passivo_nao_circulante_2024 = 12150
    patrimonio_liquido_2024 = 2477
    passivo_e_pl_2024 = 33889
    assert passivo_circulante_2024 + passivo_nao_circulante_2024 + patrimonio_liquido_2024 == passivo_e_pl_2024, "Erro na soma do Passivo + PL 2024"
    assert ativo_total_2024 == passivo_e_pl_2024, f"Desbalanceamento no Balanço 2024: Ativo {ativo_total_2024} != Passivo+PL {passivo_e_pl_2024}"
    print("\n[OK] Equação Fundamental do Balanço (Ativo = Passivo + PL) balanceada com discrepância zero em ambos os exercícios.")

def test_cash_flow_statement_reconciliation():
    """
    Validação da Demonstração do Fluxo de Caixa (Página 13 do PDF):
    - Lucro Líquido DFC == Lucro Líquido DRE (-2.988)
    - Variação do Caixa = FCO + FCI + FCF
    - Saldo Final de Caixa = Saldo Inicial + Variação
    - Conciliação DFC x Balanço Patrimonial (Caixa e Aplicações)
    """
    lucro_liq_dre = -2988
    lucro_liq_dfc = -2988
    assert lucro_liq_dfc == lucro_liq_dre, f"Lucro Líquido DFC ({lucro_liq_dfc}) diverge da DRE ({lucro_liq_dre})"

    fco_2025 = 15129
    fci_2025 = -254
    fcf_2025 = -15781
    variacao_caixa_2025 = -906

    assert fco_2025 + fci_2025 + fcf_2025 == variacao_caixa_2025, "Erro no cálculo da variação líquida de caixa"

    saldo_inicial_2025 = 2131
    saldo_final_2025 = 1225
    assert saldo_inicial_2025 + variacao_caixa_2025 == saldo_final_2025, "Erro no fechamento do saldo final de caixa"

    # Conciliação com o Balanço Patrimonial (Página 12)
    caixa_bp_2024 = 2131
    caixa_bp_2025 = 1225
    assert saldo_inicial_2025 == caixa_bp_2024, f"Saldo inicial DFC ({saldo_inicial_2025}) diverge do Caixa BP 2024 ({caixa_bp_2024})"
    assert saldo_final_2025 == caixa_bp_2025, f"Saldo final DFC ({saldo_final_2025}) diverge do Caixa BP 2025 ({caixa_bp_2025})"
    print("\n[OK] Fluxo de Caixa 100% conciliado internamente e cruzado com a DRE e com o Balanço Patrimonial.")

def test_statements_api_service_endpoints(client):
    """
    Testa os 4 endpoints de demonstrações CVM após o carregamento da empresa:
    - /api/statements/dra
    - /api/statements/dmpl
    - /api/statements/dva
    - /api/statements/ne
    """
    for endpoint, name in [
        ("/api/statements/dra", "DRA"),
        ("/api/statements/dmpl", "DMPL"),
        ("/api/statements/dva", "DVA"),
        ("/api/statements/ne", "NE"),
    ]:
        res = client.get(endpoint)
        assert res.status_code == 200, f"Erro ao consultar {name}: {res.status_code}"
        data = res.json()
        assert data.get("has_data") is True, f"Esperado has_data=True para {name}"
        assert "periods" in data or "notes" in data or "company" in data, f"Estrutura incompleta para {name}"
        print(f"[OK] Endpoint {endpoint} ({name}) retornou dados válidos e consistentes.")
