from playwright.sync_api import sync_playwright
import time

def test_cvm_dispatcher():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        target_url = "https://hypercube-kappa.vercel.app/"
        print(f"1. Opening {target_url}...")
        page.goto(target_url, wait_until="networkidle")
        time.sleep(2)
        
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo")').first
        if enter_btn.count() > 0:
            enter_btn.click()
            time.sleep(2)
            
        # Click CVM Watch tab
        cvm_btn = page.locator('button:has-text("CVM Watch")').first
        cvm_btn.click()
        time.sleep(2)
        
        # 1. Take screenshot of the new CVM Watch with Annual files
        page.screenshot(path="artifacts/new_cvm_watch_annual.png")
        print("Saved annual files screenshot to artifacts/new_cvm_watch_annual.png")
        
        # 2. Click Trimestral (ITR)
        itr_btn = page.locator('button:has-text("Trimestral (ITR)")').first
        itr_btn.click()
        time.sleep(1.5)
        page.screenshot(path="artifacts/new_cvm_watch_quarterly.png")
        print("Saved quarterly files screenshot to artifacts/new_cvm_watch_quarterly.png")
        
        # 3. Click "Enviar ... para Visão Geral & Ingestão"
        send_btn = page.locator('button:has-text("Enviar")').first
        print("Clicking send button...")
        send_btn.click()
        time.sleep(3)
        
        # 4. Take screenshot of Overview & Ingestion after redirection
        page.screenshot(path="artifacts/ingestion_redirect_verified.png")
        print("Saved redirection screenshot to artifacts/ingestion_redirect_verified.png")
        
        browser.close()

if __name__ == "__main__":
    test_cvm_dispatcher()
