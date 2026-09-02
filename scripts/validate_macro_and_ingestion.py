import time
from playwright.sync_api import sync_playwright

print("Waiting 35s for Vercel deployment of commit 60d39b8...")
time.sleep(35)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 950})
    
    # 1. Open Vercel
    page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle")
    time.sleep(1.5)

    # 2. Enter app
    page.locator("text=Acessar o Aplicativo").first.click()
    time.sleep(1.5)
    page.locator("text=Diretoria FP").first.click()
    time.sleep(2.5)

    # 3. Screenshot of the updated Ingestion card
    page.screenshot(path="C:/Users/edumo/.gemini/antigravity-ide/brain/79ffe3e3-5435-4192-85cd-c40fd494a4d9/ingestion_grid_2col.png")
    print("Ingestion card screenshot saved!")

    # 4. Click Macroeconomia & BCB
    macro_tab = page.locator("button:has-text('Macroeconomia')").first
    macro_tab.click()
    time.sleep(3)

    # 5. Check KPIs and click Sync
    sync_btn = page.locator("button:has-text('Sincronizar')").first
    if sync_btn.count() > 0:
        sync_btn.click()
        print("Clicked sync button!")
        time.sleep(2)

    # 6. Take screenshot of Macroeconomia & BCB
    page.screenshot(path="C:/Users/edumo/.gemini/antigravity-ide/brain/79ffe3e3-5435-4192-85cd-c40fd494a4d9/macroeconomia_updated.png")
    print("Macroeconomia screenshot saved!")

    browser.close()
