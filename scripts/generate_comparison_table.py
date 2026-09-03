import json
from backend.app.cvm.analysis import cvm_analyzer

# CVM Watch data
cvm_data = cvm_analyzer.get_company_analysis(23310)

# Extract CVM Watch values for 2024 and 2025
ts_2024 = next(ts for ts in cvm_data["time_series"] if ts["period"] == "2024-12-31")
ts_2025 = next(ts for ts in cvm_data["time_series"] if ts["period"] == "2025-12-31")

# Real Audited Figures from PDF "cvc_2024-2025.pdf" (in R$ Millions, converted from R$ Thousands)
# Page 20 - DRE Consolidado:
# Receita líquida: 2025: 1.488.493 mil = 1488.49 Mi | 2024: 1.420.763 mil = 1420.76 Mi
# Custo serviços: 2025: -42.699 mil = -42.70 Mi | 2024: -105.947 mil = -105.95 Mi
# Lucro bruto: 2025: 1.445.794 mil = 1445.79 Mi | 2024: 1.314.816 mil = 1314.82 Mi
# Desp. vendas: 2025: -288.500 mil = -288.50 Mi | 2024: -253.824 mil = -253.82 Mi
# Desp. G&A: 2025: -975.982 mil = -975.98 Mi | 2024: -963.863 mil = -963.86 Mi
# Outras rec/desp op: 2025: +93.945 mil = +93.95 Mi | 2024: -6.314 mil = -6.31 Mi
# Lucro antes res financeiro (EBIT): 2025: 275.257 mil = 275.26 Mi | 2024: 90.815 mil = 90.82 Mi
# Res financeiro liq: 2025: -275.981 mil = -275.98 Mi | 2024: -174.182 mil = -174.18 Mi
# LAIR (EBT): 2025: -724 mil = -0.72 Mi | 2024: -83.367 mil = -83.37 Mi
# IR/CSLL: 2025: -40.211 mil = -40.21 Mi | 2024: -19.974 mil = -19.97 Mi
# Lucro / Prejuízo Líquido: 2025: -40.935 mil = -40.94 Mi | 2024: -103.341 mil = -103.34 Mi

# Balanço Patrimonial Consolidado (R$ Millions):
# Ativo Circulante: 2025: 2177.66 Mi | 2024: 2226.99 Mi
# Ativo Não Circulante: 2025: 1561.22 Mi | 2024: 1613.66 Mi
# Ativo Total: 2025: 3738.89 Mi | 2024: 3840.65 Mi
# Passivo Circulante: 2025: 2807.31 Mi | 2024: 2531.69 Mi
# Passivo Não Circulante: 2025: 452.78 Mi | 2024: 777.33 Mi
# Passivo Total: 2025: 3260.09 Mi | 2024: 3309.02 Mi
# Patrimônio Líquido: 2025: 478.79 Mi | 2024: 531.63 Mi

# DFC Consolidado (R$ Millions):
# FCO (Operacional): 2025: +351.41 Mi | 2024: +382.45 Mi
# FCI (Investimentos): 2025: -121.78 Mi | 2024: -86.64 Mi
# FCF (Financiamento): 2025: -321.70 Mi | 2024: -410.22 Mi
# Variação Cambial de Caixa: 2025: -21.44 Mi | 2024: +31.82 Mi
# Variação Líquida de Caixa: 2025: -113.51 Mi | 2024: -82.60 Mi
# Saldo Final de Caixa: 2025: 286.73 Mi | 2024: 400.23 Mi

comparison = {
    "dre": [
        {
            "rubrica": "Receita Líquida de Vendas",
            "pdf_2024": 1420.76, "cvm_2024": ts_2024["receita_liquida"],
            "pdf_2025": 1488.49, "cvm_2025": ts_2025["receita_liquida"]
        },
        {
            "rubrica": "Custo dos Serviços / CPV",
            "pdf_2024": -105.95, "cvm_2024": ts_2024["custo_bens_servicos"],
            "pdf_2025": -42.70, "cvm_2025": ts_2025["custo_bens_servicos"]
        },
        {
            "rubrica": "Lucro Bruto",
            "pdf_2024": 1314.82, "cvm_2024": ts_2024["lucro_bruto"],
            "pdf_2025": 1445.79, "cvm_2025": ts_2025["lucro_bruto"]
        },
        {
            "rubrica": "Despesas com Vendas",
            "pdf_2024": -253.82, "cvm_2024": next(a["vl_conta"] for a in ts_2024["raw_accounts"] if a["conta_canonical"] == "despesas_vendas"),
            "pdf_2025": -288.50, "cvm_2025": next(a["vl_conta"] for a in ts_2025["raw_accounts"] if a["conta_canonical"] == "despesas_vendas")
        },
        {
            "rubrica": "Despesas Gerais e Administrativas (G&A)",
            "pdf_2024": -963.86, "cvm_2024": next(a["vl_conta"] for a in ts_2024["raw_accounts"] if a["conta_canonical"] == "despesas_gerais_adm"),
            "pdf_2025": -975.98, "cvm_2025": next(a["vl_conta"] for a in ts_2025["raw_accounts"] if a["conta_canonical"] == "despesas_gerais_adm")
        },
        {
            "rubrica": "Outras Receitas/Despesas Operacionais",
            "pdf_2024": -6.31, "cvm_2024": next(a["vl_conta"] for a in ts_2024["raw_accounts"] if a["conta_canonical"] == "outras_receitas_op"),
            "pdf_2025": 93.95, "cvm_2025": next(a["vl_conta"] for a in ts_2025["raw_accounts"] if a["conta_canonical"] == "outras_receitas_op")
        },
        {
            "rubrica": "EBIT (Lucro Antes do Res. Financeiro)",
            "pdf_2024": 90.82, "cvm_2024": ts_2024["resultado_ebit"],
            "pdf_2025": 275.26, "cvm_2025": ts_2025["resultado_ebit"]
        },
        {
            "rubrica": "Resultado Financeiro Líquido",
            "pdf_2024": -174.18, "cvm_2024": next(a["vl_conta"] for a in ts_2024["raw_accounts"] if a["conta_canonical"] == "resultado_financeiro"),
            "pdf_2025": -275.98, "cvm_2025": next(a["vl_conta"] for a in ts_2025["raw_accounts"] if a["conta_canonical"] == "resultado_financeiro")
        },
        {
            "rubrica": "Resultado Antes dos Tributos (LAIR / EBT)",
            "pdf_2024": -83.37, "cvm_2024": next(a["vl_conta"] for a in ts_2024["raw_accounts"] if a["conta_canonical"] == "resultado_antes_tributos"),
            "pdf_2025": -0.72, "cvm_2025": next(a["vl_conta"] for a in ts_2025["raw_accounts"] if a["conta_canonical"] == "resultado_antes_tributos")
        },
        {
            "rubrica": "Imposto de Renda e Contribuição Social",
            "pdf_2024": -19.97, "cvm_2024": next(a["vl_conta"] for a in ts_2024["raw_accounts"] if a["conta_canonical"] == "imposto_renda_contribuicao"),
            "pdf_2025": -40.21, "cvm_2025": next(a["vl_conta"] for a in ts_2025["raw_accounts"] if a["conta_canonical"] == "imposto_renda_contribuicao")
        },
        {
            "rubrica": "Lucro / (Prejuízo) Líquido do Exercício",
            "pdf_2024": -103.34, "cvm_2024": ts_2024["lucro_liquido"],
            "pdf_2025": -40.94, "cvm_2025": ts_2025["lucro_liquido"]
        }
    ]
}

print(json.dumps(comparison, indent=2, ensure_ascii=False))
