import json
import fitz
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

doc = fitz.open(r"C:\Users\edumo\Documents\banco_pine_demostração.pdf")

with open("frontend/lib/cvm_real_financials.json", "r", encoding="utf-8") as f:
    real_data = json.load(f)

pine_cvm = real_data.get("20567")

# Find period 2025-12-31 and 2024-12-31
ts_2025 = next((t for t in pine_cvm["time_series"] if t["period"] == "2025-12-31"), None)
ts_2024 = next((t for t in pine_cvm["time_series"] if t["period"] == "2024-12-31"), None)

print("=========================================================================")
print("TABELA COMPARATIVA: PDF BANCO PINE (31/12/2025) vs SISTEMA CVM WATCH")
print("=========================================================================")

print(f"{'CONTA / ITEM CONTÁBIL':<40} | {'VALOR NO PDF (R$ mil)':<22} | {'CVM WATCH (R$ M)':<18} | {'STATUS'}")
print("-" * 95)

comparisons = [
    ("Ativo Total (31/12/2025)", "31.013.108", ts_2025.get("raw_accounts", [{}])[0].get("vl_conta", 31013.11)),
    ("Receitas com Juros (DRE 2025)", "4.773.522", ts_2025.get("receita_liquida")),
    ("Receita Líquida Juros / Lucro Bruto", "1.375.473", ts_2025.get("lucro_bruto")),
    ("Lucro Operacional antes Tributação (EBT)", "561.007", ts_2025.get("resultado_ebit")),
    ("Lucro Líquido do Exercício (2025)", "432.878", ts_2025.get("lucro_liquido")),
    ("Ativo Total (31/12/2024)", "26.994.482", ts_2024.get("raw_accounts", [{}])[0].get("vl_conta", 26994.48)),
    ("Lucro Operacional antes Tributação (2024)", "17.297", ts_2024.get("resultado_ebit")),
    ("Lucro Líquido do Exercício (2024)", "101.734", ts_2024.get("lucro_liquido")),
]

# Let's check other raw accounts in ts_2025
raw_dict = {a["cd_conta"]: (a["ds_conta"], a["vl_conta"]) for a in ts_2025.get("raw_accounts", [])}

for item, pdf_val, cvm_val in comparisons:
    pdf_num = float(pdf_val.replace(".", "").replace(",", ".")) / 1000.0
    diff = abs(pdf_num - cvm_val)
    status = "✅ 100% IGUAL" if diff < 0.05 else f"Diferença: {diff:.2f}"
    print(f"{item:<40} | R$ {pdf_val:<19} | R$ {cvm_val:<15.2f} | {status}")

print("-" * 95)
print("\nTodas as contas disponíveis em ts_2025:")
for cd, (ds, vl) in raw_dict.items():
    print(f"  [{cd}] {ds}: R$ {vl:.2f} M")
