from playwright.sync_api import sync_playwright
import time
import json

def run_full_pine_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 950})
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(2)
        
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo")').first
        if enter_btn.count() > 0:
            enter_btn.click()
            time.sleep(2)
            
        # 1. CVM Watch
        cvm_tab = page.locator('button:has-text("CVM Watch")').first
        cvm_tab.click()
        time.sleep(2)
        
        # Select Bancos
        sector_select = page.locator('select').first
        sector_select.select_option(label="Bancos")
        time.sleep(1.5)
        
        # Select Banco Pine
        comp_select = page.locator('select').nth(1)
        comp_options = comp_select.locator('option').all_inner_texts()
        pine_opt = next((o for o in comp_options if "PINE" in o.upper()), None)
        print(f"1. Selecionando no CVM Watch: {pine_opt}")
        comp_select.select_option(label=pine_opt)
        time.sleep(2.5)
        
        # Click send to ingestion
        send_btn = page.locator('button:has-text("Enviar")').first
        send_btn.scroll_into_view_if_needed()
        time.sleep(1)
        print("2. Enviando arquivos de Banco Pine para Ingestão...")
        send_btn.click()
        time.sleep(3)
        page.screenshot(path="artifacts/audit_pine_1_ingestion.png")
        print("   Salvo artifacts/audit_pine_1_ingestion.png")
        
        # 3. DRE Tab & Table
        print("3. Abrindo DRE de Banco Pine...")
        dre_btn = page.locator('button:has-text("Demonstração DRE")').first
        dre_btn.click()
        time.sleep(2)
        
        open_dre_tbl = page.locator('button:has-text("Abrir Tabela DRE")').first
        if open_dre_tbl.count() > 0:
            open_dre_tbl.click()
            time.sleep(1.5)
            
        page.screenshot(path="artifacts/audit_pine_2_dre_table.png")
        print("   Salvo artifacts/audit_pine_2_dre_table.png")
        
        # Extract DRE table rows
        rows = page.locator('table tr').all_inner_texts()
        print(f"\n--- LINHAS DA TABELA DRE NA TELA ({len(rows)} linhas) ---")
        for r in rows[:15]:
            clean_r = " | ".join([c.strip() for c in r.split('\t') if c.strip()])
            print("  ", clean_r)
            
        # 4. Balanço Patrimonial (BP)
        print("\n4. Abrindo Balanço Patrimonial de Banco Pine...")
        bp_btn = page.locator('button:has-text("Balanço Patrimonial (BP)")').first
        bp_btn.click()
        time.sleep(2)
        
        # Select Tabela do BP
        bp_tbl_btn = page.locator('button:has-text("Tabela do BP")').first
        if bp_tbl_btn.count() > 0:
            bp_tbl_btn.click()
            time.sleep(1.5)
            
        page.evaluate("window.scrollTo(0, 400)")
        time.sleep(1)
        page.screenshot(path="artifacts/audit_pine_3_bp_table.png")
        print("   Salvo artifacts/audit_pine_3_bp_table.png")

        bp_rows = page.locator('table tr').all_inner_texts()
        print(f"\n--- LINHAS DA TABELA BP NA TELA ({len(bp_rows)} linhas) ---")
        for r in bp_rows[:15]:
            clean_r = " | ".join([c.strip() for c in r.split('\t') if c.strip()])
            print("  ", clean_r)

        # 5. Fluxo de Caixa (DFC)
        print("\n5. Abrindo Fluxo de Caixa (DFC) de Banco Pine...")
        dfc_btn = page.locator('button:has-text("Fluxo de Caixa (DFC)")').first
        dfc_btn.click()
        time.sleep(2)
        
        open_dfc_tbl = page.locator('button:has-text("Abrir Tabela DFC")').first
        if open_dfc_tbl.count() > 0:
            open_dfc_tbl.click()
            time.sleep(1.5)
            
        page.screenshot(path="artifacts/audit_pine_4_dfc_table.png")
        print("   Salvo artifacts/audit_pine_4_dfc_table.png")

        dfc_rows = page.locator('table tr').all_inner_texts()
        print(f"\n--- LINHAS DA TABELA DFC NA TELA ({len(dfc_rows)} linhas) ---")
        for r in dfc_rows[:15]:
            clean_r = " | ".join([c.strip() for c in r.split('\t') if c.strip()])
            print("  ", clean_r)

        browser.close()
        print("\nAuditoria E2E concluída com sucesso!")

if __name__ == "__main__":
    run_full_pine_audit()
