"""
Comprehensive Unit & Integration Tests for CVM Open Data Watchdog & Company Analysis Module.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.cvm.database import cvm_db
from backend.app.cvm.normalizer import normalize_account_code
from backend.app.cvm.watchdog import cvm_watchdog
from backend.app.cvm.analysis import cvm_analyzer
from backend.app.engine.multidim_cube import global_cube

client = TestClient(app)

def test_cvm_database_schema_and_seeding():
    """Validates that DuckDB tables are properly initialized with default listed companies."""
    sectors = cvm_db.get_sectors()
    assert len(sectors) > 0
    assert any("Petróleo" in s or "Petroleo" in s or "Mineração" in s or "Mineracao" in s or "Banco" in s for s in sectors)

    companies = cvm_db.get_companies()
    assert len(companies) >= 10
    
    # Verify Petrobras, Vale, Banco do Brasil are present
    petro = cvm_db.get_company_by_code(9512)
    assert petro is not None
    assert "PETROBRAS" in petro["nome_pregao"]

    vale = cvm_db.get_company_by_code(4170)
    assert vale is not None
    assert "VALE" in vale["nome_pregao"]

def test_cvm_normalizer_mappings():
    """Validates canonical accounting normalization for standard and financial charts."""
    # Standard Non-Financial DRE
    assert normalize_account_code("3.01", "Receita Líquida de Vendas") == "receita_liquida"
    assert normalize_account_code("3.02", "Custo dos Bens e Serviços Vendidos") == "custo_bens_servicos"
    assert normalize_account_code("3.03", "Resultado Bruto") == "lucro_bruto"
    assert normalize_account_code("3.05", "Resultado Antes do Resultado Financeiro (EBIT)") == "resultado_ebit"
    assert normalize_account_code("3.06", "Resultado Financeiro") == "resultado_financeiro"
    assert normalize_account_code("3.11", "Lucro Líquido Consolidado") == "lucro_liquido"

    # Financial Institution terms
    assert normalize_account_code("3.01", "Receitas da Intermediação Financeira", is_financial=True) == "receita_intermediacao"
    assert normalize_account_code("3.02", "Despesas de Captação", is_financial=True) == "despesas_captacao"
    assert normalize_account_code("3.04", "Provisão para Risco de Crédito PRC", is_financial=True) == "provisao_credito"

def test_cvm_watchdog_filing_id_and_financial_series():
    """Tests deterministic filing ID generation and standard financial statement generation."""
    f_id = cvm_watchdog.compute_filing_id(9512, "ITR", "2025-03-31", 1)
    assert len(f_id) == 16

    # Test financial generation for Petrobras
    records = cvm_watchdog.generate_company_financial_series(9512, "Petróleo, Gás e Biocombustíveis")
    assert len(records) > 0

    filings = cvm_db.get_company_filings(9512)
    assert len(filings) > 0
    assert filings[0]["status"] == "LOADED"

def test_cvm_company_analyzer_kpis():
    """Tests the financial analysis calculations, margins, and KPI synthesis."""
    analysis = cvm_analyzer.get_company_analysis(9512)
    assert analysis is not None
    assert "kpis" in analysis
    assert "time_series" in analysis
    assert len(analysis["time_series"]) > 0

    kpis = analysis["kpis"]
    assert kpis["receita_liquida"] > 0
    assert "margem_bruta" in kpis
    assert "margem_ebit" in kpis
    assert "margem_liquida" in kpis
    assert "roe_estimado" in kpis

def test_cvm_cube_injection():
    """Tests injecting a CVM company into the HyperCube multidimensional calculation tensor."""
    success = global_cube.load_cvm_company_dataset(4170)  # Vale
    assert success is True
    assert global_cube.active_company_id == "cvm_4170"
    
    # Test slice query
    slice_data = global_cube.query_slice(row_dim="account", col_dim="time")
    assert len(slice_data["columns"]) > 0
    assert len(slice_data["rows"]) > 0

    # Ensure accounts exist in the tensor
    accounts = [r["id"] for r in slice_data["rows"]]
    assert "Receita_Liquida" in accounts
    assert "Margem_Bruta" in accounts
    assert "Lucro_Liquido" in accounts

def test_cvm_api_endpoints():
    """Validates FastAPI CVM endpoints end-to-end."""
    # 1. Sectors
    r_sec = client.get("/api/cvm/sectors")
    assert r_sec.status_code == 200
    assert isinstance(r_sec.json(), list)

    # 2. Companies list and search
    r_comp = client.get("/api/cvm/companies?search=Petrobras")
    assert r_comp.status_code == 200
    companies = r_comp.json()
    assert len(companies) >= 1
    assert companies[0]["cod_cvm"] == 9512

    # 3. Company details
    r_detail = client.get("/api/cvm/companies/9512")
    assert r_detail.status_code == 200
    assert r_detail.json()["cod_cvm"] == 9512

    # 4. Filings
    r_filings = client.get("/api/cvm/companies/9512/filings")
    assert r_filings.status_code == 200
    assert isinstance(r_filings.json(), list)

    # 5. Financials & KPIs
    r_fin = client.get("/api/cvm/companies/9512/financials")
    assert r_fin.status_code == 200
    fin_data = r_fin.json()
    assert "kpis" in fin_data
    assert "time_series" in fin_data

    # 6. Watchdog status
    r_status = client.get("/api/cvm/watchdog/status")
    assert r_status.status_code == 200
    assert "status" in r_status.json()

    # 7. Load into Hyperblock Cube
    r_cube = client.post("/api/cvm/companies/9512/load-cube")
    assert r_cube.status_code == 200
    cube_resp = r_cube.json()
    assert cube_resp["status"] == "loaded"
    assert cube_resp["cod_cvm"] == 9512
