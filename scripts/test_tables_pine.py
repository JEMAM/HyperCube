from playwright.sync_api import sync_playwright
import time

def test_tables():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(2)
        
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo")').first
        if enter_btn.count() > 0:
            enter_btn.click()
            time.sleep(2)
            
        # Navigate to DRE tab
        dre_btn = page.locator('button:has-text("Demonstração DRE")').first
        dre_btn.click()
        time.sleep(2)
        
        # Click "Abrir Tabela DRE"
        open_table_btn = page.locator('button:has-text("Abrir Tabela DRE")').first
        if open_table_btn.count() > 0:
            open_table_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/pine_dre_table_modal.png")
            print("Salvo artifacts/pine_dre_table_modal.png")
            
        # Navigate to BP tab
        bp_btn = page.locator('button:has-text("Balanço Patrimonial (BP)")').first
        bp_btn.click()
        time.sleep(2)
        
        # Click "2. Tabela do BP (AV / AH)"
        bp_tab2 = page.locator('button:has-text("Tabela do BP")').first
        if bp_tab2.count() > 0:
            bp_tab2.click()
            time.sleep(2)
            page.screenshot(path="artifacts/pine_bp_table_view.png")
            print("Salvo artifacts/pine_bp_table_view.png")
            
        browser.close()

if __name__ == "__main__":
    test_tables()
