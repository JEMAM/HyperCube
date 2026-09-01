"""
Playwright script to verify the DAG view with the active company header and nodes.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756\step_walkthrough"

def run():
    print("Iniciando captura do Grafo DAG...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=1.5
        )
        page = context.new_page()

        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        time.sleep(1.5)

        # Dismiss modal if open
        modal_btn = page.locator('button:has-text("Confirmar Modelo & Abrir Painel")')
        if modal_btn.count() > 0:
            modal_btn.first.click()
            time.sleep(1)

        # Navigate to DAG view
        page.locator('button[title*="DAG"]').first.click()
        time.sleep(2)

        page.screenshot(path=os.path.join(OUTPUT_DIR, "passo7_arvore_dag.png"))
        print("[OK] Screenshot salvo: passo7_arvore_dag.png")

        browser.close()

if __name__ == "__main__":
    run()
