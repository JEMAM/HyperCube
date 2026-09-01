---
name: dynamic-dag-builder
description: Dynamic DAG Builder skill for constructing Directed Acyclic Graphs for any DRE (Income Statement) or DFC (Cash Flow) schema across all sectors.
---

# Skill: Dynamic DAG Builder

Constructs and validates Directed Acyclic Graphs (DAGs) for any financial statement structure.

## Supported DAG Schemas

1. **DRE Comercial / Varejo**:
   - `receita_operacional_liquida` + `custo_mercadorias_servicos` ➔ `lucro_bruto`
   - `lucro_bruto` + `despesas_vendas` + `despesas_gerais_adm` + `outras_despesas_op` ➔ `resultado_operacional_ebit`
   - `receitas_financeiras` + `despesas_financeiras` ➔ `resultado_financeiro`
   - `resultado_operacional_ebit` + `resultado_financeiro` ➔ `resultado_antes_tributos_ebt`
   - `resultado_antes_tributos_ebt` + `tributos_imposto_renda` ➔ `lucro_liquido`

2. **DRE Industrial**:
   - `receita_bruta` - `deducoes_impostos` ➔ `receita_liquida`
   - `receita_liquida` - `custo_produtos_vendidos` ➔ `lucro_bruto`
   - `lucro_bruto` - `despesas_operacionais` ➔ `ebit`

3. **DRE de Serviços / SaaS**:
   - `receita_assinaturas_mrr` + `receita_servicos_profissionais` ➔ `receita_liquida_total`
   - `receita_liquida_total` - `custo_servicos_prestados` ➔ `lucro_bruto`

4. **DRE Financeira / Institucional**:
   - `receita_operacoes` + `despesas_captacao` ➔ `produto_intermediacao`
   - `produto_intermediacao` + `provisao_risco` ➔ `resultado_intermediacao`
