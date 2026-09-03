from backend.app.cvm.database import cvm_db

rows = cvm_db.conn.execute("""
    SELECT cd_conta, ds_conta, vl_conta, conta_canonical
    FROM cvm_financials
    WHERE cod_cvm = 14460 AND dt_refer = '2025-12-31' AND tipo = 'DFP'
    ORDER BY cd_conta ASC
""").fetchall()

print(f"Total accounts in DuckDB for Cyrela 2025-12-31: {len(rows)}")
print("\nDRE Accounts:")
for r in rows:
    if r[0].startswith("3."):
        print(f"  {r[0]} | {r[1]} | {r[2]} Mi | canonical: {r[3]}")
