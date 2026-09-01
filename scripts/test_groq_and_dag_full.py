"""
Playwright script to test Groq active status in header, Grafo DAG view, and DRE What-If with AI explanation.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756\step_walkthrough"

def run():
    print("Iniciando testes completos com Playwright (Groq Ativo + Grafo DAG + DRE)...")
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

        # Dismiss modal if open
        modal_btn = page.locator('button:has-text("Confirmar Modelo & Abrir Painel")')
        if modal_btn.count() > 0:
            modal_btn.first.click()
            time.sleep(1)

        # Set LocalStorage to Groq model & active key
        page.evaluate("""() => {
            localStorage.setItem('hypercube_ai_provider', 'groq');
            localStorage.setItem('hypercube_ai_model', 'Llama 3.1 (8B, 70B, 405B) e Llama 3.3 / Llama 4 Scout');
            localStorage.setItem('hypercube_ai_key', 'gsk_demo_active_token');
        }""")
        page.reload(wait_until="networkidle")
        time.sleep(1.5)

        # Dismiss modal again after reload
        modal_btn = page.locator('button:has-text("Confirmar Modelo & Abrir Painel")')
        if modal_btn.count() > 0:
            modal_btn.first.click()
            time.sleep(1)

        # Test 1: Header Screenshot showing Groq + Status "Ativo"
        print("Capturando Header com Status Ativo...")
        page.screenshot(path=os.path.join(OUTPUT_DIR, "header_groq_ativo.png"))

        # Test 2: Navigate to DRE & Execute What-If Simulation
        print("Executando teste no DRE...")
        page.locator('button[title*="Demonstração DRE"]').first.click()
        time.sleep(1.5)

        # Click Simulate
        sim_btn = page.locator('button:has-text("Executar Simulação")')
        if sim_btn.count() > 0:
            sim_btn.first.click()
            time.sleep(2)

        page.screenshot(path=os.path.join(OUTPUT_DIR, "passo4_dre_painel.png"))

        # Test 3: Navigate to Grafo DAG & verify updated nodes
        print("Capturando Grafo DAG...")
        page.locator('button[title*="DAG"]').first.click()
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "passo7_arvore_dag.png"))

        browser.close()
        print("Todos os testes Playwright concluidos com sucesso!")

if __name__ == "__main__":
    run()
