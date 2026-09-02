from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})

    # 1. CVM Watch
    page.goto(f"{BASE_URL}/analise", wait_until="domcontentloaded")
    page.wait_for_timeout(2500)

    # Select Daycoval
    company_select = page.locator("select").nth(1)
    comp_options = company_select.locator("option").all_inner_texts()
    daycoval_opt = next((opt for opt in comp_options if "daycoval" in opt.lower()), None)
    if daycoval_opt:
        company_select.select_option(label=daycoval_opt)
        page.wait_for_timeout(2000)

    # Scroll to DRE Table in CVM Watch
    dre_sec = page.locator("section:has-text('Demonstração DRE')").first
    dre_sec.scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="scripts/screenshot_cvm_watch_daycoval_dre.png")

    # Toggle to DFC in CVM Watch
    dfc_tab_btn = page.locator("button:has-text('Demonstração DFC')").first
    dfc_tab_btn.click()
    page.wait_for_timeout(1500)
    page.screenshot(path="scripts/screenshot_cvm_watch_daycoval_dfc.png")

    # 2. Main App DRE with DAG
    page.goto(BASE_URL, wait_until="domcontentloaded")
    page.wait_for_timeout(1500)
    enter_btn = page.locator("button:has-text('Ir para o Aplicativo')").first
    if enter_btn.is_visible():
        enter_btn.click()
        page.wait_for_timeout(1500)

    # Go to CVM Watch inside app and load Daycoval
    cvm_btn = page.locator("button:has-text('CVM Watch & Análise')").first
    cvm_btn.click()
    page.wait_for_timeout(2000)
    comp_select2 = page.locator("select").nth(1)
    comp_select2.select_option(label=daycoval_opt)
    page.wait_for_timeout(1500)
    page.locator("button:has-text('Carregar no Hyperblock')").first.click()
    page.wait_for_timeout(2000)

    # Go to DRE tab and scroll to DAG
    page.locator("button:has-text('Demonstração DRE')").first.click()
    page.wait_for_timeout(2000)
    dag_container = page.locator(".react-flow").first
    dag_container.scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="scripts/screenshot_dag_canvas_daycoval.png")

    browser.close()
    print("Captures completed successfully!")
