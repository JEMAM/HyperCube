import fitz
from backend.app.cvm.database import cvm_db

# Query DuckDB for Cyrela BP (1. and 2.) and DFC (6.) for 2024-12-31 and 2025-12-31
bp_duck = cvm_db.conn.execute("""
    SELECT cd_conta, ds_conta, dt_refer, vl_conta
    FROM cvm_financials
    WHERE cod_cvm = 14460 AND dt_refer IN ('2024-12-31', '2025-12-31') AND tipo = 'DFP'
      AND cd_conta IN ('1', '1.01', '1.02', '2', '2.01', '2.02', '2.03', '6.01', '6.02', '6.03', '6.05', '6.05.02')
    ORDER BY cd_conta ASC, dt_refer ASC
""").fetchall()

print("=== DUCKDB BALANCE SHEET & CASH FLOW ===")
for r in bp_duck:
    print(f"Conta {r[0]} | {r[1]} | {r[2]} | R$ {r[3]} Mi")

# Extract PDF pages 19, 21, 23, 27
doc = fitz.open(r"C:\Users\edumo\Documents\cyrela_demonstração.pdf")
print("\n=== PDF BALANCE SHEET ATIVO (PAGE 19 & 20) ===")
print(doc[18].get_text()[:1200])
print("\n=== PDF BALANCE SHEET PASSIVO & PL (PAGE 21 & 23) ===")
print(doc[20].get_text()[:1200])
print(doc[22].get_text()[:1200])

print("\n=== PDF DFC (PAGE 27 & 28) ===")
print(doc[26].get_text()[:1200])
