# Antigravity Prompt — Hyperblock Engine (Reactive Multidimensional Calculation Engine)

## CONTEXT AND GOAL

Build a complete application (frontend + backend) implementing a **reactive, multidimensional "Hyperblock-style" calculation engine**, inspired by FP&A planning engines like TM1/Hyperion, but using modern Python (Polars, DuckDB, NetworkX/Rustworkx) on the backend and Next.js on the frontend.

The end goal is to let the user:
- Load financial data from `DRE_financeira.txt` (a quarterly income-statement / DRE dataset, `data` column as the time dimension);
- Run analytical OLAP queries on that data (temporal aggregations — by year, by decade, YoY/QoQ growth);
- View and edit the dependency tree between financial accounts (DAG);
- Automatically cascade-recalculate only the affected cells/columns when an assumption changes (true "reactivity", not a full recalculation);
- Run "What-If" simulations (e.g., an increase in funding expenses or credit-risk provisions) and see the impact propagate through to Net Income (`lucro_liquido`);
- Visualize the DAG and the before/after simulation results graphically.

This project should be deliverable, documented, testable, and runnable locally (dev mode), with the possibility of future deployment.

---

## REQUIRED TECH STACK

**Backend (Python):**
- `polars` — vectorized dataframe engine for the reactive calculations
- `duckdb` — embedded OLAP engine for aggregate analytical queries
- `networkx` — building and manipulating the dependency DAG (didactic/visualization purposes)
- `rustworkx` — high-performance graph implementation for production-grade topological sorting
- `graphviz` (+ `pydot` or `networkx.drawing.nx_pydot`) — visual export of the DAG
- `seaborn` + `matplotlib` — generating the analytical charts
- `agno` — AI agent orchestration (e.g., an agent that suggests assumptions, explains variances, and answers natural-language questions about the results)
- `fastapi` (+ `uvicorn`) — REST API exposing the engine to the frontend
- `pydantic` — validation of the API's input/output schemas

**Frontend:**
- `Next.js` (App Router, TypeScript)
- `TailwindCSS` for styling
- A frontend charting library (e.g., `recharts` or `visx`) for interactive dashboards
- A frontend graph library (e.g., `react-flow` or `vis-network`) to display the DAG interactively
- Communication with the backend via REST/JSON (or WebSocket for real-time reactive updates, if feasible)

**Input data:**
- Test file: `DRE_financeira.txt`, semicolon-delimited (`;`), quoted fields, decimal comma in some numeric columns (e.g., `"608,0"`), quarterly rows from 2002-03-31 to 2025-12-31. Located at `C:\Users\edumo\Documents\DRE_financeira.txt` — treat it as the sample data source; also build a synthetic data generator (Python script) for cases where the file is unavailable, or to generate additional test periods.

---

## PROJECT STRUCTURE (suggested)

```
hyperblock-engine/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app
│   │   ├── data/
│   │   │   ├── loader.py            # reads DRE_financeira.txt, handles schema evolution, synthetic generation
│   │   │   └── DRE_financeira.txt
│   │   ├── olap/
│   │   │   └── duckdb_queries.py    # OLAP queries (annual aggregations, YoY growth)
│   │   ├── graph/
│   │   │   ├── dag_builder.py       # DAG construction (networkx + rustworkx)
│   │   │   └── dag_export.py        # visual export (graphviz)
│   │   ├── engine/
│   │   │   └── hyperblock_engine.py # PolarsHyperblockEngine class
│   │   ├── agents/
│   │   │   └── analysis_agent.py    # agno agent for explanations/insights
│   │   ├── api/
│   │   │   └── routes.py            # REST endpoints
│   │   └── viz/
│   │       └── charts.py            # seaborn chart generation
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── DagViewer.tsx
│   │   ├── ScenarioPanel.tsx
│   │   └── ResultsDashboard.tsx
│   └── package.json
└── README.md
```

---

## DETAILED FUNCTIONAL SPECIFICATION (implement in this order)

### 1. Test data generation and loading
- Read `DRE_financeira.txt` as the primary source. It is `;`-delimited, values are quoted, numeric fields sometimes use decimal comma (e.g., `"608,0"`) and empty string (`""`) for missing values — the loader must normalize these (strip quotes, replace `,` with `.`, cast to float, coerce `""` to null).
- **Time dimension:** unlike a typical FP&A cube, this dataset has a single entity with `data` (quarter-end date) as the only dimension — there is no `Produto`/`Estado`/`Versao` breakdown. Derive `ano` (year) and `trimestre` (quarter number) from `data` for OLAP grouping.
- **Schema evolution:** the file's column layout changes starting 2025-03-31. Handle both eras explicitly in the loader:
  - **Legacy era (2002–2024):** uses `receita_com_titulos_e_valores_mobiliarios_1`, separate `despesas_de_pessoal` and `despesas_administrativas`, and does not populate `resultado_com_titulos_e_valores_mobiliarios`, `despesas_com_pessoal_e_administrativas`, `participacao_nos_lucros`, `lucro_liquido`, or `resultado_de_alienacoes_de_acoes_e_amort_cotas_de_fundos` (all blank/empty in this era).
  - **Current era (2025+):** uses `resultado_com_titulos_e_valores_mobiliarios` and `despesas_com_pessoal_e_administrativas` instead, populates `lucro_liquido`, `participacao_nos_lucros`, and `resultado_de_alienacoes_de_acoes_e_amort_cotas_de_fundos`, and leaves `receita_com_titulos_e_valores_mobiliarios_1`, `despesas_de_pessoal`, `despesas_administrativas` blank.
