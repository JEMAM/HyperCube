from playwright.sync_api import sync_playwright
import time
import json
import fitz

def run_pine_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        target_url = "http://localhost:3000"
        print(f"1. Acessando {target_url}...")
        page.goto(target_url, wait_until="networkidle")
        time.sleep(2)
        
        # Entrar no app
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo")').first
        if enter_btn.count() > 0:
            enter_btn.click()
            time.sleep(2)
            
        # Clicar na aba CVM Watch & Análise
        print("2. Acessando CVM Watch & Análise...")
        cvm_tab = page.locator('button:has-text("CVM Watch")').first
        cvm_tab.click()
        time.sleep(2)
        
        # Selecionar Setor "Bancos"
        print("3. Selecionando Setor 'Bancos'...")
        sector_select = page.locator('select').first
        sector_select.select_option(label="Bancos")
        time.sleep(1.5)
        
        # Selecionar Companhia "BANCO PINE S/A"
        print("4. Selecionando 'BANCO PINE S/A'...")
        comp_select = page.locator('select').nth(1)
        comp_options = comp_select.locator('option').all_inner_texts()
        pine_opt = next((o for o in comp_options if "PINE" in o.upper()), None)
        if pine_opt:
            print(f"   Opção encontrada: {pine_opt}")
            comp_select.select_option(label=pine_opt)
            time.sleep(2.5)
        else:
            print("   ERRO: Banco Pine não encontrado no combobox!")
            
        # Capturar screenshot de CVM Watch para Banco Pine
        page.screenshot(path="artifacts/pine_cvm_watch_annual.png")
        print("   Evidência salva em artifacts/pine_cvm_watch_annual.png")
        
        # Alternar para Trimestral (ITR)
        itr_btn = page.locator('button:has-text("Trimestral (ITR)")').first
        if itr_btn.count() > 0:
            itr_btn.click()
            time.sleep(1.5)
            page.screenshot(path="artifacts/pine_cvm_watch_quarterly.png")
            print("   Evidência salva em artifacts/pine_cvm_watch_quarterly.png")
            
        # Voltar para Anual (DFP)
        dfp_btn = page.locator('button:has-text("Anual (DFP)")').first
        if dfp_btn.count() > 0:
            dfp_btn.click()
            time.sleep(1)
            
        # Enviar demonstrações de Banco Pine para Visão Geral & Ingestão
        print("5. Clicando em 'Enviar demonstrações de BANCO PINE S/A para Visão Geral & Ingestão'...")
        send_btn = page.locator('button:has-text("Enviar demonstrações")').first
        if send_btn.count() > 0:
            send_btn.click()
            time.sleep(3)
            page.screenshot(path="artifacts/pine_ingestion_success.png")
            print("   Evidência salva em artifacts/pine_ingestion_success.png")
        else:
            print("   Botão de envio não encontrado!")
            
        # Navegar para Demonstração DRE
        print("6. Navegando para Demonstração DRE...")
        dre_btn = page.locator('button:has-text("Demonstração DRE")').first
        if dre_btn.count() > 0:
            dre_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/pine_dre_view.png")
            print("   Evidência salva em artifacts/pine_dre_view.png")
            
        # Navegar para Balanço Patrimonial (BP)
        print("7. Navegando para Balanço Patrimonial (BP)...")
        bp_btn = page.locator('button:has-text("Balanço Patrimonial (BP)")').first
        if bp_btn.count() > 0:
            bp_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/pine_bp_view.png")
            print("   Evidência salva em artifacts/pine_bp_view.png")
            
        # Navegar para Fluxo de Caixa (DFC)
        print("8. Navegando para Fluxo de Caixa (DFC)...")
        dfc_btn = page.locator('button:has-text("Fluxo de Caixa (DFC)")').first
        if dfc_btn.count() > 0:
            dfc_btn.click()
            time.sleep(2)
            page.screenshot(path="artifacts/pine_dfc_view.png")
            print("   Evidência salva em artifacts/pine_dfc_view.png")
            
        browser.close()
        print("Teste de UI concluído com sucesso!")

if __name__ == "__main__":
    run_pine_test()
