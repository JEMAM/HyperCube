from playwright.sync_api import sync_playwright
import time

def test_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        target_url = "https://hypercube-kappa.vercel.app/"
        print(f"1. Opening {target_url}...")
        page.goto(target_url, wait_until="networkidle")
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
        
        # Select Construção Civil e Imobiliário -> Cyrela
        sector_select = page.locator('select').first
        sector_options = sector_select.locator('option').all_inner_texts()
        const_sec = next((o for o in sector_options if "Constru" in o), None)
        if const_sec:
            sector_select.select_option(label=const_sec)
            time.sleep(1.5)
            
        comp_select = page.locator('select').nth(1)
        comp_options = comp_select.locator('option').all_inner_texts()
        cyrela_opt = next((o for o in comp_options if "CYRELA" in o), None)
        if cyrela_opt:
            print(f"Selecting company: {cyrela_opt}")
            comp_select.select_option(label=cyrela_opt)
            time.sleep(2.5)
            
        # Check Trimestral toggle
        itr_btn = page.locator('button:has-text("Trimestral (ITR)")').first
        if itr_btn.count() > 0:
            print("Clicking Trimestral (ITR)...")
            itr_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/cyrela_quarterly_verified.png")
            print("Saved quarterly screenshot to artifacts/cyrela_quarterly_verified.png")
            
        # Navigate to another tab: DRE
        dre_btn = page.locator('button:has-text("Demonstração DRE")').first
        if dre_btn.count() > 0:
            print("Navigating to DRE tab...")
            dre_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/dre_tab_banner_verified.png")
            print("Saved DRE tab banner screenshot to artifacts/dre_tab_banner_verified.png")

        # Navigate to another tab: DFC
        dfc_btn = page.locator('button:has-text("Fluxo de Caixa (DFC)")').first
        if dfc_btn.count() > 0:
            print("Navigating to DFC tab...")
            dfc_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/dfc_tab_banner_verified.png")
            print("Saved DFC tab banner screenshot to artifacts/dfc_tab_banner_verified.png")
            
        # Return to CVM Watch
        print("Returning to CVM Watch tab...")
        cvm_btn = page.locator('button:has-text("CVM Watch")').first
        cvm_btn.click()
        time.sleep(2)
        
        comp_text_after = comp_select.locator('option:checked').inner_text()
        print("Selected company after returning to CVM Watch:", comp_text_after)
        page.screenshot(path="artifacts/cvm_persistent_verified.png")
        print("Saved persistence screenshot to artifacts/cvm_persistent_verified.png")
        
        browser.close()

if __name__ == "__main__":
    test_flow()
