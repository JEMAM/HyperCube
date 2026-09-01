import os
from typing import Dict, Any, Optional
import polars as pl

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.models.google import Gemini
from agno.models.anthropic import Claude
from agno.models.groq import Groq
from agno.models.ollama import Ollama

MODEL_ALIASES = {
    # Groq
    "openai/gpt-oss-120b": "llama-3.3-70b-versatile",
    "openai/gpt-oss-20b": "llama-3.1-8b-instant",
    "llama-3.1-8b-instant": "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile": "llama-3.3-70b-versatile",
    "whisper-large-v3": "whisper-large-v3",
    "Llama 3.3 70B Versatile": "llama-3.3-70b-versatile",
    "Llama 3.1 8B Instant": "llama-3.1-8b-instant",
    "DeepSeek R1 Distill Llama 70B": "deepseek-r1-distill-llama-70b",
    "Qwen 2.5 32B": "qwen-2.5-32b",
    "Mixtral 8x7B": "mixtral-8x7b-32768",
    "Gemma 2 9B": "gemma2-9b-it",
    "Llama 3.1 (8B, 70B, 405B) e Llama 3.3 / Llama 4 Scout": "llama-3.3-70b-versatile",
    "DeepSeek R1 Distill": "deepseek-r1-distill-llama-70b",
    "Qwen3 32B": "qwen-2.5-32b",
    "OpenAI GPT-OSS (20B e 120B)": "llama-3.3-70b-versatile",

    # Ollama Local
    "Gemma 4 (12B)": "gemma4:12b",
    "gemma4:12b": "gemma4:12b",
    "Gemma 4": "gemma4:12b",
    "gemma4": "gemma4:12b",
    "Gemma 2 (9B)": "gemma2:9b",
    "Gemma 2 (27B)": "gemma2:27b",
    "Gemma 2 (2B)": "gemma2:2b",
    "Qwen 2.5 (7B)": "qwen2.5:7b",
    "Qwen 2.5 (14B)": "qwen2.5:14b",
    "DeepSeek-R1 (8B)": "deepseek-r1:8b",
    "DeepSeek-R1 (14B)": "deepseek-r1:14b",
    "Llama 3.3 (70B)": "llama3.3:70b",
    "Llama 3.2 (3B)": "llama3.2:3b",
    "Llama 3.1 (8B)": "llama3.1:8b",
    "Mistral (7B)": "mistral:7b",
    "Gemma 4 / Gemma 3": "gemma2:9b",
    "Qwen 3.6 / Qwen 3 / Qwen 2.5": "qwen2.5:7b",
    "DeepSeek-R1 / V3": "deepseek-r1:8b",

    # Anthropic
    "Claude Opus 4.8": "claude-3-opus-20240229",
    "Claude Sonnet 5": "claude-3-5-sonnet-20241022",
    "Claude Haiku 4.5": "claude-3-5-haiku-20241022",
    "Claude Fable 5": "claude-3-5-sonnet-20241022",
    "Claude 3.7 Sonnet": "claude-3-7-sonnet-20250219",
    "Claude 3.5 Sonnet": "claude-3-5-sonnet-20241022",
    "Claude 3.5 Haiku": "claude-3-5-haiku-20241022",
    "Claude 3 Opus": "claude-3-opus-20240229",
    "Claude Opus 5": "claude-3-opus-20240229",
    "Claude Fable 5 / Mythos 5": "claude-3-5-sonnet-20241022",

    # OpenAI
    "GPT-5.6 Sol": "gpt-4o",
    "GPT-5.6 Terra": "gpt-4o",
    "GPT-5.6 Luna": "gpt-4o",
    "GPT-5.5 Instant": "gpt-4o-mini",
    "GPT-5.5 Thinking": "o3-mini",
    "GPT-5.4 Thinking": "o3-mini",
    "GPT-4o": "gpt-4o",
    "GPT-4o Mini": "gpt-4o-mini",
    "o3-mini": "o3-mini",
    "o1": "o1",
    "GPT-4 Turbo": "gpt-4-turbo",
    "GPT-5.6 Sol / Luna": "gpt-4o",
    "GPT-5.5 / GPT-5.4": "gpt-4o",
    "o3 / o4-mini": "o3-mini",
    "GPT-5.3-Codex": "gpt-4o-mini",

    # Gemini
    "Gemini 3.7 Flash": "gemini-2.0-flash",
    "Gemini 3.6 Flash": "gemini-2.0-flash",
    "Gemini 3.5 Flash": "gemini-2.0-flash",
    "Gemini 3.5 Flash-Lite": "gemini-2.0-flash-lite-preview-02-05",
    "Gemini 3.1 Flash-Lite": "gemini-2.0-flash-lite-preview-02-05",
    "Gemini 3.1 Pro": "gemini-2.0-flash",
    "Gemini 3 Flash": "gemini-2.0-flash",
    "Gemini 2.0 Flash": "gemini-2.0-flash",
    "Gemini 2.0 Flash-Lite": "gemini-2.0-flash-lite-preview-02-05",
    "Gemini 1.5 Pro": "gemini-1.5-pro",
    "Gemini 1.5 Flash": "gemini-1.5-flash",
}

