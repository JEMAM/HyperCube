# Ponto de Retorno: Etapa 2 — O Triângulo Contábil Fechado (Closed-Loop 3-Statement Model & Fleuriet)

**Data do Checkpoint:** 01 de Setembro de 2026  
**Versão do Motor:** HyperCube 3-Statement Engine v2.0  
**Status dos Testes:** 48/48 Testes Unitários e de Integração Aprovados (`pytest`)  
**Status do Frontend:** Compilação de Produção Next.js 15 Aprovada (`npm run build`)  

---

## 1. Visão Geral da Arquitetura Contábil Causal

A **Etapa 2** estabelece a integração causal contínua e sem circularidade entre as três demonstrações financeiras fundamentais (**DRE**, **DFC** e **Balanço Patrimonial**), eliminando o gargalo clássico de modelagem financeira: a perda de integridade patrimonial durante simulações dinâmicas de direcionadores operacionais.

```mermaid
graph TD
    subgraph DRE [Demonstração do Resultado do Exercício]
        REC[Receita Líquida] --> LB[Lucro Bruto]
        LB --> EBITDA[EBITDA Ajustado]
        EBITDA --> EBIT[EBIT / LAJIR]
        EBIT --> EBT[Lucro Antes dos Tributos]
        EBT --> LL[Lucro Líquido do Exercício]
    end

    subgraph DFC [Demonstração dos Fluxos de Caixa - Método Indireto]
        LL --> FCO_INI[Lucro Líquido]
        DA[Depreciação & Amortização] --> FCO[Fluxo de Caixa Operacional]
        VAR_GIRO[Variação Contas a Receber, Estoques, Fornecedores] --> FCO
        FCO --> VAR_CAIXA[Variação Líquida de Caixa]
        FCI[FCI: Investimentos Capex] --> VAR_CAIXA
        FCF[FCF: Dívida & Dividendos] --> VAR_CAIXA
    end

    subgraph BP [Balanço Patrimonial - Equilíbrio Estrito]
        VAR_CAIXA --> CX_FIM[(=) Caixa & Equivalentes]
        CX_FIM --> AC[Ativo Circulante]
        ANC[Ativo Não Circulante / Imobilizado] --> AT[ATIVO TOTAL]
        AC --> AT
        
        LL --> RETENCAO[Lucro Líquido (-) Dividendos]
        RETENCAO --> LUCROS_ACUM[Lucros Acumulados]
        LUCROS_ACUM --> PL[Patrimônio Líquido]
        PC[Passivo Circulante] --> PASSIVO_TOT[Passivo Total + PL]
        PNC[Passivo Não Circulante] --> PASSIVO_TOT
        PL --> PASSIVO_TOT
    end

    subgraph FLEURIET [Modelo Fleuriet & Capital de Giro]
        ACO[Ativo Circulante Operacional]
        PCO[Passivo Circulante Operacional]
        NCG[NCG = ACO - PCO]
        CDG[CDG = Passivo Permanente - Ativo Não Circulante]
        ST[Saldo de Tesouraria = CDG - NCG]
    end

    AT ---|Δ = R$ 0,00 Garantido| PASSIVO_TOT
```

---

## 2. Os 6 Pilares Implementados na Etapa 2

