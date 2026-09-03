from playwright.sync_api import sync_playwright
import time

def test_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        print("1. Opening localhost:3000...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(2)
        
        # Click Ir para o Aplicativo
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo")').first
        if enter_btn.count() > 0:
            enter_btn.click()
            time.sleep(2)
            
        # Verify Tier 3 active company banner is visible
        banner = page.locator('text=Empresa em Análise Ativa:').first
        print("Banner visible:", banner.is_visible())
        
        # Click CVM Watch
        cvm_btn = page.locator('button:has-text("CVM Watch")').first
        cvm_btn.click()
        time.sleep(2)
        
        # Select Cyrela in CVM Watch if not already selected
        comp_select = page.locator('select').nth(1)
        comp_text = comp_select.locator('option:checked').inner_text()
        print("Initially selected company in dropdown:", comp_text)
        
        # Check Trimestral toggle
        itr_btn = page.locator('button:has-text("Trimestral (ITR)")').first
        if itr_btn.count() > 0:
            print("Clicking Trimestral (ITR)...")
            itr_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/cyrela_quarterly_verified.png")
            print("Saved quarterly screenshot to artifacts/cyrela_quarterly_verified.png")
            
        # Navigate to another tab: DRE
        dre_btn = page.locator('button:has-text("DRE")').first
        if dre_btn.count() > 0:
            print("Navigating to DRE tab...")
            dre_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/dre_tab_banner_verified.png")
            print("Saved DRE tab banner screenshot to artifacts/dre_tab_banner_verified.png")
            
        # Return to CVM Watch
        print("Returning to CVM Watch tab...")
        cvm_btn = page.locator('button:has-text("CVM Watch")').first
        cvm_btn.click()
        time.sleep(2)
        
        comp_text_after = comp_select.locator('option:checked').inner_text()
        print("Selected company after returning:", comp_text_after)
        page.screenshot(path="artifacts/cvm_persistent_verified.png")
        print("Saved persistence screenshot to artifacts/cvm_persistent_verified.png")
        
        browser.close()

if __name__ == "__main__":
    test_flow()
