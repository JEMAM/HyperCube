import time
from playwright.sync_api import sync_playwright

print("Waiting 30s for Vercel deployment of commit 5371ef0...")
time.sleep(30)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 950})
    page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle")
    page.wait_for_timeout(1500)
    
    # Enter app
    btn = page.locator("text=Acessar o Aplicativo").first
    if btn.count() > 0:
        btn.click()
        page.wait_for_timeout(1000)

    # Login demo
    acc = page.locator("text=Diretoria FP").first
    if acc.count() > 0:
        acc.click()
        page.wait_for_timeout(2000)

    # Click on 'Visão Geral & Ingestão' if not active
    tab = page.locator("button:has-text('Visão Geral')").first
    if tab.count() > 0:
        tab.click()
        page.wait_for_timeout(1500)

    # Take screenshot of the entire page and specific element
    page.screenshot(path="artifacts/ingestion_expanded_cells.png")
    print("Full page screenshot saved to artifacts/ingestion_expanded_cells.png")
    
    # Take screenshot specifically of the ingestion card
    card = page.locator("text=Ingestão de Demonstrações Contábeis").locator("xpath=ancestor::div[contains(@class, 'rounded-xl')][last()]")
    if card.count() > 0:
        card.screenshot(path="artifacts/ingestion_card_only.png")
        print("Card screenshot saved to artifacts/ingestion_card_only.png")

    browser.close()
