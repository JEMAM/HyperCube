import fitz
import json

# 1. Get CVM Watch data for CVC Brasil (23310)
from backend.app.cvm.analysis import cvm_analyzer
cvm_watch_data = cvm_analyzer.get_company_analysis(23310)

# 2. Extract detailed text from PDF
doc = fitz.open(r"C:\Users\edumo\Documents\cvc_2024-2025.pdf")

print("=== CVM WATCH TIME SERIES (2024 & 2025) ===")
for ts in cvm_watch_data.get("time_series", []):
    p = ts.get("period")
    if "2024" in p or "2025" in p:
        print(f"Period: {p} ({ts.get('quarter')})")
        print(f"  Receita Líquida: {ts.get('receita_liquida')} Mi")
        print(f"  CPV: {ts.get('custo_bens_servicos')} Mi")
        print(f"  Lucro Bruto: {ts.get('lucro_bruto')} Mi")
        print(f"  EBIT: {ts.get('resultado_ebit')} Mi")
        print(f"  Lucro Líquido: {ts.get('lucro_liquido')} Mi")
        print(f"  Margem Bruta: {ts.get('margem_bruta')}%")
        print(f"  Margem EBIT: {ts.get('margem_ebit')}%")
        print(f"  Margem Líquida: {ts.get('margem_liquida')}%")

print("\n=== CVM WATCH 2024 & 2025 ANNUALIZED / DFP TOTALS ===")
# In CVM Watch, DFP periods are 2024-12-31 and 2025-12-31 (or sum of quarters)
dfp_2024 = next((ts for ts in cvm_watch_data.get("time_series", []) if ts.get("period") == "2024-12-31"), None)
dfp_2025 = next((ts for ts in cvm_watch_data.get("time_series", []) if ts.get("period") == "2025-12-31"), None)
print("DFP 2024 in CVM Watch:", dfp_2024)
print("DFP 2025 in CVM Watch:", dfp_2025)

# Also let's sum quarters for 2024 and 2025
q_2024 = [ts for ts in cvm_watch_data.get("time_series", []) if ts.get("year") == "2024" and "12-31" not in ts.get("period")]
q_2025 = [ts for ts in cvm_watch_data.get("time_series", []) if ts.get("year") == "2025" and "12-31" not in ts.get("period")]
print("\nSum of 3 ITR quarters 2024:")
print("  Rec:", sum(q["receita_liquida"] for q in q_2024))
print("Sum of 3 ITR quarters 2025:")
print("  Rec:", sum(q["receita_liquida"] for q in q_2025))
