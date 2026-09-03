from playwright.sync_api import sync_playwright
import time

def test_scroll_pine():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1100})
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(2)
        
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo")').first
        if enter_btn.count() > 0:
            enter_btn.click()
            time.sleep(2)
            
        cvm_tab = page.locator('button:has-text("CVM Watch")').first
        cvm_tab.click()
        time.sleep(2)
        
        sector_select = page.locator('select').first
        sector_select.select_option(label="Bancos")
        time.sleep(1.5)
        
        comp_select = page.locator('select').nth(1)
        comp_options = comp_select.locator('option').all_inner_texts()
        pine_opt = next((o for o in comp_options if "PINE" in o.upper()), None)
        if pine_opt:
            comp_select.select_option(label=pine_opt)
            time.sleep(2.5)
            
        # Scroll down
        page.evaluate("window.scrollTo(0, 700)")
        time.sleep(1)
        page.screenshot(path="artifacts/pine_cvm_files_list.png")
        print("Saved file list screenshot to artifacts/pine_cvm_files_list.png")
        
        # Click the send button
        send_btn = page.locator('button:has-text("Enviar demonstrações")').first
        if send_btn.count() > 0:
            send_btn.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path="artifacts/pine_send_button_view.png")
            print("Clicking send button...")
            send_btn.click()
            time.sleep(3)
            page.screenshot(path="artifacts/pine_ingestion_redirected.png")
            print("Saved ingestion redirection to artifacts/pine_ingestion_redirected.png")
        else:
            print("Button not found with selector")
            
        browser.close()

if __name__ == "__main__":
    test_scroll_pine()
