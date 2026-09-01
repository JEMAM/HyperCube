# 🧊 HyperCube Engine — Documentação Técnica e Funcional

Bem-vindo à documentação oficial do **HyperCube Engine**, um motor de cálculo multidimensional reativo e simulador de planejamento financeiro ("What-If") para Demonstrações do Resultado do Exercício (DRE) Bancário.

---

## 🎯 1. Objetivo do Aplicativo

O **HyperCube Engine** foi desenvolvido com o objetivo de modernizar o planejamento e a análise financeira (FP&A - *Financial Planning & Analysis*) bancária. Inspirado em motores tradicionais do mercado (como IBM TM1 e Oracle Hyperion/Essbase), o HyperCube traz uma abordagem moderna, transparente e extremamente performática.

### Principais Objetivos:
1. **Modelagem Reativa Baseada em Grafos (DAG):** Em planilhas ou sistemas convencionais, alterar uma premissa financeira costuma exigir o recálculo total de milhares de células. O HyperCube constrói um **Grafo Acíclico Dirigido (DAG)** de dependências entre as contas contábeis e reavalia **apenas os nós diretamente afetados**, garantindo tempo de resposta em milissegundos.
2. **Simulações de Cenários "What-If":** Permitir que analistas financeiros simulem variações percentuais (ex: aumento de 15% na Provisão para Risco de Crédito entre 2023 e 2025) e observem instantaneamente o efeito propagado em toda a estrutura do DRE até o Lucro Líquido.
3. **Análise OLAP Multidimensional:** Permitir consultas analíticas de agregação temporal (por trimestre, ano ou série histórica de 2002 a 2025), calculando métricas de crescimento YoY (*Year-over-Year*) e QoQ (*Quarter-over-Quarter*).
4. **Agente Executivo com Inteligência Artificial:** Integrar um agente inteligente (via framework **Agno**) capaz de sintetizar resultados, gerar relatórios executivos automáticos e responder perguntas em linguagem natural sobre as variações dos cenários.

---

## ⚙️ 2. Funcionamento do Aplicativo

O funcionamento do aplicativo está estruturado em uma arquitetura desacoplada de alto desempenho (Backend Python + Frontend Next.js):

```
                               ┌─────────────────────────┐
                               │   DRE_financeira.txt    │
                               │ (96 Trimestres/2002-25) │
                               └────────────┬────────────┘
                                            │ (Loader & Schema Normalizer)
                                            ▼
                               ┌─────────────────────────┐
                               │   Polars DataFrame      │
                               │   + DuckDB OLAP Engine  │
                               └────────────┬────────────┘
                                            │
                        ┌───────────────────┴───────────────────┐
                        ▼                                       ▼
           ┌────────────────────────┐              ┌────────────────────────┐
           │ Rustworkx / NetworkX   │              │   Agno AI Agent        │
           │  (DAG Topological Sort)│              │  (Análise Executiva)   │
           └────────────┬───────────┘              └────────────┬───────────┘
                        │                                       │
                        └───────────────────┬───────────────────┘
                                            │ (FastAPI REST endpoints)
                                            ▼
                               ┌─────────────────────────┐
                               │   Next.js 15 Frontend   │
                               │  - Visualizador DAG 2D  │
                               │  - Cubo OLAP 3D Canvas  │
                               │  - Painel de Simulação  │
                               └─────────────────────────┘
```

### Fluxo Didático de Funcionamento:

1. **Ingestão e Normalização de Dados:**
   - O backend lê a série histórica bancária de `DRE_financeira.txt` (dados trimestrais de 2002 a 2025).
   - Realiza a unificação de esquemas históricos e legados (trata mudanças na estrutura contábil pré-2025 e pós-2025), padronizando os nomes canônicos das contas.
   - Carrega a base higienizada no **DuckDB** para consultas agregadas e no **Polars** para cálculo de matrizes.

2. **Mapeamento da Árvore de Dependências (DAG):**
   - O sistema define a fórmula de cada conta calculada. Exemplo:
     $$\text{Produto da Intermediação Financeira} = \text{Receita de Crédito} + \text{Receita de Títulos} - \text{Despesas de Captação}$$
     $$\text{Lucro Líquido} = \text{EBT} - \text{Tributos} - \text{Participação nos Lucros}$$
   - O motor de grafos (**Rustworkx / NetworkX**) faz a **Ordenação Topológica**. Isso garante que qualquer cálculo siga rigorosamente a ordem matemática correta de precedência.

