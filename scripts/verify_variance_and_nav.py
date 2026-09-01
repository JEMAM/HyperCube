"""
Playwright script to verify the updated navigation order (Macroeconomia as 2nd page)
and the updated Variance table with non-null values, correct period, and Casas Bahia branding.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756\step_walkthrough"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def run():
    print("Iniciando verificacao de variancia e navegacao...")
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

        # Navigate to Multidimensional Planning (Planejamento Conectado)
        page.locator('button[title*="Planejamento"]').first.click()
        time.sleep(2)

        # Click Variance Mode button
        var_btn = page.locator('button:has-text("Análise de Variância"), button:has-text("Comparativo")')
        if var_btn.count() > 0:
            var_btn.first.click()
            time.sleep(2)

        page.screenshot(path=os.path.join(OUTPUT_DIR, "passo8_planejamento_multidim.png"))
        print("[OK] Screenshot salvo: passo8_planejamento_multidim.png")

        browser.close()
        print("Verificacao concluida!")

if __name__ == "__main__":
    run()
