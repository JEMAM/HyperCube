import fitz
from backend.app.cvm.database import cvm_db
from backend.app.cvm.analysis import cvm_analyzer

# 1. Search Cyrela in CVM DB
rows = cvm_db.conn.execute("SELECT cod_cvm, cnpj, denom_social, nome_pregao, setor FROM cvm_companies WHERE denom_social LIKE '%CYRELA%' OR nome_pregao LIKE '%CYRE%'").fetchall()
print("=== CYRELA COMPANIES IN CVM DB ===")
for r in rows:
    count = cvm_db.conn.execute("SELECT COUNT(*) FROM cvm_financials WHERE cod_cvm = ?", [r[0]]).fetchone()[0]
    print(f"Code: {r[0]} | Name: {r[2]} | Pregao: {r[3]} | Records in cvm_financials: {count}")

# 2. Inspect PDF
pdf_path = r"C:\Users\edumo\Documents\cyrela_demonstração.pdf"
doc = fitz.open(pdf_path)
print(f"\n=== CYRELA PDF INSPECTION ===")
print(f"Total pages: {len(doc)}")
for i in range(min(15, len(doc))):
    txt = doc[i].get_text()
    lines = [l.strip() for l in txt.split("\n") if l.strip()]
    header = " | ".join(lines[:4])
    print(f"Page {i+1}: {header[:120]}")
