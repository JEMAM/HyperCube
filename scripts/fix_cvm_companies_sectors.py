import json
from collections import Counter

with open("frontend/lib/cvm_companies.json", "r", encoding="utf-8") as f:
    companies = json.load(f)

# Canonical sectors from cvmData.ts
CVM_SECTORS = [
    "Agricultura (Açúcar, Álcool e Cana)",
    "Alimentos e Bebidas",
    "Arrendamento Mercantil",
    "Bancos",
    "Bolsas de Valores / Mercado de Capitais",
    "Brinquedos e Lazer",
    "Comunicação e Informática",
    "Comércio (Atacado e Varejo)",
    "Construção Civil e Imobiliário",
    "Crédito Imobiliário",
    "Educação",
    "Embalagens",
    "Energia Elétrica",
    "Extração Mineral",
    "Farmacêutico e Higiene",
    "Hospedagem e Turismo",
    "Intermediação Financeira",
    "Material de Transporte / Aeroespacial",
    "Metalurgia e Siderurgia",
    "Máquinas, Equipamentos, Veículos e Peças",
    "Papel e Celulose",
    "Petroquímicos e Borracha",
    "Petróleo e Gás",
    "Reflorestamento",
    "Saneamento, Água e Serviços Básicos",
    "Securitização de Recebíveis",
    "Seguradoras e Corretoras",
    "Sem Setor Principal",
    "Serviços Médicos e Hospitalares",
    "Serviços de Transporte e Logística",
    "Telecomunicações",
    "Têxtil e Vestuário"
]

def map_canonical_sector(raw):
    if not raw:
        return "Sem Setor Principal"
    r = raw.lower()
    # Normalize
    clean = "".join(c for c in r if c.isalnum() or c == " ")
    
    if "educa" in clean:
        return "Educação"
    if "eletric" in clean or "energia" in clean:
        return "Energia Elétrica"
    if "constru" in clean or "imobili" in clean:
        return "Construção Civil e Imobiliário"
    if "comerc" in clean or "varejo" in clean:
        return "Comércio (Atacado e Varejo)"
    if "transp" in clean and ("aero" in clean or "material" in clean):
        return "Material de Transporte / Aeroespacial"
    if "transp" in clean or "logist" in clean:
        return "Serviços de Transporte e Logística"
    if "banco" in clean:
        return "Bancos"
    if "petrol" in clean or "gas" in clean:
        return "Petróleo e Gás"
    if "telecom" in clean:
        return "Telecomunicações"
    if "aliment" in clean or "bebid" in clean:
        return "Alimentos e Bebidas"
    if "medic" in clean or "hospit" in clean or "saude" in clean:
        return "Serviços Médicos e Hospitalares"
    if "metalurg" in clean or "siderurg" in clean:
        return "Metalurgia e Siderurgia"
    if "maquin" in clean or "equip" in clean or "veicul" in clean or "pecas" in clean:
        return "Máquinas, Equipamentos, Veículos e Peças"
    if "textil" in clean or "vestu" in clean:
        return "Têxtil e Vestuário"
    if "agric" in clean or "acucar" in clean or "alcool" in clean or "cana" in clean:
        return "Agricultura (Açúcar, Álcool e Cana)"
    if "farmac" in clean or "higien" in clean:
        return "Farmacêutico e Higiene"
    if "miner" in clean or "extrac" in clean:
        return "Extração Mineral"
    if "securit" in clean:
        return "Securitização de Recebíveis"
    if "segur" in clean or "corretor" in clean:
        return "Seguradoras e Corretoras"
    if "hosped" in clean or "turis" in clean or "hotel" in clean:
        return "Hospedagem e Turismo"
    if "brinq" in clean or "lazer" in clean:
        return "Brinquedos e Lazer"
    if "papel" in clean or "celul" in clean:
        return "Papel e Celulose"
    if "intermediac" in clean:
        return "Intermediação Financeira"
    if "arrend" in clean:
        return "Arrendamento Mercantil"
    if "bolsa" in clean or "capitais" in clean:
        return "Bolsas de Valores / Mercado de Capitais"
    if "embalag" in clean:
        return "Embalagens"
    if "reflorest" in clean:
        return "Reflorestamento"
    if "saneam" in clean or "agua" in clean:
        return "Saneamento, Água e Serviços Básicos"
    if "credito" in clean and "imob" in clean:
        return "Crédito Imobiliário"
    if "comunic" in clean or "informat" in clean:
        return "Comunicação e Informática"
    if "petroquim" in clean or "borracha" in clean:
        return "Petroquímicos e Borracha"
        
    return "Sem Setor Principal"

for c in companies:
    c["setor"] = map_canonical_sector(c.get("setor"))

# Check distribution now
counts = Counter([c["setor"] for c in companies])
print("=== CANONICAL SECTOR DISTRIBUTION ===")
for s in sorted(CVM_SECTORS):
    print(f"  {s}: {counts.get(s, 0)} companies")

with open("frontend/lib/cvm_companies.json", "w", encoding="utf-8") as f:
    json.dump(companies, f, ensure_ascii=False, indent=2)

print("\nSuccessfully updated frontend/lib/cvm_companies.json!")
