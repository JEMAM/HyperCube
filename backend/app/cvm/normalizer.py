"""
Canonical accounting normalizer mapping CVM standard charts of accounts (CPC/IFRS)
into Hyperblock unified canonical items.
"""
from typing import Optional, Dict, Any

STANDARD_ACCOUNT_MAP = {
    # Non-Financial / General Industry Canonical Map
    "3.01": "receita_liquida",
    "3.02": "custo_bens_servicos",
    "3.03": "lucro_bruto",
    "3.04": "despesas_operacionais",
    "3.04.01": "despesas_vendas",
    "3.04.02": "despesas_gerais_adm",
    "3.04.03": "perdas_nao_recuperaveis",
    "3.04.04": "outras_despesas_op",
    "3.04.05": "outras_receitas_op",
    "3.04.06": "resultado_equivalencia_patrimonial",
    "3.05": "resultado_ebit",
    "3.06": "resultado_financeiro",
    "3.06.01": "receitas_financeiras",
    "3.06.02": "despesas_financeiras",
    "3.07": "resultado_antes_tributos",
    "3.08": "imposto_renda_contribuicao",
    "3.09": "resultado_operacoes_descontinuadas",
    "3.11": "lucro_liquido",
    "3.99": "lucro_liquido",
    "3.99.01": "lucro_atribuido_controladores",
    "3.99.02": "lucro_atribuido_nao_controladores",
}

FINANCIAL_ACCOUNT_MAP = {
    # Financial Institutions (Bancos / Intermediação)
    "receita_com_operacoes_de_credito": "receita_intermediacao",
    "receita_com_operacoes_de_credito_e_repasses": "receita_intermediacao",
    "receitas_da_intermediacao_financeira": "receita_intermediacao",
    "receita_titulos_valores_mobiliarios": "receita_titulos",
    "despesas_de_captacao": "despesas_captacao",
    "produto_da_intermediacao_financeira": "produto_intermediacao",
    "provisao_para_risco_de_credito_prc": "provisao_credito",
    "resultado_da_intermediacao_financeira": "resultado_intermediacao",
    "despesas_pessoal_e_administrativas": "despesas_adm_pessoal",
    "despesas_de_pessoal": "despesas_pessoal",
    "despesas_administrativas": "despesas_adm",
    "despesas_tributarias": "despesas_tributarias",
    "outras_despesas_liquidas": "outras_despesas_liquidas",
    "resultado_antes_da_tributacao": "resultado_antes_tributos",
    "tributos_sobre_o_lucro": "imposto_renda_contribuicao",
    "participacao_nos_lucros": "participacao_lucros",
    "lucro_liquido": "lucro_liquido"
}

import unicodedata

def _clean_str(text: str) -> str:
    """Removes accents and standardizes string for robust matching."""
    text = str(text).replace('\ufffd', '')
    nfkd = unicodedata.normalize('NFKD', text)
    cleaned = ''.join([c for c in nfkd if not unicodedata.combining(c)]).lower()
    return cleaned.replace("_", " ").replace("-", " ").strip()

def normalize_account_code(cd_conta: str, ds_conta: str, is_financial: bool = False) -> str:
    """
    Normalizes a CVM account line code and description into a canonical account key.
    """
    cd = cd_conta.strip()
    ds_clean = _clean_str(ds_conta)

    if is_financial:
        # Check text matching for financial institutions
        for key, canonical in FINANCIAL_ACCOUNT_MAP.items():
            key_clean = _clean_str(key)
            if key_clean in ds_clean or ds_clean in key_clean:
                return canonical
        if "intermediacao" in ds_clean and "receita" in ds_clean:
            return "receita_intermediacao"
        if "captacao" in ds_clean or "despesas de captacao" in ds_clean:
            return "despesas_captacao"
        if "provisao" in ds_clean or "risco de credito" in ds_clean:
            return "provisao_credito"

    # Direct match on standard CVM numeric codes
    if cd in STANDARD_ACCOUNT_MAP:
        return STANDARD_ACCOUNT_MAP[cd]

    # Prefix match (e.g. 3.01.01 -> receita_liquida if subaccount)
    for prefix in sorted(STANDARD_ACCOUNT_MAP.keys(), key=len, reverse=True):
        if cd.startswith(prefix + "."):
            return f"{STANDARD_ACCOUNT_MAP[prefix]}_sub"

    # Description heuristics with cleaned text
    if "receita liquida" in ds_clean or "receita de venda" in ds_clean:
        return "receita_liquida"
    elif "custo dos bens" in ds_clean or "custo dos servicos" in ds_clean or "cpv" in ds_clean or "cmv" in ds_clean:
        return "custo_bens_servicos"
    elif "lucro bruto" in ds_clean or "resultado bruto" in ds_clean:
        return "lucro_bruto"
    elif "despesas com vendas" in ds_clean or "despesas comerciais" in ds_clean:
        return "despesas_vendas"
    elif "despesas gerais e administrativas" in ds_clean or "despesas administrativas" in ds_clean:
        return "despesas_gerais_adm"
    elif "ebit" in ds_clean or "resultado antes do resultado financeiro" in ds_clean or "resultado operacional" in ds_clean:
        return "resultado_ebit"
    elif "resultado financeiro" in ds_clean:
        return "resultado_financeiro"
    elif "receitas financeiras" in ds_clean:
        return "receitas_financeiras"
    elif "despesas financeiras" in ds_clean:
        return "despesas_financeiras"
    elif "resultado antes do imposto" in ds_clean or "resultado antes dos tributos" in ds_clean or "lair" in ds_clean:
        return "resultado_antes_tributos"
    elif "imposto de renda" in ds_clean or "irrf" in ds_clean or "csll" in ds_clean or "tributos sobre o lucro" in ds_clean:
        return "imposto_renda_contribuicao"
    elif "lucro liquido" in ds_clean or "lucro/prejuizo liquido" in ds_clean or "resultado liquido" in ds_clean:
        return "lucro_liquido"

    return "outras_contas"


