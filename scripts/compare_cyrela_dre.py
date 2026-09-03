import fitz
import json
from backend.app.cvm.analysis import cvm_analyzer

# 1. Get CVM Watch analysis for Cyrela (14460)
cvm_analysis = cvm_analyzer.get_company_analysis(14460)
print("=== CVM WATCH ANALYSIS FOR CYRELA (14460) ===")
print("Company:", cvm_analysis.get("company"))
print("KPIs:", json.dumps(cvm_analysis.get("kpis"), indent=2, ensure_ascii=False))

print("\nTime Series in CVM Watch:")
for ts in cvm_analysis.get("time_series", []):
    print(f"Period: {ts['period']} ({ts.get('quarter')})")
    print(f"  Receita Líquida: {ts.get('receita_liquida')} Mi")
    print(f"  CPV: {ts.get('custo_bens_servicos')} Mi")
    print(f"  Lucro Bruto: {ts.get('lucro_bruto')} Mi")
    print(f"  EBIT: {ts.get('resultado_ebit')} Mi")
    print(f"  Lucro Líquido: {ts.get('lucro_liquido')} Mi")

# 2. Extract DRE text from PDF pages 24 and 25
doc = fitz.open(r"C:\Users\edumo\Documents\cyrela_demonstração.pdf")
print("\n=== PDF DRE CONSOLIDADA (PAGES 24 & 25) ===")
p24 = doc[23].get_text("text")
p25 = doc[24].get_text("text")
print("--- Page 24 ---")
print(p24[:2000])
print("--- Page 25 ---")
print(p25[:2000])
