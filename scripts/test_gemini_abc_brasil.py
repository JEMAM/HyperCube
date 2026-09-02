"""
Targeted test for Gemini AI on Balanço Patrimonial with Banco ABC Brasil S/A
"""
import os
import time
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts", "test_abc_brasil"))
TARGET_URL = "https://hypercube-kappa.vercel.app/"

def test_gemini():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 950})
        page.goto(TARGET_URL, wait_until="networkidle", timeout=60000)
        time.sleep(2)
        
        # Enter app
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo"), button:has-text("Acessar o Aplicativo")').first
        if enter_btn.is_visible():
            enter_btn.click()
            time.sleep(2)

        # 1. Load Banco ABC Brasil in CVM Watch
        cvm_btn = page.locator('button:has-text("CVM Watch")').first
        if cvm_btn.is_visible():
            cvm_btn.click()
            time.sleep(2.5)

            # Select Bancos
            sector_select = page.locator('select:has(option:has-text("Setores"))').first
            sector_select.select_option(label="Bancos")
            time.sleep(1.5)

            # Select Banco ABC
            company_select = page.locator('div:has(label:has-text("Companhia Aberta")) select, select:has(option:has-text("ABC"))').first
            options = company_select.locator("option").all_inner_texts()
            abc_option = next((opt for opt in options if "ABC" in opt.upper()), None)
            if abc_option:
                company_select.select_option(label=abc_option)
                time.sleep(2)

            # Click Carregar no Hyperblock
            load_btn = page.locator('button:has-text("Carregar no Hyperblock")').first
            if load_btn.is_visible():
                load_btn.click()
                time.sleep(2.5)
                print("[OK] Banco ABC Brasil injetado no Hyperblock!")

        # 2. Go to Balanço Patrimonial (BP)
        bp_tab = page.locator('button:has-text("Balanço Patrimonial (BP)")').first
        if not bp_tab.is_visible():
            bp_tab = page.locator('button:has-text("Balanço Patrimonial")').first
        
        print("[*] Clicando na aba Balanço Patrimonial (BP)...")
        bp_tab.click()
        time.sleep(3)

        # Scroll to bottom to view BPAgentPanel
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1.5)

        agent_input = page.locator("input[placeholder*='liquidez'], input[placeholder*='Dupont'], input[placeholder*='Pergunte']").first
        ask_btn = page.locator("form button[type='submit']").first

        print(f"[*] Campo do agente visível: {agent_input.is_visible()}")
        if agent_input.is_visible():
            question = "Avalie a estrutura de capital, índice de Basiléia, liquidez e ROE do BANCO ABC BRASIL S/A."
            print(f"[*] Enviando pergunta ao Gemini 3.7 Flash: '{question}'...")
            agent_input.fill(question)
            time.sleep(0.5)
            if ask_btn.is_visible():
                ask_btn.click()
            else:
                agent_input.press("Enter")

            print("[*] Aguardando processamento e resposta analítica da IA Gemini...")
            time.sleep(12)

            page.screenshot(path=os.path.join(ARTIFACTS_DIR, "27_gemini_response_completed.png"))
            print(f"[SCREENSHOT] 27_gemini_response_completed.png gravado com sucesso!")

        browser.close()

if __name__ == "__main__":
    test_gemini()
