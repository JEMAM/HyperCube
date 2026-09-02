from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        errors = []
        page.on("pageerror", lambda err: errors.append(f"[PAGE ERROR] {err}"))
        page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)

        print("Navigating to Vercel site...")
        page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle")
        time.sleep(2)

        # 1. Check Landing Page
        print("1. Landing page loaded")

        # 2. Click enter app
        btn = page.locator('text=Acessar o Aplicativo').first
        if btn.count() > 0:
            btn.click()
            time.sleep(1.5)

        # 3. Login demo
        acc = page.locator('text=Diretoria FP').first
        if acc.count() > 0:
            acc.click()
            time.sleep(2)
            print("2. Logged in to dashboard")

        # 4. Loop through tabs
        tabs = [
            "Visão Geral & Ingestão",
            "Conexões ERP & Bancos de Dados",
            "Macroeconomia & BCB",
            "Guia do Usuário & Manual",
            "Planejamento Conectado (N-D)",
            "Planejamento por Drivers",
            "Previsão & Monte Carlo",
            "Conselho & Covenants",
            "Loop DRE-DFC-BP",
            "Cubo 3D OLAP Interativo",
            "Valuation Corporativo",
            "Demonstração DRE",
            "Fluxo de Caixa (DFC)",
            "Balanço Patrimonial (BP)",
            "Resultado Abrangente (DRA)",
            "Mutações do PL (DMPL)",
            "Valor Adicionado (DVA)",
            "Notas Explicativas (NE)",
            "CVM Watch & Análise"
        ]

        for tab_name in tabs:
            tab = page.locator(f'button:has-text("{tab_name}")').first
            if tab.count() > 0:
                print(f"Testing tab: {tab_name}...")
                tab.click()
                time.sleep(1.2)
                body = page.inner_text("body")
                if "Application error" in body:
                    print(f"!!! ERROR FOUND ON TAB: {tab_name} !!!")
                    page.screenshot(path=f"artifacts/error_tab_{tab_name[:10]}.png")
                    break

        print("\n=== ALL DETECTED ERRORS ===")
        for e in errors:
            print(e)

        browser.close()

if __name__ == "__main__":
    run()
