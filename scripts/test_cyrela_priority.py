from collections import defaultdict
from backend.app.cvm.database import cvm_db

financials = cvm_db.get_company_financials(14460)

# Sort so that non-3 accounts are processed first, and 3. accounts are processed last (overwriting secondary accounts)
# Furthermore, within 3. accounts, main summary accounts (3.01, 3.02, 3.03, 3.05, 3.06, 3.07, 3.08, 3.11) should win
def account_priority(rec):
    cd = rec["cd_conta"]
    if cd in ["3.01", "3.02", "3.03", "3.05", "3.06", "3.07", "3.08", "3.11"]:
        return 100
    if cd.startswith("3."):
        return 50
    return 10

financials_sorted = sorted(financials, key=account_priority)

periods_dict = defaultdict(dict)
for rec in financials_sorted:
    dt = rec["dt_refer"]
    canonical = rec["conta_canonical"]
    vl = rec["vl_conta"]
    cd = rec["cd_conta"]
    
    # Specific canonical mappings for DRE
    if cd == "3.01":
        periods_dict[dt]["receita_liquida"] = vl
    elif cd == "3.02":
        periods_dict[dt]["custo_bens_servicos"] = vl
    elif cd == "3.03":
        periods_dict[dt]["lucro_bruto"] = vl
    elif cd == "3.05":
        periods_dict[dt]["resultado_ebit"] = vl
    elif cd == "3.06":
        periods_dict[dt]["resultado_financeiro"] = vl
    elif cd == "3.07":
        periods_dict[dt]["resultado_antes_tributos"] = vl
    elif cd == "3.08":
        periods_dict[dt]["imposto_renda_contribuicao"] = vl
    elif cd == "3.11":
        periods_dict[dt]["lucro_liquido"] = vl
    else:
        if canonical not in periods_dict[dt]:
            periods_dict[dt][canonical] = vl

print("=== CORRECTED CYRELA PERIODS ===")
for dt in sorted(periods_dict.keys()):
    d = periods_dict[dt]
    print(f"{dt}: Rec = {d.get('receita_liquida')} Mi | Lucro Bruto = {d.get('lucro_bruto')} Mi | EBIT = {d.get('resultado_ebit')} Mi | Lucro Liq = {d.get('lucro_liquido')} Mi")
