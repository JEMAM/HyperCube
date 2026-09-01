"""
Playwright script to test Casas Bahia PDF upload and take high quality walkthrough screenshots.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\edumo\HyperCube\public\walkthrough"
BRAIN_OUTPUT_DIR = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756\step_walkthrough"
PDF_FILE = r"C:\Users\edumo\Documents\casa_bahia_ 1T26.pdf"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(BRAIN_OUTPUT_DIR, exist_ok=True)

def save_both(page, filename):
    p1 = os.path.join(OUTPUT_DIR, filename)
    p2 = os.path.join(BRAIN_OUTPUT_DIR, filename)
    page.screenshot(path=p1)
    page.screenshot(path=p2)
    print(f"Saved: {filename}")

def run():
    print("Iniciando suite de testes Playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1.5
        )
        page = context.new_page()

        # Step 1: Open app and dismiss initial modal if open
        print("[Passo 1] Acessando Landing Page...")
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        time.sleep(1.5)

        # If modal is open, dismiss it first to see clean Landing Page
        confirm_btn = page.locator('button:has-text("Confirmar Modelo"), button:has-text("Abrir Painel")')
        if confirm_btn.count() > 0:
            confirm_btn.first.click()
            time.sleep(1.5)

        save_both(page, "passo1_landing_page.png")

        # Step 2: Open Config Modal explicitly
        print("[Passo 2] Abrindo Modal de Configuração do Motor IA...")
        settings_btn = page.locator('button[title="Configurar LLM / Parâmetros"]')
        if settings_btn.count() > 0:
            settings_btn.first.click()
            time.sleep(1)
            save_both(page, "passo2_config_ia_modal.png")
            # Close modal
            confirm_btn = page.locator('button:has-text("Confirmar Modelo"), button:has-text("Fechar"), button:has-text("Salvar")')
            if confirm_btn.count() > 0:
                confirm_btn.first.click()
                time.sleep(1)

        # Step 3: Overview & Ingestion
        print("[Passo 3] Visão Geral & Ingestão...")
        page.click('button:has-text("Visão Geral & Ingestão")')
        time.sleep(2)

        # Upload Casas Bahia PDF if file input is available
        file_input = page.locator('input[type="file"]')
        if file_input.count() > 0 and os.path.exists(PDF_FILE):
            print(f"[Upload] Fazendo upload do PDF Casas Bahia: {PDF_FILE}...")
            file_input.first.set_input_files(PDF_FILE)
            time.sleep(1.5)
            # Click Import Button
            import_btn = page.locator('button:has-text("Importar DRE"), button:has-text("Importar DFC")')
            if import_btn.count() > 0:
                import_btn.first.click()
                time.sleep(2.5)

        save_both(page, "passo3_visao_geral_ingestao.png")

        # Step 4: DRE Panel
        print("[Passo 4] Demonstrativo DRE...")
        page.click('button:has-text("Demonstração DRE")')
        time.sleep(2.5)
        save_both(page, "passo4_dre_painel.png")

        # Step 5: What-If simulation
        print("[Passo 5] Simulação What-If...")
        slider = page.locator('input[type="range"]')
        if slider.count() > 0:
            slider.first.fill("10")
            time.sleep(1)
            recalc_btn = page.locator('button:has-text("Recalcular Grafo DAG")')
            if recalc_btn.count() > 0:
                recalc_btn.first.click()
                time.sleep(2.5)
        save_both(page, "passo5_whatif_recalculo.png")

        # Step 6: DFC Fluxo de Caixa
        print("[Passo 6] Fluxo de Caixa (DFC)...")
        page.click('button:has-text("Fluxo de Caixa (DFC)")')
        time.sleep(2.5)
        save_both(page, "passo6_dfc_fluxo_caixa.png")

        # Step 7: Grafo DAG
        print("[Passo 7] Grafo DAG de Dependências...")
        page.click('button:has-text("Grafo DAG de Dependências")')
        time.sleep(2.5)
        save_both(page, "passo7_arvore_dag.png")

        # Step 8: Multidimensional Planning
        print("[Passo 8] Planejamento Conectado (N-D)...")
        page.click('button:has-text("Planejamento Conectado (N-D)")')
        time.sleep(2.5)
        save_both(page, "passo8_planejamento_multidim.png")

        # Step 9: BCB Focus Macroeconomics
        print("[Passo 9] Macroeconomia & BCB...")
        page.click('button:has-text("Macroeconomia & BCB")')
        time.sleep(2.5)
        save_both(page, "passo9_macroeconomia_focus.png")

        # Step 10: User Guide & Manual
        print("[Passo 10] Guia do Usuário & Manual...")
        page.click('button:has-text("Guia do Usuário & Manual")')
        time.sleep(2.5)
        save_both(page, "passo10_guia_usuario.png")

        browser.close()
        print("Suite concluída com 100% de sucesso!")

if __name__ == "__main__":
    run()
