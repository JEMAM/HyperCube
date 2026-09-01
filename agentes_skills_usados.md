# 🤖 Agentes e Skills do HyperCube Engine

Este documento descreve detalhadamente todos os **Agentes de Inteligência Artificial** e **Skills (Habilidades Especializadas)** integrados ao ecossistema do **HyperCube Engine**, detalhando como e onde são utilizados no aplicativo.

---

## 1. 🤖 Agentes de IA Integrados ao Aplicativo (Backend)

O backend do HyperCube utiliza o framework **Agno** (`from agno.agent import Agent`) para orquestrar agentes inteligentes de FP&A e análise macroeconômica.

### 📍 Localização no Código: [`backend/app/agents/`](file:///c:/Users/edumo/HyperCube/backend/app/agents)

| Agente | Arquivo Fonte | Função e Aplicação no Sistema | Modelos Suportados |
| :--- | :--- | :--- | :--- |
| **`AnalysisAgent`** | [`analysis_agent.py`](file:///c:/Users/edumo/HyperCube/backend/app/agents/analysis_agent.py) | **Análise Executiva de Simulações ("What-If"):** Intercepta o impacto de variações percentuais nas contas contábeis do DRE, gera relatórios explicativos em linguagem natural e sintetiza os impactos no Lucro Líquido. | OpenAI (GPT-4o, o3-mini), Gemini (2.0 Flash), Claude (3.5 Sonnet), Groq (Llama 3.3 70B) |
| **`EconomicAgent`** | [`economic_agent.py`](file:///c:/Users/edumo/HyperCube/backend/app/agents/economic_agent.py) | **Inteligência Macroeconômica & Séries Temporais:** Conecta-se às APIs públicas do Banco Central do Brasil (BCB SGS) e IBGE (SIDRA) para coletar dados de inflação (IPCA), Selic, Câmbio PTAX (USD/BRL) e IPP. Realiza diagnósticos macroeconômicos e projeções bancárias. | OpenAI, Gemini, Claude, Groq |
| **`ValuationAgent`** | [`valuation_agent.py`](file:///c:/Users/edumo/HyperCube/backend/app/agents/valuation_agent.py) | **Valuation Corporativo & Agente Agno PhD:** Executa modelagem multimetodológica de Valuation (DCF Gordon Growth & Exit Multiple, WACC detalhado via CAPM, Múltiplos EV/EBITDA e P/L, Abordagem Patrimonial e Matriz de Sensibilidade 2D WACC × g) tanto para empresas de upload quanto companhias abertas do CVM Watch, com chat interativo e memória de cálculo transparente. | OpenAI (GPT-5.6 Sol/Terra, GPT-4o), Gemini (3.7/3.6/3.5/2.0 Flash), Claude (Sonnet 5, Opus 4.8), Groq (Llama 3.3 70B), Ollama Local |

---

## 2. ⚡ Skills Utilizadas pelo Aplicativo (Workspace `.agents/skills`)

As skills são pacotes de instrução, algoritmos e conectores especializados localizados na pasta [`.agents/skills/`](file:///c:/Users/edumo/HyperCube/.agents/skills) do projeto:

| Skill | Caminho da Skill | Onde e Como é Usada no Aplicativo |
| :--- | :--- | :--- |
| **`analise-balanco-patrimonial`** | [`.agents/skills/analise-balanco-patrimonial`](file:///c:/Users/edumo/HyperCube/.agents/skills/analise-balanco-patrimonial/SKILL.md) | **Análise Econômico-Financeira do Balanço Patrimonial (BP):** Cálculo e interpretação de índices de liquidez (corrente, seca, imediata, geral), Capital de Giro pelo Modelo Fleuriet (NCG, CDG, Saldo de Tesouraria ST e diagnóstico de estrutura sólida/risco), Endividamento Geral e Composição da Dívida, Decomposição Dupont do ROE em 3 fatores (Margem Líquida × Giro do Ativo × Alavancagem Financeira), e Prazos Médios/Ciclos Operacional e Financeiro. |
| **`valuation-empresas`** | [`.agents/skills/valuation-empresas`](file:///c:/Users/edumo/HyperCube/.agents/skills/valuation-empresas/SKILL.md) | Guia completo de valuation multimetodológico: DCF, múltiplos relativos, abordagem patrimonial, gráfico Football Field e matriz de sensibilidade para a nova página de Valuation. |
| **`valuation-dcf`** | [`.agents/skills/valuation-dcf`](file:///c:/Users/edumo/HyperCube/.agents/skills/valuation-dcf/SKILL.md) | Modelagem de Fluxo de Caixa Descontado (DCF), projeção de FCFF de 5 anos, cálculo detalhado do WACC (Ke via CAPM, Kd pós-impostos) e perpetuidade de Gordon. |
| **`bcb-sgs-api`** | [`.agents/skills/bcb-sgs-api`](file:///c:/Users/edumo/HyperCube/.agents/skills/bcb-sgs-api/SKILL.md) | Usada no `EconomicAgent` para consultar taxas históricas e diárias da Selic, IPCA 12M, Câmbio USD/BRL e agregados monetários M4 no Banco Central. |
| **`copom-comparative-analyst`** | [`.agents/skills/copom-comparative-analyst`](file:///c:/Users/edumo/HyperCube/.agents/skills/copom-comparative-analyst/SKILL.md) | Usada em simulações macroeconômicas para correlacionar decisões do COPOM com o custo de captação bancária e DRE. |
| **`data-visualization`** | [`.agents/skills/data-visualization`](file:///c:/Users/edumo/HyperCube/.agents/skills/data-visualization/SKILL.md) | Usada nos módulos de visualização do backend (`backend/app/viz`) e frontend para configurar gráficos Recharts e visualizações OLAP/DAG. |
| **`docling-pdf-parser`** | [`.agents/skills/docling-pdf-parser`](file:///c:/Users/edumo/HyperCube/.agents/skills/docling-pdf-parser/SKILL.md) | Utilizada no processamento e extração de tabelas de DRE/DFC a partir de relatórios em PDF publicados por instituições financeiras. |
| **`phd-economista`** | [`.agents/skills/phd-economista`](file:///c:/Users/edumo/HyperCube/.agents/skills/phd-economista/SKILL.md) | Fornece as diretrizes e regras de negócio para análise de política monetária e sensibilidade da margem financeira bancária. |
| **`phd-financas`** | [`.agents/skills/phd-financas`](file:///c:/Users/edumo/HyperCube/.agents/skills/phd-financas/SKILL.md) | Regras para análise de estrutura de capital, composição da carteira de crédito e provisão para devedores duvidosos (PDD/Risco de Crédito). |
| **`fii-analyzer`** | [`.agents/skills/fii-analyzer`](file:///c:/Users/edumo/HyperCube/.agents/skills/fii-analyzer/SKILL.md) | Análise complementar para valuation de ativos imobiliários e fundos integrados à carteira bancária. |
| **`finance-news`** | [`.agents/skills/finance-news`](file:///c:/Users/edumo/HyperCube/.agents/skills/finance-news/SKILL.md) | Coleta de notícias do mercado financeiro e resumos sintéticos de eventos corporativos. |
| **`quant-trader`** | [`.agents/skills/quant-trader`](file:///c:/Users/edumo/HyperCube/.agents/skills/quant-trader/SKILL.md) | Análise quantitativa de ativos negociados na B3 para benchmarking de carteiras de títulos e valores mobiliários (TVM). |
| **`valuation-dcf`** | [`.agents/skills/valuation-dcf`](file:///c:/Users/edumo/HyperCube/.agents/skills/valuation-dcf/SKILL.md) | Modelagem de Fluxo de Caixa Descontado (DFC) e cálculo de WACC aplicados à projeção de longo prazo. |
| **`schema-harmonizer`** | [`.agents/skills/schema-harmonizer`](file:///c:/Users/edumo/HyperCube/.agents/skills/schema-harmonizer/SKILL.md) | Padronização e harmonização semântica de múltiplas fontes de dados (Excel, CSV, PDF) com diferentes nomenclaturas, layouts e convenções de sinal. |
| **`data-auditor-reconciliation`** | [`.agents/skills/data-auditor-reconciliation`](file:///c:/Users/edumo/HyperCube/.agents/skills/data-auditor-reconciliation/SKILL.md) | Auditoria de integridade contábil, consistência matemática em DAGs e conciliação cruzada (*cross-reconciliation*) entre departamentos. |
| **`universal-financial-analyzer`** | [`.agents/skills/universal-financial-analyzer`](file:///c:/Users/edumo/HyperCube/.agents/skills/universal-financial-analyzer/SKILL.md) | Análise financeira universal multissetorial para demonstrações contábeis DRE e DFC. |
| **`dynamic-dag-builder`** | [`.agents/skills/dynamic-dag-builder`](file:///c:/Users/edumo/HyperCube/.agents/skills/dynamic-dag-builder/SKILL.md) | Construção e validação dinâmica de grafos direcionados acíclicos para qualquer estrutura contábil. |
| **`whatif-simulation-engine`** | [`.agents/skills/whatif-simulation-engine`](file:///c:/Users/edumo/HyperCube/.agents/skills/whatif-simulation-engine/SKILL.md) | Motor de simulação e propagação topológica reativa de choques em grafos contábeis. |
| **`find-skills`** | [`.agents/skills/find-skills`](file:///c:/Users/edumo/HyperCube/.agents/skills/find-skills/SKILL.md) | Utilitário interno do projeto para identificar e instalar novas habilidades operacionais. |

---

## 3. 🛠️ Agentes e Servidores MCP do Ambiente Antigravity AI

Durante o desenvolvimento e manutenção do HyperCube, o assistente de desenvolvimento opera com os seguintes recursos:

### Subagentes de Execução
* **`research`**: Executa pesquisas de documentação e análise de código em modo leitura.
* **`self`**: Executa tarefas assíncronas e paralelas de desenvolvimento e refatoração.

### Servidores MCP (Model Context Protocol) Ativos
* **`StitchMCP`**: Geração e estilização de interfaces visuais e componentes React/Next.js.
* **`firebase-mcp-server`**: Gestão e deploy de serviços Firebase.
* **`github-mcp-server`**: Controle de versão, Pull Requests e automação de repositórios GitHub.
* **`mcp-brasil`**: Consultas a bancos de dados públicos e indicadores socioeconômicos do Brasil.
* **`mcp-context7`**: Leitura de documentação técnica de bibliotecas.
* **`notebooklm-mcp`**: Pesquisa e consulta contextualizada em cadernos do NotebookLM.
