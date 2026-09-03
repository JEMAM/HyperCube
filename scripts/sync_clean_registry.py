import io
import json
from pathlib import Path
import httpx
import polars as pl
from backend.app.cvm.normalizer import normalize_sector
from backend.app.cvm.database import cvm_db
from backend.app.cvm.config import USER_AGENT

url = "https://dados.cvm.gov.br/dados/CIA_ABERTA/CAD/DADOS/cad_cia_aberta.csv"
print(f"Downloading active CVM registry from {url}...")
resp = httpx.get(url, headers={"User-Agent": USER_AGENT}, timeout=30.0, follow_redirects=True)
raw_bytes = resp.content

df_cad = pl.read_csv(io.BytesIO(raw_bytes), separator=";", encoding="iso-8859-1", ignore_errors=True)
print(f"Loaded {len(df_cad)} companies from official CVM registry")

# Filter active companies
active_df = df_cad.filter(pl.col("SIT").str.to_uppercase() == "ATIVO")
print(f"Active companies: {len(active_df)}")

companies_clean = []
seen_cods = set()
for row in active_df.iter_rows(named=True):
    try:
        cod_cvm = int(row["CD_CVM"])
    except Exception:
        continue
    if cod_cvm in seen_cods:
        continue
    seen_cods.add(cod_cvm)
    
    cnpj = str(row.get("CNPJ_CIA") or "").strip()
    denom = str(row.get("DENOM_SOCIAL") or "").strip()
    pregao = str(row.get("NOME_PREGAO") or denom).strip()
    raw_setor = str(row.get("SETOR_ATIV") or "Sem Setor Principal").strip()
    cat = str(row.get("CATEG_REG") or "Categoria A").strip()
    sit = str(row.get("SIT") or "ATIVO").strip()
    uf = str(row.get("UF") or "SP").strip()
    
    canon_setor = normalize_sector(raw_setor)
    
    # Specific targeted overrides for high profile companies
    denom_upper = denom.upper()
    if "PETROBRAS" in denom_upper or cod_cvm == 9512 or "PETROLEO BRASILEIRO" in denom_upper:
        canon_setor = "Petróleo e Gás"
    elif "SANEAMENTO" in denom_upper or "SABESP" in denom_upper or cod_cvm == 14443 or "COPASA" in denom_upper or "SANEPAR" in denom_upper or "SANEAGO" in denom_upper:
        canon_setor = "Saneamento, Água e Serviços Básicos"
    elif "EMBRAER" in denom_upper or "MARCOPOLO" in denom_upper or "RANDON" in denom_upper or "AERIS" in denom_upper:
        canon_setor = "Material de Transporte / Aeroespacial"
    elif "CYRELA" in denom_upper or "EZTEC" in denom_upper or "EVEN" in denom_upper or "MRV" in denom_upper or "DIRECIONAL" in denom_upper or "LPS BRASIL" in denom_upper:
        canon_setor = "Construção Civil e Imobiliário"
    elif "CVC BRASIL" in denom_upper or cod_cvm == 23310:
        canon_setor = "Hospedagem e Turismo"
    elif any(k in denom_upper for k in ["ANIMA", "KROTON", "COGNA", "YDUQS", "ESTACIO", "SER EDUCACIONAL", "VITRU", "CRUZEIRO DO SUL", "BIOMA", "ATOM EDUCA"]):
        canon_setor = "Educação"
    elif "LOCALIZA" in denom_upper or "MOVIDA" in denom_upper or "SIMPAR" in denom_upper or "RUMO" in denom_upper or "CCR" in denom_upper or "ECORODOVIAS" in denom_upper:
        canon_setor = "Serviços de Transporte e Logística"
    elif "VALE S.A" in denom_upper or cod_cvm == 4170 or "CSN MINERACAO" in denom_upper or "AURA" in denom_upper:
        canon_setor = "Extração Mineral"
    elif "WEG" in denom_upper or cod_cvm == 5410:
        canon_setor = "Máquinas, Equipamentos, Veículos e Peças"
    elif "MAGAZINE LUIZA" in denom_upper or "LOJAS RENNER" in denom_upper or "CARREFOUR" in denom_upper or "ASSAI" in denom_upper or "GRUPO MATEUS" in denom_upper:
        canon_setor = "Comércio (Atacado e Varejo)"
    elif "ITAU" in denom_upper or "BRADESCO" in denom_upper or "BANCO DO BRASIL" in denom_upper or "SANTANDER" in denom_upper or "BTG" in denom_upper or "PINE" in denom_upper:
        canon_setor = "Bancos"
        
    companies_clean.append({
        "cod_cvm": cod_cvm,
        "cnpj": cnpj,
        "denom_social": denom,
        "nome_pregao": pregao,
        "categoria": cat,
        "situacao": sit,
        "setor": canon_setor,
        "uf": uf,
        "codigo_cvm_str": str(cod_cvm).zfill(6)
    })

print(f"Total processed clean companies: {len(companies_clean)}")

# Check Education sector specifically
edu = [c for c in companies_clean if c["setor"] == "Educação"]
print(f"Companies in Educação ({len(edu)}):")
for e in edu[:10]:
    print(f"  [{e['cod_cvm']}] {e['nome_pregao']} — {e['denom_social']}")

# Write to frontend/lib/cvm_companies.json
out_json = Path("frontend/lib/cvm_companies.json")
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(companies_clean, f, ensure_ascii=False, indent=2)
print(f"Successfully updated {out_json}")

# Update DuckDB cvm_companies
cvm_db.conn.execute("DELETE FROM cvm_companies")
duck_rows = [
    (c["cod_cvm"], c["cnpj"], c["denom_social"], c["nome_pregao"], c["categoria"], c["situacao"], c["setor"], c["uf"])
    for c in companies_clean
]
cvm_db.conn.executemany("""
    INSERT INTO cvm_companies (cod_cvm, cnpj, denom_social, nome_pregao, categoria, situacao, setor, uf)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", duck_rows)
print(f"Updated DuckDB cvm_companies with {len(duck_rows)} rows!")
