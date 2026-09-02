import sys
import urllib.request
import json
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

def test_api_endpoints():
    print("--- 1. TESTANDO ENDPOINTS DA API NEXT.JS / SERVERLESS ---", flush=True)
    
    # Test DRE Table for Daycoval
    dre_url = f"{BASE_URL}/api/dre/table?company_id=cvm_20796"
    req = urllib.request.urlopen(dre_url)
    dre_data = json.loads(req.read().decode("utf-8"))
    print(f"   [OK] /api/dre/table: Companhia = {dre_data.get('company', {}).get('name')}", flush=True)
    assert "DAYCOVAL" in dre_data.get('company', {}).get('name', '').upper()
    dre_row_names = [r.get('name', '') for r in dre_data.get('rows', [])]
    assert any("Intermediação Financeira" in r for r in dre_row_names), "DRE bancária não contém Intermediação Financeira!"
    assert any("Provisão para Perdas" in r or "PCLD" in r for r in dre_row_names), "DRE bancária não contém PCLD/PDD!"
    print(f"   [OK] Contas bancárias DRE validadas ({len(dre_row_names)} linhas).", flush=True)

    # Test DFC Table for Daycoval
    dfc_url = f"{BASE_URL}/api/dfc/table?company_id=cvm_20796"
    req = urllib.request.urlopen(dfc_url)
    dfc_data = json.loads(req.read().decode("utf-8"))
    print(f"   [OK] /api/dfc/table: Companhia = {dfc_data.get('company', {}).get('name')}", flush=True)
    dfc_row_names = [r.get('name', '') for r in dfc_data.get('rows', [])]
    assert any("FCO" in r or "Operacionais" in r for r in dfc_row_names), "DFC bancária não contém FCO!"
    assert any("Títulos e Valores Mobiliários" in r or "TVM" in r for r in dfc_row_names), "DFC bancária não contém TVM!"
    assert any("Operações de Crédito" in r for r in dfc_row_names), "DFC bancária não contém Carteira de Crédito!"
    print(f"   [OK] Contas bancárias DFC validadas ({len(dfc_row_names)} linhas).", flush=True)

    # Test DAG for Daycoval
    dag_url = f"{BASE_URL}/api/dag?company_id=cvm_20796"
    req = urllib.request.urlopen(dag_url)
    dag_data = json.loads(req.read().decode("utf-8"))
    dag_nodes = [n.get('id', '') for n in dag_data.get('nodes', [])]
    print(f"   [OK] /api/dag: {len(dag_nodes)} nós retornados.", flush=True)
    assert any("intermediacao" in n for n in dag_nodes), "DAG não contém nós de intermediação bancária!"
    assert any("credito" in n or "prc" in n for n in dag_nodes), "DAG não contém nós de risco de crédito!"
    print("   [OK] Topologia do DAG bancário validada via API.", flush=True)

