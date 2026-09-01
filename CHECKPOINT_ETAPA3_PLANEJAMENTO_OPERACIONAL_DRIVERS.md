# Ponto de Retorno: Etapa 3 — Planejamento Operacional por Drivers (Headcount & Capex Automático)

**Data do Checkpoint:** 01 de Setembro de 2026  
**Versão do Motor:** HyperCube Operational Driver Planning Engine v3.0  
**Status dos Testes:** 57/57 Testes Unitários e de Integração Aprovados (`pytest`)  
**Status do Frontend:** Compilação de Produção Next.js 15 Aprovada (`npm run build`)  

---

## 1. Visão Geral da Arquitetura Causal da Etapa 3

A **Etapa 3** introduz o **Planejamento Baseado em Direcionadores Operacionais (Driver-Based Planning)**, permitindo que gestores, CFOs e analistas de FP&A modelem causalmente as duas maiores alavancas operacionais de qualquer companhia:
1. **Workforce Planning (Headcount, Folha Salarial & Encargos Sociais Brasileiros)**
2. **Capex & Depreciação Automática de Ativos (IFRS 16 / CPC 27)**

Todas as alterações nesses direcionadores propagam instantaneamente para o **Triângulo Contábil Fechado (DRE ↔ DFC ↔ Balanço Patrimonial)**, mantendo a garantia estrita de **Tolerância Zero a Descasamentos Contábeis ($\Delta = \text{R\$} 0,00$)**.

```mermaid
graph TD
    subgraph DRIVERS_INPUTS [Direcionadores Operacionais de Entrada]
        HC[Headcount Atual, Contratações, Turnover & Salários]
        CHARGES[Encargos Sociais: FGTS 8%, INSS 20%, RAT 8.8%, 13º/Férias 19.4%]
        BENEFITS[Benefícios Médios per Capita]
        CAPEX_PROJ[Carteira de Projetos Capex: Ativo, Vida Útil, Residual]
    end

    subgraph ENGINE_CALC [Motor Causal: DriverPlanningEngine]
        HC --> WORKFORCE[Cálculo de Massa Salarial, Encargos & Benefícios]
        CHARGES --> WORKFORCE
        BENEFITS --> WORKFORCE
        CAPEX_PROJ --> DEPR_CALC[Cálculo Automático de D&A e Cronograma de Ativos]
    end

    subgraph THREE_STATEMENT [Integração Closed-Loop 3-Statement]
        WORKFORCE -->|Pessoal de Fábrica| DRE_CMV[CMV / Custos Fabris na DRE]
        WORKFORCE -->|Vendedores| DRE_VENDAS[Despesas Comerciais na DRE]
        WORKFORCE -->|Admin & P&D| DRE_SGA[Despesas SG&A na DRE]
        WORKFORCE -->|Desembolso Líquido| DFC_FCO[FCO: Fluxo Operacional na DFC]
        
        DEPR_CALC -->|D&A do Período| DRE_DA[D&A na DRE: Reduz EBIT sem impactar EBITDA]
        DEPR_CALC -->|Desembolso de Capex| DFC_FCI[FCI: Fluxo de Investimentos na DFC]
        DEPR_CALC -->|Imobilizado Líquido| BP_ANC[Ativo Imobilizado Líquido no Balanço]
        
        DFC_FCO --> CAIXA_FIM[(=) Caixa e Equivalentes Final]
        DFC_FCI --> CAIXA_FIM
        CAIXA_FIM --> BP_AC[Ativo Circulante no Balanço]
    end

    subgraph RETORNO_INDICADORES [Síntese de Retorno & Estrutura de Capital]
        BP_AC ---|Δ = R$ 0,00 Estrito| BP_PASSIVO[Passivo Total + Patrimônio Líquido]
        DRE_DA --> EBITDA[EBITDA & Margem Operacional]
        DRE_DA --> DUPONT[Decomposição DuPont: ROE & ROA]
        CAIXA_FIM --> FLEURIET[Modelo Fleuriet: NCG, CDG & Saldo de Tesouraria]
    end
```

---

## 2. Os Componentes Implementados na Etapa 3

