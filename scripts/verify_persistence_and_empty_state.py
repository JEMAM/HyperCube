import time
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("TARGET_URL", "https://hypercube-kappa.vercel.app")
ARTIFACTS_DIR = os.path.join(os.getcwd(), "artifacts", "persistence_audit")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def run():
    print(f"=== INICIANDO AUDITORIA E2E: ESTADO INICIAL VAZIO E PERSISTÊNCIA (SEM REGRESSÃO KLABIN) ===")
    print(f"Alvo: {BASE_URL}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # ----------------------------------------------------
        # ETAPA 1: Abertura Limpa (localStorage vazio)
        # ----------------------------------------------------
        print("\n[ETAPA 1] Limpando localStorage e abrindo aplicação em estado novo...")
        page.goto(BASE_URL, wait_until="networkidle", timeout=60000)
        page.evaluate("() => localStorage.clear()")
        page.reload(wait_until="networkidle")
        time.sleep(3)

        # Se estiver na landing page, entrar no aplicativo
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo"), button:has-text("Acessar o Aplicativo")').first
        if enter_btn.is_visible():
            enter_btn.click()
            time.sleep(2)

        # Verificar se o header está aguardando empresa
        header_text = page.locator("header").first.inner_text()
        print(f"Header inicial: {header_text.replace(chr(10), ' | ')}")
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "01_initial_empty_header.png"))

        assert "Aguardando" in header_text or "SEM DADOS" in header_text or "Nenhuma" in header_text, (
            f"Erro: O cabeçalho inicial não iniciou em estado limpo! Conteúdo: {header_text}"
        )
        print("✓ Cabeçalho inicial inicializado em estado limpo (sem empresa pré-carregada).")

        # Verificar demonstrativos DRE em estado limpo
        dre_tab = page.locator("button:has-text('Demonstração DRE')")
        if dre_tab.count() > 0:
            dre_tab.click()
            time.sleep(2)
            page.screenshot(path=os.path.join(ARTIFACTS_DIR, "02_initial_empty_dre.png"))
            dre_content = page.content()
            assert "Nenhuma demonstração carregada" in dre_content or "Aguardando" in dre_content or "vazias" in dre_content or "Upload" in dre_content, (
                "Erro: A DRE deveria indicar estado de aguardo/células vazias!"
            )
            print("✓ DRE inicializada com células vazias e banner aguardando upload/CVM.")

        # ----------------------------------------------------
        # ETAPA 2: Carregar Banco ABC Brasil S/A no CVM Watch
        # ----------------------------------------------------
        print("\n[ETAPA 2] Navegando para CVM Watch & Análise e carregando Banco ABC Brasil S/A...")
        cvm_btn = page.locator("button:has-text('CVM Watch & Análise')")
        cvm_btn.click()
        time.sleep(3)

        # Filtrar por Bancos
        sector_select = page.locator("select").first
        sector_select.select_option(value="Bancos")
        time.sleep(2)

        # Selecionar Banco ABC Brasil (cod_cvm: 20958)
        company_select = page.locator("select").nth(1)
        company_select.select_option(value="20958")
        time.sleep(2)

        # Clicar em Carregar no Hyperblock
        load_btn = page.locator("button:has-text('Carregar no Hyperblock')")
        load_btn.click()
        time.sleep(3)

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "03_abc_brasil_loaded_cvm.png"))
        header_after = page.locator("header").first.inner_text()
        print(f"Header após carga: {header_after.replace(chr(10), ' | ')}")
        assert "ABC BRASIL" in header_after, f"Erro: Empresa ABC BRASIL não carregada no header! Conteúdo: {header_after}"
        print("✓ Banco ABC Brasil S/A carregado com sucesso no Hyperblock!")

        # ----------------------------------------------------
        # ETAPA 3: Testar Navegação entre Todas as Páginas
        # Garantir que NENHUMA regride para Klabin ou Vale!
        # ----------------------------------------------------
        pages_to_test = [
            ("Conselho & Covenants", "Conselho & Covenants"),
            ("Planejamento por Drivers", "Planejamento por Drivers (Headcount & Capex)"),
            ("Previsão & Monte Carlo", "Previsão & Monte Carlo"),
            ("Loop DRE-DFC-BP", "Loop DRE-DFC-BP"),
            ("Demonstração DRE", "Demonstração DRE"),
            ("Fluxo de Caixa (DFC)", "Fluxo de Caixa (DFC)"),
            ("Balanço Patrimonial (BP)", "Balanço Patrimonial (BP)"),
            ("Valuation Corporativo", "Valuation Corporativo"),
        ]

        print("\n[ETAPA 3] Testando navegação contínua entre páginas sem regressão para Klabin...")

        for idx, (btn_name, expected_title) in enumerate(pages_to_test, start=4):
            btn = page.locator(f"button:has-text('{btn_name}')").first
            btn.click()
            time.sleep(2.5)

            current_header = page.locator("header").first.inner_text()
            current_body = page.locator("main, [role='main'], div.flex-1").first.inner_text()

            # Capturar screenshot
            safe_name = btn_name.replace(" ", "_").replace("&", "e").replace("(", "").replace(")", "").lower()
            page.screenshot(path=os.path.join(ARTIFACTS_DIR, f"{idx:02d}_{safe_name}.png"))

            # Validação crítica: NÃO PODE CONTER KLABIN no cabeçalho ou badge de empresa ativa
            assert "Klabin" not in current_header, f"REGRESSÃO DETECTADA: Cabeçalho reverteu para Klabin na página '{btn_name}'!"
            assert "KLBN11" not in current_header, f"REGRESSÃO DETECTADA: Ticker reverteu para KLBN11 na página '{btn_name}'!"

            # Deve conter ABC Brasil
            assert "ABC BRASIL" in current_header or "ABC" in current_body, (
                f"Erro: Página '{btn_name}' perdeu a empresa ativa ABC Brasil!"
            )

            print(f"✓ [{idx-3}/8] Página '{btn_name}': OK! Empresa permanece BANCO ABC BRASIL S/A (Zero regressão Klabin).")

        browser.close()

    print("\n=== AUDITORIA CONCLUÍDA COM SUCESSO! ===")
    print("1. O aplicativo inicia com células e demonstrativos vazios aguardando dados.")
    print("2. A empresa carregada (via CVM ou Upload) é sincronizada no motor reativo.")
    print("3. A navegação entre todas as páginas mantém 100% a empresa selecionada sem jamais regredir para a Klabin.")

if __name__ == "__main__":
    run()
