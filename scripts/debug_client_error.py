import sys
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    console_logs = []
    page_errors = []

    page.on("console", lambda msg: console_logs.append(f"[{msg.type.upper()}] {msg.text}"))
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    print("Navigating to https://hypercube-kappa.vercel.app/ ...")
    try:
        page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle", timeout=20000)
    except Exception as e:
        print(f"Navigation exception: {e}")

    page.wait_for_timeout(3000)

    print("\n=== PAGE ERRORS (Exceptions) ===")
    for pe in page_errors:
        print(pe)

    print("\n=== CONSOLE LOGS (Errors & Warns) ===")
    for cl in console_logs:
        if "[ERROR]" in cl or "[WARN]" in cl:
            print(cl)

    body_text = page.inner_text("body")
    if "client-side exception" in body_text:
        print("\n>>> CONFIRMED: 'Application error: a client-side exception has occurred' is displayed!")
    else:
        print(f"\n>>> Body snippet: {body_text[:200]}...")

    page.screenshot(path="artifacts/browser_client_error.png")
    print("Screenshot saved to artifacts/browser_client_error.png")
    browser.close()