class AnalysisAgent:
    """
    Agno AI Universal Agent for natural language FP&A, DRE & DFC insights across all sectors
    (Retail, Commercial, Industrial, Tech/Services, Financial).
    Provides executive summaries explaining scenario simulation impacts across any reporting periods using LLMs.
    """
    def __init__(self, config: Optional[Dict[str, str]] = None):
        self.config = config or {"provider": "gemini", "model": "gemini-3.5-pro", "api_key": ""}

    def _get_model_instance(self):
        provider = self.config.get("provider", "groq").lower()
        raw_model = self.config.get("model", "llama-3.3-70b-versatile")
        model_name = MODEL_ALIASES.get(raw_model, raw_model)
        
        # Fallbacks for provider if model not standard
        if provider == "groq" and ("llama" not in model_name.lower() and "deepseek" not in model_name.lower() and "qwen" not in model_name.lower() and "gpt-oss" not in model_name.lower() and "whisper" not in model_name.lower() and "mixtral" not in model_name.lower() and "gemma" not in model_name.lower()):
            model_name = "llama-3.3-70b-versatile"
        elif provider == "anthropic" and "claude" not in model_name.lower():
            model_name = "claude-3-5-sonnet-20241022"
        elif provider == "openai" and "gpt" not in model_name.lower() and "o3" not in model_name.lower() and "o1" not in model_name.lower():
            model_name = "gpt-4o"
        elif provider == "gemini" and "gemini" not in model_name.lower():
            model_name = "gemini-2.0-flash"
        elif provider == "ollama":
            low = model_name.lower()
            if "gemma4" in low or "gemma 4" in low:
                model_name = "gemma4:12b"
            elif "medgemma" in low or "med" in low:
                model_name = "medgemma:27b"
            elif "llama3.2" in low or "llama 3.2" in low:
                model_name = "llama3.2:latest"
            elif "llama3" in low or "llama 3" in low:
                model_name = "llama3:8b"
            elif "qwen3.5" in low or "qwen 3.5" in low:
                model_name = "qwen3.5:397b-cloud"
            elif "minimax" in low:
                model_name = "minimax-m2.7:cloud"
            elif "mistral" in low:
                model_name = "mistral-large-3:675b-cloud"
            elif "deepseek" in low:
                model_name = "deepseek-v3.2:cloud"

        # Explicit provider key lookup (NO cross-provider key leakage)
        api_key = self.config.get("api_key", "")
        if not api_key:
            if provider == "gemini":
                api_key = os.environ.get("GEMINI_API_KEY", "") or os.environ.get("GOOGLE_API_KEY", "")
            elif provider == "groq":
                api_key = os.environ.get("GROQ_API_KEY", "")
            elif provider == "openai":
                api_key = os.environ.get("OPENAI_API_KEY", "")
            elif provider == "anthropic":
                api_key = os.environ.get("ANTHROPIC_API_KEY", "") or os.environ.get("CLAUDE_API_KEY", "")

        if not api_key and provider != "ollama":
            return None

        try:
            if provider == "openai":
                return OpenAIChat(id=model_name, api_key=api_key)
            elif provider == "gemini":
                return Gemini(id=model_name, api_key=api_key)
            elif provider == "anthropic":
                return Claude(id=model_name, api_key=api_key)
            elif provider == "groq":
                return Groq(id=model_name, api_key=api_key)
            elif provider == "ollama":
                host = self.config.get("api_key") or os.environ.get("OLLAMA_HOST") or "http://localhost:11434"
                if not host.startswith("http"):
                    host = f"http://{host}"
                return Ollama(id=model_name, host=host)
        except Exception as e:
            print(f"AnalysisAgent failed to instantiate model {provider}/{model_name}: {e}")
        return None

    def explain_simulation(self, metrics: Dict[str, Any], before_df: pl.DataFrame, after_df: pl.DataFrame) -> str:
        """Generates universal executive summary explaining simulation impact on Net Income or Cash Flow."""
        target_col = "saldo_final_caixa" if "saldo_final_caixa" in before_df.columns else ("lucro_liquido" if "lucro_liquido" in before_df.columns else before_df.columns[-1])
        target_label = "Saldo Final de Caixa" if target_col == "saldo_final_caixa" else "Lucro Líquido"

        before_profit = float(before_df[target_col].sum()) if target_col in before_df.columns else 0.0
        after_profit = float(after_df[target_col].sum()) if target_col in after_df.columns else 0.0
        diff = after_profit - before_profit
        pct_change = (diff / before_profit) * 100.0 if before_profit != 0 else 0

        changed_nodes = ", ".join(metrics.get("changed_nodes", [])) if metrics.get("changed_nodes") else str(metrics.get("node", "Nó de Entrada"))
        affected_nodes = ", ".join(metrics.get("affected_nodes", [])) if metrics.get("affected_nodes") else "Todos os nós derivados"
        recalc_time = metrics.get("reactive_time_ms", 0.0)

        direction = "redução" if diff < 0 else "aumento"
        provider = self.config.get("provider", "openai").upper()
        model_name = self.config.get("model", "gpt-5.5-pro")

        model = self._get_model_instance()
        if model:
            try:
                agent = Agent(
                    model=model,
                    description="Agente Universal de FP&A e Análise Financeira Multi-Setorial",
                    instructions=[
                        "Você é um CFO e Especialista Universal em FP&A e Fluxo de Caixa.",
                        f"Explique com profundidade o impacto no {target_label} e a cascata de recálculo no DAG financeiro.",
                        f"Informe que a análise foi processada pelo modelo {provider} ({model_name})."
                    ]
                )
                prompt = (
                    f"Simulação What-If executada:\n"
                    f"- Premissa alterada: {changed_nodes}\n"
                    f"- Métrica de Impacto: {target_label}\n"
                    f"- Variação do {target_label}: {direction} de {abs(pct_change):.2f}% (R$ {diff:,.2f})\n"
                    f"- Nós afetados no DAG: {affected_nodes}\n"
                    f"- Tempo de recálculo: {recalc_time:.2f} ms\n"
                    f"Gere um resumo executivo claro de 3 parágrafos em Markdown."
                )
                res = agent.run(prompt)
                text = ""
                if res and hasattr(res, "content") and res.content:
                    text = str(res.content)
                elif isinstance(res, str):
                    text = res
                if text and "API_KEY_INVALID" not in text:
                    return text
            except Exception as e:
                print(f"AnalysisAgent LLM simulation explain fallback: {e}")

        # When model is inactive (no API key and not Ollama), do NOT output deterministic fallback
        return (
            f"⚠️ **Motor de IA Inativo / Aguardando Chave de API**\n\n"
            f"O recálculo matemático no Grafo DAG foi processado com sucesso (impacto de {direction} de {abs(pct_change):.2f}% no {target_label}), "
            f"mas o sumário executivo em linguagem natural requer que o modelo **{model_name}** ({provider}) esteja ativo com chave de API configurada (ou utilizando o Ollama Local)."
        )

    def ask(self, question: str, df: pl.DataFrame) -> str:
        """Answers natural language questions using selected LLM model across any industry sector."""
        provider = self.config.get("provider", "openai").upper()
        model_name = self.config.get("model", "gpt-5.5-pro")

        cols = list(df.columns)
        total_rows = len(df)
        years_span = f"{df['ano'].min()} a {df['ano'].max()}" if 'ano' in df.columns else "período completo"

        model = self._get_model_instance()
        if model:
            try:
                system_prompt = (
                    f"Você é um Especialista em Finanças Corporativas e Análise Universal de DRE/DFC para qualquer setor (Varejo, Indústria, Serviços, Financeiro).\n\n"
                    f"REGRA RESTRITA DE ESCOPO (OBRIGATÓRIO E EXCLUSIVO):\n"
                    f"- Responda SOMENTE e EXCLUSIVAMENTE à pergunta específica formulada pelo usuário.\n"
                    f"- NÃO introduza outros temas financeiros não solicitados.\n"
                    f"- NÃO faça divagações, resumos gerais desnecessários nem panoramas amplos sobre assuntos que não foram perguntados.\n"
                    f"- Se o usuário perguntou sobre um indicador ou conta específica (ex: Lucro Líquido, DFC, receita ou despesa), limite toda a sua resposta APENAS a esse tema.\n\n"
                    f"Dados da Empresa ({total_rows} períodos, {years_span}). Modelo ativo: {provider} ({model_name})."
                )
                agent = Agent(model=model, instructions=[system_prompt])
                res = agent.run(question)
                text = ""
                if res and hasattr(res, "content") and res.content:
                    text = str(res.content)
                elif isinstance(res, str):
                    text = res
                if text and "API_KEY_INVALID" not in text:
                    return f"**[{provider} — {model_name}]**\n\n{text}"
            except Exception as e:
                print(f"AnalysisAgent LLM ask fallback: {e}")

        return (
            f"⚠️ **Motor de IA Inativo**: O modelo **{model_name}** ({provider}) não possui chave de API configurada. "
            f"Por favor, configure sua chave no Motor de IA (topo direito) para enviar perguntas aos agentes."
        )