- Normalize both eras into a single canonical schema (documented mapping table in the README) so the DAG/engine can operate on one consistent set of column names.
- Expected columns (minimum contract, canonical names): `data`, `receita_com_operacoes_de_credito_e_repasses`, `receita_titulos_valores_mobiliarios` (unified from either era), `despesas_de_captacao`, `produto_da_intermediacao_financeira`, `provisao_para_risco_de_credito_prc`, `resultado_da_intermediacao_financeira`, `resultado_com_participacoes_societarias`, `receita_de_dividendos_e_juros_sobre_o_capital_proprio`, `resultado_com_equivalencia_patrimonial`, `reversao_constituicao_de_provisao_para_ajuste_de_investimentos`, `resultado_com_alienacoes_de_titulos_de_renda_variavel`, `resultado_com_derivativos_renda_variavel`, `resultado_com_fundos_participacoes_societarias`, `outras_rendas_despesas_sobre_participacoes_societarias`, `despesas_pessoal_e_administrativas` (unified from either era), `despesas_tributarias`, `outras_despesas_liquidas`, `resultado_antes_da_tributacao`, `tributos_sobre_o_lucro`, `participacao_nos_lucros`, `lucro_liquido`.
- Implement `loader.py` with a fallback: if the file doesn't exist, generate plausible synthetic quarterly data (same column contract, ~90 quarters, values in the same order of magnitude as the real series) using `polars` or `numpy`.
- Load the data into a DuckDB table (`duckdb.connect()`, either in-memory or persisted to `.duckdb`).

### 2. OLAP queries with DuckDB
- Implement a function that aggregates `resultado_antes_da_tributacao` and `lucro_liquido` by `ano` (calendar year), summing the four quarters, and computing year-over-year growth.
- Expose this query as the `/api/olap/resultado-por-ano` endpoint.
- Write the query in raw SQL inside DuckDB (document the query in the code).

### 3. Dependency tree mapping (DAG) with NetworkX/Rustworkx
- Define nodes = financial accounts, using the canonical column names from Section 1. Key relationships verified against the actual data:
  - `produto_da_intermediacao_financeira = receita_com_operacoes_de_credito_e_repasses + receita_titulos_valores_mobiliarios + despesas_de_captacao`
  - `resultado_da_intermediacao_financeira = produto_da_intermediacao_financeira + provisao_para_risco_de_credito_prc`
  - `resultado_com_participacoes_societarias = receita_de_dividendos_e_juros_sobre_o_capital_proprio + resultado_com_equivalencia_patrimonial + reversao_constituicao_de_provisao_para_ajuste_de_investimentos + resultado_com_alienacoes_de_titulos_de_renda_variavel + resultado_com_derivativos_renda_variavel + resultado_com_fundos_participacoes_societarias + outras_rendas_despesas_sobre_participacoes_societarias`
  - `resultado_antes_da_tributacao = resultado_da_intermediacao_financeira + resultado_com_participacoes_societarias + despesas_pessoal_e_administrativas + despesas_tributarias + outras_despesas_liquidas`
  - `lucro_liquido = resultado_antes_da_tributacao + tributos_sobre_o_lucro + participacao_nos_lucros` (validate sign conventions against the 2025+ rows, where `lucro_liquido` is populated directly, and use those rows as ground truth for the formula).
- Classify nodes into three types: `input` (editable assumptions — e.g., `despesas_de_captacao`, `provisao_para_risco_de_credito_prc`, `despesas_pessoal_e_administrativas`), `calculated` (intermediate formulas — e.g., `produto_da_intermediacao_financeira`, `resultado_da_intermediacao_financeira`, `resultado_antes_da_tributacao`), `target` (final KPI: `lucro_liquido`).
- Build the graph with `networkx.DiGraph` for didactic/visual purposes, and mirror it in `rustworkx.PyDiGraph` for high-performance topological-sort calculations (`rustworkx.topological_sort`).
- Validate that the graph is acyclic (DAG) — raise a clear error if a cycle is detected.

