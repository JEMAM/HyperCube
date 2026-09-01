# 🧊 HyperCube Engine

**HyperCube Engine** é um motor de cálculo multidimensional reativo e simulador de planejamento financeiro ("What-If") de alta performance voltado para Demonstrações do Resultado do Exercício (DRE) Bancário.

Inspirado por sistemas tradicionais de mercado (como IBM TM1 e Oracle Hyperion/Essbase), o HyperCube combina o processamento vetorizado em memória (**Polars** + **DuckDB**), ordenação topológica por grafos de dependência contábil (**Rustworkx**) e uma interface moderna em **Next.js 15** com agentes de Inteligência Artificial (**Agno**) para análises executivas automáticas.

---

## 🚀 Principais Funcionalidades

* **Modelagem Reativa Baseada em Grafos (DAG):** Reavaliação instantânea apenas dos nós afetados por alterações de premissas financeiras, evitando o recálculo pesado de toda a matriz.
* **Simulação de Cenários "What-If":** Variações percentuais em contas contábeis e propagação imediata dos impactos no Lucro Líquido.
* **Cubo OLAP Multidimensional:** Consultas analíticas e agregações temporais (trimestral e anual de 2002 a 2025) com métricas de crescimento YoY (*Year-over-Year*) e QoQ (*Quarter-over-Quarter*).
* **Visualização Interativa:** Grafos de dependência e componentes gráficos de DRE no frontend.
* **Agente IA Executivo (Agno):** Diagnósticos automáticos em linguagem natural sobre as variações dos cenários simulados.

---

## 🛠️ Arquitetura e Tecnologias

### Backend (`/backend`)
* **Python 3.11+**
* **FastAPI:** Exposição de endpoints REST assíncronos.
* **Polars:** Processamento vetorizado e reatividade matemática em Rust.
* **DuckDB:** Banco OLAP em memória para agregações de séries históricas.
* **Rustworkx & NetworkX:** Grafos Acíclicos Dirigidos (DAG) e ordenação topológica.
* **Agno:** Agentic AI para geração de insights financeiros executivos.

### Frontend (`/frontend`)
* **Next.js 15 (App Router)** & **TypeScript**
* **TailwindCSS:** Estilização responsiva.
* **Three.js / React Three Fiber:** Renderização e visualizações 3D.
* **Recharts & Lucide React:** Gráficos interativos e UI.

---

## 📂 Estrutura do Repositório

```
HyperCube/
├── backend/                             # Servidor FastAPI e Motor de Cálculo
├── frontend/                            # Aplicação Next.js 15
├── ARQUITETURA_E_FUNCIONAMENTO.md      # Especificação técnica detalhada
├── RELATORIO_DE_TESTES_E_AUDITORIA.md  # Relatórios e auditorias de testes
├── DRE_financeira.txt                   # Base de dados histórica (2002 - 2025)
└── README.md                            # Documentação principal
```

---

## 🚦 Como Executar o Projeto

### Pré-requisitos
* **Python 3.11+**
* **Node.js 18+** e **npm** / **pnpm**

---

### 1. Inicializando o Backend (Python / FastAPI)

Navegue até a pasta do backend e instale as dependências:

```bash
cd backend
python -m venv venv
# No Windows PowerShell:
.\venv\Scripts\Activate.ps1
# No Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
```

Inicie o servidor de desenvolvimento:

```bash
uvicorn main:app --reload --port 8000
```
O backend estará acessível em: `http://localhost:8000` (documentação Swagger em `http://localhost:8000/docs`).

---

### 2. Inicializando o Frontend (Next.js 15)

Navegue até a pasta do frontend e instale os pacotes:

```bash
cd frontend
npm install
```

Execute o servidor de desenvolvimento:

```bash
npm run dev
```
O aplicativo estará acessível no navegador em: `http://localhost:3000`.

---

## 🧪 Testes e Validação

Para rodar os testes do motor de cálculo e rotas no backend:

```bash
cd backend
pytest
```

---

## 📚 Documentação Complementar

* [GUIA_DO_USUARIO_E_MANUAL.md](file:///c:/Users/edumo/HyperCube_.4/GUIA_DO_USUARIO_E_MANUAL.md): **Manual Oficial do Usuário & Guia Operacional Passo a Passo** (Ingestão, DRE, DFC, Balanço Fleuriet, Valuation What-If, Cubo 3D OLAP, CVM Watch e Macro BCB).
* [agentes_skills_usados.md](file:///c:/Users/edumo/HyperCube_.4/agentes_skills_usados.md): Catálogo detalhado de todos os Agentes IA Agno e Skills especializadas integradas.
* [ARQUITETURA_E_FUNCIONAMENTO.md](file:///c:/Users/edumo/HyperCube_.4/ARQUITETURA_E_FUNCIONAMENTO.md): Detalhamento matemático do Grafo DAG, DuckDB, Polars e motor reativo.
* [RELATORIO_DE_TESTES_E_AUDITORIA.md](file:///c:/Users/edumo/HyperCube_.4/RELATORIO_DE_TESTES_E_AUDITORIA.md): Resultados das auditorias de código e testes do motor.
