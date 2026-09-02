from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle")
    time.sleep(2)

    # Click enter app
    page.locator("text=Acessar o Aplicativo").first.click()
    time.sleep(1.5)

    # Click Diretoria FP
    page.locator("text=Diretoria FP").first.click()
    time.sleep(2.5)

    # Click tab Visão Geral & Ingestão just to be certain
    tab = page.locator("button:has-text('Visão Geral')").first
    if tab.count() > 0:
        tab.click()
        time.sleep(1.5)

    page.screenshot(path="C:/Users/edumo/.gemini/antigravity-ide/brain/79ffe3e3-5435-4192-85cd-c40fd494a4d9/dashboard_overview_expanded.png")
    print("Dashboard overview screenshot captured successfully!")
    browser.close()
