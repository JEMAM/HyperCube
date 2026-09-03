import json
from collections import Counter

with open("frontend/lib/cvm_companies.json", "r", encoding="utf-8") as f:
    companies = json.load(f)

print(f"Total companies in cvm_companies.json: {len(companies)}")
sectors = Counter([c.get("setor") for c in companies])
print("\nTop sectors in cvm_companies.json:")
for s, count in sectors.most_common(40):
    print(f"  '{s}': {count} companies")

print("\nSearching for Education companies (Educação, Ensino, Anima, Cogna, Yduqs, Cruzeiro):")
for c in companies:
    txt = (c.get("denom_social", "") + " " + c.get("nome_pregao", "") + " " + c.get("setor", "")).lower()
    if any(k in txt for k in ["educa", "ensino", "cogna", "yduqs", "anima", "cruzeiro"]):
        print(f"  [{c.get('cod_cvm')}] {c.get('nome_pregao')} | Setor: '{c.get('setor')}'")
