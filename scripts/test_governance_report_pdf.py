import time
from playwright.sync_api import sync_playwright
import os

def main():
    os.makedirs("artifacts", exist_ok=True)
    print("Iniciando teste e geração de PDF do Relatório Executivo de Governança & Covenants...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1100})
        page = context.new_page()

        # Set localStorage with Banco Pine or company
        banco_pine_payload = {
            "id": "cvm_20796",
            "name": "BANCO PINE S.A.",
            "ticker": "PINE4",
            "currency": "R$",
            "periods": ["2023", "2024", "2025", "Budget 2026"],
            "periodicity": "ANUAL",
            "sector": "Intermediação Financeira / Bancos"
        }

        page.add_init_script(f"""
            localStorage.setItem("hypercube_active_company", JSON.stringify({banco_pine_payload}));
            localStorage.setItem("hypercube_has_active_data", "true");
            localStorage.setItem("hypercube_ai_provider", "groq");
            localStorage.setItem("hypercube_ai_model", "Llama 3.3 70B Versatile");
        """)

        # Poll until Vercel deploys with new Tab 5
        for attempt in range(15):
            print(f"Tentativa {attempt + 1}/15 acessando Vercel...")
            page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle")
            time.sleep(2)
            
            # Enter App
            btn = page.locator("button:has-text('Ir para o Aplicativo')").first
            if btn.is_visible():
                btn.click()
                time.sleep(2)

            # Click on Conselho & Covenants tab
            conselho_btn = page.locator("button:has-text('Conselho & Covenants'), button:has-text('Board & Covenants')").first
            if conselho_btn.is_visible():
                conselho_btn.click()
                time.sleep(2)

            report_tab = page.locator("button:has-text('Relatório Completo'), button:has-text('PDF / Impressão')").first
            if report_tab.is_visible():
                print("Nova versão com Relatório Completo detectada!")
                break
            print("Aguardando Vercel atualizar...")
            time.sleep(8)

        # 1. Capture default Covenants Screen
        page.screenshot(path="artifacts/live_conselho_covenants_main.png", full_page=True)
        print("Capturada screenshot: artifacts/live_conselho_covenants_main.png")

        # 2. Click on Tab 5: Relatório Completo (.PDF / Impressão)
        report_tab = page.locator("button:has-text('Relatório Completo'), button:has-text('PDF / Impressão')").first
        if report_tab.is_visible():
            print("Abrindo aba Relatório Completo (.PDF / Impressão)...")
            report_tab.click()
            time.sleep(3)

            # Capture full page screenshot of the report
            page.screenshot(path="artifacts/live_conselho_covenants_report.png", full_page=True)
            print("Capturada screenshot do Relatório: artifacts/live_conselho_covenants_report.png")

            # Generate actual PDF file using Playwright's native PDF engine with print emulation
            page.emulate_media(media="print")
            pdf_path = "artifacts/Relatorio_Executivo_Conselho_Covenants_2026.pdf"
            page.pdf(
                path=pdf_path,
                format="A4",
                print_background=True,
                margin={"top": "15mm", "bottom": "15mm", "left": "15mm", "right": "15mm"}
            )
            print(f"PDF gerado com sucesso em: {pdf_path} (Tamanho: {os.path.getsize(pdf_path)} bytes)")

            # Verify key contents in text
            body_text = page.locator("body").inner_text()
            print("\n--- Verificação dos Resultados no Relatório ---")
            print("1. Título do Relatório:", "Relatório Integrado de Governança" in body_text)
            print("2. Sumário Executivo & CFO:", "Sumário Executivo & Parecer do Gabinete do CFO" in body_text)
            print("3. Painel Oficial Covenants:", "Painel Oficial de Monitoramento de Covenants" in body_text)
            print("4. Trajetória 5 Trimestres:", "Trajetória Temporal & Monitoramento Contínuo" in body_text)
            print("5. Decomposição da Dívida:", "Decomposição da Estrutura de Capital & Dívida Líquida" in body_text)
            print("6. EBITDA Bridge:", "Decomposição Operacional & EBITDA Bridge" in body_text)
            print("7. Matriz de Sensibilidade:", "Testes de Estresse & Matriz de Sensibilidade" in body_text)
            print("8. Reconciliação 3-Statement (Tolerância Zero):", "Tolerância Zero" in body_text)
            print("9. Recomendações Conselho:", "Deliberações e Recomendações Estratégicas para o Conselho" in body_text)
            print("10. Assinaturas C-Level:", "Presidente do Conselho" in body_text and "Diretor Financeiro (CFO)" in body_text)

        browser.close()

if __name__ == "__main__":
    main()
