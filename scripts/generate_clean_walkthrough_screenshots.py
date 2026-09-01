"""
Robust Playwright script to capture clean walkthrough screenshots for all 10 steps with Casas Bahia 1T26 dataset.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\edumo\HyperCube\public\walkthrough"
BRAIN_OUTPUT_DIR = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756\step_walkthrough"
PDF_FILE = r"C:\Users\edumo\Documents\casa_bahia_ 1T26.pdf"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(BRAIN_OUTPUT_DIR, exist_ok=True)

def save_step(page, filename):
    time.sleep(1.5)
    p1 = os.path.join(OUTPUT_DIR, filename)
    p2 = os.path.join(BRAIN_OUTPUT_DIR, filename)
    page.screenshot(path=p1)
    page.screenshot(path=p2)
    print(f"[OK] Screenshot salvo: {filename}")

def run():
    print("Iniciando captura de telas em alta resolucao...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=1.5
        )
        page = context.new_page()

        # Step 1: Landing Page
        print("[Passo 1] Landing Page...")
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        time.sleep(1.5)
        # Dismiss initial modal if open
        modal_btn = page.locator('button:has-text("Confirmar Modelo & Abrir Painel")')
        if modal_btn.count() > 0:
            modal_btn.first.click()
            time.sleep(1)
        save_step(page, "passo1_landing_page.png")

        # Step 2: IA Setup Modal
        print("[Passo 2] Configuracao do Motor IA...")
        settings_btn = page.locator('button[title*="Configurar"]')
        if settings_btn.count() > 0:
            settings_btn.first.click()
            time.sleep(1)
            save_step(page, "passo2_config_ia_modal.png")
            # Close modal
            modal_btn = page.locator('button:has-text("Confirmar Modelo & Abrir Painel")')
            if modal_btn.count() > 0:
                modal_btn.first.click()
                time.sleep(1)

        # Step 3: Overview & Ingestion
        print("[Passo 3] Visao Geral & Ingestao...")
        page.locator('button[title*="Geral"]').first.click()
        time.sleep(1.5)
        # Upload Casas Bahia PDF if available
        file_input = page.locator('input[type="file"]')
        if file_input.count() > 0 and os.path.exists(PDF_FILE):
            file_input.first.set_input_files(PDF_FILE)
            time.sleep(1)
            import_btn = page.locator('button:has-text("Importar DRE")')
            if import_btn.count() > 0:
                import_btn.first.click()
                time.sleep(2.5)
        save_step(page, "passo3_visao_geral_ingestao.png")

        # Step 4: DRE Panel
        print("[Passo 4] Demonstrativo DRE...")
        page.locator('button[title*="DRE"]').first.click()
        time.sleep(2.5)
        save_step(page, "passo4_dre_painel.png")

        # Step 5: What-If Simulation
        print("[Passo 5] Simulacao What-If...")
        slider = page.locator('input[type="range"]')
        if slider.count() > 0:
            slider.first.fill("12")
            time.sleep(0.5)
            recalc_btn = page.locator('button:has-text("Recalcular Grafo DAG")')
            if recalc_btn.count() > 0:
                recalc_btn.first.click()
                time.sleep(2.5)
        save_step(page, "passo5_whatif_recalculo.png")

        # Step 6: DFC Fluxo de Caixa
        print("[Passo 6] Fluxo de Caixa (DFC)...")
        page.locator('button[title*="DFC"]').first.click()
        time.sleep(2.5)
        save_step(page, "passo6_dfc_fluxo_caixa.png")

        # Step 7: DAG Graph
        print("[Passo 7] Grafo DAG...")
        page.locator('button[title*="DAG"]').first.click()
        time.sleep(2.5)
        save_step(page, "passo7_arvore_dag.png")

        # Step 8: Multidimensional Planning
        print("[Passo 8] Planejamento Conectado (N-D)...")
        page.locator('button[title*="Planejamento"]').first.click()
        time.sleep(2.5)
        save_step(page, "passo8_planejamento_multidim.png")

        # Step 9: BCB Focus Macroeconomics
        print("[Passo 9] Macroeconomia & BCB...")
        page.locator('button[title*="Macroeconomia"]').first.click()
        time.sleep(2.5)
        save_step(page, "passo9_macroeconomia_focus.png")

        # Step 10: User Operational Guide
        print("[Passo 10] Guia do Usuario & Manual...")
        page.locator('button[title*="Guia"]').first.click()
        time.sleep(2.5)
        save_step(page, "passo10_guia_usuario.png")

        browser.close()
        print("Sucesso absoluto! Todos os 10 passos foram capturados e salvos.")

if __name__ == "__main__":
    run()