### 1. Tolerância Zero a Descasamentos Contábeis (Zero Delta Closed Loop)
* **Arquivo:** [`backend/app/engine/three_statement_engine.py`](file:///c:/Users/edumo/HyperCubo_final2/backend/app/engine/three_statement_engine.py)
* **Princípio:** Em todas as projeções históricas (2024, 2025) e cenários futuros simulados (Budget 2026), o balanço é fechado com exatidão matemática absoluta:
  $$\text{Ativo Total} - (\text{Passivo Total} + \text{Patrimônio Líquido}) \equiv \text{R\$} 0,00$$
* A variação líquida de caixa apurada na DFC reconcilia com precisão milimétrica a conta `Caixa e Equivalentes` do Ativo Circulante:
  $$\text{Caixa Final}_{t} = \text{Caixa Inicial}_{t} + \Delta \text{Caixa}_{\text{DFC}}$$

### 2. Modelo Fleuriet Dinâmico & Matriz das 6 Tipologias Clássicas
* **Arquivo:** [`backend/app/engine/three_statement_engine.py`](file:///c:/Users/edumo/HyperCubo_final2/backend/app/engine/three_statement_engine.py) e [`frontend/components/ThreeStatementIntegrator.tsx`](file:///c:/Users/edumo/HyperCubo_final2/frontend/components/ThreeStatementIntegrator.tsx)
* Reclassificação estrita dos balanços em contas operacionais (cíclicas) e financeiras (erráticas):
  * **ACO**: Contas a Receber + Estoques + Outros Ativos Circulantes
  * **PCO**: Fornecedores + Obrigações Fiscais/Trabalhistas + Outros Passivos Circulantes
  * **NCG (Necessidade de Capital de Giro)**: $ACO - PCO$
  * **CDG (Capital de Giro Próprio)**: $(PNC + PL) - ANC$
  * **ST (Saldo de Tesouraria)**: $CDG - NCG$
* Classificação automatizada entre as **6 Tipologias Canônicas de Fleuriet**:
  1. **Tipo 1 — Excelente**: $CDG > 0, NCG < 0, ST > 0$ (folga financeira estrutural máxima).
  2. **Tipo 2 — Sólida / Equilibrada**: $CDG > 0, NCG > 0, ST \ge 0$ (recursos de longo prazo cobrem o giro).
  3. **Tipo 3 — Insatisfatória**: $CDG > 0, NCG > 0, ST < 0$ (CDG insuficiente, dependência de dívida bancária CP).
  4. **Tipo 4 — Efeito Tesoura / Alto Risco**: $CDG \le 0, NCG > 0, ST < 0$ (Overtrading com dívida CP financiando imobilizado e giro).
  5. **Tipo 5 — Muito Ruim / Crítica**: $CDG \le 0, NCG \le 0, ST < 0$ (colapso de liquidez).
  6. **Tipo 6 — Atípica com Tesouraria Positiva**: $CDG \le 0, NCG \le 0, ST > 0$.

### 3. Sistema de Alerta Antecipado de Efeito Tesoura (Scissors Effect / Overtrading)
* Monitoramento contínuo dos indicadores:
  * **Grau de Dependência Bancária**: $\frac{\text{Empréstimos Curto Prazo}}{ACO} \times 100$
  * **ST sobre Receita Líquida**: $\frac{ST}{\text{Receita Líquida}} \times 100$
* Alerta executivo no painel caso a expansão acelerada de vendas consuma caixa operacional desproporcionalmente sem lastro de financiamento estável de longo prazo.

### 4. Decomposição DuPont de 3 Fatores (ROE & ROA)
* Decomposição causal das alavancas de retorno:
  $$\text{ROE} = \text{Margem Líquida} \times \text{Giro do Ativo} \times \text{Alavancagem Financeira}$$
  * **Margem Líquida (%)**: $\frac{\text{Lucro Líquido}}{\text{Receita Líquida}} \times 100$ (eficiência operacional e precificação)
  * **Giro do Ativo (x)**: $\frac{\text{Receita Líquida}}{\text{Ativo Total}}$ (produtividade dos ativos investidos)
  * **Alavancagem Financeira (x)**: $\frac{\text{Ativo Total}}{\text{Patrimônio Líquido}}$ (multiplicador de capital de terceiros)
  * **ROA (%)**: $\frac{\text{Lucro Líquido}}{\text{Ativo Total}} = \text{Margem Líquida} \times \text{Giro do Ativo}$

### 5. Ciclo Operacional e Ciclo Financeiro (Cash Conversion Cycle)
* Monitoramento dos direcionadores temporais de capital de giro:
  * **PMR (DSO)**: Prazo Médio de Recebimento de Clientes (dias)
  * **PME (DIO)**: Prazo Médio de Renovação de Estoques (dias)
  * **PMP (DPO)**: Prazo Médio de Pagamento a Fornecedores (dias)
  * **Ciclo Operacional**: $PMR + PME$
  * **Ciclo Financeiro / Ciclo de Caixa**: $PMR + PME - PMP$

### 6. Cascata Causal de Caixa (Waterfall Bridge de 12 Etapas)
* Reconciliação passo a passo entre o Lucro Líquido da DRE e o Caixa Final no Balanço:
  1. `Lucro Líquido` (DRE)
  2. `(+) Depreciação e Amortização` (Ajuste Não-Caixa)
  3. `(+/-) Variação em Contas a Receber` (Giro)
  4. `(+/-) Variação em Estoques` (Giro)
  5. `(+/-) Variação em Fornecedores` (Giro)
  6. `(=) Fluxo de Caixa Operacional (FCO)` (Subtotal DFC)
  7. `(-) Investimentos em Capex` (FCI)
  8. `(-) Dividendos e JCP Distribuídos` (FCF)
  9. `(+/-) Amortização Líquida de Dívida` (FCF)
  10. `(=) Variação Líquida de Caixa` (Total DFC)
  11. `(+) Saldo Inicial de Caixa` (Base BP)
  12. `(=) Caixa e Equivalentes Final` (BP)

---

## 3. Suporte Multi-Empresa Integrado

O motor 3-Statement suporta a seleção e simulação para **5 perfis setoriais calibrados**:

| Empresa | Ticker | Setor | Receita 2025 (R$ M) | Perfil Fleuriet |
| :--- | :--- | :--- | :--- | :--- |
| **Vale S.A.** | `VALE3` | Mineração & Metais Básicos | R$ 45.090 M | Tipo 2: Sólida / Equilibrada |
| **Petrobras S.A.** | `PETR4` | Petróleo, Gás & Biocombustíveis | R$ 524.300 M | Tipo 2: Sólida / Equilibrada |
| **Klabin S.A.** | `KLBN11` | Papel & Celulose / Florestal | R$ 20.697 M | Tipo 2: Sólida (Ciclo Longo) |
| **WEG S.A.** | `WEGE3` | Bens de Capital & Motores Elétricos | R$ 38.100 M | Tipo 1: Excelente / Caixa Líquido |
| **Banco do Brasil S.A.** | `BBAS3` | Intermediação Financeira & Bancos | R$ 106.200 M | Tipo 2: Sólida (Operações Crédito) |

---

## 4. Endpoints REST da API 3-Statement

* `GET /api/financials/3statement/model?company_id={vale|petrobras|klabin|weg|banco_do_brasil}`: Retorna o modelo triangular fechado completo, incluindo reconciliação, Fleuriet, DuPont e Cascata Causal.
* `POST /api/financials/3statement/simulate`: Simula os direcionadores operacionais (`growth_pct`, `pmr_dias`, `pme_dias`, `pmp_dias`, `capex_val`, `payout_pct`) com recálculo reativo instantâneo.
* `GET /api/financials/3statement/companies`: Lista os perfis de empresas disponíveis e a empresa ativa.

---

## 5. Mapeamento de Arquivos da Etapa 2

| Arquivo | Camada | Descrição |
| :--- | :--- | :--- |
| `backend/app/engine/three_statement_engine.py` | Backend Engine | Motor causal fechado DRE ↔ DFC ↔ BP, Fleuriet, DuPont e Bridge |
| `backend/app/api/three_statement_routes.py` | Backend API | Rotas REST FastAPI com suporte a multi-empresa e simulação |
| `backend/tests/test_three_statement.py` | Testes | 6 testes cobrindo reconciliação, Fleuriet, DuPont e multi-empresa |
| `frontend/components/ThreeStatementIntegrator.tsx` | Frontend UI | Interface executiva com 6 abas, seletor de empresa e exportação |
| `frontend/app/page.tsx` | Frontend Core | Roteamento do `viewMode === "THREE_STATEMENT"` |

---

## 6. Roteiro de Validação e Execução

### 1. Testes Automatizados Backend
```powershell
python -m pytest backend/tests/test_three_statement.py -v
```
*Resultado:* `6 passed in 0.05s`

```powershell
python -m pytest backend/tests
```
*Resultado:* `48 passed in ~7.3s`

### 2. Build de Produção do Frontend
```powershell
cd frontend
npm run build
```
*Resultado:* `✓ Compiled successfully` e `Generating static pages (6/6)`

### 3. Acesso à Interface
* Acesse `http://localhost:3000`
* Selecione no menu lateral a aba **"Loop DRE-DFC-BP"** (ou **"Triângulo Contábil"**)
* Explore as abas:
  1. **DRE**
  2. **DFC**
  3. **Balanço**
  4. **Fleuriet & Efeito Tesoura**
  5. **DuPont (ROE & ROA)**
  6. **Ponte Causal (Bridge DRE ↔ DFC ↔ BP)**
