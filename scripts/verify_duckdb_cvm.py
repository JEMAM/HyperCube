from backend.app.cvm.database import cvm_db
from backend.app.cvm.analysis import cvm_analyzer

# Query DuckDB summary
res = cvm_db.conn.execute("""
    SELECT 
        COUNT(DISTINCT cod_cvm) as total_companies,
        COUNT(*) as total_records,
        MIN(dt_refer) as min_date,
        MAX(dt_refer) as max_date
    FROM cvm_financials
""").fetchone()

print("=== DUCKDB CVM FINANCIALS SUMMARY ===")
print(f"Total Companies with Real Statements: {res[0]}")
print(f"Total Financial Statement Lines: {res[1]:,}")
print(f"Date Range: {res[2]} to {res[3]}")

# Test several diverse companies
test_companies = [
    (9512, "Petrobras"),
    (4170, "Vale"),
    (23310, "CVC Brasil"),
    (5410, "WEG"),
    (22470, "Magazine Luiza"),
    (18325, "Embraer"),
    (2437, "Eletrobras"),
    (20257, "Localiza")
]

print("\n=== SAMPLE COMPANY AUDIT VERIFICATION ===")
for cod, name in test_companies:
    analysis = cvm_analyzer.get_company_analysis(cod)
    if analysis and analysis.get("time_series"):
        ts_list = analysis["time_series"]
        latest = ts_list[-1]
        print(f"[{cod}] {name}:")
        print(f"  Periods available: {len(ts_list)} ({[t['period'] for t in ts_list]})")
        print(f"  Latest ({latest['period']}): Rec Liq = R$ {latest.get('receita_liquida')} Mi | Lucro Liq = R$ {latest.get('lucro_liquido')} Mi | EBIT = R$ {latest.get('resultado_ebit')} Mi")
    else:
        print(f"[{cod}] {name}: No analysis generated")
