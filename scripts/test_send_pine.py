from playwright.sync_api import sync_playwright
import time

def test_send_pine():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
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
            print(f"Selecionando: {pine_opt}")
            comp_select.select_option(label=pine_opt)
            time.sleep(2.5)
            
        # Click the send button
        send_btn = page.locator('button:has-text("Enviar")').first
        if send_btn.count() > 0:
            send_btn.scroll_into_view_if_needed()
            time.sleep(1)
            print("Clicando no botão de envio...")
            send_btn.click()
            time.sleep(3)
            page.screenshot(path="artifacts/pine_ingestion_redirected.png")
            print("Salvo artifacts/pine_ingestion_redirected.png")
        else:
            print("Botão não encontrado!")
            
        # Navegar para DRE
        print("Navegando para Demonstração DRE...")
        dre_btn = page.locator('button:has-text("Demonstração DRE")').first
        if dre_btn.count() > 0:
            dre_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/pine_dre_active.png")
            print("Salvo artifacts/pine_dre_active.png")
            
        # Navegar para Balanço Patrimonial (BP)
        print("Navegando para Balanço Patrimonial (BP)...")
        bp_btn = page.locator('button:has-text("Balanço Patrimonial (BP)")').first
        if bp_btn.count() > 0:
            bp_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/pine_bp_active.png")
            print("Salvo artifacts/pine_bp_active.png")

        # Navegar para Fluxo de Caixa (DFC)
        print("Navegando para Fluxo de Caixa (DFC)...")
        dfc_btn = page.locator('button:has-text("Fluxo de Caixa (DFC)")').first
        if dfc_btn.count() > 0:
            dfc_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/pine_dfc_active.png")
            print("Salvo artifacts/pine_dfc_active.png")

        browser.close()
        print("Finalizado!")

if __name__ == "__main__":
    test_send_pine()
