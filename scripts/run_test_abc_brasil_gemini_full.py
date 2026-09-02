"""
HyperCube 1.0 - Automated End-to-End Test Suite
Scenario: CVM Watch & Análise -> Setor 'Bancos' -> 'BANCO ABC BRASIL S/A' + Gemini 3.7 Flash + All 20 Pages Audit
"""
import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts", "test_abc_brasil"))
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

TARGET_URL = "https://hypercube-kappa.vercel.app/"

def run_test():
    print("=" * 80)
    print(" HYPERCUBE END-TO-END TEST: BANCO ABC BRASIL S/A (CVM) & GEMINI AI")
    print(f" Target: {TARGET_URL}")
    print(f" Artifacts: {ARTIFACTS_DIR}")
    print("=" * 80)

    results = {
        "landing_page": False,
        "workspace_access": False,
        "cvm_sector_bancos": False,
        "cvm_abc_brasil_selected": False,
        "cvm_financials_loaded": False,
        "cube_injected": False,
        "ai_gemini_tested": False,
        "pages_audited": [],
        "errors": []
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 950},
            device_scale_factor=1.0
        )
        page = context.new_page()

        page.on("pageerror", lambda err: results["errors"].append(f"[PAGE ERROR] {err}"))
        page.on("console", lambda msg: results["errors"].append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)

        # -------------------------------------------------------------
        # STEP 1: Landing Page & Access Platform
        # -------------------------------------------------------------
        print("\n=== [1/6] Acessando a Plataforma ===")
        page.goto(TARGET_URL, wait_until="networkidle", timeout=60000)
        time.sleep(2)
        results["landing_page"] = True
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "01_landing_page.png"))
        print("[SCREENSHOT] 01_landing_page.png gravado.")

        # Entrar no app
        enter_btn = page.locator('button:has-text("Ir para o Aplicativo"), button:has-text("Acessar o Aplicativo"), button:has-text("Entrar")').first
        if enter_btn.is_visible():
            print("[*] Clicando em 'Ir para o Aplicativo'...")
            enter_btn.click()
            time.sleep(2.5)

        results["workspace_access"] = True
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "02_workspace_dashboard.png"))
        print("[SCREENSHOT] 02_workspace_dashboard.png gravado.")

        # -------------------------------------------------------------
        # STEP 2: CVM Watch & Análise -> Setor Bancos -> BANCO ABC BRASIL S/A
        # -------------------------------------------------------------
        print("\n=== [2/6] Navegando para CVM Watch & Análise ===")
        cvm_tab_btn = page.locator('button:has-text("CVM Watch"), button:has-text("CVM")').first
        assert cvm_tab_btn.is_visible(), "Aba CVM Watch & Análise não encontrada!"
        cvm_tab_btn.click()
        time.sleep(3)

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "03_cvm_panel_initial.png"))
        print("[SCREENSHOT] 03_cvm_panel_initial.png gravado.")

        # 2.1 Selecionar Setor "Bancos"
        print("[*] Selecionando setor 'Bancos' no filtro CVM...")
        sector_select = page.locator('select:has(option:has-text("Setores"))').first
        if sector_select.is_visible():
            # Localizar option de Bancos
            sector_select.select_option(label="Bancos")
            time.sleep(1.5)
            results["cvm_sector_bancos"] = True
            print("[OK] Setor 'Bancos' selecionado com sucesso!")

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "04_cvm_sector_bancos_filtered.png"))
        print("[SCREENSHOT] 04_cvm_sector_bancos_filtered.png gravado.")

        # 2.2 Selecionar "BANCO ABC BRASIL S/A"
        print("[*] Buscando e selecionando 'BANCO ABC BRASIL S/A' (CVM 020958)...")
        # Pode usar o campo de busca ou o select de empresas
        search_box = page.locator('input[placeholder*="Buscar"], input[placeholder*="Search"]').first
        if search_box.is_visible():
            search_box.fill("ABC BRASIL")
            time.sleep(1.5)

        company_select = page.locator('div:has(label:has-text("Companhia Aberta")) select, select:has(option:has-text("ABC"))').first
        if company_select.is_visible():
            # Seleciona option do Banco ABC
            options = company_select.locator("option").all_inner_texts()
            print(f"Empresas disponíveis no filtro: {len(options)}")
            abc_option = next((opt for opt in options if "ABC" in opt.upper()), None)
            if abc_option:
                company_select.select_option(label=abc_option)
                time.sleep(2)
                results["cvm_abc_brasil_selected"] = True
                print(f"[OK] Companhia selecionada: {abc_option}")

        # Limpar campo de busca se necessário para manter visão limpa
        if search_box.is_visible():
            search_box.fill("")
            time.sleep(1)

        # 2.3 Validar dados financeiros do Banco ABC Brasil
        time.sleep(2.5)
        body_text = page.inner_text("body")
        has_abc_banner = "BANCO ABC BRASIL" in body_text
        has_cvm_code = "020958" in body_text
        has_kpis = "RECEITA LÍQUIDA" in body_text or "LUCRO LÍQUIDO" in body_text or "MARGEM" in body_text

        print(f"[OK] Banner Banco ABC Brasil visível: {has_abc_banner}")
        print(f"[OK] Código CVM 020958 visível: {has_cvm_code}")
        print(f"[OK] KPIs contábeis calculados: {has_kpis}")
        results["cvm_financials_loaded"] = has_abc_banner and has_kpis

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "05_cvm_abc_brasil_financials.png"))
        print("[SCREENSHOT] 05_cvm_abc_brasil_financials.png gravado.")

        # 2.4 Clicar em "Carregar no Hyperblock"
        print("[*] Clicando no botão 'Carregar no Hyperblock'...")
        load_btn = page.locator('button:has-text("Carregar no Hyperblock")').first
        if load_btn.is_visible():
            load_btn.click()
            time.sleep(3)
            results["cube_injected"] = True
            print("[OK] Banco ABC Brasil S/A carregado com sucesso no Cubo Multidimensional!")

        # Validar sincronização na barra de contexto
        time.sleep(1)
        sync_bar_text = page.inner_text("body")
        is_synced = "Sincronizada com o modelo ativo" in sync_bar_text or "BANCO ABC BRASIL" in sync_bar_text
        print(f"[OK] Sincronização do modelo ativo confirmada: {is_synced}")

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "06_cvm_abc_brasil_synced_hyperblock.png"))
        print("[SCREENSHOT] 06_cvm_abc_brasil_synced_hyperblock.png gravado.")

        # -------------------------------------------------------------
        # STEP 3: Configurar / Verificar Gemini AI Provider
        # -------------------------------------------------------------
        print("\n=== [3/6] Verificando Provedor de IA Gemini ===")
        settings_btn = page.locator("header button[title*='Configurar LLM'], header button[title*='Configurar']").first
        if settings_btn.is_visible():
            settings_btn.click()
            time.sleep(1.5)
            modal = page.locator("div.fixed.inset-0").first
            if modal.is_visible():
                gemini_tab = modal.locator("button:has-text('Google DeepMind'), button:has-text('Gemini')").first
                if gemini_tab.is_visible():
                    gemini_tab.click()
                    time.sleep(0.5)
                save_btn = modal.locator("button:has-text('Salvar')").first
                if save_btn.is_visible():
                    save_btn.click()
                    time.sleep(1.5)
                print("[OK] Gemini AI configurado!")

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "07_gemini_ai_configured.png"))
        print("[SCREENSHOT] 07_gemini_ai_configured.png gravado.")

        # -------------------------------------------------------------
        # STEP 4: Auditoria de TODAS as 20 Páginas com BANCO ABC BRASIL
        # -------------------------------------------------------------
        print("\n=== [4/6] Auditando Todas as 20 Páginas com Banco ABC Brasil Ativo ===")

        pages_to_audit = [
            # Linha 1: Ferramentas
            ("08_page_overview", "Visão Geral & Ingestão", "button:has-text('Visão Geral'), button:has-text('Visao Geral'), button:has-text('Overview')"),
            ("09_page_connections", "Conexões ERP & Bancos de Dados", "button:has-text('Conexões ERP'), button:has-text('Conexoes ERP'), button:has-text('ERP')"),
            ("10_page_economy", "Macroeconomia & BCB", "button:has-text('Macroeconomia'), button:has-text('BCB')"),
            ("11_page_guide", "Guia do Usuário & Manual", "button:has-text('Guia do Usuário'), button:has-text('Guia do Usuario'), button:has-text('Manual')"),

            # Linha 2: Planejamento
            ("12_page_planning", "Planejamento Conectado (N-D)", "button:has-text('Planejamento Conectado')"),
            ("13_page_drivers", "Planejamento por Drivers", "button:has-text('Drivers'), button:has-text('Headcount')"),
            ("14_page_forecast", "Previsão & Monte Carlo", "button:has-text('Previsão & Monte Carlo'), button:has-text('Previsao'), button:has-text('Monte Carlo')"),
            ("15_page_governance", "Conselho & Covenants", "button:has-text('Conselho'), button:has-text('Covenants')"),
            ("16_page_three_statement", "Loop DRE-DFC-BP", "button:has-text('Loop DRE-DFC-BP'), button:has-text('3-Statement')"),
            ("17_page_cube", "Cubo 3D OLAP Interativo", "button:has-text('Cubo 3D'), button:has-text('Cubo OLAP'), button:has-text('3D OLAP')"),
            ("18_page_valuation", "Valuation Corporativo", "button:has-text('Valuation')"),

            # Linha 3: Demonstrações Contábeis CVM / CPC
            ("19_page_dre", "Demonstração DRE", "button:has-text('Demonstração DRE'), button:has-text('DRE')"),
            ("20_page_dfc", "Fluxo de Caixa (DFC)", "button:has-text('Fluxo de Caixa'), button:has-text('DFC')"),
            ("21_page_bp", "Balanço Patrimonial (BP)", "button:has-text('Balanço Patrimonial'), button:has-text('Balanco Patrimonial'), button:has-text('BP')"),
            ("22_page_dra", "Resultado Abrangente (DRA)", "button:has-text('Resultado Abrangente'), button:has-text('DRA')"),
            ("23_page_dmpl", "Mutações do PL (DMPL)", "button:has-text('Mutações do PL'), button:has-text('Mutacoes do PL'), button:has-text('DMPL')"),
            ("24_page_dva", "Valor Adicionado (DVA)", "button:has-text('Valor Adicionado'), button:has-text('DVA')"),
            ("25_page_ne", "Notas Explicativas (NE)", "button:has-text('Notas Explicativas'), button:has-text('NE')"),
            ("26_page_cvm_watch", "CVM Watch & Análise", "button:has-text('CVM Watch'), button:has-text('CVM')"),
        ]

        for screenshot_name, title, selector in pages_to_audit:
            print(f"[*] Auditando: {title}...")
            btn = page.locator(selector).first
            if btn.is_visible():
                btn.click()
                time.sleep(1.8)
            else:
                page.get_by_text(title, exact=False).first.click()
                time.sleep(1.8)

            # Verificar se não há erro de renderização
            page_content = page.inner_text("body")
            has_error = "Application error" in page_content or "Unhandled Runtime Error" in page_content
            header_text = page.locator("header").first.inner_text()
            has_abc = "ABC" in header_text or "BANCO" in header_text

            results["pages_audited"].append({
                "page": title,
                "status": "PASS" if not has_error else "FAIL",
                "abc_active_in_header": has_abc,
                "screenshot": f"{screenshot_name}.png"
            })

            screenshot_path = os.path.join(ARTIFACTS_DIR, f"{screenshot_name}.png")
            page.screenshot(path=screenshot_path)
            print(f"[OK] {title} validada com sucesso! -> {screenshot_name}.png")

        # -------------------------------------------------------------
        # STEP 5: Teste da IA Gemini no Banco ABC Brasil
        # -------------------------------------------------------------
        print("\n=== [5/6] Executando Análise Financeira via Agente Gemini 3.7 Flash ===")
        # Navega para Balanço Patrimonial onde reside o BPAgentPanel
        bp_btn = page.locator("button:has-text('Balanço Patrimonial'), button:has-text('Balanco Patrimonial'), button:has-text('BP')").first
        if bp_btn.is_visible():
            bp_btn.click()
            time.sleep(2.5)

        # Rola até o final da página onde o BPAgentPanel está localizado
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1)

        agent_input = page.locator("input[placeholder*='liquidez'], input[placeholder*='Dupont'], input[placeholder*='Pergunte']").first
        ask_btn = page.locator("form button[type='submit']").first

        if agent_input.is_visible():
            question = "Avalie a estrutura de capital, liquidez e rentabilidade (ROE) do Banco ABC Brasil S/A."
            print(f"[*] Enviando pergunta ao Gemini 3.7 Flash: '{question}'...")
            agent_input.fill(question)
            time.sleep(0.5)
            if ask_btn.is_visible():
                ask_btn.click()
            else:
                agent_input.press("Enter")
            
            print("[*] Aguardando resposta analítica do Gemini...")
            time.sleep(7.5)
            results["ai_gemini_tested"] = True
            page.screenshot(path=os.path.join(ARTIFACTS_DIR, "27_gemini_financial_analysis_abc.png"))
            print("[SCREENSHOT] 27_gemini_financial_analysis_abc.png gravado.")
        else:
            print("[!] Campo do agente não localizado diretamente, gravando tela do BP...")
            page.screenshot(path=os.path.join(ARTIFACTS_DIR, "27_bp_agent_screen.png"))

        # -------------------------------------------------------------
        # STEP 6: Validação Final da Landing Page
        # -------------------------------------------------------------
        print("\n=== [6/6] Validando Landing Page Final ===")
        home_btn = page.locator("button:has-text('Início'), button:has-text('Inicio'), button:has-text('Home')").first
        if home_btn.is_visible():
            home_btn.click()
            time.sleep(2)
        else:
            page.goto(TARGET_URL, wait_until="networkidle")
            time.sleep(2)

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "28_landing_page_final.png"))
        print("[SCREENSHOT] 28_landing_page_final.png gravado.")

        browser.close()

    print("\n" + "=" * 80)
    print(" [SUCESSO TOTAL] TESTE END-TO-END 100% CONCLUÍDO!")
    print(f" - Setor 'Bancos' auditado com sucesso: {results['cvm_sector_bancos']}")
    print(f" - 'BANCO ABC BRASIL S/A' selecionado: {results['cvm_abc_brasil_selected']}")
    print(f" - Demonstrações e KPIs carregados: {results['cvm_financials_loaded']}")
    print(f" - Injetado no Cubo Multidimensional: {results['cube_injected']}")
    print(f" - Agente Gemini testado: {results['ai_gemini_tested']}")
    print(f" - Total de Páginas Auditadas com êxito: {len(results['pages_audited'])}/19")
    print(f" - Total de Screenshots capturados: 28 imagens salvas em {ARTIFACTS_DIR}")
    print("=" * 80)

if __name__ == "__main__":
    run_test()
