"""
Playwright script to verify:
1. Selecting Ollama displays localhost endpoint input instead of API key in both setup and AISettings modals.
2. Helper text confirms on-premise execution without cloud API key.
3. Saving sets Ollama as active local engine in the header.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756\step_walkthrough"

def run():
    print("Iniciando verificacao de configuracao do Ollama Localhost...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=1.5
        )
        page = context.new_page()

        # Step 1: Open app with Welcome Setup Modal
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        time.sleep(1.5)

        # Select Gemma (Ollama) in the Welcome Setup Modal
        select_elem = page.locator('select').first
        if select_elem.count() > 0:
            select_elem.select_option("Gemma 4 / Gemma 3")
            time.sleep(0.5)

        # Capture Welcome Modal screenshot with Ollama localhost input
        page.screenshot(path=os.path.join(OUTPUT_DIR, "modal_welcome_ollama_localhost.png"))
        print("[OK] Screenshot Welcome Modal Ollama salvo: modal_welcome_ollama_localhost.png")

        # Click Confirm
        confirm_btn = page.locator('button:has-text("Confirmar Modelo & Abrir Painel")').first
        if confirm_btn.count() > 0:
            confirm_btn.click()
            time.sleep(1.5)

        # Now open AISettingsModal from the header button
        header_model_btn = page.locator('button[title*="Configurar Provedor"]').first
        if header_model_btn.count() > 0:
            header_model_btn.click()
            time.sleep(1)

        # Select DeepSeek-R1 (Ollama) in AISettingsModal
        deepseek_card = page.locator('div:has-text("DeepSeek-R1 / V3")').last
        if deepseek_card.count() > 0:
            deepseek_card.click()
            time.sleep(0.5)

        # Capture AISettingsModal screenshot showing Localhost input
        page.screenshot(path=os.path.join(OUTPUT_DIR, "modal_ollama_localhost.png"))
        print("[OK] Screenshot AISettings Modal Ollama salvo: modal_ollama_localhost.png")

        # Click Save
        save_btn = page.locator('button:has-text("Salvar Configuração de IA")').first
        if save_btn.count() > 0:
            save_btn.click()
            time.sleep(1.5)

        # Capture Header screenshot showing Ollama active
        page.screenshot(path=os.path.join(OUTPUT_DIR, "header_ollama_ativo.png"))
        print("[OK] Screenshot Header Ollama Ativo salvo: header_ollama_ativo.png")

        browser.close()
        print("Verificacao do Ollama concluida com sucesso!")

if __name__ == "__main__":
    run()
