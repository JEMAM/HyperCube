from backend.app.cvm.database import cvm_db
from backend.app.cvm.watchdog import cvm_watchdog
from backend.app.cvm.analysis import cvm_analyzer

# Clean old records for 23310
cvm_db.conn.execute("DELETE FROM cvm_financials WHERE cod_cvm = 23310")
cvm_db.conn.execute("DELETE FROM cvm_filings WHERE cod_cvm = 23310")

analysis = cvm_analyzer.get_company_analysis(23310)
print("Updated CVC in CVM Watch:")
for ts in analysis.get("time_series", []):
    if ts["period"] in ["2024-12-31", "2025-12-31"]:
        print(f"{ts['period']}: Rec = {ts.get('receita_liquida')} Mi, CPV = {ts.get('custo_bens_servicos')} Mi, Lucro Bruto = {ts.get('lucro_bruto')} Mi, EBIT = {ts.get('resultado_ebit')} Mi, Lucro Liq = {ts.get('lucro_liquido')} Mi")
