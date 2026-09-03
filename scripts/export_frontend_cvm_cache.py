import json
from pathlib import Path
from backend.app.cvm.database import cvm_db
from backend.app.cvm.analysis import cvm_analyzer

print("Exporting real DuckDB financial profiles to frontend/lib/cvm_real_financials.json...")

companies = cvm_db.conn.execute("SELECT DISTINCT cod_cvm FROM cvm_financials ORDER BY cod_cvm ASC").fetchall()
print(f"Total companies with real financials: {len(companies)}")

real_profiles = {}
count = 0
for (cod_cvm,) in companies:
    analysis = cvm_analyzer.get_company_analysis(cod_cvm)
    if not analysis or not analysis.get("time_series"):
        continue

    # Keep only the essential data to keep json compact
    ts_clean = []
    for ts in analysis.get("time_series", []):
        ts_clean.append({
            "period": ts.get("period"),
            "year": ts.get("year"),
            "quarter": ts.get("quarter"),
            "receita_liquida": ts.get("receita_liquida"),
            "custo_bens_servicos": ts.get("custo_bens_servicos"),
            "lucro_bruto": ts.get("lucro_bruto"),
            "resultado_ebit": ts.get("resultado_ebit"),
            "lucro_liquido": ts.get("lucro_liquido"),
            "margem_bruta": ts.get("margem_bruta"),
            "margem_ebit": ts.get("margem_ebit"),
            "margem_liquida": ts.get("margem_liquida"),
            "raw_accounts": ts.get("raw_accounts", [])[:15]
        })

    real_profiles[str(cod_cvm)] = {
        "kpis": analysis.get("kpis"),
        "time_series": ts_clean,
        "periods": analysis.get("periods", [])
    }
    count += 1

out_path = Path("frontend/lib/cvm_real_financials.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(real_profiles, f, ensure_ascii=False)

file_size_kb = out_path.stat().st_size / 1024
print(f"Successfully exported {count} company profiles to {out_path} ({file_size_kb:.1f} KB)")