### 1. Motor de Planejamento de Pessoal (Workforce Planning)
* **Arquivo:** [`backend/app/engine/driver_planning_engine.py`](file:///c:/Users/edumo/HyperCubo_final2/backend/app/engine/driver_planning_engine.py)
* Modela departamentos corporativos (*Operações/Fábrica*, *Comercial & Vendas*, *P&D & Engenharia*, *G&A / Administrativo & Financeiro*).
* Parametrização dos encargos e tributos sobre folha no padrão Lucro Real brasileiro:
  * FGTS: 8,0%
  * INSS Patronal: 20,0%
  * Sistema S / RAT / FAP: ~8,8%
  * Provisão de 13º Salário: 8,33%
  * Provisão de Férias (+ 1/3 constitucional): 11,11%
  * Benefícios médios mensais (Saúde, Refeição, Transporte, Seguros): per capita.
* Segregação contábil automática:
  * Pessoal Fabril $\rightarrow$ **CMV / Custos Operacionais**
  * Pessoal de Vendas $\rightarrow$ **Despesas Comerciais**
  * Pessoal Administrativo $\rightarrow$ **SG&A**

### 2. Motor de Capex Automático & Depreciação (Asset Schedule)
* **Arquivo:** [`backend/app/engine/driver_planning_engine.py`](file:///c:/Users/edumo/HyperCubo_final2/backend/app/engine/driver_planning_engine.py)
* Parametrização por categoria de ativo (CPC 27 / IFRS 16):
  * **Máquinas & Equipamentos**: 10 anos de vida útil (10% a.a.)
  * **Softwares & Tecnologia**: 5 anos de vida útil (20% a.a.)
  * **Veículos & Frotas**: 5 anos de vida útil (20% a.a.)
  * **Edificações & Obras Civis**: 25 anos de vida útil (4% a.a.)
* Algoritmo de depreciação linear com valor residual:
  $$\text{Depreciação Anual} = \frac{\text{Investimento} \times (1 - \text{Valor Residual \%})}{\text{Vida Útil (Anos)}}$$
* Projeção da curva de valor contábil líquido (*Net Book Value*) e D&A acumulada ao longo de 5 anos (Ano 1 a Ano 5).

### 3. Integração Closed-Loop 3-Statement com Fechamento Patrimonial Estrito
* Conexão causal direta com o [`ThreeStatementEngine`](file:///c:/Users/edumo/HyperCubo_final2/backend/app/engine/three_statement_engine.py).
* Recálculo instantâneo de DRE, DFC e Balanço Patrimonial garantindo:
  $$\text{Ativo Total} - (\text{Passivo Total} + \text{Patrimônio Líquido}) \equiv \text{R\$} 0,00$$
* Atualização dos diagnósticos de **Fleuriet** (NCG, CDG, ST e as 6 tipologias) e **DuPont** (ROE, ROA, Giro e Alavancagem).

### 4. Endpoints REST FastAPI
* **Arquivo:** [`backend/app/api/driver_planning_routes.py`](file:///c:/Users/edumo/HyperCubo_final2/backend/app/api/driver_planning_routes.py)
* `GET /api/financials/planning/drivers`: Carrega a carteira baseline de pessoal e capex da empresa ativa.
* `POST /api/financials/planning/drivers/simulate`: Recebe alterações nos direcionadores de headcount e capex e retorna o recálculo consolidado.
* `GET /api/financials/planning/drivers/companies`: Lista empresas calibradas (Klabin, Vale, Petrobras, WEG, Banco do Brasil).

### 5. Interface Executiva no Frontend
* **Arquivo:** [`frontend/components/OperationalDriverPlanning.tsx`](file:///c:/Users/edumo/HyperCubo_final2/frontend/components/OperationalDriverPlanning.tsx)
* 4 abas estruturadas:
  1. **Headcount & Folha de Pagamento**: Edição em tempo real de FTEs, admissões, turnover, salários e encargos com cálculo automático do custo total.
  2. **Capex & Imobilizado Automático**: Adição/edição de projetos de investimento, vida útil, residual e trajetória de 5 anos do imobilizado.
  3. **Impacto no Triângulo Contábil**: DRE, DFC e Balanço Patrimonial projetados lado a lado com carimbo de auditoria de fechamento ($\Delta = \text{R\$} 0,00$).
  4. **Síntese de Retorno & Sensibilidade**: Variação em EBITDA, Caixa Final, NCG Fleuriet e ROE DuPont decorrentes dos drivers operacionais.

---

## 3. Roteiro de Validação e Testes

### 1. Testes Automatizados do Backend
```powershell
# Executar a suíte completa de testes (57 testes aprovados)
python -m pytest backend/tests -q
```
*Resultado:* `57 passed, 100% aprovados em ~14m53s`.

### 2. Compilação de Produção do Frontend
```powershell
cd frontend
npm run build
```
*Resultado:* `✓ Compiled successfully in 6.9s` com `Generating static pages (6/6)`.

### 3. Acesso à Interface
* Acesse `http://localhost:3000`
* Na barra superior, selecione a opção **"Planejamento por Drivers"**
* Explore as 4 abas e simule admissões e projetos de Capex em tempo real.
