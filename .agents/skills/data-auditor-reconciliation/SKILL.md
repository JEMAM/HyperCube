---
name: data-auditor-reconciliation
description: Auditoria de integridade contábil, verificação de consistência matemática em DAGs e conciliação cruzada (cross-reconciliation) entre bases financeiras e planilhas de diferentes departamentos.
---

# Skill: Data Auditor & Reconciliation (Auditor & Conciliador de Dados)

Especialista em **auditoria de dados financeiros, verificação de consistência contábil e conciliação cruzada** entre relatórios gerados por diferentes departamentos (ex: Comercial vs. Controladoria vs. Tesouraria vs. Contabilidade).

---

## 🎯 Capacidades Principais

### 1. Reconciliação Cruzada Intersetorial (*Cross-Reconciliation*)
Compara as fontes de dados para encontrar discrepâncias de fechamento:

* **Vendas (Comercial) $\leftrightarrow$ Faturamento (Fiscal/Controladoria)**:
  * Checa se o total faturado no sistema de vendas coincide com a `Receita Bruta` apurada pela Controladoria.
* **Folha de Pagamento (RH) $\leftrightarrow$ Despesas de Pessoal (DRE/Contábil)**:
  * Valida se o custo total de pessoal (salários + encargos + benefícios) bate com a linha `Despesas com Pessoal`.
* **Fluxo de Caixa (Tesouraria/Extratos) $\leftrightarrow$ DRE (Competência)**:
  * Identifica descasamentos de prazos médios de recebimento/pagamento e checa a conciliação do `EBITDA` com o `Fluxo de Caixa Operacional (FCO)`.

---

### 2. Validação Algébrica e Integridade de DAG
Audita se as regras contábeis e matemáticas estão 100% corretas em cada período:

$$\text{Receita Líquida} \stackrel{?}{=} \text{Receita Bruta} - \text{Deduções}$$
$$\text{Lucro Bruto} \stackrel{?}{=} \text{Receita Líquida} - \text{Custos (CMV/CPV/CSP)}$$
$$\text{EBITDA} \stackrel{?}{=} \text{EBIT} + \text{Depreciação} + \text{Amortização}$$
$$\text{Lucro Líquido} \stackrel{?}{=} \text{EBT} - \text{Impostos (IRPJ/CSLL)} - \text{Participações}$$

* Identifica erros comuns de planilhas: células com fórmulas sobrescritas por valores estáticos (*hardcoded numbers*), linhas esquecidas na soma ou referências circulares.

---

### 3. Detecção de Outliers e Anomalias Temporais
* **Variação Brusca (QoQ / YoY)**: Dispara alerta se uma conta variar mais de $3\sigma$ (três desvios-padrão) sem histórico sazonal justificável.
* **Inversão Inesperada de Sinal**: Ex: Conta de *Despesas Gerais* apresentando saldo positivo (receita) ou *Receita de Vendas* negativa sem devoluções correspondentes.
* **Buracos de Dados / Lacunas Temporais**: Identifica meses/trimestres ausentes ou períodos com valores nulos/zerados.

---

### 4. Scorecard de Auditoria & Relatório de Parecer

Gera um parecer estruturado para a diretoria:

```markdown
### 📋 Scorecard de Conciliação e Auditoria

| Teste / Regra de Auditoria | Status | Discrepância / Delta | Parecer |
| :--- | :---: | :---: | :--- |
| **Identidade DRE (Receita Líquida)** | 🟢 100% | R$ 0,00 | Fórmula perfeita em todos os 24 meses. |
| **Batimento Vendas vs. Faturamento** | 🟡 99.4% | R$ -14.250,00 | Pequena divergência em 08/2024 (devolução não baixada no Comercial). |
| **RH Folha vs. DRE Despesas Pessoal** | 🟢 100% | R$ 0,00 | Totalmente conciliado. |
| **Consistência do Lucro Líquido** | 🔴 94.2% | R$ +180.000,00 | 1T2024 com crédito tributário lançado fora do DAG padrão. |

**Nível de Confiança Geral da Base**: 🟡 **97.8% (Aprovado com Ressalvas)**
```

---

## 🛠️ Critérios de Classificação

* 🟢 **CONCILIADO**: Discrepância $= 0\%$ ou dentro da tolerância de arredondamento de centavos ($< R\$ 0,05$).
* 🟡 **ALERTA LEVE**: Discrepância $< 1\%$, geralmente explicada por efeitos de corte contábil (*cut-off*) ou divergência de frete/devolução.
* 🔴 **CRÍTICO / INCONSISTENTE**: Discrepância $\ge 1\%$ ou quebra de identidade contábil que inviabiliza simulações financeiras sem correção prévia.
