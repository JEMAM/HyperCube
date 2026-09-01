# 🧊 HyperCube Connected Planning — Guia do Usuário & Manual Operacional v4.0

> **Manual Oficial de Operação e Referência Executiva da Plataforma HyperCube**  
> *Versão 4.0 — Planejamento Financeiro Conectado, Grafos DAG Reativos, Valuation Corporativo & Inteligência Multidimensional*

---

## 📑 Sumário

1. [Visão Geral da Plataforma & Conceito de Connected Planning](#1-visão-geral-da-plataforma--conceito-de-connected-planning)
2. [Como Iniciar e Executar o Aplicativo](#2-como-iniciar-e-executar-o-aplicativo)
3. [Guia de Início Rápido: Seus Primeiros 5 Minutos](#3-guia-de-início-rápido-seus-primeiros-5-minutos)
4. [Módulo 1: Visão Geral & Ingestão de Demonstrações](#4-módulo-1-visão-geral--ingestão-de-demonstrações)
5. [Módulo 2: Demonstração do Resultado do Exercício (DRE)](#5-módulo-2-demonstração-do-resultado-do-exercício-dre)
6. [Módulo 3: Demonstração dos Fluxos de Caixa (DFC)](#6-módulo-3-demonstração-dos-fluxos-de-caixa-dfc)
7. [Módulo 4: Balanço Patrimonial (BP), Modelo Fleuriet & Agente Especialista IA](#7-módulo-4-balanço-patrimonial-bp-modelo-fleuriet--agente-especialista-ia)
8. [Módulo 5: Planejamento Conectado N-D, Write-Back, Breakback & Ponte Waterfall](#8-módulo-5-planejamento-conectado-n-d-write-back-breakback--ponte-waterfall)
9. [Módulo 6: O Triângulo Contábil Fechado (Closed-Loop 3-Statement Model DRE ↔ DFC ↔ BP)](#9-módulo-6-o-triângulo-contábil-fechado-closed-loop-3-statement-model-dre--dfc--bp)
10. [Módulo 7: Valuation Corporativo & Simulador What-If Multi-Paramétrico](#10-módulo-7-valuation-corporativo--simulador-what-if-multi-paramétrico)
11. [Módulo 8: Cubo 3D OLAP Interativo WebGL](#11-módulo-8-cubo-3d-olap-interativo-webgl)
12. [Módulo 9: Macroeconomia BCB SGS & Pesquisa Focus Semanal](#12-módulo-9-macroeconomia-bcb-sgs--pesquisa-focus-semanal)
13. [Módulo 10: CVM Watchdog & Cadastro de Companhias Abertas](#13-módulo-10-cvm-watchdog--cadastro-de-companhias-abertas)
14. [Módulo 11: Configuração de Motores de Inteligência Artificial](#14-módulo-11-configuração-de-motores-de-inteligência-artificial)
15. [Glossário Financeiro Executivo](#15-glossário-financeiro-executivo)
16. [Perguntas Frequentes (FAQ)](#16-perguntas-frequentes-faq)


---

## 1. Visão Geral da Plataforma & Conceito de Connected Planning

O **HyperCube** é uma infraestrutura corporativa de planejamento contínuo (*Connected Planning*) desenvolvida para superar os gargalos tradicionais de planilhas eletrônicas corporativas pesadas, erros de fórmulas circulares, lentidão de recálculo e silos de informação departamentais.

### O Que É o "Planejamento Conectado" (Connected Planning)?

Nas organizações convencionais, o processo orçamentário e analítico opera em **silos desconectados**:
* A equipe de **Vendas e Marketing** projeta volumes e receitas em suas planilhas de demanda;
* A **Operação / Produção** estima os custos de fabricação (CPV) e estoques de forma isolada;
* A **Tesouraria** tenta antecipar o caixa sem visibilidade em tempo real das alterações comerciais;
* A **Controladoria** consolida o Balanço Patrimonial com semanas de defasagem através de fechamentos contábeis manuais;
* A **Diretoria Executiva / Conselho** recebe análises de Valuation desatualizadas assim que qualquer premissa macroeconômica (como a taxa Selic ou o câmbio) sofre alterações.

O **Planejamento Conectado** unifica todas as dimensões operacionais, táticas e estratégicas da empresa em um **Grafo Relacional Vivo e Reativo (Directed Acyclic Graph - DAG)**. Cada decisão operacional tomada na ponta (por exemplo, conceder mais 15 dias de prazo para clientes ou investir R$ 500 milhões em uma nova linha de produção) se propaga instantaneamente por todas as demonstrações financeiras em milissegundos.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           ARQUITETURA DE PLANEJAMENTO CONECTADO (DAG)                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

          [ DRIVERS OPERACIONAIS & MACRO ]
         (Volume, Preço, Spread, Selic, Câmbio)
                          │
                          ▼
       ┌─────────────────────────────────────┐
       │   DEMONSTRAÇÃO DO RESULTADO (DRE)   │
       │ Receita ─► Margem Bruta ─► EBITDA   │
       │        EBIT ─► LAIR ─► LUCRO LÍQUIDO│
       └──────────────────┬──────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │ (Lucro Líquido + Depreciação) │ (Lucros Acumulados / Reservas)
          ▼                               ▼
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│ FLUXO DE CAIXA OPERACIONAL (FCO)  │   │     PATRIMÔNIO LÍQUIDO (PL)       │
│ Reconciliação do Lucro & Giro     │   │ PL = Capital + Reservas + Lucros  │
└─────────────────┬─────────────────┘   └─────────────────▲─────────────────┘
                  │                                       │
                  │ (Variações de Giro: Clientes, Estoques, Fornecedores)
                  ▼                                       │
┌─────────────────────────────────────────────────────────┴─────────────────┐
│                        BALANÇO PATRIMONIAL (BP)                           │
│  ATIVO TOTAL (Circulante + Permanente) = PASSIVO TOTAL + PATRIMÔNIO LÍQ.  │
│  Dinâmica de Capital de Giro Fleuriet: NCG + CDG + Saldo de Tesouraria    │
└─────────────────▲───────────────────────────────────────▲─────────────────┘
                  │                                       │
                  │ (Saldo Final de Caixa)                │ (Dívida de CP e LP)
                  │                                       │
┌─────────────────┴───────────────────────────────────────┴─────────────────┐
│                  DEMONSTRAÇÃO DOS FLUXOS DE CAIXA (DFC)                   │
│   FCO (Operacional) + FCI (Capex Imobilizado) + FCF (Financiamentos)      │
│                 = VARIAÇÃO LÍQUIDA ─► SALDO FINAL DE CAIXA                │
└─────────────────┬─────────────────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      CUBO MULTIDIMENSIONAL OLAP 6D                        │
│   Tempo x Cenário x Versão x Entidade x Conta Contábil x Segmento         │
│   Write-Back em Célula • Breakback Top-Down • Comparativo Actual vs Budget│
└─────────────────┬─────────────────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                 VALUATION CORPORATIVO & FOOTBALL FIELD                    │
│   Fluxo de Caixa Livre da Firma (FCFF) • WACC • Múltiplos • Preço Justo   │
└───────────────────────────────────────────────────────────────────────────┘
```

### Como os Dados se Conectam Entre as Demonstrações Contábeis

1. **Da DRE para a DFC (Reconciliação do Caixa Operacional - FCO)**:
   * O **Lucro Líquido** apurado na DRE é o ponto de partida do método indireto da DFC.
   * As despesas não desembolsadas (Depreciação, Amortização e Exaustão) são somadas de volta ao lucro.
   * Provisões que não geraram saída imediata de caixa (como PDD em bancos ou provisões de contingências cíveis/trabalhistas) são neutralizadas.

2. **Da DRE para o Balanço Patrimonial (Patrimônio Líquido)**:
   * O Lucro Líquido gerado no exercício, deduzido da distribuição de Dividendos e Juros sobre Capital Próprio (JCP), é incorporado diretamente ao **Patrimônio Líquido** do Balanço Patrimonial através da conta de *Reservas de Lucros* ou *Lucros Acumulados*:
     $$\text{PL}_t = \text{PL}_{t-1} + \text{Lucro Líquido}_t - \text{Dividendos / JCP Pagos}_t$$

3. **Do Balanço Patrimonial para a DFC (Ajustes de Capital de Giro - NCG)**:
   * As variações das contas patrimoniais operacionais de curto prazo definem a geração de caixa operacional:
     * Aumento em **Contas a Receber (Clientes)** consome caixa (venda a prazo que ainda não virou dinheiro).
     * Aumento em **Estoques** consome caixa (recurso imobilizado em mercadorias/insumos).
     * Aumento em **Fornecedores** gera caixa (financiamento operacional concedido por parceiros).

4. **Da DFC para o Balanço Patrimonial (Fechamento Perfeito de Caixa & Dívida)**:
   * **Fluxo de Investimentos (FCI)**: O desembolso de CAPEX (compra de máquinas, equipamentos e expansão florestal/industrial) incrementa o saldo do **Ativo Imobilizado / Permanente** no Balanço Patrimonial.
   * **Fluxo de Financiamentos (FCF)**: A captação ou amortização de debêntures e empréstimos altera a linha de **Passivo Exigível (Empréstimos de Curto e Longo Prazo)**.
   * **Saldo Final de Caixa**: O resultado da equação $\text{Saldo Inicial} + \Delta\text{Caixa Líquido} + \text{Variação Cambial}$ define o valor exato da conta **Caixa e Equivalentes de Caixa** no Ativo Circulante, fechando o Balanço Patrimonial com rigor absoluto ($\Delta = \text{Ativo} - (\text{Passivo} + \text{PL}) = 0,00$).

5. **Do Grafo para o Cubo OLAP 6D e Valuation**:
   * Uma vez integradas, as demonstrações alimentam o hipercubo analítico de 6 eixos, permitindo fatiar e analisar a organização por subsidiária, trimestre, produto ou cenário, fornecendo a projeção de Fluxo de Caixa Livre da Firma (**FCFF**) para calcular o **Enterprise Value** e o **Preço Justo da Ação**.

---

### Por que o HyperCube é diferente de uma planilha convencional?

| Característica | Planilhas Tradicionais (Excel / Sheets) | HyperCube Connected Planning |
| :--- | :--- | :--- |
| **Arquitetura de Cálculo** | Sequencial e matricial em $O(N)$, recalculando pastas inteiras. | **Grafo Acíclico Dirigido (DAG)** com ordenação topológica em $O(K)$. |
| **Tempo de Resposta What-If** | Segundos a minutos; travamento em arquivos pesados. | **Inferior a 2 milissegundos** em memória vetorizada (Polars). |
| **Integridade de Fórmulas** | Alto risco de corrupção ao inserir colunas/linhas ou quebrar referências. | Fórmulas preservadas por nós canônicos e contratos imutáveis. |
| **Escala Dimensional** | Planilhas 2D com abas isoladas sujeitas a erros de link e fórmulas circulares. | **Hipercubo OLAP de 6 dimensões** (Tempo, Contas, Cenários, Versões, Entidades e Produtos). |
| **Simulação em Cascata** | Exige macros VBA complexas ou cópias infinitas de arquivos (*Planilha_v1_Final_rev3.xlsx*). | **Mecanismo de Breakback e Branching** nativo com recálculo instantâneo em cascata. |
| **Auditoria & Inteligência** | Revisão manual exaustiva célula a célula. | **Agentes de IA Integrados (Framework Agno / DeepSeek / Gemini)** explicando causas e efeitos em linguagem natural. |

---

## 2. Como Iniciar e Executar o Aplicativo

### Pré-requisitos
* **Node.js**: Versão 18 ou superior.
* **Python**: Versão 3.11 ou superior.
* **Navegador**: Google Chrome, Microsoft Edge, Brave ou Firefox com suporte a WebGL.

### Inicialização em Um Clique (Windows)
Basta clicar duas vezes no arquivo executável na raiz:
```cmd
start.bat
```
O script verifica o ambiente, ativa o ambiente virtual Python, instala dependências se necessário e inicia tanto o backend quanto o frontend de forma unificada.

### Inicialização Manual por Linha de Comando
Na pasta raiz do projeto:
```powershell
npm run dev
```
* **Frontend Next.js**: Disponível em `http://localhost:3000`
* **Backend FastAPI**: Disponível em `http://localhost:8000` (documentação Swagger em `http://localhost:8000/docs`)

---

## 3. Guia de Início Rápido: Seus Primeiros 5 Minutos

Siga este roteiro direto para explorar o potencial do aplicativo:

```
[Etapa 1: Ingestão / Empresa] ──► [Etapa 2: DRE / DFC / BP] ──► [Etapa 3: Valuation What-If] ──► [Etapa 4: Cubo 3D & Macro]
```

1. **Etapa 1 — Ingestão ou Seleção de Empresa**:
   * Abra a plataforma em `http://localhost:3000`.
   * Acesse **"Visão Geral & Ingestão"** no menu lateral.
   * Selecione uma empresa pré-carregada (ex: **Vale S.A.** ou **Banco do Brasil**), pesquise um ticker no **CVM Watch** (ex: `PETR4`, `ITUB4`) ou envie seus próprios relatórios em PDF/Excel.
2. **Etapa 2 — Análise das Demonstrações Financeiras**:
   * Vá para a aba **Demonstração DRE** para visualizar a margem bruta, EBITDA e lucro líquido.
   * Acesse **Fluxo de Caixa (DFC)** para inspecionar o fluxo operacional, de investimentos e de financiamento.
   * Acesse **Balanço Patrimonial (BP)** para verificar o capital de giro no **Modelo Fleuriet** (NCG, CDG, Saldo de Tesouraria) e tire dúvidas no chat com o **Agente de Balanço IA**.
3. **Etapa 3 — Valuation & Simulações What-If**:
   * Acesse **Valuation Corporativo**.
   * No topo, utilize os sliders do **Simulador What-If** para variar premissas como WACC, margem EBIT ou taxa de crescimento.
   * Observe a atualização automática do Enterprise Value, Equity Value, Preço Justo por Ação e gráfico Football Field.
4. **Etapa 4 — Exploração Espacial e Cenário Econômico**:
   * Acesse o **Cubo 3D OLAP Interativo** para navegar espacialmente pelos dados contábeis em 3D.
   * Acesse **Macroeconomia & BCB** para conferir a Selic meta, inflação IPCA, câmbio PTAX e o histórico semanal da Pesquisa Focus.

---

## 4. Módulo 1: Visão Geral & Ingestão de Demonstrações

O módulo de **Visão Geral & Ingestão** é a porta de entrada para conectar dados contábeis ao motor HyperCube. Ele foi projetado com flexibilidade para suportar desde documentos auditados únicos de centenas de páginas até múltiplos relatórios e pacotes zipados.

### 📦 As 4 Formas de Fazer Upload de Mais de um Arquivo

O HyperCube oferece quatro métodos práticos para alimentar o sistema com múltiplos arquivos ou múltiplas demonstrações financeiras da mesma empresa:

#### 1. Upload de Pacote Compactado (.ZIP) — *Método Recomendado para Pacotes Completos*
* **Como Funciona**: Você pode reunir em um único arquivo `.zip` todos os documentos relevantes da empresa:
  * Exemplo: `DRE_2024.pdf`, `DFC_2024.pdf`, `Balanco_Patrimonial_2024.pdf`;
  * Ou relatórios anuais de múltiplos exercícios: `Demonstracoes_2023.pdf` e `Demonstracoes_2024.pdf`;
  * Ou planilhas e relatórios auxiliares: `fechamento.xlsx` junto com `relatorio_auditoria.pdf`.
* **Processamento Automatizado**:
  * Ao clicar no botão **"Todas as Demonstrações"** (ou arrastar o `.zip` para a área de upload), o backend descompacta os arquivos em um diretório de trabalho seguro e isolado.
  * O motor semântico com OCR e leitor estruturado (PyPDF / Docling) analisa cada documento contido no `.zip`, detecta automaticamente quais páginas e tabelas pertencem à **DRE**, **DFC** ou **Balanço Patrimonial**, reconcilia os períodos temporais e compila o Grafo DAG unificado.

#### 2. Upload Seletivo e Sequencial por Demonstração Contábil — *Método Modular*
* **Como Funciona**: Na tela de "Visão Geral & Ingestão", a interface disponibiliza cards independentes com seletores de tipo:
  * **Card DRE**: Permite fazer o upload específico do PDF ou planilha com o Demonstrativo de Resultados;
  * **Card DFC**: Permite o upload dedicado do Demonstrativo de Fluxos de Caixa;
  * **Card Balanço Patrimonial**: Permite o envio do Balanço com Ativo, Passivo e Patrimônio Líquido.
* **Persistência de Sessão**: Cada arquivo enviado é processado e vinculado à empresa ativa sem apagar ou sobrescrever os outros demonstrativos já carregados. Você pode subir a DRE agora e, em seguida, carregar a DFC e o BP de arquivos completamente separados.

#### 3. Ingestão Multi-Aba via Planilha Excel (.xlsx / .xls) — *Método Corporativo*
* **Como Funciona**: Envie um único arquivo de pasta de trabalho do Excel contendo abas separadas nomeadas de acordo com as demonstrações:
  * Aba 1: `DRE` (ou `Resultado`, `Demonstracao_Resultado`, `Income Statement`);
  * Aba 2: `DFC` (ou `Fluxo_Caixa`, `Cash_Flow`);
  * Aba 3: `BP` (ou `Balanco`, `Balanco_Patrimonial`, `Balance_Sheet`).
* **Parser Matricial**: O motor lê as abas simultaneamente, identifica os cabeçalhos de trimestres/anos nas colunas e mapeia as linhas contábeis para o grafo canônico.

#### 4. Ingestão Automatizada via API REST (`POST /api/upload-all`) — *Método para Desenvolvedores e ERPs*
* **Como Funciona**: Para esteiras de automação contínua, integração com ERPs corporativos (SAP, Totvs, Oracle) ou scripts Python/PowerShell:
  * **Endpoint**: `POST http://localhost:8000/api/upload-all`
  * **Formato**: `multipart/form-data` com o campo `file` recebendo um arquivo `.pdf`, `.xlsx` ou `.zip`.
  * **Resposta**: Retorna o JSON canônico completo com todas as contas extraídas, verificação de fechamento matemático ($\Delta = 0,00$) e métricas de tempo de resposta da ingestão.

---

* **Formatos de Arquivo Aceitos**: `.pdf` (documentos escaneados com OCR ou nativos vetoriais), `.zip` (pacotes multi-arquivo), `.xlsx` / `.xls` (planilhas), `.csv` e `.txt`.
* **Mapeamento Canônico Automático**: O motor semântico lê os nomes de contas originais do documento (inclusive COSIF bancário para bancos e planos de contas de varejo/indústria) e os correlaciona aos nós universais CVM / IFRS.
* **Normalização de Escala**: Converte e normaliza automaticamente valores expressos em milhares ($R\$\text{ Mil}$) ou milhões ($R\$\text{ M}$) de reais, evitando qualquer inconsistência dimensional nos cálculos.

---

## 5. Módulo 2: Demonstração do Resultado do Exercício (DRE)

O painel de **Demonstração DRE** apresenta o desempenho operacional detalhado:

* **Contas Canônicas Calculadas**:
  * Receita Bruta $\to$ (-) Deduções e Impostos $\to$ (=) **Receita Operacional Líquida**
  * (-) Custo dos Produtos/Serviços Vendidos (CMV/CPV) $\to$ (=) **Lucro Bruto**
  * (-) Despesas Gerais, Administrativas e Vendas (SG&A) $\to$ (=) **EBITDA**
  * (-) Depreciação e Amortização $\to$ (=) **EBIT (Resultado Operacional)**
  * (+/-) Resultado Financeiro Líquido $\to$ (=) **EBT (Lucro Antes dos Impostos)**
  * (-) Provisão para IRPJ e CSLL $\to$ (=) **Lucro Líquido do Exercício**
* **Métricas Analíticas**: Margem Bruta (%), Margem EBITDA (%), Margem Operacional (%) e Margem Líquida (%).
* **Simulador What-If Integrado**: Escolha qualquer nó (ex: Receita ou Custos), defina uma variação percentual (ex: $+5\%$ ou $-8\%$) e clique em "Simular" para que o grafo DAG recalcule instantaneamente o impacto em todas as linhas filhas.

---

## 6. Módulo 3: Demonstração dos Fluxos de Caixa (DFC)

A tela de **Fluxo de Caixa (DFC)** analisa a capacidade real de geração de caixa:

* **Estrutura dos 3 Grandes Grupos**:
  1. **FCO (Fluxo de Caixa Operacional)**: Lucro ajustado por itens não-caixa, variação do capital de giro operacional (contas a receber, estoques e fornecedores).
  2. **FCI (Fluxo de Caixa de Investimentos)**: Despesas de capital (CAPEX), compras/vendas de imobilizado e aplicações financeiras de longo prazo.
  3. **FCF (Fluxo de Caixa de Financiamentos)**: Captações e amortizações de empréstimos, pagamento de dividendos e juros sobre capital próprio (JCP).
* **Variação Líquida de Caixa**: Saldo inicial de disponibilidades $+$ Geração líquida total $=$ Saldo final de caixa e equivalentes.

---

## 7. Módulo 4: Balanço Patrimonial (BP), Modelo Fleuriet & Agente Especialista IA

O painel de **Balanço Patrimonial** fornece a avaliação da liquidez, estrutura de capital e solvência financeira:

### O Modelo Fleuriet (Dinâmica do Capital de Giro)

O Modelo Fleuriet reclassifica o balanço em contas operacionais e financeiras:

$$\text{NCG} = \text{Ativo Circulante Operacional} - \text{Passivo Circulante Operacional}$$

$$\text{CDG} = (\text{Patrimônio Líquido} + \text{Passivo Não Circulante}) - \text{Ativo Não Circulante}$$

$$\text{Saldo de Tesouraria (ST)} = \text{CDG} - \text{NCG}$$

* **Diagnósticos do Modelo Fleuriet**:
  * **Tipo I — Estrutura Excelente**: $\text{CDG} > 0$, $\text{NCG} > 0$ e $\text{ST} > 0$. A empresa financia o giro com recursos de longo prazo e possui folga de caixa.
  * **Tipo II — Estrutura Sólida**: $\text{CDG} > 0$, $\text{NCG} < 0$ e $\text{ST} > 0$. A operação é financiada pelos fornecedores (comum no grande varejo).
  * **Tipo IV — Efeito Tesoura**: $\text{CDG} < \text{NCG}$, levando a um $\text{ST} < 0$ que cresce a cada período. A empresa depende crescentemente de empréstimos bancários caros para sustentar o giro.

### Índices de Liquidez e Estrutura
* **Liquidez Corrente**: $\frac{\text{Ativo Circulante}}{\text{Passivo Circulante}}$
* **Liquidez Seca**: $\frac{\text{Ativo Circulante} - \text{Estoques}}{\text{Passivo Circulante}}$
* **Liquidez Imediata**: $\frac{\text{Disponibilidades}}{\text{Passivo Circulante}}$
* **Liquidez Geral**: $\frac{\text{Ativo Circulante} + \text{Realizável a Longo Prazo}}{\text{Passivo Circulante} + \text{Passivo Não Circulante}}$

### Agente Especialista IA em Balanço Patrimonial
No rodapé da página do Balanço Patrimonial, há um assistente inteligente equipado com a skill especializada `analise-balanco-patrimonial`. O usuário pode realizar perguntas em linguagem natural, como:
* *"Qual a situação da liquidez da empresa e há risco de efeito tesoura?"*
* *"Faça a decomposição DuPont do ROE identificando a principal alavanca de rentabilidade."*
* *"Como está a cobertura do serviço da dívida pelo EBITDA?"*

---

## 8. Módulo 5: Planejamento Conectado N-D, Write-Back & Breakback

A página de **Planejamento Conectado (N-D)** representa o núcleo operacional da infraestrutura HyperCube. É nela que os usuários corporativos (CFOs, diretores de FP&A, gerentes de planejamento e analistas financeiros) realizam a modelagem contínua de cenários e orçamentos.

### 🌐 Como Funciona o Planejamento Conectado na Prática?

No HyperCube, o modelo financeiro não é uma coleção de números estáticos, mas um **Cubo Analítico de 6 Dimensões** com hiperblocos em memória:

1. **Dimensão Tempo (`time`)**: Contém os períodos históricos realizados (*Actuals*: `2023`, `2024`, `2025`, ou trimestres `1T`, `2T`, `3T`, `4T`) e as janelas de projeção futura (*Budget*: `Budget 2025`, `Budget 2026`).
2. **Dimensão Cenário (`scenario`)**: Permite simular caminhos econômicos alternativos:
   * **Cenário Base (Oficial)**: Premissas do plano de negócios aprovado pelo conselho;
   * **Cenário Otimista (Bull / Expansão)**: Aumento de volume de vendas (+10%), preços favoráveis e diluição de custos fixos;
   * **Cenário Pessimista (Bear / Retração)**: Queda na demanda (-15%), retração de margens e aumento de inadimplência;
   * **Cenário de Estresse Macroeconômico**: Choques de Câmbio (USD/BRL a R$ 6,20), disparada da taxa Selic e alta de custos de insumos.
3. **Dimensão Versão (`version`)**: Governança das fases do ciclo orçamentário:
   * `Actuals` (Realizado oficial auditado e travado para edição);
   * `Budget` (Orçamento anual congelado de referência);
   * `Forecast Q1/Q2/Q3` (Previsões revisadas ao longo do ano com base no realizado dos meses anteriores).
4. **Dimensão Entidade (`entity`)**: A árvore organizacional da empresa:
   * Nível Consolidado (Holding / Matriz);
   * Unidades de Negócio ou Subsidiárias (ex: na Klabin: Florestal, Celulose, Papéis e Embalagens; no Banco Master: Banco Comercial, Investment Banking, Crédito Consignado; na Vale: Minério de Ferro, Metais Básicos, Logística).
5. **Dimensão Conta Contábil (`account`)**: O catálogo canônico unificado (Receita Bruta, Deduções, Receita Líquida, CPV, Margem Bruta, SG&A, EBITDA, Depreciação, EBIT, Resultado Financeiro, LAIR, Impostos, Lucro Líquido, Contas a Receber, Fornecedores, Capex, etc.).
6. **Dimensão Produto / Segmento (`product`)**: Linhas de produto específicas para planejamento granular de demanda e custos.

---

### ✏️ Mecanismos de Alteração e Modelação de Cenários

O HyperCube disponibiliza dois mecanismos essenciais de edição para planejamento colaborativo:

#### 1. Edição Direta de Célula com Write-Back Instantâneo
* **Operação Bottom-Up**: O usuário clica em qualquer célula da grade multidimensional e digita o novo valor.
* **Persistência Reativa**: O motor Polars captura a alteração, identifica os nós dependentes no Grafo DAG e recalcula as contas derivadas (ex: ao alterar o CPV do 3T, a Margem Bruta, o EBITDA, o LAIR e o Lucro Líquido do trimestre são recomputados em menos de 2 milissegundos).

#### 2. Mecanismo de Breakback (Top-Down Spread com Rateio Inteligente)
* **O Desafio**: Em reuniões de diretoria, a meta costuma ser definida no nível agregado: *"Nossa Receita Líquida anual para 2026 deve atingir R$ 25 bilhões"* ou *"Devemos cortar os Custos Operacionais em R$ 400 milhões"*.
* **A Solução HyperCube**: Ao editar o valor total anual ou a linha consolidada de um grupo:
  1. A plataforma abre automaticamente o **Modal de Breakback**;
  2. O usuário escolhe a metodologia de distribuição:
     * **Distribuição Proporcional (Recomendada)**: Mantém a proporção e sazonalidade histórica de cada trimestre ou subsidiária, aplicando a variação ponderada;
     * **Distribuição Igualitária**: Divide o acréscimo ou redução em parcelas idênticas entre todas as contas filhas;
  3. O motor redistribui os valores pelas folhas da árvore e propaga o recálculo em cascata por toda a DRE, DFC e Balanço.

---

### 🎛️ Matriz Completa de Variáveis Modificáveis em Todas as Páginas

Para garantir governança e previsibilidade total nos testes de cenários, a tabela abaixo consolida **todas as variáveis operacionais e financeiras que o usuário pode modificar** em cada módulo do HyperCube, com a indicação precisa do seu impacto de jusante (*downstream*):

| Página / Módulo | Variável / Parâmetro Modificável | Tipo de Input | O Que Representa | Impacto Imediato nos Cálculos (DAG) |
| :--- | :--- | :--- | :--- | :--- |
| **DRE** | **Receita Bruta / Intermediação** | Célula / Slider (%) | Volume de vendas, preço unitário ou spread de crédito | Recalcula Receita Líquida, Margem Bruta, EBITDA, EBIT e Lucro Líquido |
| **DRE** | **Deduções & Impostos s/ Vendas** | Célula / Slider (%) | Alíquotas de ICMS, PIS, COFINS, ISS e descontos | Altera o fator de conversão de faturamento bruto em receita operacional líquida |
| **DRE** | **Custos dos Produtos (CPV / CMV)** | Célula / Slider (%) | Custo de insumos, matérias-primas, mão de obra fabril ou captação de CDB | Impacta diretamente o Lucro Bruto e as margens industriais/comerciais |
| **DRE** | **Despesas com Vendas & Logística** | Célula / Slider (%) | Frete rodoviário/marítimo, combustível, comissões de venda | Reduz a margem EBITDA e altera a rentabilidade por canal |
| **DRE** | **Despesas Administrativas (SG&A)** | Célula / Slider (%) | Folha corporativa, dissídio salarial, aluguéis, tecnologia | Altera despesas fixas e o ponto de equilíbrio (*break-even point*) |
| **DRE** | **Provisão Perdas de Crédito (PDD)** | Célula / Slider (%) | Inadimplência esperada em bancos e carteiras de crédito | Impacta o Resultado da Intermediação Financeira e LAIR |
| **DRE** | **Resultado Financeiro Líquido** | Célula / Slider (%) | Despesas de juros sobre dívida menos receitas de aplicações | Sensibilidade a juros (Selic/CDI) e variações cambiais de dívidas em dólar |
| **DRE** | **Alíquota de Tributos (IR / CSLL)** | Célula / Slider (%) | Alíquota efetiva de imposto de renda e contribuição social | Define a taxa de retenção final que gera o Lucro Líquido Consolidado |
| **DFC** | **Recebimento de Vendas (Clientes)** | Célula / Slider (%) | Prazo Médio de Recebimento (PMR / DSO) e taxa de cobrança | Altera o Fluxo de Caixa Operacional (FCO) e a folga de liquidez |
| **DFC** | **Pagamento a Fornecedores** | Célula / Slider (%) | Prazo Médio de Pagamento (PMP / DPO) e condições comerciais | Altera o consumo operacional de caixa e a necessidade de financiamento |
| **DFC** | **Pagamento de Pessoal & Tributos** | Célula / Slider (%) | Desembolsos obrigatórios de curto prazo | Impacta a geração líquida de caixa das operações |
| **DFC** | **Investimentos em CAPEX (Imobilizado)**| Célula / Slider (%) | Aquisição de máquinas, plantas industriais, ativos biológicos | Define o Fluxo de Investimentos (FCI) e a taxa de reinvestimento |
| **DFC** | **Desinvestimentos / Venda de Ativos** | Célula / Slider (%) | Venda de imóveis, subsidiárias ou desmobilização | Gera entrada extraordinária de caixa em investimentos |
| **DFC** | **Captação de Novos Empréstimos** | Célula / Slider (%) | Emissão de debêntures, notas comerciais ou letras | Aumenta o Fluxo de Financiamento (FCF) e a dívida bruta |
| **DFC** | **Amortização de Dívidas** | Célula / Slider (%) | Pagamento do principal de dívidas bancárias e debêntures | Consome caixa de financiamento e reduz passivos exigíveis |
| **DFC** | **Dividendos e JCP Pagos** | Célula / Slider (%) | Remuneração aos acionistas (% de payout sobre o lucro) | Reduz o FCF e diminui os lucros acumulados no Patrimônio Líquido |
| **Balanço (BP)**| **Caixa e Aplicações Financeiras** | Célula direta | Recursos disponíveis imediatos em tesouraria | Altera o Ativo Circulante, a Liquidez Imediata e o Saldo de Tesouraria (ST) |
| **Balanço (BP)**| **Contas a Receber (Duplicatas)** | Célula / Slider (%) | Saldo de faturas a vencer de clientes | Aumenta o Ativo Circulante Operacional e a Necessidade de Giro (NCG) |
| **Balanço (BP)**| **Estoques de Produtos / Insumos** | Célula / Slider (%) | Posição física avaliada de matérias-primas e produtos | Aumenta a NCG e reduz a Liquidez Seca do balanço |
| **Balanço (BP)**| **Fornecedores a Pagar** | Célula / Slider (%) | Obrigações operacionais com parceiros de suprimentos | Aumenta o Passivo Circulante Operacional e alivia a NCG Fleuriet |
| **Balanço (BP)**| **Empréstimos Bancários (CP / LP)** | Célula / Slider (%) | Saldo devedor de curto e longo prazo | Altera o Endividamento Geral, Dívida Líquida/EBITDA e o CDG |
| **Balanço (BP)**| **Ativo Imobilizado / Permanente** | Célula / Slider (%) | Valor contábil líquido de fábricas, florestas e equipamentos | Altera o Ativo Não Circulante e absorve Recursos de Longo Prazo (CDG) |
| **Balanço (BP)**| **Patrimônio Líquido (Capital + Reservas)**| Célula direta | Capital integralizado e reservas retidas | Garante o Fechamento Patrimonial ($\Delta = 0,00$) e financia o CDG |
| **Valuation** | **Taxa Livre de Risco ($R_f$)** | Slider ($3\%$ a $12\%$) | Taxa do título soberano de longo prazo (NTN-B / Tesouro) | Eleva o custo do capital próprio ($K_e$) e o WACC |
| **Valuation** | **Beta da Empresa ($\beta$)** | Slider ($0.40x$ a $2.20x$)| Sensibilidade do ativo em relação ao mercado (Ibovespa) | Amplifica o prêmio de risco do setor no cálculo do CAPM |
| **Valuation** | **Prêmio de Risco de Ações ($ERP$)** | Slider ($3\%$ a $9\%$) | Retorno adicional exigido pelo investidor de renda variável | Altera o custo de oportunidade dos sócios |
| **Valuation** | **Custo da Dívida ($K_d$)** | Slider ($6\%$ a $20\%$) | Taxa de juros média pré-impostos paga nos financiamentos | Altera o custo do capital de terceiros após o benefício fiscal |
| **Valuation** | **Estrutura de Capital ($D/V$)** | Slider ($0\%$ a $80\%$) | Peso do endividamento em relação ao valor total da firma | Pondera as fatias de dívida e capital próprio no WACC |
| **Valuation** | **Margem EBIT Projetada** | Slider ($2\%$ a $50\%$) | Projeção de rentabilidade operacional para os anos 1 a 5 | Altera o NOPAT e a projeção do Fluxo Livre da Firma (FCFF) |
| **Valuation** | **Crescimento de Receita (CAGR)** | Slider ($-5\%$ a $+25\%$)| Ritmo anual composto de expansão do faturamento | Multiplica a base nominal de fluxo de caixa futuro |
| **Valuation** | **Crescimento Perpétuo ($g$)** | Slider ($1\%$ a $5.5\%$) | Taxa de expansão da empresa no longo prazo (Gordon Growth) | Impacta exponencialmente o Valor Terminal ($TV$) da companhia |
| **Valuation** | **Taxa de Reinvestimento em CAPEX** | Slider ($1\%$ a $15\%$) | Percentual da receita comprometido em imobilizado | Reduz o FCFF disponível para distribuição aos provedores de capital |
| **Valuation** | **Necessidade Adicional de Giro ($\Delta NWC$)**| Slider ($0\%$ a $8\%$) | Percentual da receita absorvido pela expansão do giro | Ajusta o fluxo de caixa livre pelas necessidades de capital de giro |
| **Valuation** | **Múltiplo EV / EBITDA Setorial** | Slider ($2.0x$ a $15.0x$)| Múltiplo de mercado praticado por pares comparáveis | Define a barra de múltiplos no gráfico Football Field |
| **Valuation** | **Múltiplo Preço / Lucro (P/L)** | Slider ($3.0x$ a $25.0x$)| Relação de preço sobre lucro observada na B3 | Oferece a métrica relativa de valuation baseada em lucro líquido |

---

### 📊 Ponte de Variância Waterfall & Análise Causal Volume-Preço-Mix

Na aba de **Análise de Variância** do Planejamento Conectado, o HyperCube disponibiliza um motor executivo de **Gráfico Waterfall** que decompõe qualquer divergência orçamentária (*Actual vs. Budget* ou *Exercício Atual vs. Anterior*) em seus direcionadores causais:

1. **Ponte de EBITDA**:
   * **Efeito Volume**: $\Delta V = (Q_{\text{real}} - Q_{\text{orç}}) \times P_{\text{orç}}$
   * **Efeito Preço Médio**: $\Delta P = Q_{\text{real}} \times (P_{\text{real}} - P_{\text{orç}})$
   * **Eficiência de Custos (CMV/CPV)**: Ganho ou perda em insumos, mão de obra fabril ou matéria-prima;
   * **Despesas Comerciais & Marketing**: Esforço comercial e comissões de expansão;
   * **Despesas Gerais e Administrativas (G&A)**: Variação das despesas fixas de sede e suporte corporativo.
2. **Ponte de Receita Líquida**: Isola a expansão orgânica de volume das repactuações inflacionárias de preços e alíquotas tributárias sobre vendas.
3. **Ponte de Lucro Líquido**: Integra o resultado operacional aos efeitos de despesas financeiras líquidas (impacto de taxas de juros) e alíquota efetiva de imposto de renda.
4. **Fechamento Aditivo 100% Garantido**: Diferente de ferramentas estáticas, o somatório dos efeitos causais fecha exatamente a variação total ($\text{Valor Final} = \text{Valor Base} + \sum \Delta \text{Efeitos}$).

---

## 9. Módulo 6: O Triângulo Contábil Fechado (Closed-Loop 3-Statement Model DRE ↔ DFC ↔ BP)

O **Modelo Triangular 3-Statement** resolve o clássico gargalo de modelagem financeira corporativa: criar uma amarração matemática causal e contínua entre as três demonstrações financeiras fundamentais, sem circularidade e com garantia de equilíbrio patrimonial absoluto.

```
                    ┌──────────────────────────────────────┐
                    │                 DRE                  │
                    │   Receita Líquida ──► Lucro Bruto    │
                    │       EBITDA ──► LUCRO LÍQUIDO       │
                    └──────────────────┬───────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      │ Lucro Líquido + D&A             │ Lucro Líquido (-) Dividendos
                      ▼                                 ▼
         ┌─────────────────────────┐       ┌─────────────────────────┐
         │           DFC           │       │    BALANÇO PATRIMONIAL  │
         │ FCO ──► FCI ──► FCF     │       │   Ativo Circulante      │
         │  VARIAÇÃO DE CAIXA      │──────►│  (=) CAIXA E EQUIV.     │
         └─────────────────────────┘       │ ─────────────────────── │
                                           │   Patrimônio Líquido    │
                                           │  (=) LUCROS ACUMULADOS  │
                                           │ ─────────────────────── │
                                           │ ATIVO TOTAL = PASSIVO+PL│
                                           │       (Δ = R$ 0,00)     │
                                           └─────────────────────────┘
```

### Principais Funcionalidades do Módulo:
* **Tolerância Zero a Descasamentos Contábeis**: $\text{Ativo Total} - (\text{Passivo Total} + \text{PL}) \equiv \text{R\$} 0,00$ em todos os exercícios e cenários simulados.
* **Gaveta de Simulador de Direcionadores Operacionais**:
  * **PMR (DSO)**: Prazo Médio de Recebimento de Vendas em dias;
  * **PME (DIO)**: Prazo Médio de Renovação de Estoques em dias;
  * **PMP (DPO)**: Prazo Médio de Pagamento a Fornecedores em dias;
  * **Capex Anual**: Investimentos brutos em imobilizado e projetos de expansão;
  * **Dividend Payout**: Percentual do lucro líquido destinado à remuneração dos acionistas;
  * **Crescimento de Receita (%)**: Expansão orgânica da linha superior da DRE.
* **Modelo Fleuriet Dinâmico & Detecção de Efeito Tesoura**:
  * Cálculo instantâneo da **Necessidade de Capital de Giro (NCG)**, **Capital de Giro Próprio (CDG)** e **Saldo de Tesouraria (ST)**;
  * Alerta executivo automático caso a empresa entre em **Efeito Tesoura (Overtrading)**, prevenindo crises de liquidez causadas por expansão acelerada sem lastro de financiamento de longo prazo.

---

## 10. Módulo 7: Valuation Corporativo & Simulador What-If Multi-Paramétrico

O painel de **Valuation Corporativo & Análise de Valor Justo** consolida a avaliação da empresa por métodos intrínsecos e de mercado:


### O Simulador What-If de 14 Variáveis Matemáticas
Localizado no topo da tela, permite estressar todas as premissas em tempo real:

1. **Custo de Capital & WACC (CAPM)**:
   * **Taxa Livre de Risco ($R_f$)**: Curva real soberana / NTN-B ($3\%$ a $12\%$).
   * **Beta do Ativo ($\beta$)**: Sensibilidade ao Ibovespa ($0.40x$ a $2.20x$).
   * **Prêmio de Risco ($ERP$)**: Retorno excedente do mercado de ações ($3\%$ a $9\%$).
   * **Custo da Dívida ($K_d$)**: Taxa pré-impostos de financiamentos ($6\%$ a $20\%$).
   * **Alavancagem ($D/V$)**: Peso do endividamento no capital total ($0\%$ a $80\%$).
   * **WACC Consolidado**: Override direto da taxa de desconto ($5\%$ a $22\%$).
2. **Operação & Fluxo de Caixa (DCF)**:
   * **Margem EBIT Projetada**: Alavancagem operacional ($2\%$ a $50\%$).
   * **Crescimento de Receita (CAGR Anos 1-5)**: Ritmo de expansão ($ -5\%$ a $+25\%$).
   * **Crescimento Perpétuo ($g$)**: Gordon Growth para longo prazo ($1.0\%$ a $5.5\%$).
   * **CAPEX Ratio (% da Receita)**: Intensidade de investimento em imobilizado ($1\%$ a $15\%$).
   * **Variação de Capital de Giro ($\Delta NWC$)**: Necessidade incremental de giro ($0\%$ a $8\%$).
3. **Múltiplos Relativos de Mercado**:
   * **EV / EBITDA Setorial**: Múltiplo dos pares da B3 ($2.0x$ a $15.0x$).
   * **Preço sobre Lucro (P/L)**: Múltiplo de lucro dos comparáveis ($3.0x$ a $25.0x$).
4. **Presets Rápidos de Cenário**:
   * 🟢 **Cenário Otimista (Bull)**: $+3\%$ margem EBIT, $+2\%$ crescimento, $-1\%$ WACC, $+0.5\%$ g.
   * 🔴 **Cenário de Estresse (Bear)**: $-3.5\%$ margem EBIT, $-2.5\%$ crescimento, $+1.5\%$ WACC, $-0.5\%$ g.
   * 🔄 **Resetar Tudo**: Restaura todas as variáveis para o modelo base oficial.

### Gráfico do FCFF Formatado
Apresenta ano a ano as colunas de:
* **FCFF (Fluxo Livre Nominal)**: Geração operacional pós-impostos deduzida de capex e giro.
* **Valor Presente (Descontado ao WACC)**: Trazido a valor presente pela fórmula $\frac{FCFF_t}{(1 + WACC)^t}$.
* Escala limpa e padronizada em bilhões de reais ($R\$\text{ Bi}$), sem cortes de caracteres.

### Aba 5: Metodologias & Parâmetros dos Indicadores
Tabela de total governança contendo:
* Nome do indicador, metodologia, símbolo matemático e fórmula detalhada.
* Valor vigente do What-If com badge de alteração.
* Elasticidade e impacto teórico no Preço Justo da ação.

---

## 11. Módulo 8: Cubo 3D OLAP Interativo WebGL

O **Cubo 3D OLAP** traduz dados contábeis em uma representação geométrica tridimensional:

* **Eixo Vertical (Y)**: Margem de lucro e rentabilidade percentual.
* **Eixo de Profundidade (Z)**: Trajetória temporal ao longo dos anos e trimestres.
* **Cor do Voxel**: Volume financeiro da conta contábil.
* **Interatividade**:
  * **Rotacionar**: Clique com o botão esquerdo do mouse e arraste.
  * **Zoom**: Use a roda de rolagem do mouse (*scroll*).
  * **Inspecionar Voxel**: Clique sobre qualquer cubo interno para abrir o cartão de detalhes analíticos.

---

## 12. Módulo 9: Macroeconomia BCB SGS & Pesquisa Focus Semanal

Conexão com os dados oficiais do Banco Central do Brasil:

* **Séries Diárias SGS**:
  * **Selic Meta Copom (SGS 432)**
  * **IPCA Acumulado 12 Meses (SGS 13522)**
  * **Câmbio USD/BRL PTAX Venda (SGS 10813)**
  * **Dívida Bruta do Governo Geral % PIB (SGS 13762)**
* **Pesquisa Focus Semanal**:
  * Tabela com as últimas 6 semanas de divulgação (sextas de corte, segundas de publicação às 08h30).
  * Estatísticas completas: Mediana, Média, Desvio Padrão, Spread e Respondentes.
  * Variações automáticas $\Delta 1\text{ semana}$ e $\Delta 4\text{ semanas}$.
  * Botão de exportação em CSV para enriquecer modelos financeiros externos.

---

## 13. Módulo 10: CVM Watchdog & Cadastro de Companhias Abertas

Sincronização em tempo real com os dados públicos da Comissão de Valores Mobiliários:

* **Arquivo de Origem**: `cad_cia_aberta.csv` sincronizado do portal de dados abertos da CVM.
* **Base Sincronizada**: Mais de 750 companhias abertas registradas.
* **Pesquisa Inteligente**: Digite o ticker (ex: `VALE3`, `PETR4`, `BBAS3`, `WEGE3`) ou a razão social para carregar demonstrações oficiais instantaneamente no workspace.

---

## 14. Módulo 11: Configuração de Motores de Inteligência Artificial

O HyperCube é agnóstico a modelos de linguagem e suporta 18 modelos em 5 provedores:

1. **Groq (LPU Ultrarrápida)**: Modelos Llama 3.1, Llama 3.3 70B, DeepSeek R1 e GPT-OSS com velocidade de até 800 tokens/segundo.
2. **Gemini (Google DeepMind)**: Modelos Gemini 3.7 Flash, 3.6 Flash, 3.5 Flash e 3.1 Pro com janela de contexto de até 2 milhões de tokens.
3. **Claude (Anthropic)**: Opus 5, Sonnet 5 e Haiku 4.5 para raciocínio contábil de máxima precisão.
4. **ChatGPT (OpenAI)**: GPT-5.6 Sol/Luna, GPT-5.5 e o3-mini para raciocínio matemático.
5. **Ollama (Local / On-Premise)**: Gemma, Qwen e DeepSeek rodando 100% no seu próprio hardware, garantindo total privacidade e funcionamento sem internet.

Para trocar de provedor ou modelo, basta clicar no botão de IA no topo direito do cabeçalho da aplicação.

---

## 15. Glossário Financeiro Executivo

* **Breakback**: Algoritmo de rateio top-down onde a alteração de um valor agregado é distribuída automaticamente para as contas filhas.
* **CAPEX (Capital Expenditures)**: Despesas de capital destinadas a aquisição, manutenção ou melhoria de bens do ativo imobilizado.
* **CDG (Capital de Giro Líquido)**: Recursos de longo prazo disponíveis para financiar a operação corrente da empresa.
* **DCF (Discounted Cash Flow)**: Metodologia de fluxo de caixa descontado para determinar o valor presente justo de uma firma.
* **EBITDA**: Lucro antes de juros, impostos, depreciação e amortização; indicador de geração bruta de caixa operacional.
* **FCFF (Free Cash Flow to Firm)**: Fluxo de caixa livre disponível para todos os provedores de capital (credores e acionistas).
* **NCG (Necessidade de Capital de Giro)**: Recursos financeiros que a empresa necessita para sustentar o ciclo de compras, estocagem e vendas.
* **Saldo de Tesouraria (ST)**: Margem de liquidez resultante da diferença entre CDG e NCG.
* **WACC (Weighted Average Cost of Capital)**: Custo médio ponderado do capital que a empresa utiliza para financiar seus ativos.
* **Waterfall Bridge**: Gráfico em cascata que decompõe variações em alavancas aditivas (Volume, Preço, Custos, SG&A) com fechamento 100%.

---

## 16. Perguntas Frequentes (FAQ)


### 1. Posso usar dados de empresas de qualquer setor?
**Sim.** O algoritmo de mapeamento canônico do HyperCube é universal e multi-setorial, suportando indústrias, comércio varejista, empresas de tecnologia, agronegócio, serviços e instituições financeiras.

### 2. Os cálculos das simulações What-If sobrescrevem a base oficial?
**Não.** As simulações são executadas em memória volátil isolada (*branches*). A base histórica original permanece inalterada, permitindo simulações seguras sem risco de perda de dados.

### 3. O aplicativo necessita de internet para funcionar?
O motor de cálculo DAG, o Cubo 3D OLAP, a grade multidimensional e os relatórios funcionam **100% offline**. Apenas os agentes de IA na nuvem (OpenAI, Gemini, Claude, Groq) e a sincronização do Banco Central requerem internet; se configurado com o Ollama local, todo o ecossistema opera sem internet.

### 4. Como exportar os resultados e relatórios?
Nas telas de DRE, DFC, Valuation e Focus, utilize os botões dedicados de **Exportar PDF** ou **Exportar CSV** para gerar documentação executiva diagramada para reuniões de diretoria e auditoria externa.
