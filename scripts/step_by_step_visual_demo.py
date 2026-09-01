"""
Step-by-step visual process runner for HyperCube
Executes every process sequentially, capturing detailed screenshots for the visual walkthrough.
"""

import os
import sys
import time
from playwright.sync_api import sync_playwright

def run_step_by_step():
    artifacts_dir = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756"
    steps_dir = os.path.join(artifacts_dir, "step_walkthrough")
    os.makedirs(steps_dir, exist_ok=True)

    print("=" * 60)
    print("Iniciando Demonstração Passo a Passo Visual do HyperCube")
    print("=" * 60)

    with sync_playwright() as p:
        # Launch Chromium with high-definition viewport
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 920})
        page = context.new_page()

        # PASSO 1: Abertura da Aplicação & Landing Page
        print("\n[PASSO 1] Abertura da Aplicação & Landing Page...")
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        time.sleep(2)
        step1_path = os.path.join(steps_dir, "passo1_landing_page.png")
        page.screenshot(path=step1_path)
        print(f"  -> Passo 1 capturado: {step1_path}")

        # PASSO 2: Modal de Configuração do Motor IA (Abertura)
        print("\n[PASSO 2] Modal de Configuração do Motor IA...")
        step2_path = os.path.join(steps_dir, "passo2_config_ia_modal.png")
        page.screenshot(path=step2_path)
        print(f"  -> Passo 2 capturado: {step2_path}")

        # Confirmar e fechar modal de IA
        modal_btn = page.locator("button:has-text('Confirmar Modelo & Abrir Painel')")
        if modal_btn.count() > 0 and modal_btn.first.is_visible():
            modal_btn.first.click()
            time.sleep(1)

        # Clicar em "Acessar Plataforma" caso na Landing
        enter_btn = page.locator("text=Acessar Plataforma")
        if enter_btn.count() > 0 and enter_btn.first.is_visible():
            enter_btn.first.click()
            time.sleep(1)

        # PASSO 3: Visão Geral & Ingestão Contábil (Dataset Ativo Vale S.A.)
        print("\n[PASSO 3] Visão Geral & Ingestão Contábil...")
        step3_path = os.path.join(steps_dir, "passo3_visao_geral_ingestao.png")
        page.screenshot(path=step3_path)
        print(f"  -> Passo 3 capturado: {step3_path}")

        # PASSO 4: Demonstrativo DRE & Painel Executivo
        print("\n[PASSO 4] Demonstrativo DRE & Painel Executivo...")
        dre_nav = page.locator("button:has-text('DRE')")
        if dre_nav.count() > 0:
            dre_nav.first.click()
            time.sleep(1.5)
        step4_path = os.path.join(steps_dir, "passo4_dre_painel.png")
        page.screenshot(path=step4_path)
        print(f"  -> Passo 4 capturado: {step4_path}")

        # PASSO 5: Execução da Simulação What-If (Choque de Preço / Custos)
        print("\n[PASSO 5] Simulação What-If & Recálculo DAG Reativo...")
        sim_btn = page.locator("button:has-text('Executar Simulação')")
        if sim_btn.count() > 0 and sim_btn.first.is_visible():
            sim_btn.first.click()
            time.sleep(2)
        step5_path = os.path.join(steps_dir, "passo5_whatif_recalculo.png")
        page.screenshot(path=step5_path)
        print(f"  -> Passo 5 capturado: {step5_path}")

        # PASSO 6: Demonstrativo dos Fluxos de Caixa (DFC)
        print("\n[PASSO 6] Fluxo de Caixa Consolidado (DFC)...")
        dfc_nav = page.locator("button:has-text('Fluxo de Caixa (DFC)')")
        if dfc_nav.count() > 0:
            dfc_nav.first.click()
            time.sleep(1.5)
        step6_path = os.path.join(steps_dir, "passo6_dfc_fluxo_caixa.png")
        page.screenshot(path=step6_path)
        print(f"  -> Passo 6 capturado: {step6_path}")

        # PASSO 7: Árvore DAG Interativa de Dependências (ReactFlow)
        print("\n[PASSO 7] Árvore DAG Interativa (ReactFlow)...")
        dag_nav = page.locator("button:has-text('Árvore DAG')")
        if dag_nav.count() > 0:
            dag_nav.first.click()
            time.sleep(2)
        step7_path = os.path.join(steps_dir, "passo7_arvore_dag.png")
        page.screenshot(path=step7_path)
        print(f"  -> Passo 7 capturado: {step7_path}")

        # PASSO 8: Planejamento Conectado MultiDim (Matriz OLAP)
        print("\n[PASSO 8] Planejamento Conectado MultiDim (Matriz OLAP)...")
        cube_nav = page.locator("button:has-text('Planejamento Conectado')")
        if cube_nav.count() > 0:
            cube_nav.first.click()
            time.sleep(2)
        step8_path = os.path.join(steps_dir, "passo8_planejamento_multidim.png")
        page.screenshot(path=step8_path)
        print(f"  -> Passo 8 capturado: {step8_path}")

        # PASSO 9: Macroeconomia & Tabela Semanal Focus BCB
        print("\n[PASSO 9] Macroeconomia & Pesquisa Focus BCB...")
        eco_nav = page.locator("button:has-text('Macroeconomia & BCB')")
        if eco_nav.count() > 0:
            eco_nav.first.click()
            time.sleep(2.5)
        step9_path = os.path.join(steps_dir, "passo9_macroeconomia_focus.png")
        page.screenshot(path=step9_path)
        print(f"  -> Passo 9 capturado: {step9_path}")

        # PASSO 10: Guia do Usuário & Manual Operacional
        print("\n[PASSO 10] Guia do Usuário & Manual Operacional...")
        guide_nav = page.locator("button:has-text('Guia do Usuário')")
        if guide_nav.count() > 0:
            guide_nav.first.click()
            time.sleep(1.5)
        step10_path = os.path.join(steps_dir, "passo10_guia_usuario.png")
        page.screenshot(path=step10_path)
        print(f"  -> Passo 10 capturado: {step10_path}")

        browser.close()

    print("\n" + "=" * 60)
    print("DEMONSTRAÇÃO PASSO A PASSO FINALIZADA COM SUCESSO!")
    print("=" * 60)

if __name__ == "__main__":
    run_step_by_step()
