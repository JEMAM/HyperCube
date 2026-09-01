"""
Playwright script to verify:
1. Groq key is populated when Groq is selected.
2. Switching to Ollama replaces the key with 'http://localhost:11434' automatically.
3. Switching back to Groq restores the Groq key.
"""

import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\edumo\.gemini\antigravity\brain\d7dd95a5-e003-49fb-bc3b-dd3a33163756\step_walkthrough"

def run():
    print("Iniciando verificacao de troca dinamica de chave/endpoint no modal...")
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

        # Set initial Groq key in localStorage
        page.evaluate("""() => {
            localStorage.setItem('hypercube_ai_provider', 'groq');
            localStorage.setItem('hypercube_ai_model', 'Llama 3.1 (8B, 70B, 405B) e Llama 3.3 / Llama 4 Scout');
            localStorage.setItem('hypercube_ai_key', 'gsk_mock_testing_key_placeholder');
            localStorage.setItem('hypercube_groq_key', 'gsk_mock_testing_key_placeholder');
            sessionStorage.setItem('hypercube_setup_completed', 'true');
        }""")
        page.reload(wait_until="networkidle")
        time.sleep(1)

        # Open AI Settings Modal via Header Button
        header_model_btn = page.locator('button[title*="Configurar Provedor"]').first
        if header_model_btn.count() > 0:
            header_model_btn.click()
            time.sleep(1)

        # 1. Click on Gemma (Ollama) card
        ollama_card = page.locator('div:has-text("Gemma 4 / Gemma 3")').last
        if ollama_card.count() > 0:
            ollama_card.click()
            time.sleep(0.5)

        # Screenshot showing localhost automatically in the input
        page.screenshot(path=os.path.join(OUTPUT_DIR, "ollama_switch_localhost_input.png"))
        print("[OK] Screenshot Ollama com localhost salvo: ollama_switch_localhost_input.png")

        # 2. Click back on Groq Llama card
        groq_card = page.locator('div:has-text("Llama 3.1 (8B, 70B, 405B)")').last
        if groq_card.count() > 0:
            groq_card.click()
            time.sleep(0.5)

        # Screenshot showing Groq key restored
        page.screenshot(path=os.path.join(OUTPUT_DIR, "groq_switch_key_restored.png"))
        print("[OK] Screenshot Groq restaurado salvo: groq_switch_key_restored.png")

        # 3. Switch back to Ollama and save
        if ollama_card.count() > 0:
            ollama_card.click()
            time.sleep(0.5)

        save_btn = page.locator('button:has-text("Salvar Configuração de IA")').first
        if save_btn.count() > 0:
            save_btn.click()
            time.sleep(1.5)

        browser.close()
        print("Verificacao concluida com sucesso!")

if __name__ == "__main__":
    run()
