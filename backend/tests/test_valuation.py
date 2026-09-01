import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.agents.valuation_agent import valuation_agent

client = TestClient(app)

def test_valuation_agent_calculation_structure():
    company_data = {
        "name": "TEST ENTERPRISE S.A.",
        "ticker": "TEST3",
        "setor": "Comércio Varejista",
        "receita_liquida": 10000.0,
        "margem_bruta": 30.0,
        "margem_ebit": 10.0,
        "margem_liquida": 5.0
    }
    val = valuation_agent.calculate_valuation(company_data)
    
    assert "company" in val
    assert "parameters" in val
    assert "dcf_summary" in val
    assert "projections" in val
    assert "sensitivity_matrix" in val
    assert "football_field" in val
    assert "calculation_steps" in val

    # Verify WACC and DCF logic
    assert val["parameters"]["wacc"] > 0
    assert val["dcf_summary"]["enterprise_value"] > 0
    assert val["dcf_summary"]["equity_value"] > 0
    assert val["dcf_summary"]["fair_share_price"] > 0
    assert len(val["projections"]) == 5
    assert len(val["calculation_steps"]) >= 6
    assert len(val["football_field"]) >= 4

def test_valuation_agent_chat_fallback():
    company_data = {
        "name": "EMPRESA EXEMPLO",
        "ticker": "EXMP3",
        "sector": "Industrial",
        "receita_liquida": 8000.0,
        "margem_ebit": 12.0
    }
    val = valuation_agent.calculate_valuation(company_data)
    
    ans_wacc = valuation_agent.chat("Como o WACC foi calculado?", val)
    assert "WACC" in ans_wacc
    assert "CAPM" in ans_wacc or "Capital" in ans_wacc

    ans_sens = valuation_agent.chat("Qual a sensibilidade da perpetuidade g?", val)
    assert "Sensibilidade" in ans_sens or "Perpetuidade" in ans_sens or "g" in ans_sens

def test_valuation_api_calculate_and_chat():
    # 1. Calculate for upload
    res_up = client.post("/api/valuation/calculate", json={"source_type": "upload", "identifier": "casas_bahia"})
    assert res_up.status_code == 200
    data_up = res_up.json()
    assert "dcf_summary" in data_up
    assert data_up["dcf_summary"]["enterprise_value"] > 0

    # 2. Calculate for CVM company (Petrobras 9512)
    res_cvm = client.post("/api/valuation/calculate", json={"source_type": "cvm", "identifier": 9512})
    assert res_cvm.status_code == 200
    data_cvm = res_cvm.json()
    assert "PETROBRAS" in data_cvm["company"]["name"] or "PETROBRAS" in data_cvm["company"]["ticker"]
    assert data_cvm["dcf_summary"]["fair_share_price"] > 0

    # 3. Chat endpoint
    res_chat = client.post("/api/valuation/chat", json={
        "question": "Qual o valuation range da companhia?",
        "valuation_context": data_cvm
    })
    assert res_chat.status_code == 200
    assert "answer" in res_chat.json()
    assert len(res_chat.json()["answer"]) > 20
