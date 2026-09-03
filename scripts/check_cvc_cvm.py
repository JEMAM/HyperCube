import json
from backend.app.cvm.database import cvm_db
from backend.app.cvm.analysis import cvm_analyzer

cvc = cvm_db.get_company_by_code(23310)
print("CVC in cvm_db:", cvc)

analysis = cvm_analyzer.get_company_analysis(23310)
if analysis:
    print("Company:", analysis.get("company"))
    print("KPIs:", json.dumps(analysis.get("kpis"), indent=2, ensure_ascii=False))
    print("\nTime Series:")
    for ts in analysis.get("time_series", []):
        p = ts.get("period")
        if "2024" in p or "2025" in p:
            print(f"Period: {p} ({ts.get('quarter')}) | Rec Liq: {ts.get('receita_liquida')} | CPV: {ts.get('custo_bens_servicos')} | Lucro Bruto: {ts.get('lucro_bruto')} | EBIT: {ts.get('resultado_ebit')} | Lucro Liq: {ts.get('lucro_liquido')}")
else:
    print("No analysis found in backend for 23310")
