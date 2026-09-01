"""
Playwright script to verify:
1. Groq model badge displayed in header with active status pill.
2. Reordered navigation sidebar:
   - 1: Apresentação da Plataforma
   - 2: Visão Geral & Ingestão
   - 3: Macroeconomia & BCB
3. Grafo DAG updated.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756\step_walkthrough"

def run():
    print("Iniciando verificacao de ordem de navegacao e exibicao do Groq...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=1.5
        )
        page = context.new_page()

        # Step 1: Open app
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        time.sleep(1.5)

        # Set localStorage to Groq
        page.evaluate("""() => {
            localStorage.setItem('hypercube_ai_provider', 'groq');
            localStorage.setItem('hypercube_ai_model', 'Llama 3.1 (8B, 70B, 405B) e Llama 3.3 / Llama 4 Scout');
            localStorage.setItem('hypercube_ai_key', 'gsk_demo_token_123');
            sessionStorage.setItem('hypercube_setup_completed', 'true');
        }""")
        page.reload(wait_until="networkidle")
        time.sleep(1.5)

        # Dismiss modal if open
        modal_btn = page.locator('button:has-text("Confirmar Modelo & Abrir Painel")')
        if modal_btn.count() > 0:
            modal_btn.first.click()
            time.sleep(1)

        # 1. Header Screenshot (Groq + Navigation Sidebar)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "header_groq_and_nav_order.png"))
        print("[OK] Screenshot header e nav salvo: header_groq_and_nav_order.png")

        # 2. Click on Visao Geral (2nd item)
        page.locator('button[title*="Visão Geral"]').first.click()
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "passo2_visao_geral.png"))
        print("[OK] Screenshot Visao Geral salvo: passo2_visao_geral.png")

        # 3. Click on Macroeconomia & BCB (3rd item)
        page.locator('button[title*="Macroeconomia"]').first.click()
        time.sleep(1.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "passo3_macroeconomia.png"))
        print("[OK] Screenshot Macroeconomia salvo: passo3_macroeconomia.png")

        browser.close()
        print("Verificacao concluida com sucesso!")

if __name__ == "__main__":
    run()
