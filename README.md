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



🚀 Apresento o HyperCube 1.0 — Planejamento Financeiro Conectado & Inteligência Multidimensional Reativa.

Desenvolvi o HyperCube com o objetivo de elevar o nível do FP&A corporativo, unindo modelagem financeira avançada, cálculo multidimensional reativo e Inteligência Artificial.

💡 O que o HyperCube resolve:

🔹 Triângulo Contábil Fechado: Integração matemática em tempo real entre DRE, Fluxo de Caixa (DFC) e Balanço Patrimonial (BP), com conciliação automática Ativo = Passivo + PL.
🔹 Motor Multidimensional & Cubo 3D OLAP: Navegação interativa em WebGL cruzando Contas, Linhas de Negócio e Linha do Tempo.
🔹 CVM Watch & Análise: Ingestão direta dos dados públicos da CVM (ITR/DFP de empresas da B3 como Braskem, Vale, Klabin, Petrobras).
🔹 Modelos Avançados de Finanças: Modelo Fleuriet (NCG/CDG/Efeito Tesoura), Decomposição DuPont, Simulações Estocásticas de Monte Carlo e Valuation DCF com WACC dinâmico.
🔹 Agentes de IA Financeira: Suporte multi-provedor com Google DeepMind (Gemini), Groq (Llama 3.3) e modelos locais via Ollama para análises preditivas.

🌐 Acesse a demonstração online:
👉 https://hypercube-kappa.vercel.app/

🧪 Como testar:
A plataforma está em modo Sandbox aberto para testes. Basta inserir qualquer e-mail e senha no formulário de login (ou clicar em um dos perfis demo de Diretoria FP&A) para explorar todos os 20 módulos.

Feedback e impressões são muito bem-vindos! 💬

#FPA #CorporateFinance #ConnectedPlanning #Nextjs #FastAPI #Fintech #CVM #BusinessIntelligence #FinancialModeling #AI



Modernizando o FP&A: Do Excel estático ao Planejamento Financeiro Conectado em tempo real. 📊

Quem trabalha com controladoria e planejamento financeiro sabe o desafio de manter projeções orçamentárias sincronizadas entre demonstrações contábeis sem quebrar fórmulas complexas.

Para solucionar esse gargalo, criei o HyperCube 1.0 — uma plataforma de Connected Planning orientada a grafos de dependência reativos (DAGs):

📌 Principais Capacidades: • Consistência Causal Instantânea: Altere uma premissa de receita ou prazo médio e veja o impacto propagar em milissegundos pela DRE, DFC e Balanço Patrimonial.
• Gestão de Liquidez & Fleuriet: Diagnóstico imediato de Necessidade de Capital de Giro (NCG) e detecção antecipada de Efeito Tesoura.
• Dados Oficiais da CVM: Carga e comparação com balanços auditados de companhias abertas brasileiras.
• Cubo 3D OLAP: Análise visual volumétrica de margens e desvios por centro de custo e período.
• Inteligência Artificial Integrada: Diagnósticos contábeis automáticos gerados por LLMs com governança estrita de escopo.

🔗 Deploy em produção:
💻 https://hypercube-kappa.vercel.app/

🔑 Acesso para demonstração:
O ambiente está liberado para testes da comunidade: basta digitar qualquer e-mail e senha no acesso rápido para testar livremente as simulações.

Gostaria muito de ouvir a opinião de profissionais de finanças, tecnologia e dados!

#Controladoria #CFO #PlanejamentoFinanceiro #FPA #DataAnalytics #FinancialEngineering
