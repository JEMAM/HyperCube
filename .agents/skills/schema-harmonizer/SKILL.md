---
name: schema-harmonizer
description: Harmoniza e padroniza dados financeiros e contábeis de múltiplas fontes heterogêneas (Excel, CSV, PDF, ERPs) com diferentes nomenclaturas, layouts, formatos numéricos e convenções de sinal para um esquema canônico unificado.
---

# Skill: Schema Harmonizer (Padronizador Semântico Multi-Fontes)

Especialista em **ingestão, normalização semântica e harmonização de dados** provenientes de fontes heterogêneas (planilhas Excel de diferentes departamentos, CSVs bancários, relatórios contábeis em PDF e exportações de ERPs).

---

## 🎯 Capacidades Principais

### 1. Mapeamento Semântico "De / Para" (Ontologia Contábil/Financeira)
Mapeia automaticamente sinônimos, abreviações e jargões operacionais de diversas áreas para um **Modelo Canônico**:

| Conta Canônica | Sinônimos / Variações Típicas Encontradas | Área de Origem |
| :--- | :--- | :--- |
| `receita_bruta` | `"Vendas Totais"`, `"Gross Sales"`, `"FAT_BRUTO"`, `"Vl_Faturamento"`, `"Receita_Operacional_Bruta"` | Comercial / Vendas |
| `deducoes_receita` | `"Devoluções"`, `"Impostos s/ Vendas"`, `"DED_REC"`, `"Abatimentos"`, `"ICMS_PIS_COFINS"` | Fiscal / Tributário |
| `receita_liquida` | `"Rec_Liq"`, `"Net Revenue"`, `"Faturamento Líquido"`, `"Receita Operacional Líquida"` | Controladoria |
| `custos_operacionais` | `"CPV"`, `"CMV"`, `"CSP"`, `"COGS"`, `"Custos de Produção"`, `"Custo Mercadorias"` | Operações / Fábrica |
| `despesas_vendas_sga`| `"Comissões"`, `"Fretes"`, `"Mkt / Propaganda"`, `"Desp_Comerciais"`, `"Selling Exp"` | Comercial / Marketing |
| `despesas_adm_rh` | `"Salários / Encargos"`, `"Folha de Pagamento"`, `"G&A"`, `"Despesas Administrativas"` | RH / Administrativo |
| `resultado_financeiro` | `"Juros Pagos"`, `"Variação Cambial"`, `"Rendimentos Aplic"`, `"Desp_Financ_Liq"` | Tesouraria / Finanças |
| `lucro_liquido` | `"Resultado Líquido"`, `"Net Income"`, `"Resultado do Período"`, `"Lucro / Prejuízo"` | Contabilidade |

---

### 2. Normalização Numérica e Convenção de Sinais
Trata inconsistências de formatação que geram erros de cálculo:
- **Convenção de Sinal**: Identifica se custos/despesas foram lançados como números positivos (ex: `150.000` em coluna de débitos) ou negativos (`-150.000`), convertendo para a convenção canônica do DAG.
- **Formatação Regional**: Converte padrão brasileiro (`R$ 1.250.500,50` ou `(50.000,00)`) e padrão internacional (`$1,250,500.50` ou `-50000.00`) para ponto flutuante IEEE 754.
- **Períodos e Granularidade**: Padroniza chaves temporais (`1T24`, `1Q2024`, `03/2024`, `2024-03-31`, `Jan-Mar/24`) para o formato ISO `YYYY-MM` ou `YYYY-Q#`.

---

### 3. Pipeline de Execução (Passo a Passo)

1. **Inspeção de Metadados e Amostragem**:
   - Lê os cabeçalhos das abas/arquivos e uma amostra de 5 a 10 linhas.
   - Identifica a granularidade (diária, mensal, trimestral ou anual) e a moeda/unidade (R$, R$ mil, R$ milhões).
2. **Geração do Dicionário "De/Para"**:
   - Cria o mapeamento das colunas originais para as contas canônicas.
   - Registra o nível de confiança do mapeamento (Ex: `"FAT_BRUTO"` ➔ `receita_bruta` com confiança 99%).
3. **Conversão e Higienização**:
   - Limpa caracteres especiais, remove linhas de cabeçalho duplo/mesclado e rodapés de soma.
4. **Exportação Canônica**:
   - Gera um dataset unificado estruturado em Parquet, DuckDB ou Polars DataFrame pronto para consumo pelo motor de cálculo ou pelo Agente Auditor.

---

## 🛠️ Padrão de Saída Canônica

```json
{
  "origem_arquivo": "Vendas_Comercial_2024_v2.xlsx",
  "aba": "Consolidado_Regional",
  "unidade": "BRL",
  "fator_escala": 1.0,
  "mapeamento_realizado": [
    {"coluna_origem": "Vl_Fat_Bruto", "conta_canonica": "receita_bruta", "confianca": 0.98},
    {"coluna_origem": "Devolucoes_Totais", "conta_canonica": "deducoes_receita", "confianca": 0.95},
    {"coluna_origem": "Período_Ref", "campo_temporal": "periodo_iso", "formato_detectado": "MM/YYYY"}
  ],
  "linhas_processadas": 240,
  "status": "HARMONIZADO_COM_SUCESSO"
}
```
