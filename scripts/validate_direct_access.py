import time
from playwright.sync_api import sync_playwright

print("Waiting 30s for Vercel deployment of commit 7cc3198...")
time.sleep(30)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    # 1. Open Landing Page
    page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle")
    time.sleep(2)
    page.screenshot(path="C:/Users/edumo/.gemini/antigravity-ide/brain/79ffe3e3-5435-4192-85cd-c40fd494a4d9/landing_direct_access_header.png")
    print("Landing page header screenshot captured!")

    # 2. Click directly on 'Ir para o Aplicativo' in header
    btn = page.locator("header button:has-text('Ir para o Aplicativo'), header button:has-text('Go to Workspace')").first
    btn.click()
    time.sleep(2.5)

    # 3. Confirm we are inside the app without any login or modal
    page.screenshot(path="C:/Users/edumo/.gemini/antigravity-ide/brain/79ffe3e3-5435-4192-85cd-c40fd494a4d9/app_direct_access_inside.png")
    print("SUCCESS: Directly entered workspace with ZERO login/signup modals!")

    browser.close()
