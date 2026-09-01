import os
import sys

workspace_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if workspace_dir not in sys.path:
    sys.path.insert(0, workspace_dir)

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

PDF_PATH = r"C:\Users\edumo\Documents\klabin4T25.pdf"

print("=" * 80)
print("TESTE COMPLETO DE INGESTÃO E ENDPOINTS DA API HYPERCUBE (KLABIN S.A.)")
print("=" * 80)

# 1. Ingestão do PDF completo via /api/upload-all
print(f"[1/10] POST /api/upload-all -> Enviando {PDF_PATH}...")
with open(PDF_PATH, "rb") as f:
    r = client.post("/api/upload-all", files={"file": ("klabin4T25.pdf", f, "application/pdf")})
print(f"       Status: {r.status_code}")
assert r.status_code == 200
up_data = r.json()
print(f"       Resposta: {up_data.get('message')}")
print(f"       Empresa detectada: {up_data.get('company_info', {}).get('name')}")

# 2. Active company
r = client.get("/api/active-company")
print(f"[2/10] GET /api/active-company -> Status: {r.status_code}")
assert r.status_code == 200
comp = r.json()
print(f"       Empresa ativa: {comp.get('name')} ({comp.get('ticker')})")
print(f"       Períodos: {comp.get('periods')}")
assert "Klabin" in comp.get('name')

# 3. DRE Timeseries
r = client.get("/api/dre/timeseries")
print(f"[3/10] GET /api/dre/timeseries -> Status: {r.status_code}")
assert r.status_code == 200
dre_ts = r.json()
print(f"       Total de pontos na série: {len(dre_ts)}")
assert len(dre_ts) > 0
print(f"       Último período: {dre_ts[-1].get('period')} - Receita: {dre_ts[-1].get('Receita_Liquida')} | Lucro: {dre_ts[-1].get('Lucro_Liquido')}")

# 4. DFC Timeseries & Table
r = client.get("/api/dfc/timeseries")
print(f"[4/10] GET /api/dfc/timeseries -> Status: {r.status_code}")
assert r.status_code == 200
dfc_ts = r.json()
print(f"       Último período DFC: {dfc_ts[-1].get('period')} - FCO: {dfc_ts[-1].get('fco')} | Saldo Final: {dfc_ts[-1].get('saldo_final')}")

r_tbl = client.get("/api/dfc/table")
print(f"       GET /api/dfc/table -> Status: {r_tbl.status_code} | Períodos: {r_tbl.json().get('periods')}")
assert r_tbl.status_code == 200

# 5. BP Table
r = client.get("/api/bp/table")
print(f"[5/10] GET /api/bp/table -> Status: {r.status_code}")
assert r.status_code == 200
bp_tbl = r.json()
print(f"       Empresa no BP: {bp_tbl.get('company', {}).get('name')}")
print(f"       Linhas do BP: {len(bp_tbl.get('rows', []))}")
assert "Klabin" in bp_tbl.get('company', {}).get('name')

# 6. BP KPIs
r = client.get("/api/bp/kpis")
print(f"[6/10] GET /api/bp/kpis -> Status: {r.status_code}")
assert r.status_code == 200
bp_kpis = r.json()
print(f"       Período mais recente dos KPIs: {bp_kpis.get('latest_period')}")
print(f"       Classificação Fleuriet: {bp_kpis.get('summary', {}).get('fleuriet', {}).get('classificacao')}")

# 7. Valuation Calculate
r = client.post("/api/valuation/calculate", json={"wacc_override": 0.115, "growth_rate_override": 0.035})
print(f"[7/10] POST /api/valuation/calculate -> Status: {r.status_code}")
assert r.status_code == 200
val = r.json()
print(f"       Valuation calculado para: {val.get('company', {}).get('name')} ({val.get('company', {}).get('ticker')})")
print(f"       Setor: {val.get('company', {}).get('sector')}")
print(f"       Target Price (DCF): R$ {val.get('target_price_dcf', 0):.2f}")
print(f"       Enterprise Value: R$ {val.get('enterprise_value', 0):,.1f} M")

# 8. Cube Data
r = client.get("/api/olap/cube-data")
print(f"[8/10] GET /api/olap/cube-data -> Status: {r.status_code}")
assert r.status_code == 200
cube_data = r.json()
print(f"       Total de células OLAP retornadas: {len(cube_data)}")

# 9. Charts
r1 = client.get("/api/charts/resultado-trimestral")
print(f"[9/10] GET /api/charts/resultado-trimestral -> Status: {r1.status_code} | Bytes: {len(r1.content)}")
assert r1.status_code == 200
r2 = client.get("/api/charts/lucro-anual")
print(f"       GET /api/charts/lucro-anual -> Status: {r2.status_code} | Bytes: {len(r2.content)}")
assert r2.status_code == 200

# 10. What-If Simulation
r = client.post("/api/simulate/whatif", json={"node": "receita_com_operacoes_de_credito_e_repasses", "change_pct": 10.0, "start_year": 2025, "end_year": 2025})
print(f"[10/10] POST /api/simulate/whatif -> Status: {r.status_code}")
assert r.status_code == 200
wi = r.json()
print(f"        What-If DRE: {wi.get('lucro_liquido_delta_pct')}% variação no Lucro Líquido")

r_dfc = client.post("/api/dfc/simulate/whatif", json={"node": "recebimento_vendas", "change_pct": 15.0, "start_year": 2025, "end_year": 2025})
print(f"        POST /api/dfc/simulate/whatif -> Status: {r_dfc.status_code}")
assert r_dfc.status_code == 200
wi_dfc = r_dfc.json()
print(f"        What-If DFC executado com sucesso: {wi_dfc.get('status')} | Tempo: {wi_dfc.get('elapsed_ms')} ms")

print("=" * 80)
print("TODOS OS ENDPOINTS DA API TESTADOS COM 100% DE SUCESSO PARA A KLABIN S.A.!")
print("=" * 80)

print("=" * 80)
print("TODOS OS ENDPOINTS DA API TESTADOS COM 100% DE SUCESSO!")
print("=" * 80)