### 4. Reactive recalculation engine with Polars — `PolarsHyperblockEngine`
- Implement a `PolarsHyperblockEngine` class with:
  - `__init__(self, df: pl.DataFrame, dag)` — receives the quarterly time-series data and the dependency graph.
  - `set_formula(node, fn)` — registers the Polars calculation function (a `pl.col(...)` expression) for each calculated node.
  - `recalculate(changed_nodes: list[str])` — starting from the changed nodes, walks the DAG in topological order, touching **only the affected descendant nodes** (not a full recalculation), and updates the corresponding Polars dataframe columns across all quarters.
  - `get_dataframe()` — returns the current state of the dataframe.
  - Cache/memoization of unaffected nodes to make the performance gain of the reactive approach explicit (optionally measure and log execution time comparing full vs. partial recalculation).
- This is the core of the project: what differentiates it from a regular spreadsheet is precisely that it recalculates only what's necessary.

### 5. "What-If" scenario simulation
- Implement an endpoint/function that applies a change: e.g., a 10% increase in `despesas_de_captacao` (funding expenses) for a chosen date range (e.g., all quarters in 2024–2025), or a 20% increase in `provisao_para_risco_de_credito_prc` (credit-risk provision).
- Trigger `engine.recalculate(["despesas_de_captacao"])` (or the equivalent node) and observe the propagation through to `lucro_liquido`.
- Keep the "before" and "after" simulation states in memory (or as two Polars tables) to allow comparison.
- Expose a `/api/simulate/whatif` endpoint that accepts generic parameters (node, date-range filter, percentage/absolute change) so it isn't hardcoded to a single account or period.

### 6. Dependency graph visualization
- Generate a DAG visualization with `networkx` + `graphviz`, highlighting with different colors:
  - Input nodes — e.g., blue
  - Calculated nodes — e.g., gray
  - Target node (`lucro_liquido`) — e.g., green/highlighted
- Export as an image (PNG/SVG) served by the backend and displayed on the frontend.
- On the frontend, implement an equivalent interactive visualization with `react-flow` (draggable nodes; clicking a node shows its formula and current value for the selected quarter).

### 7. Visual analysis of results
- Generate with `seaborn`:
  - Line chart: "Quarterly Evolution of resultado_antes_da_tributacao and lucro_liquido" (2002–2025), before vs. after the simulation.
  - Bar chart: "Annual lucro_liquido" (summed by year), before vs. after the simulation.
- Expose these images via endpoints (`/api/charts/resultado-trimestral`, `/api/charts/lucro-anual`), or preferably send the aggregated data as JSON for the frontend to render with `recharts`, keeping the `seaborn` charts only for a "static report" version (e.g., PDF/PNG export).

### 8. AI Agent (agno)
- Implement a simple agent with `agno` that:
  - Receives the simulation result (before/after) and generates an executive summary in natural language explaining the impact (e.g., "A 10% increase in funding expenses in 2024–2025 reduced net income by X%, most concentrated in Q4 periods due to higher seasonal volumes").
  - Answers free-form user questions about the loaded data (e.g., "which year had the largest drop in resultado_antes_da_tributacao?", "how did the schema change in 2025 affect comparability?").
- Expose via the `/api/agent/explain` and `/api/agent/ask` endpoints.

---

## NON-FUNCTIONAL REQUIREMENTS

- Typed Python code (type hints), organized into modules, with docstrings explaining each function's purpose.
- Unit tests (pytest) covering at least: DAG construction, cycle detection, partial vs. full recalculation, the what-if simulation, and correct handling of the 2002–2024 vs. 2025+ schema mapping.
- Clear logs indicating which nodes were recalculated on each change (to make the "reactivity" evident).
- A complete README explaining: how to install dependencies, how to run the backend and frontend, how to swap the input data file, the legacy/current column-mapping table, and how to interpret the results.
- Friendly error handling on both the API and the frontend (clear messages, not just a stack trace).

---

## EXPECTED DELIVERABLES

1. A functional repository with the backend (FastAPI) and frontend (Next.js) running locally.
2. A web dashboard allowing the user to:
   - View the aggregated OLAP data (annual/quarterly).
   - View and interact with the DAG.
   - Run what-if simulations via a form (node, date-range filter, % change).
   - See the before/after comparison charts.
   - Read the AI agent's generated summary.
3. Technical documentation explaining the "Hyperblock Engine" architecture, the legacy/current schema-mapping decisions, and why partial recalculation via topological ordering is more efficient than recalculating the entire table.

---

## FINAL INSTRUCTIONS FOR THE AGENT (ANTIGRAVITY)

- Work incrementally: first build the backend (loader → DuckDB → DAG → engine → simulation) and validate it via tests before building the frontend.
- Prioritize the correctness of the reactive engine (`PolarsHyperblockEngine`) over visual polish — it is the technical core of the project.
- Whenever a design decision isn't clear from the spec — especially around the 2002–2024 vs. 2025+ schema differences — choose the simplest option and document that choice in the README.
- At the end of each stage (1 through 8 above), produce a short summary of what was implemented and which files were created/modified.
- Only ask the user a question if something is truly blocking; otherwise, assume reasonable defaults and proceed.
