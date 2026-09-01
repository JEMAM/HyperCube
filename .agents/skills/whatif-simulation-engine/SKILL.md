---
name: whatif-simulation-engine
description: Reactive What-If simulation engine skill for evaluating topological propagation of financial shocks across DRE and DFC Directed Acyclic Graphs (DAGs).
---

# Skill: What-If Simulation Engine

Provides rules and algorithms for executing reactive "What-If" scenario simulations on DRE and DFC Directed Acyclic Graphs (DAGs).

## Core Rules

1. **Reactive Propagation**:
   - When an input node (e.g. *Receita Operacional*, *CMV*, *Despesas de Captação*, *Vendas*) is varied by $X\%$, calculate topological order using Rustworkx/NetworkX.
   - Re-evaluate ONLY affected downstream nodes vectorially using Polars.

2. **Multi-Period Horizon**:
   - Supports single-period (e.g. 1T26 vs 1T25), multi-quarter, or multi-year simulations.
   - Computes absolute delta ($\Delta R\$$) and relative percentage change ($\%$) for Net Income and Cash Flow.

3. **Multi-Sector Adaptability**:
   - Evaluates commercial DREs, industrial DREs, and banking DREs without hardcoding sector-specific formulas.
