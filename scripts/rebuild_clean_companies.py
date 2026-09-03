import polars as pl
from pathlib import Path
import json
from backend.app.cvm.normalizer import normalize_sector, CVM_CANONICAL_SECTORS
from backend.app.cvm.database import cvm_db

# 1. Check if cad_cia_aberta.csv exists in CACHE_DIR or backend/app/data/
cad_paths = [
    Path("backend/app/data/cvm/cache/cad_cia_aberta.csv"),
    Path("backend/app/data/cvm/cad_cia_aberta.csv"),
    Path("backend/app/data/cad_cia_aberta.csv")
]

cad_file = next((p for p in cad_paths if p.exists()), None)
print(f"Found cad_cia_aberta: {cad_file}")

if cad_file:
    df_cad = pl.read_csv(cad_file, separator=";", encoding="iso-8859-1", ignore_errors=True)
    print(f"Loaded {len(df_cad)} companies from raw CVM CAD")
    
    # Filter active companies (SIT == 'ATIVO')
    active_df = df_cad.filter(pl.col("SIT").str.to_uppercase() == "ATIVO")
    print(f"Active companies: {len(active_df)}")
    
    companies_clean = []
    for row in active_df.iter_rows(named=True):
        cod_cvm = int(row["CD_CVM"])
        cnpj = str(row.get("CNPJ_CIA") or "")
        denom = str(row.get("DENOM_SOCIAL") or "").strip()
        pregao = str(row.get("NOME_PREGAO") or denom).strip()
        raw_setor = str(row.get("SETOR_ATIV") or "Sem Setor Principal").strip()
        cat = str(row.get("CATEG_REG") or "Categoria A").strip()
        sit = str(row.get("SIT") or "ATIVO").strip()
        uf = str(row.get("UF") or "SP").strip()
        
        # Override known major companies
        canon_setor = normalize_sector(raw_setor)
        if "PETROBRAS" in denom or cod_cvm == 9512:
            canon_setor = "Petróleo e Gás"
        elif "SANEAMENTO" in denom or "SABESP" in denom or cod_cvm == 14443 or "COPASA" in denom or "SANEPAR" in denom:
            canon_setor = "Saneamento, Água e Serviços Básicos"
        elif "EMBRAER" in denom or "MARCOPOLO" in denom or "RANDON" in denom:
            canon_setor = "Material de Transporte / Aeroespacial"
        elif "CYRELA" in denom or "EZTEC" in denom or "EVEN" in denom or "MRV" in denom or "DIRECIONAL" in denom:
            canon_setor = "Construção Civil e Imobiliário"
        elif "CVC BRASIL" in denom or cod_cvm == 23310:
            canon_setor = "Hospedagem e Turismo"
        elif any(k in denom for k in ["ANIMA", "KROTON", "COGNA", "YDUQS", "ESTACIO", "SER EDUCACIONAL", "VITRU", "CRUZEIRO DO SUL"]):
            canon_setor = "Educação"
            
        companies_clean.append({
            "cod_cvm": cod_cvm,
            "cnpj": cnpj,
            "denom_social": denom,
            "nome_pregao": pregao,
            "categoria": cat,
            "situacao": sit,
            "setor": canon_setor,
            "uf": uf,
            "codigo_cvm_str": str(cod_cvm).padStart(6, "0") if hasattr(str(cod_cvm), "padStart") else str(cod_cvm).zfill(6)
        })
        
    print(f"Processed {len(companies_clean)} clean companies")
    
    # Save to frontend/lib/cvm_companies.json
    out_json = Path("frontend/lib/cvm_companies.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(companies_clean, f, ensure_ascii=False, indent=2)
    print(f"Saved clean companies to {out_json}")
    
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
    print(f"Updated DuckDB cvm_companies table with {len(duck_rows)} rows!")
