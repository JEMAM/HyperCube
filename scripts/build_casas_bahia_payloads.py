import json

# Casas Bahia 4T25 & 2025 Canonical Datasets extracted from casa_bahia_4T25.pdf
casas_bahia_data = {
    "active_company": {
        "id": "casas_bahia",
        "name": "Grupo Casas Bahia S.A.",
        "ticker": "BHIA3",
        "sector": "Varejo & E-commerce Omnicanal",
        "currency": "BRL",
        "last_closing_price": 3.42,
        "market_cap": 3248000000.0,
        "enterprise_value": 4210000000.0,
        "shares_outstanding": 950000000,
        "description": "Demonstrações Financeiras Oficiais 4T25 e Fechamento 2025 do Grupo Casas Bahia S.A. (BHIA3). Redução de 75% da dívida líquida, alavancagem de 0,4x EBITDA e R$ 1,8 bilhão em fluxo de caixa livre gerado."
    },
    "statement_dre": {
        "company_id": "casas_bahia",
        "company_name": "Grupo Casas Bahia S.A.",
        "period": "4T25 e Exercício 2025",
        "rows": [
            {"code": "3.01", "name": "Receita Bruta de Vendas", "quarter": 10141.0, "annual": 34798.0, "level": 1, "is_total": True},
            {"code": "3.01.01", "name": "(-) Deduções e Impostos sobre Vendas", "quarter": -1670.0, "annual": -5601.0, "level": 2, "is_total": False},
            {"code": "3.02", "name": "(=) Receita Operacional Líquida", "quarter": 8471.0, "annual": 29197.0, "level": 1, "is_total": True},
            {"code": "3.03", "name": "(-) Custo das Mercadorias Vendidas (CMV)", "quarter": -5745.0, "annual": -20075.0, "level": 2, "is_total": False},
            {"code": "3.03.01", "name": "(-) Depreciação Logística", "quarter": -55.0, "annual": -213.0, "level": 2, "is_total": False},
            {"code": "3.04", "name": "(=) Lucro Bruto (Margem: 31,5%)", "quarter": 2671.0, "annual": 8909.0, "level": 1, "is_total": True},
            {"code": "3.05", "name": "(-) Despesas com Vendas", "quarter": -1623.0, "annual": -5509.0, "level": 2, "is_total": False},
            {"code": "3.06", "name": "(-) Despesas Gerais e Administrativas (G&A)", "quarter": -283.0, "annual": -1124.0, "level": 2, "is_total": False},
            {"code": "3.07", "name": "(+) Resultado de Equivalência Patrimonial", "quarter": 6.0, "annual": 66.0, "level": 2, "is_total": False},
            {"code": "3.08", "name": "(-) Outras Despesas Operacionais Líquidas", "quarter": -57.0, "annual": -175.0, "level": 2, "is_total": False},
            {"code": "3.09", "name": "(=) Despesas Operacionais Totais", "quarter": -1957.0, "annual": -6742.0, "level": 1, "is_total": True},
            {"code": "3.10", "name": "(=) EBIT - Lucro Antes dos Juros e Tributos", "quarter": 491.0, "annual": 1343.0, "level": 1, "is_total": True},
            {"code": "3.11", "name": "(+) Depreciação e Amortização Total", "quarter": 278.0, "annual": 1037.0, "level": 2, "is_total": False},
            {"code": "3.12", "name": "(=) EBITDA Ajustado (Margem: 9,8%)", "quarter": 826.0, "annual": 2555.0, "level": 1, "is_total": True},
            {"code": "3.13", "name": "(+) Receitas Financeiras", "quarter": 165.0, "annual": 539.0, "level": 2, "is_total": False},
            {"code": "3.14", "name": "(-) Despesas Financeiras", "quarter": -722.0, "annual": -4226.0, "level": 2, "is_total": False},
            {"code": "3.15", "name": "(=) Resultado Financeiro Líquido", "quarter": -557.0, "annual": -3687.0, "level": 1, "is_total": True},
            {"code": "3.16", "name": "(=) Resultado Antes dos Tributos (LAIR)", "quarter": -66.0, "annual": -2344.0, "level": 1, "is_total": True},
            {"code": "3.17", "name": "(-) Imposto de Renda e Contribuição Social Diferidos", "quarter": -1463.0, "annual": -644.0, "level": 2, "is_total": False},
            {"code": "3.18", "name": "(=) Lucro / Prejuízo Líquido Consolidado", "quarter": -1529.0, "annual": -2988.0, "level": 1, "is_total": True}
        ]
    },
    "statement_bp": {
        "company_id": "casas_bahia",
        "company_name": "Grupo Casas Bahia S.A.",
        "period": "31/12/2025",
        "rows": [
            {"code": "1", "name": "ATIVO TOTAL", "valor": 33638.0, "level": 1, "is_total": True},
            {"code": "1.01", "name": "Ativo Circulante", "valor": 14403.0, "level": 2, "is_total": True},
            {"code": "1.01.01", "name": "Caixa e Equivalentes de Caixa", "valor": 1225.0, "level": 3, "is_total": False},
            {"code": "1.01.02", "name": "Contas a Receber & Cartões de Crédito", "valor": 5060.0, "level": 3, "is_total": False},
            {"code": "1.01.03", "name": "Estoques Operacionais", "valor": 5036.0, "level": 3, "is_total": False},
            {"code": "1.01.04", "name": "Tributos a Recuperar e Outros", "valor": 3082.0, "level": 3, "is_total": False},
            {"code": "1.02", "name": "Ativo Não Circulante", "valor": 19235.0, "level": 2, "is_total": True},
            {"code": "1.02.01", "name": "Realizável a Longo Prazo", "valor": 13113.0, "level": 3, "is_total": False},
            {"code": "1.02.02", "name": "Ativo de Direito de Uso (Arrendamento)", "valor": 2224.0, "level": 3, "is_total": False},
            {"code": "1.02.03", "name": "Imobilizado", "valor": 1223.0, "level": 3, "is_total": False},
            {"code": "1.02.04", "name": "Intangível e Ágio", "valor": 2659.0, "level": 3, "is_total": False},
            {"code": "2", "name": "PASSIVO E PATRIMÔNIO LÍQUIDO", "valor": 33638.0, "level": 1, "is_total": True},
            {"code": "2.01", "name": "Passivo Circulante", "valor": 21822.0, "level": 2, "is_total": True},
            {"code": "2.01.01", "name": "Fornecedores e Risco Sacado", "valor": 10850.0, "level": 3, "is_total": False},
            {"code": "2.01.02", "name": "Financiamento ao Consumidor (CDCI)", "valor": 4879.0, "level": 3, "is_total": False},
            {"code": "2.01.03", "name": "Empréstimos e Financiamentos CP", "valor": 734.0, "level": 3, "is_total": False},
            {"code": "2.01.04", "name": "Obrigações Trabalhistas, Fiscais e Outras", "valor": 5359.0, "level": 3, "is_total": False},
            {"code": "2.02", "name": "Passivo Não Circulante", "valor": 9042.0, "level": 2, "is_total": True},
            {"code": "2.02.01", "name": "Empréstimos e Financiamentos LP (Reestruturados)", "valor": 272.0, "level": 3, "is_total": False},
            {"code": "2.02.02", "name": "Passivo de Arrendamento LP", "valor": 2434.0, "level": 3, "is_total": False},
            {"code": "2.02.03", "name": "FIDC Cotas Seniores e Provisões Judiciais", "valor": 3573.0, "level": 3, "is_total": False},
            {"code": "2.02.04", "name": "Receitas Diferidas e Outros LP", "valor": 2763.0, "level": 3, "is_total": False},
            {"code": "2.03", "name": "Patrimônio Líquido Consolidado", "valor": 2774.0, "level": 2, "is_total": True}
        ]
    },
    "statement_dfc": {
        "company_id": "casas_bahia",
        "company_name": "Grupo Casas Bahia S.A.",
        "period": "Exercício 2025",
        "rows": [
            {"code": "6.01", "name": "Caixa Líquido das Atividades Operacionais (FCO)", "valor": 15129.0, "is_total": True},
            {"code": "6.02", "name": "Caixa Líquido das Atividades de Investimento (FCI)", "valor": -254.0, "is_total": True},
            {"code": "6.03", "name": "Caixa Líquido das Atividades de Financiamento (FCF)", "valor": -15781.0, "is_total": True},
            {"code": "6.04", "name": "Variação Líquida de Caixa e Equivalentes", "valor": -906.0, "is_total": True},
            {"code": "6.05", "name": "Saldo Inicial de Caixa e Equivalentes", "valor": 2131.0, "is_total": False},
            {"code": "6.06", "name": "Saldo Final de Caixa e Equivalentes", "valor": 1225.0, "is_total": True}
        ]
    },
    "governance_covenants": {
        "company_id": "casas_bahia",
        "company_name": "Grupo Casas Bahia S.A.",
        "as_of_date": "31/12/2025",
        "covenants": [
            {
                "name": "Dívida Líquida / EBITDA Ajustado",
                "target": "≤ 2.00x",
                "current": "0.40x",
                "status": "COMPLIANT",
                "margin": "+1.60x de folga contratual (Dívida líquida caiu 75%)",
                "risk_level": "LOW"
            },
            {
                "name": "Índice de Cobertura de Juros (EBITDA / Juros)",
                "target": "≥ 1.50x",
                "current": "2.34x",
                "status": "COMPLIANT",
                "margin": "+0.84x acima do gatilho mínimo",
                "risk_level": "LOW"
            },
            {
                "name": "Fluxo de Caixa Livre Mínimo",
                "target": "≥ R$ 500 Mi",
                "current": "R$ 1.800 Mi",
                "status": "COMPLIANT",
                "margin": "+R$ 1.300 Mi de geração excedente",
                "risk_level": "LOW"
            },
            {
                "name": "Índice de Liquidez Corrente",
                "target": "≥ 0.65",
                "current": "0.66",
                "status": "MONITORING",
                "margin": "Equilibrado após renegociação do reperfilamento",
                "risk_level": "MEDIUM"
            }
        ],
        "summary": {
            "total_covenants": 4,
            "compliant_count": 3,
            "warning_count": 1,
            "breach_count": 0,
            "overall_status": "REGULAR - Estrutura de capital saneada no 4T25."
        }
    },
    "valuation_casas_bahia": {
        "company_name": "Grupo Casas Bahia S.A. (BHIA3)",
        "share_price": 3.42,
        "shares_outstanding": 950000000,
        "market_cap": 3249000000.0,
        "net_debt": 1022000000.0,
        "enterprise_value": 4271000000.0,
        "wacc": 14.85,
        "cost_of_equity": 16.50,
        "cost_of_debt": 11.20,
        "perpetual_growth": 3.5,
        "dcf_fair_value_per_share": 4.85,
        "upside_pct": 41.8,
        "ev_ebitda_multiple": 5.17,
        "ebitda_run_rate": 826.0
    }
}

with open('frontend/app/api/canonical_payloads.json', 'r', encoding='utf-8') as f:
    payloads = json.load(f)

payloads['casas_bahia'] = casas_bahia_data
payloads['active_company_casas_bahia'] = casas_bahia_data['active_company']

with open('frontend/app/api/canonical_payloads.json', 'w', encoding='utf-8') as f:
    json.dump(payloads, f, indent=2, ensure_ascii=False)

print('Casas Bahia canonical payloads generated and saved!')