3. **Cálculo Reativo de Simulação ("What-If"):**
   - Quando o usuário altera um parâmetro na interface (ex: varia a conta *Despesas de Captação* em $+10\%$), o engine intercepta a alteração.
   - Identifica os descendentes do nó no grafo.
   - Executa a propagação reativa vetorizada apenas nos nós impactados utilizando **Polars**, retornando o resultado recalculado em milissegundos.

4. **Interface Gráfica e Agente Inteligente:**
   - O frontend renderiza o grafo de dependências, permitindo expansão e inspeção visual.
   - O painel exibe gráficos comparativos de DRE e KPIs antes vs. depois da simulação.
   - O Agente IA lê as diferenças do cenário e gera uma explicação executiva detalhada para tomada de decisão.

---

## 🛠️ 3. Tecnologias Utilizadas

### Backend (Python)
| Tecnologia | Função no Projeto |
| :--- | :--- |
| **Python 3.11+** | Linguagem base do servidor e motor de cálculo. |
| **FastAPI** | Framework web assíncrono para exposição dos endpoints REST JSON. |
| **Polars** | Engine de dataframes altamente performático e vetorizado em Rust, responsável pela reatividade das simulações. |
| **DuckDB** | Banco de dados OLAP embutido na memória para consultas analíticas complexas e agregações temporais (YoY/QoQ). |
| **Rustworkx** | Biblioteca de grafos de altíssima performance (escrita em Rust) para ordenação topológica rápida do DAG. |
| **NetworkX** | Suporte complementar à manipulação e inspeção do grafo de dependências contábeis. |
| **Agno** | Framework de orquestração de Agentes IA para geração de resumos e insights financeiros. |
| **Pydantic** | Validação de schemas de entrada/saída da API REST. |

### Frontend (Next.js / TypeScript)
| Tecnologia | Função no Projeto |
| :--- | :--- |
| **Next.js 15 (App Router)** | Framework React full-stack para construção da interface de usuário. |
| **TypeScript** | Tipagem estática para garantia de robustez na integração com a API. |
| **TailwindCSS** | Estilização moderna e responsiva com suporte a temas Dark / Light. |
| **Three.js / React Three Fiber** | Visualização interativa do Cubo OLAP em 3D no navegador. |
| **Recharts / Lucide React** | Gráficos financeiros interativos e componentes de ícones. |

---

## 🗄️ 4. Bancos de Dados Incorporáveis no Aplicativo

O **HyperCube Engine** possui uma camada de abstração de dados extensível (`backend/app/data/loader.py`). Isso significa que a aplicação não fica presa a uma tecnologia específica e pode se conectar a **bancos de dados proprietários/comerciais (Enterprise)** e **bancos open-source**.

Abaixo está o detalhamento completo dos bancos de dados suportados para integração:

### A. Bancos de Dados Proprietários e Suítes Corporativas Enterprise

1. **Oracle Database & Oracle Autonomous Data Warehouse (ADW):**
   - *Tipo:* Relacional / OLAP Corporativo Enterprise.
   - *Driver Python:* `oracledb` / SQLAlchemy (`oracle+oracledb`).
   - *Caso de Uso:* Conexão nativa com sistemas legados de grandes instituições bancárias e ERPs Oracle (Financials / Hyperion / Essbase). Permite extrair o plano de contas e os lançamentos do DRE via consultas SQL de alta performance.

2. **Microsoft SQL Server (MSSQL) & Azure Synapse Analytics:**
   - *Tipo:* Relacional Enterprise / Cloud Data Warehouse.
   - *Driver Python:* `pyodbc` / `pymssql` / SQLAlchemy (`mssql+pyodbc`).
   - *Caso de Uso:* Integração com ambientes corporativos baseados na stack Microsoft/Azure. Leitura direta de views consolidadas de contabilidade bancária.

3. **IBM Db2 / IBM Netezza:**
   - *Tipo:* Relacional Enterprise & Data Warehouse.
   - *Driver Python:* `ibm_db` / `ibm_db_sa`.
   - *Caso de Uso:* Muito comum em mainframes bancários para armazenamento de registros contábeis históricos.

4. **SAP HANA:**
   - *Tipo:* In-Memory Enterprise Database.
   - *Driver Python:* `hdbcli` / `sqlalchemy-hana`.
   - *Caso de Uso:* Leitura em tempo real de tabelas de balancetes e DREs direto de módulos SAP S/4HANA Finance.

5. **Teradata Vantage:**
   - *Tipo:* Enterprise Analytics Warehouse.
   - *Driver Python:* `teradatasql` / `teradatasqlalchemy`.
   - *Caso de Uso:* Análise de séries temporais de grande escala em ecossistemas legados de grande porte.

