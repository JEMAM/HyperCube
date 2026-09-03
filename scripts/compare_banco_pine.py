import json
import fitz

# 1. Parse PDF data
doc = fitz.open(r"C:\Users\edumo\Documents\banco_pine_demostração.pdf")
print("PDF Page count:", len(doc))

# 2. Load CVM Real Financials JSON
with open("frontend/lib/cvm_real_financials.json", "r", encoding="utf-8") as f:
    real_data = json.load(f)

pine_cvm = real_data.get("20567")
print("Found Pine in cvm_real_financials.json:", pine_cvm is not None)

# Print all periods in CVM data
if pine_cvm:
    print("Available CVM periods:", [t["period"] for t in pine_cvm.get("time_series", [])])
    print("Latest CVM KPIs:", pine_cvm.get("kpis"))

# Detailed extraction from PDF Page 17 (BP) and Page 18 (DRE)
page_bp = doc[16].get_text("text")
page_dre = doc[17].get_text("text")
page_dfc = doc[20].get_text("text")

print("\n--- Extracted Periods from CVM ---")
for ts in pine_cvm.get("time_series", []):
    if "12-31" in ts["period"]:
        print(f"\nPeriod: {ts['period']}")
        print(f"  Receita Líquida (R$ M): {ts.get('receita_liquida')}")
        print(f"  Lucro Bruto (R$ M): {ts.get('lucro_bruto')}")
        print(f"  Resultado EBIT (R$ M): {ts.get('resultado_ebit')}")
        print(f"  Lucro Líquido (R$ M): {ts.get('lucro_liquido')}")
        print("  Key Accounts:")
        for a in ts.get("raw_accounts", []):
            cd = a.get("cd_conta", "")
            ds = a.get("ds_conta", "")
            vl = a.get("vl_conta", 0)
            if cd in ["1", "2", "2.03", "3.01", "3.02", "3.03", "3.05", "3.07", "3.11"]:
                print(f"    [{cd}] {ds}: {vl}")
