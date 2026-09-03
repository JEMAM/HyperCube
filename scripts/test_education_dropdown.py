from playwright.sync_api import sync_playwright
import time

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Test on local port if running or vercel
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        # Test local or Vercel
        target_url = "https://hypercube-kappa.vercel.app/"
        print(f"Testing {target_url}...")
        page.goto(target_url, wait_until="networkidle")
        time.sleep(2)
        
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo")').first
        if enter_btn.count() > 0:
            enter_btn.click()
            time.sleep(2)
            
        cvm_btn = page.locator('button:has-text("CVM Watch")').first
        if cvm_btn.count() > 0:
            cvm_btn.click()
            time.sleep(3)
            
        sector_select = page.locator('select').first
        options = sector_select.locator('option').all_inner_texts()
        print("Available sector options:", len(options))
        
        # Select Educação
        edu_opt = next((o for o in options if "Educa" in o), None)
        print("Found education option:", repr(edu_opt))
        if edu_opt:
            sector_select.select_option(label=edu_opt)
            time.sleep(1.5)
            
            comp_select = page.locator('select').nth(1)
            comp_options = comp_select.locator('option').all_inner_texts()
            print(f"Companies in {edu_opt}: {len(comp_options)}")
            for c in comp_options[:5]:
                print(f"  {c}")
                
        page.screenshot(path="artifacts/education_sector_verified.png")
        print("Saved screenshot to artifacts/education_sector_verified.png")
        browser.close()

if __name__ == "__main__":
    main()
