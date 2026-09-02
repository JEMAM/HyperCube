from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 950})
    page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle")
    page.wait_for_timeout(1000)
    page.locator("text=Acessar o Aplicativo").first.click()
    page.wait_for_timeout(1000)
    page.locator("text=Diretoria FP").first.click()
    page.wait_for_timeout(2500)
    
    # Ingestion card
    header = page.locator("text=Ingestão de Demonstrações Contábeis").first
    card = header.locator("xpath=ancestor::div[contains(@class, 'rounded-xl')][last()]")
    
    card.screenshot(path="C:/Users/edumo/.gemini/antigravity-ide/brain/79ffe3e3-5435-4192-85cd-c40fd494a4d9/ingestion_card_only.png")
    print("SUCCESS: Ingestion card screenshot captured!")
    browser.close()