def test_browser_flow():
    print("\n--- 2. TESTANDO INTERFACE BROWSER (PLAYWRIGHT) ---", flush=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("   -> Abrindo Home Page...", flush=True)
        page.goto(BASE_URL, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(2000)

        # If on landing page, click "Ir para o Aplicativo"
        enter_app_btn = page.locator("button:has-text('Ir para o Aplicativo'), button:has-text('Go to Workspace')").first
        if enter_app_btn.is_visible():
            print("   -> Clicando em 'Ir para o Aplicativo' na Landing Page...", flush=True)
            enter_app_btn.click()
            page.wait_for_timeout(2000)

        # CVM Watch navigation
        print("   -> Navegando para CVM Watch...", flush=True)
        cvm_btn = page.locator("button:has-text('CVM Watch & Análise'), button:has-text('CVM Watch'), button:has-text('CVM')").first
        cvm_btn.click()
        page.wait_for_timeout(2000)

        # Select Daycoval in dropdown
        print("   -> Buscando Daycoval no dropdown...", flush=True)
        company_select = page.locator("select").nth(1)
        comp_options = company_select.locator("option").all_inner_texts()
        daycoval_opt = next((opt for opt in comp_options if "daycoval" in opt.lower()), None)
        assert daycoval_opt is not None, "Daycoval não encontrado no dropdown!"
        company_select.select_option(label=daycoval_opt)
        page.wait_for_timeout(2000)
        print(f"   [OK] Daycoval selecionado: {daycoval_opt}", flush=True)

        # Check DRE banking rows
        dre_text = page.locator("section:has-text('Demonstração DRE')").first.inner_text()
        assert "Receitas da Intermediação Financeira" in dre_text
        assert "Despesas da Intermediação Financeira" in dre_text
        assert "Provisão para Perdas com Crédito" in dre_text
        print("   [OK] Tabela DRE no CVM Watch exibe contas bancárias do Daycoval.", flush=True)

        # Toggle to DFC
        print("   -> Alternando para aba DFC no CVM Watch...", flush=True)
        page.locator("button:has-text('Demonstração DFC')").first.click()
        page.wait_for_timeout(1500)
        dfc_text = page.locator("section:has-text('Demonstração DFC')").first.inner_text()
        assert "Caixa Líquido das Atividades Operacionais (FCO)" in dfc_text
        assert "Variação em Títulos e Valores Mobiliários" in dfc_text
        assert "Variação na Carteira de Operações de Crédito" in dfc_text
        print("   [OK] Tabela DFC no CVM Watch exibe contas de fluxo de caixa bancário.", flush=True)

        # Load to Cube
        print("   -> Clicando em 'Carregar no Hyperblock'...", flush=True)
        page.locator("button:has-text('Carregar no Hyperblock')").first.click()
        page.wait_for_timeout(2000)

        # Navigate to Demonstração DRE to verify DagViewer
        print("   -> Navegando para a Demonstração DRE (onde o Grafo DAG DRE é renderizado)...", flush=True)
        dre_btn = page.locator("button:has-text('Demonstração DRE'), button:has-text('Income Statement (DRE)')").first
        dre_btn.click()
        page.wait_for_timeout(3000)

        dag_html = page.locator(".react-flow").first.inner_text()
        assert "Intermediação" in dag_html or "intermediação" in dag_html.lower() or "Produto" in dag_html or "produto" in dag_html.lower(), f"DAG DRE não exibiu nó bancário! Conteúdo: {dag_html[:200]}"
        print("   [OK] Grafo DAG DRE renderizado com nós bancários coerentes!", flush=True)

        # Screenshot DRE DAG
        page.screenshot(path="scripts/screenshot_daycoval_dre_dag.png")
        print("   [OK] Screenshot capturada em scripts/screenshot_daycoval_dre_dag.png", flush=True)

        # Navigate to Fluxo de Caixa (DFC) to verify DFC DagViewer
        print("   -> Navegando para o Fluxo de Caixa (DFC) (onde o Grafo DAG DFC é renderizado)...", flush=True)
        dfc_btn = page.locator("button:has-text('Fluxo de Caixa (DFC)'), button:has-text('Cash Flow Statement (DFC)')").first
        dfc_btn.click()
        page.wait_for_timeout(3000)

        dfc_dag_html = page.locator(".react-flow").first.inner_text()
        assert "Operaciona" in dfc_dag_html or "FCO" in dfc_dag_html or "Caixa" in dfc_dag_html, f"DAG DFC não exibiu nós de fluxo de caixa! Conteúdo: {dfc_dag_html[:200]}"
        print("   [OK] Grafo DAG DFC renderizado com nós de fluxo de caixa coerentes!", flush=True)

        # Screenshot DFC DAG
        page.screenshot(path="scripts/screenshot_daycoval_dfc_dag.png")
        print("   [OK] Screenshot capturada em scripts/screenshot_daycoval_dfc_dag.png", flush=True)

        browser.close()

if __name__ == "__main__":
    test_api_endpoints()
    test_browser_flow()
    print("\n=======================================================")
    print(">>> SUCESSO TOTAL: TODAS AS VALIDAÇÕES FORAM CONCLUÍDAS!")
    print("=======================================================", flush=True)
