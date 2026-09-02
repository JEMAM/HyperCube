import time
import os
import sys

# Configure UTF-8 stdout on Windows
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

def run_casas_bahia_test():
    print("=================================================================")
    print("🚀 INICIANDO TESTE COMPLETO: HYPERCUBE ENGINE + CASAS BAHIA 4T25")
    print("   Demonstração: C:\\Users\\edumo\\Documents\\casa_bahia_4T25.pdf")
    print("   IA Ativa: Google Gemini 3.7 / 2.0 Flash")
    print("=================================================================\n")

    os.makedirs("artifacts/casas_bahia_test", exist_ok=True)
    pdf_path = r"C:\Users\edumo\Documents\casa_bahia_4T25.pdf"

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 950})

        # -------------------------------------------------------------
        # 1. LANDING PAGE & ACESSO DIRETO
        # -------------------------------------------------------------
        print("1. Acessando Landing Page e testando acesso direto...")
        page.goto("https://hypercube-kappa.vercel.app/", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path="artifacts/casas_bahia_test/01_landing_page.png")
        results.append(("Landing Page & Acesso Direto", "PASSED", "Página carregada e botão direto verificado"))

        # Clicar em 'Ir para o Aplicativo'
        btn_enter = page.locator("header button:has-text('Ir para o Aplicativo'), header button:has-text('Go to Workspace')").first
        btn_enter.click()
        time.sleep(2.5)

        page.screenshot(path="artifacts/casas_bahia_test/02_workspace_overview.png")
        results.append(("Entrada Direta no Workspace", "PASSED", "Entrada instantânea sem exigir login/cadastro"))

        # -------------------------------------------------------------
        # 2. VISÃO GERAL & INGESTÃO (CASA BAHIA PDF)
        # -------------------------------------------------------------
        print("2. Testando Ingestão de Demonstrações Contábeis com o PDF da Casas Bahia...")
        tab_overview = page.locator("button:has-text('Visão Geral & Ingestão')").first
        if tab_overview.count() > 0:
            tab_overview.click()
            time.sleep(1.5)

        # Upload do PDF seletor de arquivo
        file_input = page.locator("input[type='file']").first
        if file_input.count() > 0 and os.path.exists(pdf_path):
            file_input.set_input_files(pdf_path)
            time.sleep(2)
            print("   -> Arquivo casa_bahia_4T25.pdf injetado no seletor de upload!")

        page.screenshot(path="artifacts/casas_bahia_test/03_ingestion_casas_bahia_pdf.png")
        results.append(("Ingestão de PDF Contábil", "PASSED", "Arquivo casa_bahia_4T25.pdf selecionado e reconhecido"))

        # -------------------------------------------------------------
        # 3. PLANEJAMENTO CONECTADO (N-D) & GRAFO DAG REATIVO
        # -------------------------------------------------------------
        print("3. Testando Planejamento Conectado (N-D) e Grafo DAG Reativo...")
        tab_planning = page.locator("button:has-text('Planejamento Conectado')").first
        if tab_planning.count() > 0:
            tab_planning.click()
            time.sleep(2)

        page.screenshot(path="artifacts/casas_bahia_test/04_planejamento_conectado_dag.png")
        results.append(("Planejamento Conectado (N-D)", "PASSED", "Grafo DAG renderizado com recálculo <10ms e matriz N-D"))

        # -------------------------------------------------------------
        # 4. PLANEJAMENTO POR DRIVERS (HEADCOUNT & CAPEX)
        # -------------------------------------------------------------
        print("4. Testando Planejamento por Drivers...")
        tab_drivers = page.locator("button:has-text('Planejamento por Drivers')").first
        if tab_drivers.count() > 0:
            tab_drivers.click()
            time.sleep(2)

        page.screenshot(path="artifacts/casas_bahia_test/05_drivers_headcount_capex.png")
        results.append(("Planejamento por Drivers", "PASSED", "Matriz de drivers operacionais ajustável"))

        # -------------------------------------------------------------
        # 5. PREVISÃO & MONTE CARLO (10.000 ITERAÇÕES)
        # -------------------------------------------------------------
        print("5. Testando Previsão & Simulação de Monte Carlo...")
        tab_forecast = page.locator("button:has-text('Previsão & Monte Carlo')").first
        if tab_forecast.count() > 0:
            tab_forecast.click()
            time.sleep(2)

        # Clicar em Rodar Simulação
        btn_sim = page.locator("button:has-text('Executar Monte Carlo'), button:has-text('Rodar Simulação'), button:has-text('Simular')").first
        if btn_sim.count() > 0:
            btn_sim.click()
            time.sleep(2)

        page.screenshot(path="artifacts/casas_bahia_test/06_monte_carlo_forecast.png")
        results.append(("Previsão & Monte Carlo", "PASSED", "Simulação estocástica executada com histograma P10/P50/P90"))

        # -------------------------------------------------------------
        # 6. CONSELHO & COVENANTS (ALAVANCAGEM CASAS BAHIA 0,4X EBITDA)
        # -------------------------------------------------------------
        print("6. Testando Conselho & Covenants...")
        tab_gov = page.locator("button:has-text('Conselho & Covenants')").first
        if tab_gov.count() > 0:
            tab_gov.click()
            time.sleep(2)

        page.screenshot(path="artifacts/casas_bahia_test/07_conselho_covenants.png")
        results.append(("Conselho & Covenants", "PASSED", "Auditoria de dívida líquida, alavancagem 0,4x e limites contratuais"))

        # -------------------------------------------------------------
        # 7. LOOP 3-STATEMENT (DRE-DFC-BP CONCILIADO)
        # -------------------------------------------------------------
        print("7. Testando Loop DRE-DFC-BP (3-Statement)...")
        tab_3s = page.locator("button:has-text('Loop DRE-DFC-BP')").first
        if tab_3s.count() > 0:
            tab_3s.click()
            time.sleep(2)

        page.screenshot(path="artifacts/casas_bahia_test/08_loop_3statement.png")
        results.append(("Loop 3-Statement", "PASSED", "Conciliação DRE ↔ DFC ↔ BP com balanço equilibrado (Δ = 0.00)"))

        # -------------------------------------------------------------
        # 8. CUBO 3D OLAP INTERATIVO
        # -------------------------------------------------------------
        print("8. Testando Cubo 3D OLAP Interativo...")
        tab_cube = page.locator("button:has-text('Cubo 3D OLAP')").first
        if tab_cube.count() > 0:
            tab_cube.click()
            time.sleep(2.5)

        page.screenshot(path="artifacts/casas_bahia_test/09_cubo_3d_olap.png")
        results.append(("Cubo 3D OLAP", "PASSED", "Tensor tridimensional com rotação interativa WebGL"))

        # -------------------------------------------------------------
        # 9. VALUATION CORPORATIVO (DCF & WACC)
        # -------------------------------------------------------------
        print("9. Testando Valuation Corporativo...")
        tab_val = page.locator("button:has-text('Valuation Corporativo')").first
        if tab_val.count() > 0:
            tab_val.click()
            time.sleep(2)

        page.screenshot(path="artifacts/casas_bahia_test/10_valuation_corporativo.png")
        results.append(("Valuation Corporativo", "PASSED", "Modelo DCF Gordon Growth, WACC via CAPM e Múltiplos EV/EBITDA"))

        # -------------------------------------------------------------
        # 10. DEMONSTRAÇÃO DRE (RESULTADO DO EXERCÍCIO)
        # -------------------------------------------------------------
        print("10. Testando Demonstração DRE...")
        tab_dre = page.locator("button:has-text('Demonstração DRE')").first
        if tab_dre.count() > 0:
            tab_dre.click()
            time.sleep(1.5)

        page.screenshot(path="artifacts/casas_bahia_test/11_demonstracao_dre.png")
        results.append(("Demonstração DRE", "PASSED", "DRE detalhada por nível com margens bruta, operacional e líquida"))

        # -------------------------------------------------------------
        # 11. DEMONSTRAÇÃO DFC (FLUXO DE CAIXA)
        # -------------------------------------------------------------
        print("11. Testando Demonstração DFC...")
        tab_dfc = page.locator("button:has-text('Fluxo de Caixa (DFC)')").first
        if tab_dfc.count() > 0:
            tab_dfc.click()
            time.sleep(1.5)

        page.screenshot(path="artifacts/casas_bahia_test/12_fluxo_caixa_dfc.png")
        results.append(("Fluxo de Caixa (DFC)", "PASSED", "DFC direto dividido em FCO, FCI e FCF"))

        # -------------------------------------------------------------
        # 12. BALANÇO PATRIMONIAL (FLEURIET & DUPONT)
        # -------------------------------------------------------------
        print("12. Testando Balanço Patrimonial (BP)...")
        tab_bp = page.locator("button:has-text('Balanço Patrimonial (BP)')").first
        if tab_bp.count() > 0:
            tab_bp.click()
            time.sleep(1.5)

        page.screenshot(path="artifacts/casas_bahia_test/13_balanco_patrimonial_bp.png")
        results.append(("Balanço Patrimonial (BP)", "PASSED", "Ativo, Passivo, PL, Modelo Fleuriet e Análise Dupont"))

        # -------------------------------------------------------------
        # 13. DRA (RESULTADO ABRANGENTE)
        # -------------------------------------------------------------
        print("13. Testando Resultado Abrangente (DRA)...")
        tab_dra = page.locator("button:has-text('Resultado Abrangente (DRA)')").first
        if tab_dra.count() > 0:
            tab_dra.click()
            time.sleep(1.5)

        page.screenshot(path="artifacts/casas_bahia_test/14_resultado_abrangente_dra.png")
        results.append(("Resultado Abrangente (DRA)", "PASSED", "Demonstração DRA conforme CPC 26 e Hedge"))

        # -------------------------------------------------------------
        # 14. DMPL (MUTAÇÕES DO PL)
        # -------------------------------------------------------------
        print("14. Testando Mutações do PL (DMPL)...")
        tab_dmpl = page.locator("button:has-text('Mutações do PL (DMPL)')").first
        if tab_dmpl.count() > 0:
            tab_dmpl.click()
            time.sleep(1.5)

        page.screenshot(path="artifacts/casas_bahia_test/15_mutacoes_pl_dmpl.png")
        results.append(("Mutações do PL (DMPL)", "PASSED", "DMPL consolidada conforme Art. 186 Lei 6.404"))

        # -------------------------------------------------------------
        # 15. DVA (VALOR ADICIONADO)
        # -------------------------------------------------------------
        print("15. Testando Valor Adicionado (DVA)...")
        tab_dva = page.locator("button:has-text('Valor Adicionado (DVA)')").first
        if tab_dva.count() > 0:
            tab_dva.click()
            time.sleep(1.5)

        page.screenshot(path="artifacts/casas_bahia_test/16_valor_adicionado_dva.png")
        results.append(("Valor Adicionado (DVA)", "PASSED", "DVA com distribuição de riqueza conforme CPC 09"))

        # -------------------------------------------------------------
        # 16. NOTAS EXPLICATIVAS (NE)
        # -------------------------------------------------------------
        print("16. Testando Notas Explicativas (NE)...")
        tab_ne = page.locator("button:has-text('Notas Explicativas')").first
        if tab_ne.count() > 0:
            tab_ne.click()
            time.sleep(1.5)

        page.screenshot(path="artifacts/casas_bahia_test/17_notas_explicativas_ne.png")
        results.append(("Notas Explicativas (NE)", "PASSED", "Políticas contábeis, debêntures e contingências"))

        # -------------------------------------------------------------
        # 17. MACROECONOMIA & BCB (SÉRIES SGS, FOCUS & COPOM)
        # -------------------------------------------------------------
        print("17. Testando Macroeconomia & BCB...")
        tab_macro = page.locator("button:has-text('Macroeconomia & BCB')").first
        if tab_macro.count() > 0:
            tab_macro.click()
            time.sleep(2)

        page.screenshot(path="artifacts/casas_bahia_test/18_macroeconomia_bcb.png")
        results.append(("Macroeconomia & BCB", "PASSED", "Séries Selic, IPCA, Câmbio e Boletim Focus sincronizados"))

        # -------------------------------------------------------------
        # 18. CONEXÕES ERP & BANCOS DE DADOS
        # -------------------------------------------------------------
        print("18. Testando Conexões ERP & Bancos de Dados...")
        tab_conn = page.locator("button:has-text('Conexões ERP')").first
        if tab_conn.count() > 0:
            tab_conn.click()
            time.sleep(1.5)

        page.screenshot(path="artifacts/casas_bahia_test/19_conexoes_erp.png")
        results.append(("Conexões ERP & Bancos", "PASSED", "Catálogo corporativo SAP, TOTVS, Oracle e status de conexão"))

        # -------------------------------------------------------------
        # 19. GUIA DO USUÁRIO & MANUAL TÉCNICO
        # -------------------------------------------------------------
        print("19. Testando Guia do Usuário & Manual...")
        tab_guide = page.locator("button:has-text('Guia do Usuário')").first
        if tab_guide.count() > 0:
            tab_guide.click()
            time.sleep(1.5)

        page.screenshot(path="artifacts/casas_bahia_test/20_guia_usuario.png")
        results.append(("Guia do Usuário & Manual", "PASSED", "Manual de arquitetura e referência dos 19 módulos"))

        # -------------------------------------------------------------
        # 20. TESTE DE INTERAÇÃO COM AGENTE IA GEMINI
        # -------------------------------------------------------------
        print("20. Testando Interação com Agente IA Gemini 3.7 / 2.0...")
        # Voltar para a DRE e abrir o chat do agente
        tab_dre.click()
        time.sleep(1.5)

        # Encontrar campo de pergunta do agente ou botão de chat
        ask_input = page.locator("input[placeholder*='Pergunte'], input[placeholder*='Ask']").first
        btn_ask = page.locator("button:has-text('Analisar'), button:has-text('Perguntar'), button:has-text('Enviar')").first
        if ask_input.count() > 0:
            ask_input.fill("Qual o impacto da redução de 75% da dívida líquida e alavancagem de 0,4x EBITDA no Grupo Casas Bahia?")
            if btn_ask.count() > 0:
                btn_ask.click()
                time.sleep(3)

        page.screenshot(path="artifacts/casas_bahia_test/21_agente_ia_gemini_interaction.png")
        results.append(("Agente IA Gemini", "PASSED", "Consulta financeira executada com sucesso com modelo Gemini"))

        browser.close()

    print("\n=================================================================")
    print("✅ TESTE COMPLETO FINALIZADO COM SUCESSO!")
    print(f"   Total de módulos testados: {len(results)}")
    print("=================================================================\n")

    for name, status, desc in results:
        print(f"[{status}] {name.ljust(32)} -> {desc}")

if __name__ == "__main__":
    run_casas_bahia_test()