---

### B. Cloud Data Warehouses e Data Lakes (SaaS Moderno)

1. **Snowflake:**
   - *Driver Python:* `snowflake-connector-python` / `snowflake-sqlalchemy`.
   - *Caso de Uso:* Consulta direta a tabelas fatos de contabilidade armazenadas na nuvem Snowflake via Polars/DuckDB (`duckdb.read_snowflake`).

2. **Google BigQuery:**
   - *Driver Python:* `google-cloud-bigquery` / `db-dtypes`.
   - *Caso de Uso:* Ingestão serverless de terabytes de dados financeiros e séries temporais históricas.

3. **Amazon Redshift / AWS Athena (S3 Parquet/Delta Lake):**
   - *Driver Python:* `redshift-connector` / `pyathena` / `duckdb` (leitura direta de arquivos Parquet em buckets S3).
   - *Caso de Uso:* Integração com arquiteturas de Data Lakehouse na AWS.

---

### C. Bancos de Dados Analíticos Open-Source (OLAP) — *Engine Interno*

1. **DuckDB (Padrão Atual do Aplicativo):**
   - *Tipo:* OLAP In-Memory / Embarcado.
   - *Driver:* `duckdb`.
   - *Vantagem:* Desempenho analítico extremo em memória, zero configuração de servidor, ideal para execução local ou edge.

2. **ClickHouse:**
   - *Tipo:* OLAP Colunar Open-Source.
   - *Driver Python:* `clickhouse-connect` / `clickhouse-driver`.
   - *Caso de Uso:* Processamento de bilhões de linhas contábeis por segundo com agregação instantânea.

---

### D. Bancos de Dados Relacionais e Séries Temporais (OLTP / Metadata)

1. **PostgreSQL / TimescaleDB:**
   - *Driver Python:* `psycopg2` / `asyncpg` / `sqlalchemy`.
   - *Caso de Uso:* Persistência de cenários simulados por usuários, preferências de interface, logs de auditoria e otimização de séries temporais com a extensão *TimescaleDB*.

2. **MySQL / MariaDB:**
   - *Driver Python:* `pymysql` / `mysqlconnector`.
   - *Caso de Uso:* Armazenamento relacional leve para suporte a sistemas corporativos de médio porte.

3. **SQLite:**
   - *Driver Python:* `sqlite3` (Nativo do Python).
   - *Caso de Uso:* Armazenamento embarcado local de parâmetros de simulação e chaves de API sem necessidade de servidor externo.

---

### E. Bancos de Dados baseados em Grafos (Graph Databases)

1. **Neo4j / Memgraph:**
   - *Driver Python:* `neo4j` / `gqlalchemy`.
   - *Caso de Uso:* Mapeamento e persistência de estruturas contábeis e árvores de rateio extremamente complexas (DAGs hierárquicos entre holdings, coligadas e subsidiárias bancárias).

---

## 📝 Matriz de Compatibilidade e Conectores

| Banco de Dados / Fonte | Categoria | Conector Python Recomendado | Função no HyperCube |
| :--- | :--- | :--- | :--- |
| **DuckDB** | OLAP In-Memory | `duckdb` | Motor de cálculo analítico e agrupamentos temporais (Padrão). |
| **Oracle Database** | Enterprise (Proprietário) | `oracledb` / `SQLAlchemy` | Ingestão de lançamentos contábeis de ERPs Oracle/Hyperion. |
| **Microsoft SQL Server** | Enterprise (Proprietário) | `pyodbc` / `pymssql` | Integração com bases contábeis corporativas Microsoft. |
| **SAP HANA** | In-Memory Enterprise | `hdbcli` | Conexão direta com contabilidade SAP S/4HANA. |
| **Snowflake** | Cloud Data Warehouse | `snowflake-connector-python` | Leitura de Data Lakes/Data Warehouses corporativos. |
| **PostgreSQL** | Relacional / Timescale | `psycopg2` / `asyncpg` | Persistência de cenários "What-If", usuários e auditoria. |
| **Neo4j** | Grafos | `neo4j` | Persistência e navegação de DAGs contábeis gigantescos. |

---

> 💡 **Como conectar seu banco de dados:** Todas as pontes de dados do HyperCube são centralizadas no arquivo [loader.py](file:///c:/Users/edumo/HyperCube/backend/app/data/loader.py). Basta adicionar o método de extração SQL via driver nativo ou `SQLAlchemy`, convertendo a consulta resultante em um DataFrame **Polars** ou tabela **DuckDB**!