def normalize_sector(raw_sector: Optional[str]) -> str:
    """
    Cleans, fixes encoding, strips corporate prefixes (e.g. 'Emp. Adm. Part. - '),
    and maps CVM raw sector descriptions into clean, unique, standardized industry sectors.
    """
    if not raw_sector:
        return "Outros"

    s = str(raw_sector).strip()
    if not s or s.lower() == "none":
        return "Outros"

    # Fix common encoding corruptions if present
    replacements = {
        "Servios": "Serviços",
        "Servios": "Serviços",
        "Comrcio": "Comércio",
        "Comrcio": "Comércio",
        "Farmcias": "Farmácias",
        "Farmcias": "Farmácias",
        "Distribuio": "Distribuição",
        "Distribuio": "Distribuição",
        "Distribuio": "Distribuição",
        "Combustveis": "Combustíveis",
        "Combustveis": "Combustíveis",
        "Eltrica": "Elétrica",
        "Eltrica": "Elétrica",
        "Intermedirios": "Intermediários",
        "Intermedirios": "Intermediários",
        "Minerao": "Mineração",
        "Minerao": "Mineração",
        "Minerao": "Mineração",
        "Mquinas": "Máquinas",
        "Mquinas": "Máquinas",
        "Petrleo": "Petróleo",
        "Petrleo": "Petróleo",
        "Gs": "Gás",
        "Gs": "Gás",
        "Biocombustveis": "Biocombustíveis",
        "Biocombustveis": "Biocombustíveis",
    }
    for old, new in replacements.items():
        s = s.replace(old, new)

    # Strip holding / corporate prefixes
    prefixes = [
        "Emp. Adm. Part. - ",
        "Emp. Adm. Part. ",
        "Emp. Adm. Part.",
        "Holdings - ",
        "Holdings ",
        "Empresas de Participações - ",
        "Empresas de Participacoes - ",
        "Empresa de Participações - ",
    ]
    for p in prefixes:
        if s.startswith(p):
            s = s[len(p):].strip()

    s_clean = _clean_str(s)

    if "intermediacao" in s_clean or "banco" in s_clean or "credito" in s_clean:
        return "Intermediários Financeiros / Bancos"
    if "petroleo" in s_clean or "combustivel" in s_clean or "gas" in s_clean:
        if "distribuicao" in s_clean:
            return "Distribuição de Combustíveis"
        return "Petróleo, Gás e Biocombustíveis"
    if "mineracao" in s_clean or "metalurgia" in s_clean or "siderurgia" in s_clean:
        return "Mineração e Metalurgia"
    if "energia" in s_clean or "eletrica" in s_clean or "eletricidade" in s_clean:
        return "Energia Elétrica"
    if "farmacia" in s_clean or "drogaria" in s_clean or "medicamento" in s_clean:
        return "Comércio / Farmácias"
    if "varejista" in s_clean or "varejo" in s_clean or "lojas" in s_clean:
        return "Comércio Varejista"
    if "bebida" in s_clean or "alimento" in s_clean or "frigorifico" in s_clean:
        return "Bebidas e Alimentos"
    if "maquina" in s_clean or "equipamento" in s_clean or "motores" in s_clean:
        return "Máquinas e Equipamentos"
    if "papel" in s_clean or "celulose" in s_clean or "madeira" in s_clean:
        return "Papel e Celulose"
    if "aluguel" in s_clean or "locacao" in s_clean or "locadora" in s_clean or "carros" in s_clean:
        return "Aluguel de Carros / Serviços"
    if "transporte" in s_clean or "aeroespacial" in s_clean or "aeronaut" in s_clean or "aviacao" in s_clean:
        return "Material de Transporte / Aeroespacial"
    if "bolsa" in s_clean or "servicos financeiros" in s_clean:
        return "Serviços Financeiros Diversos"
    if "telecom" in s_clean or "telefonia" in s_clean or "tecnologia" in s_clean or "software" in s_clean:
        return "Telecomunicações & Tecnologia"
    if "saude" in s_clean or "hospital" in s_clean or "diagnostico" in s_clean:
        return "Saúde & Serviços Hospitalares"
    if "imobiliario" in s_clean or "construcao" in s_clean or "incorporacao" in s_clean:
        return "Construção Civil & Imobiliário"
    if "educacao" in s_clean or "ensino" in s_clean:
        return "Educação"
    if "saneamento" in s_clean or "agua" in s_clean:
        return "Saneamento & Serviços Básicos"
    if "agro" in s_clean or "agricultura" in s_clean or "graos" in s_clean:
        return "Agronegócio"

    return s if s else "Outros"


