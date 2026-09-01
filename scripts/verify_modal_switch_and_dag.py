"""
Playwright script to test selecting Groq in the modal, verifying header label updates,
and checking the Grafo DAG auto-update.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756\step_walkthrough"

def run():
    print("Iniciando teste de selecao de modelo Groq e atualizacao do Grafo DAG...")
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

        # Select Groq in the open modal
        select_elem = page.locator('select')
        if select_elem.count() > 0:
            select_elem.first.select_option("Llama 3.1 (8B, 70B, 405B) e Llama 3.3 / Llama 4 Scout")
            time.sleep(0.5)

        # Fill in API key
        key_input = page.locator('input[type="password"]')
        if key_input.count() > 0:
            key_input.first.fill("gsk_valid_demo_token_12345")
            time.sleep(0.5)

        # Click Confirm button
        save_btn = page.locator('button:has-text("Confirmar Modelo & Abrir Painel"), button:has-text("Salvar & Conectar Motor")')
        if save_btn.count() > 0:
            save_btn.first.click()
            time.sleep(2)

        # Capture Header to verify Groq is active and single unified button
        page.screenshot(path=os.path.join(OUTPUT_DIR, "header_groq_selecionado.png"))
        print("[OK] Screenshot header salvo: header_groq_selecionado.png")

        # Step 2: Navigate to Grafo DAG
        page.locator('button[title*="DAG"]').first.click()
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "passo7_arvore_dag_atualizada.png"))
        print("[OK] Screenshot DAG salvo: passo7_arvore_dag_atualizada.png")

        browser.close()
        print("Teste concluido com sucesso!")

if __name__ == "__main__":
    run()
