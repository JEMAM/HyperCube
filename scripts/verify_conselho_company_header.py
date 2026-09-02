"""
Verification script for Conselho & Covenants header showing only analyzed company name
"""
import os
import time
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))

def verify_conselho():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        # Test on live Vercel
        print("[*] Acessando Vercel...")
        page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle", timeout=60000)
        time.sleep(2)
        
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo"), button:has-text("Acessar o Aplicativo")').first
        if enter_btn.is_visible():
            enter_btn.click()
            time.sleep(2)

        # Clicar na aba Conselho & Covenants
        print("[*] Navegando para Conselho & Covenants...")
        conselho_btn = page.locator('button:has-text("Conselho & Covenants"), button:has-text("Conselho")').first
        if conselho_btn.is_visible():
            conselho_btn.click()
            time.sleep(2.5)
            
            # Captura screenshot do header e da página
            screenshot_path = os.path.join(ARTIFACTS_DIR, "conselho_covenants_company_name_enlarged.png")
            page.screenshot(path=screenshot_path)
            print(f"[OK] Screenshot gravado em: {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_conselho()
