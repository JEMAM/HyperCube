from playwright.sync_api import sync_playwright
import time

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle")
        time.sleep(2)
        
        # Click Ir para o Aplicativo
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo")').first
        if enter_btn.count() > 0:
            enter_btn.click()
            time.sleep(2)
        
        # Navigate to CVM tab
        cvm_btn = page.locator('button:has-text("CVM Watch")').first
        if cvm_btn.count() > 0:
            cvm_btn.click()
            time.sleep(3)
            
        page.screenshot(path="artifacts/live_cvm_verified.png", full_page=False)
        print("Captured screenshot to artifacts/live_cvm_verified.png")
        
        # Check CVM selectors
        sector_select = page.locator('select:has(option:has-text("Setores"))')
        if sector_select.count() > 0:
            options = sector_select.locator("option").all_inner_texts()
            print(f"Total sector options in CVM: {len(options)}")
            print("First 5 sectors:", options[:5])
            
            # Select Material de Transporte
            sector_select.select_option(label="Material de Transporte / Aeroespacial")
            time.sleep(1.5)
            
            comp_select = page.locator('select').nth(2)
            comp_options = comp_select.locator("option").all_inner_texts()
            print(f"Companies in Material de Transporte: {len(comp_options)}")
            print("First 3 companies:", comp_options[:3])
            
            page.screenshot(path="artifacts/live_cvm_transport_selected.png")
        
        browser.close()

if __name__ == "__main__":
    main()
