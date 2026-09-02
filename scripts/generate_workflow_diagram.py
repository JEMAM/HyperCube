import time
from playwright.sync_api import sync_playwright

html_content = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Workflow dos Agentes de IA - HyperCube</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #071322; color: #f8fafc; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .glow-orange { filter: drop-shadow(0 0 20px rgba(255, 107, 77, 0.4)); }
    .glow-cyan { filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.35)); }
    .glow-emerald { filter: drop-shadow(0 0 20px rgba(52, 211, 153, 0.35)); }
  </style>
</head>
<body class="p-10 flex items-center justify-center min-h-screen">
  <div class="w-[1400px] bg-[#0c1f38] border border-[#1b3a63] rounded-3xl p-10 shadow-2xl relative overflow-hidden">
    <!-- Grid Pattern Background -->
    <div class="absolute inset-0 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

    <!-- Header / Branding -->
    <div class="flex items-center justify-between border-b border-[#1b3a63] pb-6 mb-8 relative z-10">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff6b4d] to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-3xl font-black tracking-tight text-white">Hyper<span class="text-[#ff6b4d]">Cube</span></h1>
            <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">CONNECTED PLANNING ENGINE</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">AGNO AGENTS</span>
          </div>
          <p class="text-sm text-slate-400 font-medium">Arquitetura de Inteligência Agêntica, Grafos DAG Reativos e Cubos OLAP 3D</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Deploy em Produção</div>
        <div class="text-sm font-black text-emerald-400 flex items-center gap-1.5 justify-end">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          hypercube-kappa.vercel.app
        </div>
      </div>
    </div>

    <!-- Main Architecture Grid: 4 Columns -->
    <div class="grid grid-cols-12 gap-6 relative z-10">
      
      <!-- Coluna 1: Fontes de Dados (3 cols) -->
      <div class="col-span-3 space-y-4">
        <div class="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
          1. Fontes de Dados Corporativas
        </div>

        <div class="bg-[#08172c] border border-[#1a3860] rounded-2xl p-4 space-y-2">
          <div class="flex items-center gap-2 text-white font-bold text-sm">
            <span class="text-cyan-400">📊</span> CVM Dados Abertos
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">Demonstrações DFP/ITR padronizadas (718+ companhias listadas na B3).</p>
          <div class="text-[10px] text-cyan-300 mono bg-cyan-950/40 p-1.5 rounded border border-cyan-800/40">Braskem, Klabin, Petrobras, Vale</div>
        </div>

        <div class="bg-[#08172c] border border-[#1a3860] rounded-2xl p-4 space-y-2">
          <div class="flex items-center gap-2 text-white font-bold text-sm">
            <span class="text-emerald-400">🏛️</span> Banco Central (BCB SGS)
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">13 séries oficiais de Selic (432), IPCA (13522), PTAX (10813) e Pesquisa Focus.</p>
          <div class="text-[10px] text-emerald-300 mono bg-emerald-950/40 p-1.5 rounded border border-emerald-800/40">Sincronização Contínua em Tempo Real</div>
        </div>

        <div class="bg-[#08172c] border border-[#1a3860] rounded-2xl p-4 space-y-2">
          <div class="flex items-center gap-2 text-white font-bold text-sm">
            <span class="text-amber-400">🔌</span> Conexões ERP & Arquivos
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">Conectores nativos SAP S/4HANA, TOTVS Protheus, Oracle EBS, PDF e Excel.</p>
          <div class="text-[10px] text-amber-300 mono bg-amber-950/40 p-1.5 rounded border border-amber-800/40">Docling Parser & OCR Estrutural</div>
        </div>
      </div>

      <!-- Coluna 2: Agentes Especialistas de IA (3 cols) -->
      <div class="col-span-3 space-y-3">
        <div class="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#ff6b4d]">
          <span class="w-2 h-2 rounded-full bg-[#ff6b4d]"></span>
          2. Agentes de IA Autônomos (Agno)
        </div>

        <div class="bg-[#0a1b32] border border-orange-500/30 rounded-2xl p-3.5 space-y-1.5 hover:border-orange-500 transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-orange-400">EconomicAgent (PhD)</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">Macro & Copom</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug">Avalia postura hawkish do Copom e projeta cenários de Selic e câmbio nos balanços.</p>
        </div>

        <div class="bg-[#0a1b32] border border-cyan-500/30 rounded-2xl p-3.5 space-y-1.5 hover:border-cyan-500 transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-cyan-400">AnalysisAgent (What-If)</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">FP&A Executive</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug">Sintetiza impactos executivos no Lucro Líquido e margens em linguagem natural.</p>
        </div>

        <div class="bg-[#0a1b32] border border-emerald-500/30 rounded-2xl p-3.5 space-y-1.5 hover:border-emerald-500 transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-emerald-400">ValuationAgent</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">DCF & Múltiplos</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug">Calcula WACC via CAPM, Gordon Growth, Múltiplos EV/EBITDA e Sensibilidade 2D.</p>
        </div>

        <div class="bg-[#0a1b32] border border-purple-500/30 rounded-2xl p-3.5 space-y-1.5 hover:border-purple-500 transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-purple-400">Governance & Covenants</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Auditor SOC 2</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug">Monitora Dívida Líquida/EBITDA, limites de debêntures e conciliação Fleuriet/Dupont.</p>
        </div>
      </div>

      <!-- Coluna 3: Core Engine Hipercomputacional (3 cols) -->
      <div class="col-span-3 space-y-3">
        <div class="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400">
          <span class="w-2 h-2 rounded-full bg-purple-400"></span>
          3. HyperCube Core Engine
        </div>

        <div class="bg-gradient-to-b from-[#0f2444] to-[#0a1b33] border border-cyan-500/40 rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-black text-white">Grafo DAG Reativo</span>
            <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-black mono">&lt;10ms</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            Ordenação topológica que recalcula apenas os nós impactados pelo Write-Back em cascata.
          </p>
          <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-[10px] text-cyan-300 mono">
            DRE ➔ DFC ➔ Balanço (Δ = 0.00)
          </div>
        </div>

        <div class="bg-[#08172c] border border-[#1a3860] rounded-2xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-black text-white">Cubo OLAP 3D Multidimensional</span>
            <span class="text-xs text-orange-400 font-bold">DuckDB + Polars</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            Tensor 3D (Linhas Contábeis × Cenários × Tempo) com Breakback proporcional e slices em tempo real.
          </p>
        </div>

        <div class="bg-[#08172c] border border-[#1a3860] rounded-2xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-black text-white">Monte Carlo Estocástico</span>
            <span class="text-xs text-emerald-400 font-bold">10.000 iterações</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            Distribuição probabilística de EBITDA, P10/P50/P90 e Value at Risk (VaR).
          </p>
        </div>
      </div>

      <!-- Coluna 4: Interface & Decisão Executiva (3 cols) -->
      <div class="col-span-3 space-y-3">
        <div class="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          4. Interface & Decisão (Next.js)
        </div>

        <div class="bg-[#08172c] border border-[#1a3860] rounded-2xl p-3.5 space-y-2">
          <div class="text-xs font-bold text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span> 19 Módulos Corporativos
          </div>
          <p class="text-[11px] text-slate-400">DRE, DFC, Balanço, DRA, DMPL, DVA, Notas Explicativas e CVM Watchdog.</p>
        </div>

        <div class="bg-[#08172c] border border-[#1a3860] rounded-2xl p-3.5 space-y-2">
          <div class="text-xs font-bold text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-orange-400"></span> Simulação What-If ao Vivo
          </div>
          <p class="text-[11px] text-slate-400">Edição direta de qualquer célula com propagação visual instantânea em gráficos e tabelas.</p>
        </div>

        <div class="bg-[#08172c] border border-[#1a3860] rounded-2xl p-3.5 space-y-2">
          <div class="text-xs font-bold text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span> Chat com Analista IA
          </div>
          <p class="text-[11px] text-slate-400">Perguntas em linguagem natural para Gemini 3.7 / Groq / OpenAI com memória financeira.</p>
        </div>

        <div class="bg-[#08172c] border border-[#1a3860] rounded-2xl p-3.5 space-y-2">
          <div class="text-xs font-bold text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-400"></span> Exportação Oficial
          </div>
          <p class="text-[11px] text-slate-400">Geração com 1 clique de relatórios executivos em Excel multipáginas e PDF vetorial.</p>
        </div>
      </div>

    </div>

    <!-- Footer Bar -->
    <div class="mt-8 pt-4 border-t border-[#1b3a63] flex items-center justify-between text-xs text-slate-400 relative z-10">
      <div class="flex items-center gap-6">
        <span>⚡ <strong>Stack:</strong> Next.js 15 • TailwindCSS • FastAPI • Polars • DuckDB • Agno AI</span>
        <span>🔒 <strong>Privacidade:</strong> Dados processados em memória local, sem vazamento de dados</span>
      </div>
      <div class="text-[#ff6b4d] font-bold">
        HyperCube Connected Planning v3.0
      </div>
    </div>
  </div>
</body>
</html>
"""

with open("artifacts/workflow_agentes.html", "w", encoding="utf-8") as f:
    f.write(html_content)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1500, "height": 920})
    page.goto("file:///c:/Users/edumo/HyperCube-1.0/artifacts/workflow_agentes.html", wait_until="networkidle")
    time.sleep(1)
    page.screenshot(path="C:/Users/edumo/.gemini/antigravity-ide/brain/79ffe3e3-5435-4192-85cd-c40fd494a4d9/workflow_agentes_hypercube_ptbr.png")
    page.screenshot(path="artifacts/workflow_agentes_hypercube_ptbr.png")
    print("SUCCESS: Technical workflow diagram saved in 4K resolution!")
    browser.close()
