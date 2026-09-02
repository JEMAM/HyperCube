from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('https://hypercube-kappa.vercel.app/', wait_until='networkidle')
    time.sleep(2)
    
    # Click 'Acessar o Aplicativo'
    enter_btn = page.locator('button:has-text("Acessar o Aplicativo")').first
    if enter_btn.count() > 0:
        enter_btn.click()
        time.sleep(1.5)
    
    # Login via demo account
    acc = page.locator('button:has-text("Diretoria FP")').first
    if acc.count() > 0:
        acc.click()
        time.sleep(2)
        
    # Click Fluxo de Caixa (DFC) in header nav
    dfc_tab = page.locator('button:has-text("Fluxo de Caixa (DFC)")').first
    if dfc_tab.count() > 0:
        dfc_tab.click()
        time.sleep(2)
        
    page.screenshot(path='artifacts/vercel_internal_dfc_dashboard.png')
    print('Internal DFC screenshot captured: artifacts/vercel_internal_dfc_dashboard.png')
    browser.close()
