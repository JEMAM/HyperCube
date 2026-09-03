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
    "3.99": "lucro_por_acao",
    "3.99.01": "lucro_por_acao_basico",
    "3.99.02": "lucro_por_acao_diluido",
}

FINANCIAL_ACCOUNT_MAP = {
    # Financial Institutions (Bancos / Intermediação)
    "receita_com_operacoes_de_credito": "receita_intermediacao",
    "receita_com_operacoes_de_credito_e_repasses": "receita_intermediacao",
    "receitas_da_intermediacao_financeira": "receita_intermediacao",
    "receitas_de_intermediacao_financeira": "receita_intermediacao",
    "receitas_com_juros_e_similares": "receita_intermediacao",
    "receita_titulos_valores_mobiliarios": "receita_titulos",
    "despesas_de_captacao": "despesas_captacao",
    "despesas_de_intermediacao_financeira": "despesas_captacao",
    "despesas_da_intermediacao_financeira": "despesas_captacao",
    "despesas_com_juros_e_similares": "despesas_captacao",
    "produto_da_intermediacao_financeira": "produto_intermediacao",
    "resultado_bruto_de_intermediacao_financeira": "produto_intermediacao",
    "resultado_bruto_da_intermediacao_financeira": "produto_intermediacao",
    "provisao_para_risco_de_credito_prc": "provisao_credito",
    "despesa_de_provisao_para_perda_esperada": "provisao_credito",
    "despesa_de_provisao_para_perda_esperada_para_risco_de_credito": "provisao_credito",
    "provisao_para_creditos_de_liquidacao_duvidosa": "provisao_credito",
    "perda_esperada": "provisao_credito",
    "resultado_da_intermediacao_financeira": "resultado_intermediacao",
    "receitas_de_prestacao_de_servicos": "receita_servicos",
    "despesas_pessoal_e_administrativas": "despesas_adm_pessoal",
    "despesas_de_pessoal": "despesas_pessoal",
    "despesas_com_pessoal": "despesas_pessoal",
    "despesas_administrativas": "despesas_adm",
    "outras_despesas_de_administrativas": "despesas_adm",
    "outras_despesas_administrativas": "despesas_adm",
    "despesas_tributarias": "despesas_tributarias",
    "outras_despesas_liquidas": "outras_despesas_liquidas",
    "outras_receitas_operacionais": "outras_receitas_op",
    "outras_despesas_operacionais": "outras_despesas_op",
    "resultado_da_equivalencia_patrimonial": "resultado_equivalencia_patrimonial",
    "resultado_antes_da_tributacao": "resultado_antes_tributos",
    "resultado_antes_dos_tributos_sobre_o_lucro": "resultado_antes_tributos",
    "tributos_sobre_o_lucro": "imposto_renda_contribuicao",
    "imposto_de_renda_e_contribuicao_social_sobre_o_lucro": "imposto_renda_contribuicao",
    "participacao_nos_lucros": "participacao_lucros",
    "lucro_ou_prejuizo_liquido_consolidado_do_periodo": "lucro_liquido",
    "lucro_ou_prejuizo_liquido_consolidado": "lucro_liquido",
    "lucro_liquido_consolidado": "lucro_liquido",
    "lucro_liquido": "lucro_liquido",
    "atribuido_aos_socios_da_empresa_controladora": "lucro_controladora",
    "atribuido_a_socios_da_empresa_controladora": "lucro_controladora",
    "atribuido_aos_socios_nao_controladores": "lucro_nao_controladores",
    "atribuido_a_socios_nao_controladores": "lucro_nao_controladores"
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

    if cd.startswith("3."):
        if "por acao" in ds_clean or "por_acao" in ds_clean:
            return "lucro_por_acao"
        if ("lucro" in ds_clean or "prejuizo" in ds_clean) and ("consolidado" in ds_clean or "periodo" in ds_clean or "exercicio" in ds_clean):
            if "controladora" in ds_clean or "controladores" in ds_clean:
                return "lucro_controladora"
            if "nao controladores" in ds_clean or "nao_controladores" in ds_clean:
                return "lucro_nao_controladores"
            return "lucro_liquido"

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

    s = s.replace("\ufffd", "").replace("", "")

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

    # 31 Canonical CVM Sectors
    if "agricultura" in s_clean or "cana" in s_clean:
        return "Agricultura (Açúcar, Álcool e Cana)"
    if "bebida" in s_clean or "alimento" in s_clean or "fumo" in s_clean or "frigorifico" in s_clean:
        return "Alimentos e Bebidas"
    if "arrendamento" in s_clean:
        return "Arrendamento Mercantil"
    if "banco" in s_clean:
        return "Bancos"
    if "bolsa" in s_clean or "mercado de capitais" in s_clean:
        return "Bolsas de Valores / Mercado de Capitais"
    if "brinquedo" in s_clean or "lazer" in s_clean:
        return "Brinquedos e Lazer"
    if "comunicacao" in s_clean or "informatica" in s_clean:
        return "Comunicação e Informática"
    if "comercio" in s_clean or "atacado" in s_clean or "varejo" in s_clean or "lojas" in s_clean:
        return "Comércio (Atacado e Varejo)"
    if "construcao" in s_clean or "imobiliario" in s_clean or "incorporacao" in s_clean or "mat. const" in s_clean:
        return "Construção Civil e Imobiliário"
    if "credito imobiliario" in s_clean:
        return "Crédito Imobiliário"
    if "educacao" in s_clean or "ensino" in s_clean:
        return "Educação"
    if "embalagens" in s_clean or "embalagem" in s_clean:
        return "Embalagens"
    if "energia" in s_clean or "eletrica" in s_clean:
        return "Energia Elétrica"
    if "extracao mineral" in s_clean:
        return "Extração Mineral"
    if "farmac" in s_clean or "drogaria" in s_clean or "higiene" in s_clean or "medicamento" in s_clean:
        return "Farmacêutico e Higiene"
    if "hospedagem" in s_clean or "turismo" in s_clean or "hotel" in s_clean:
        return "Hospedagem e Turismo"
    if "intermediacao" in s_clean or "financeira" in s_clean:
        return "Intermediação Financeira"
    if "aeroespacial" in s_clean or "aeronaut" in s_clean or "material de transporte" in s_clean or "aviacao" in s_clean:
        return "Material de Transporte / Aeroespacial"
    if "metalurgia" in s_clean or "siderurgia" in s_clean:
        return "Metalurgia e Siderurgia"
    if "maquina" in s_clean or "equipamento" in s_clean or "motores" in s_clean or "veic" in s_clean or "pecas" in s_clean:
        return "Máquinas, Equipamentos, Veículos e Peças"
    if "papel" in s_clean or "celulose" in s_clean or "madeira" in s_clean:
        return "Papel e Celulose"
    if "petroquimico" in s_clean or "borracha" in s_clean:
        return "Petroquímicos e Borracha"
    if "petroleo" in s_clean or "gas" in s_clean or "combustivel" in s_clean:
        return "Petróleo e Gás"
    if "reflorestamento" in s_clean:
        return "Reflorestamento"
    if "saneamento" in s_clean or "agua" in s_clean or "esgoto" in s_clean:
        return "Saneamento, Água e Serviços Básicos"
    if "securitizacao" in s_clean:
        return "Securitização de Recebíveis"
    if "segurador" in s_clean or "corretora" in s_clean or "previdencia" in s_clean:
        return "Seguradoras e Corretoras"
    if "sem setor" in s_clean:
        return "Sem Setor Principal"
    if "medico" in s_clean or "hospital" in s_clean or "saude" in s_clean or "diagnostico" in s_clean:
        return "Serviços Médicos e Hospitalares"
    if "transporte" in s_clean or "logistica" in s_clean or "locacao" in s_clean:
        return "Serviços de Transporte e Logística"
    if "telecom" in s_clean or "telefonia" in s_clean:
        return "Telecomunicações"
    if "textil" in s_clean or "vestuario" in s_clean:
        return "Têxtil e Vestuário"

    return s if s else "Sem Setor Principal"

CVM_CANONICAL_SECTORS = [
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


