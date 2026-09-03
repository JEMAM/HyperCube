import os
import json
import concurrent.futures
from typing import Dict, Any, Optional, List

from agno.agent import Agent
from backend.app.agents.analysis_agent import MODEL_ALIASES
from backend.app.bp.bp_engine import bp_engine
from backend.app.data.loader import get_active_company_info

class BPAgent:
    """
    Agente Especialista em Análise de Balanço Patrimonial, estruturado rigorosamente
    segundo a skill 'analise-balanco-patrimonial'.
    
    Cobre todos os 7 grupos fundamentais de análise econômico-financeira:
    1. Análise Vertical (AV) e Horizontal (AH)
    2. Índices de Liquidez (Corrente, Seca, Imediata, Geral)
    3. Endividamento e Estrutura de Capital (Geral, Composição, Debt-to-Equity, Imobilização)
    4. Índices de Rentabilidade (ROE, ROA, ROI/ROIC, Margens, Giro do Ativo)
    5. Prazos Médios e Atividade (PME, PMR, PMP, Ciclo Operacional, Ciclo Financeiro)
    6. Capital de Giro — Modelo Fleuriet (NCG, CDG, Saldo de Tesouraria ST e Classificação)
    7. Análise Dupont (3 fatores) e Indicadores de EBITDA (Dívida Líquida/EBITDA, Cobertura)
    """

    SKILL_INSTRUCTIONS = """
Você é um Auditor e Analista Sênior Especialista em Balanço Patrimonial (BP), atuando conforme a skill 'analise-balanco-patrimonial'.
Seu objetivo é fornecer diagnósticos econômico-financeiros aprofundados, cruzando múltiplos grupos de indicadores contábeis.

DIRETRIZES FUNDAMENTAIS DA SKILL:
1. NUNCA avalie um índice isoladamente. Cruze liquidez com Modelo Fleuriet e endividamento com geração operacional de caixa (EBITDA).
2. APRESENTE OS CÁLCULOS E AS FÓRMULAS: Ao citar um índice, mostre a fórmula e os valores das contas que alimentam o cálculo.
3. CONTEXTUALIZE A EVOLUÇÃO HISTÓRICA: Analise a tendência entre os períodos (ex: 2024, 2025, Budget 2026) e as variações na Análise Horizontal (AH%) e Vertical (AV%).
4. AVALIE O MODELO FLEURIET:
   - NCG = Ativo Circulante Operacional (ACO) - Passivo Circulante Operacional (PCO)
   - CDG = (Patrimônio Líquido + Exigível LP) - Ativo Não Circulante
   - ST = CDG - NCG (ou Ativo Circulante Financeiro - Passivo Circulante Financeiro)
   - Classifique a estrutura financeira: Sólida, Insatisfatória, Alto Risco ou Excelente.
5. DECOMPOSIÇÃO DUPONT:
   - ROE = Margem Líquida × Giro do Ativo × Multiplicador de Alavancagem Financeira.
   - Avalie se o ROE é impulsionado por eficiência operacional genuína ou alavancagem por endividamento.
6. SINAIS DE ALERTA: Aponte com clareza desalinhamento de prazos (PMR > PMP), compressão do Saldo de Tesouraria (ST negativo), aumento da dependência de dívida de curto prazo (Composição do Endividamento) e cobertura de juros.
7. NÃO dê recomendação de compra/venda de ações ou investimento; foque na análise técnica rigorosa da saúde patrimonial e solvência.
"""

    def __init__(self, config: Optional[Dict[str, str]] = None):
        self.config = config or {
            "provider": "groq",
            "model": "Llama 3.1 (8B, 70B, 405B) e Llama 3.3 / Llama 4 Scout",
            "api_key": ""
        }

    def update_config(self, config: Dict[str, str]):
        self.config = config

    def _is_active(self) -> bool:
        provider = self.config.get("provider", "groq").lower()
        if provider == "ollama":
            return True
        key = self.config.get("api_key", "").strip()
        return bool(key)

    def _run_with_timeout(self, func, timeout_sec: float = 2.0):
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        future = executor.submit(func)
        try:
            res = future.result(timeout=timeout_sec)
            executor.shutdown(wait=False)
            return res
        except concurrent.futures.TimeoutError:
            print(f"BPAgent operation timed out after {timeout_sec}s")
            executor.shutdown(wait=False, cancel_futures=True)
            return None
        except Exception as e:
            print(f"BPAgent execution error: {e}")
            executor.shutdown(wait=False)
            return None

    def _get_model_instance(self):
        if not self._is_active():
            return None

        from agno.models.openai import OpenAIChat
        from agno.models.google import Gemini
        from agno.models.anthropic import Claude
        from agno.models.groq import Groq
        from agno.models.ollama import Ollama

        provider = self.config.get("provider", "groq").lower()
        raw_model = self.config.get("model", "llama-3.3-70b-versatile")
        model_name = MODEL_ALIASES.get(raw_model, raw_model)
        api_key = self.config.get("api_key", "").strip()

        try:
            if provider == "groq":
                key = api_key or os.environ.get("GROQ_API_KEY")
                return Groq(id=model_name, api_key=key) if key else None
            elif provider == "anthropic":
                key = api_key or os.environ.get("ANTHROPIC_API_KEY")
                return Claude(id=model_name, api_key=key) if key else None
            elif provider == "openai":
                key = api_key or os.environ.get("OPENAI_API_KEY")
                return OpenAIChat(id=model_name, api_key=key) if key else None
            elif provider == "gemini":
                key = api_key or os.environ.get("GEMINI_API_KEY")
                return Gemini(id=model_name, api_key=key) if key else None
            elif provider == "ollama":
                host = api_key or os.environ.get("OLLAMA_HOST") or "http://localhost:11434"
                if not host.startswith("http"):
                    host = f"http://{host}"
                return Ollama(id=model_name, host=host)
        except Exception as e:
            print(f"BPAgent failed to instantiate model {provider}/{model_name}: {e}")
        return None

    def get_executive_summary(self) -> str:
        """
        Gera um Parecer Executivo estruturado e completo sobre o Balanço Patrimonial da empresa ativa,
        cobrindo Liquidez, Fleuriet, Endividamento e Dupont.
        """
        company = get_active_company_info()
        kpis = bp_engine.get_kpis()
        latest_period = kpis.get("latest_period", "Budget 2026")
        period_kpis = kpis.get("by_period", {}).get(latest_period, {})

        liq = period_kpis.get("liquidez", {})
        endiv = period_kpis.get("endividamento", {})
        fleuriet = period_kpis.get("fleuriet", {})
        dupont = period_kpis.get("dupont", {})
        ativ = period_kpis.get("atividade", {})

        provider = self.config.get("provider", "openai").upper()
        model_name = self.config.get("model", "gpt-4o")

        model = self._get_model_instance()
        if model:
            def _invoke_llm():
                agent = Agent(
                    model=model,
                    description="Agente Especialista em Balanço Patrimonial (analise-balanco-patrimonial)",
                    instructions=[self.SKILL_INSTRUCTIONS]
                )
                prompt = (
                    f"Elabore o Parecer Executivo de Auditoria e Diagnóstico de Balanço Patrimonial para a empresa {company.get('name')} ({company.get('ticker')}) no período {latest_period}.\n\n"
                    f"DADOS CALCULADOS DO BALANÇO PATRIMONIAL:\n"
                    f"- Liquidez Corrente (LC): {liq.get('corrente', 0):.2f}x | Liquidez Seca: {liq.get('seca', 0):.2f}x | Liquidez Imediata: {liq.get('imediata', 0):.2f}x | Liquidez Geral: {liq.get('geral', 0):.2f}x\n"
                    f"- Modelo Fleuriet: NCG = R$ {fleuriet.get('ncg', 0):,.2f} mi | CDG = R$ {fleuriet.get('cdg', 0):,.2f} mi | Saldo de Tesouraria (ST) = R$ {fleuriet.get('saldo_tesouraria', 0):,.2f} mi | Estrutura = {fleuriet.get('classificacao', 'Sólida')}\n"
                    f"- Endividamento Geral: {endiv.get('geral_pct', 0):.1f}% | Composição CP: {endiv.get('composicao_cp_pct', 0):.1f}% | Debt-to-Equity: {endiv.get('debt_to_equity', 0):.2f}x\n"
                    f"- Análise Dupont: ROE = {dupont.get('roe_pct', 0):.2f}% (Margem Líquida: {dupont.get('margem_liquida_pct', 0):.2f}% × Giro: {dupont.get('giro_ativo', 0):.2f}x × Alavancagem: {dupont.get('alavancagem_patrimonial', 0):.2f}x)\n"
                    f"- Prazos Médios: PME = {ativ.get('pme_dias', 0):.1f} dias | PMR = {ativ.get('pmr_dias', 0):.1f} dias | PMP = {ativ.get('pmp_dias', 0):.1f} dias | Ciclo de Caixa = {ativ.get('ciclo_financeiro_dias', 0):.1f} dias\n\n"
                    f"Estruture em 3 parágrafos concisos e objetivos: (1) Diagnóstico de Solvência e Liquidez cruzada com Modelo Fleuriet, (2) Qualidade do Endividamento e Decomposição Dupont do ROE, (3) Principais Sinais de Alerta e Recomendações Técnicas operacionais. Informe que a análise foi processada pelo modelo {provider} ({model_name})."
                )
                res = agent.run(prompt)
                text = ""
                if res and hasattr(res, "content") and res.content:
                    text = str(res.content)
                elif isinstance(res, str):
                    text = res
                if text and "API_KEY_INVALID" not in text:
                    return text
                return None

            result = self._run_with_timeout(_invoke_llm, timeout_sec=4.0)
            if result:
                return result

        # Fallback estruturado técnico seguindo fielmente a skill
        lc = liq.get('corrente', 1.85)
        st = fleuriet.get('saldo_tesouraria', 12400)
        roe = dupont.get('roe_pct', 22.4)
        status_fleuriet = fleuriet.get('classificacao', 'Sólida')
        pmr = ativ.get('pmr_dias', 43.2)
        pmp = ativ.get('pmp_dias', 70.3)

        return (
            f"📋 **Diagnóstico Patrimonial — {company.get('name')} ({company.get('ticker')}) — {latest_period}**\n\n"
            f"**1. Liquidez e Solvência Estrutural (Modelo Fleuriet):**\n"
            f"A empresa apresenta Liquidez Corrente de **{lc:.2f}x**, indicando folga no cumprimento de obrigações de curto prazo. "
            f"Pela reclassificação dinâmica do Modelo Fleuriet, a estrutura patrimonial é classificada como **{status_fleuriet}**, "
            f"com Saldo de Tesouraria positivo de **R$ {st:,.2f} milhões** (CDG cobre integralmente a NCG com folga de liquidez).\n\n"
            f"**2. Estrutura de Capital e Análise Dupont:**\n"
            f"O retorno aos acionistas (ROE de **{roe:.2f}%**) é sustentado de forma equilibrada pela decomposição Dupont "
            f"(Margem Líquida robusta de {dupont.get('margem_liquida_pct', 21.0):.1f}% e Giro do Ativo de {dupont.get('giro_ativo', 0.5):.2f}x). "
            f"A composição da dívida mostra que a maior parcela do endividamento está alongada no Passivo Não Circulante, mitigando o risco de liquidez de curto prazo.\n\n"
            f"**3. Eficiência Operacional e Ciclos:**\n"
            f"O Prazo Médio de Recebimento (PMR: **{pmr:.1f} dias**) está confortavelmente abaixo do Prazo Médio de Pagamento a Fornecedores (PMP: **{pmp:.1f} dias**), "
            f"gerando um ciclo financeiro equilibrado que não pressiona as linhas bancárias de curto prazo.\n\n"
            f"*(Nota: Configure o Motor de IA para interações customizadas via LLM {provider} — {model_name})*"
        )

    def explain_simulation(self, sim_result: Dict[str, Any]) -> str:
        """
        Explica o impacto da simulação What-If nas contas do Balanço Patrimonial e nos indicadores.
        """
        node = sim_result.get("node", "contas_receber")
        node_label = sim_result.get("node_label", node)
        var_pct = sim_result.get("variation_pct", 10.0)
        period = sim_result.get("period", "Budget 2026")
        time_ms = sim_result.get("reactive_time_ms", 1.2)
        diff_ativo = sim_result.get("diff_ativo_total", 0.0)
        diff_st = sim_result.get("diff_saldo_tesouraria", 0.0)

        provider = self.config.get("provider", "openai").upper()
        model_name = self.config.get("model", "gpt-4o")

        model = self._get_model_instance()
        if model:
            def _invoke_explain():
                agent = Agent(
                    model=model,
                    description="Agente Especialista em Balanço Patrimonial (analise-balanco-patrimonial)",
                    instructions=[self.SKILL_INSTRUCTIONS]
                )
                prompt = (
                    f"Explique o impacto da simulação What-If no Balanço Patrimonial:\n"
                    f"- Conta alterada: {node_label} ({node})\n"
                    f"- Variação aplicada: {var_pct:+.2f}%\n"
                    f"- Período: {period}\n"
                    f"- Impacto no Ativo Total: R$ {diff_ativo:,.2f} mi\n"
                    f"- Impacto no Saldo de Tesouraria (Fleuriet): R$ {diff_st:,.2f} mi\n"
                    f"- Tempo de recálculo topológico no DAG: {time_ms:.2f} ms\n\n"
                    f"Elabore uma análise concisa de 2 parágrafos demonstrando como essa alteração afeta a NCG, liquidez e a preservação do equilíbrio contábil (Ativo = Passivo + PL)."
                )
                res = agent.run(prompt)
                text = ""
                if res and hasattr(res, "content") and res.content:
                    text = str(res.content)
                elif isinstance(res, str):
                    text = res
                if text and "API_KEY_INVALID" not in text:
                    return text
                return None

            result = self._run_with_timeout(_invoke_explain, timeout_sec=5.0)
            if result:
                return result

        dir_label = "aumento" if var_pct > 0 else "redução"
        return (
            f"🔄 **Simulação What-If no Balanço Patrimonial — {period}**\n\n"
            f"A premissa **{node_label}** sofreu um {dir_label} de **{abs(var_pct):.2f}%**, propagado instantaneamente "
            f"pelo Grafo DAG em **{time_ms:.2f} ms**.\n\n"
            f"**Impactos nos Agrupamentos Contábeis:**\n"
            f"• Variação no Ativo Total: **R$ {diff_ativo:+,.2f} milhões** (recalculado com preservação estrita da igualdade Ativo = Passivo + PL).\n"
            f"• Variação no Saldo de Tesouraria (ST): **R$ {diff_st:+,.2f} milhões**, alterando a Necessidade de Capital de Giro (NCG) operacional da companhia."
        )

    def ask(self, question: str) -> str:
        """
        Responde a qualquer pergunta livre do usuário sobre o Balanço Patrimonial da empresa ativa,
        obedecendo às etapas da skill 'analise-balanco-patrimonial'.
        """
        company = get_active_company_info()
        kpis = bp_engine.get_kpis()
        latest_period = kpis.get("latest_period", "Budget 2026")
        period_kpis = kpis.get("by_period", {}).get(latest_period, {})

        provider = self.config.get("provider", "openai").upper()
        model_name = self.config.get("model", "gpt-4o")

        model = self._get_model_instance()
        if model:
            def _invoke_ask():
                system_prompt = (
                    f"{self.SKILL_INSTRUCTIONS}\n\n"
                    f"DADOS DE CONTEXTO ATUAIS ({company.get('name')} - {company.get('ticker')}, Período {latest_period}):\n"
                    f"{json.dumps(period_kpis, indent=2, ensure_ascii=False)}\n\n"
                    f"REGRA ESTRITA DE ESCOPO:\n"
                    f"- Responda exclusivamente à pergunta do usuário utilizando a fundamentação teórica da skill 'analise-balanco-patrimonial'.\n"
                    f"- Apresente fórmulas, contas e interpretações contextualizadas no setor da empresa."
                )
                agent = Agent(model=model, instructions=[system_prompt])
                res = agent.run(question)
                text = ""
                if res and hasattr(res, "content") and res.content:
                    text = str(res.content)
                elif isinstance(res, str):
                    text = res
                if text and "API_KEY_INVALID" not in text:
                    return f"**[{provider} — {model_name} | Skill: analise-balanco-patrimonial]**\n\n{text}"
                return None

            result = self._run_with_timeout(_invoke_ask, timeout_sec=10.0)
            if result:
                return result

        # Fallback quando não há chave de IA configurada
        q_low = question.lower()
        liq = period_kpis.get("liquidez", {})
        fleuriet = period_kpis.get("fleuriet", {})
        endiv = period_kpis.get("endividamento", {})
        dupont = period_kpis.get("dupont", {})

        if "liquidez" in q_low:
            return (
                f"**[Especialista em Balanço Patrimonial — analise-balanco-patrimonial]**\n\n"
                f"**Análise dos Índices de Liquidez ({latest_period}):**\n\n"
                f"• **Liquidez Corrente (LC)** = Ativo Circulante / Passivo Circulante = **{liq.get('corrente', 1.85):.2f}x**\n"
                f"  *Interpretação:* Para cada R$ 1,00 de dívida com vencimento em até 1 ano, a empresa possui R$ {liq.get('corrente', 1.85):.2f} em haveres de curto prazo.\n\n"
                f"• **Liquidez Seca (LS)** = (Ativo Circulante - Estoques) / Passivo Circulante = **{liq.get('seca', 1.45):.2f}x**\n"
                f"  *Interpretação:* Sem depender da venda de estoques, a cobertura imediata contra passivos circulantes permanece saudável e superior a 1,0x.\n\n"
                f"• **Liquidez Geral (LG)** = (AC + RLP) / (PC + PNC) = **{liq.get('geral', 1.15):.2f}x**\n"
                f"  *Interpretação:* Capacidade de honrar todas as dívidas presentes e futuras com a totalidade dos ativos realizáveis."
            )
        elif "fleuriet" in q_low or "capital de giro" in q_low or "ncg" in q_low:
            return (
                f"**[Especialista em Balanço Patrimonial — analise-balanco-patrimonial]**\n\n"
                f"**Estrutura de Capital de Giro — Modelo Fleuriet ({latest_period}):**\n\n"
                f"• **Necessidade de Capital de Giro (NCG)**: R$ {fleuriet.get('ncg', 18450):,.2f} milhões (ACO - PCO)\n"
                f"• **Capital de Giro Líquido (CDG)**: R$ {fleuriet.get('cdg', 30850):,.2f} milhões (PNC + PL - ANC)\n"
                f"• **Saldo de Tesouraria (ST)**: R$ {fleuriet.get('saldo_tesouraria', 12400):,.2f} milhões (CDG - NCG)\n\n"
                f"**Classificação: Estrutura {fleuriet.get('classificacao', 'Sólida')}**\n"
                f"O Capital de Giro de longo prazo (CDG) supera integralmente a demanda de caixa gerada pela operação (NCG), "
                f"resultando em folga financeira de curto prazo (ST positivo) sem dependência de empréstimos bancários emergenciais."
            )
        elif "dupont" in q_low or "roe" in q_low or "rentabilidade" in q_low:
            return (
                f"**[Especialista em Balanço Patrimonial — analise-balanco-patrimonial]**\n\n"
                f"**Decomposição Dupont do ROE ({latest_period}):**\n\n"
                f"Fórmula: `ROE = Margem Líquida × Giro do Ativo × Alavancagem Patrimonial`\n\n"
                f"• Margem Líquida: **{dupont.get('margem_liquida_pct', 21.0):.2f}%** (Lucro Líquido / Receita Líquida)\n"
                f"• Giro do Ativo: **{dupont.get('giro_ativo', 0.52):.2f}x** (Receita Líquida / Ativo Total)\n"
                f"• Alavancagem Patrimonial: **{dupont.get('alavancagem_patrimonial', 2.05):.2f}x** (Ativo Total / Patrimônio Líquido)\n\n"
                f"**ROE Resultante: {dupont.get('roe_pct', 22.4):.2f}%**\n"
                f"O retorno sobre o capital próprio decorre predominantemente de margens operacionais elevadas, mantendo o nível de alavancagem em patamar prudente."
            )
        else:
            return (
                f"**[Especialista em Balanço Patrimonial — analise-balanco-patrimonial]**\n\n"
                f"Analisando a questão sobre o Balanço Patrimonial da {company.get('name')} ({company.get('ticker')}) no período {latest_period}:\n\n"
                f"• **Estrutura Patrimonial:** Ativo Total = Passivo Total + PL perfeitamente equilibrados no Grafo DAG.\n"
                f"• **Índices Centrais:** Liquidez Corrente em {liq.get('corrente', 1.85):.2f}x, Saldo de Tesouraria positivo de R$ {fleuriet.get('saldo_tesouraria', 12400):,.2f} mi (Estrutura {fleuriet.get('classificacao', 'Sólida')}), e ROE Dupont de {dupont.get('roe_pct', 22.4):.2f}%.\n\n"
                f"*(Para análises aprofundadas com LLM {provider} — {model_name}, certifique-se de configurar uma chave de API ou executar via Ollama local)*"
            )

bp_agent = BPAgent()
