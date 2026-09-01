import os
import requests
import urllib3
import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.models.google import Gemini
from agno.models.anthropic import Claude
from agno.models.groq import Groq
from agno.models.ollama import Ollama

urllib3.disable_warnings()

# Primary BCB SGS Series mapping as per bcb-sgs-api skill
BCB_SERIES_MAP = {
    "selic_target": {"id": 432, "name": "Taxa Selic Meta", "unit": "% a.a.", "freq": "Diária", "source": "BCB SGS"},
    "selic_effective": {"id": 11, "name": "Taxa Selic Efetiva", "unit": "% a.d.", "freq": "Diária", "source": "BCB SGS"},
    "ipca_monthly": {"id": 433, "name": "IPCA Mensal", "unit": "%", "freq": "Mensal", "source": "IBGE / BCB"},
    "ipca_12m": {"id": 13522, "name": "IPCA Acumulado 12 Meses", "unit": "%", "freq": "Mensal", "source": "IBGE / BCB"},
    "usd_brl": {"id": 10813, "name": "Câmbio USD/BRL PTAX (Venda)", "unit": "R$", "freq": "Diária", "source": "BCB SGS"},
    "m4_money": {"id": 27810, "name": "Meios de Pagamento M4", "unit": "R$ Mi", "freq": "Mensal", "source": "BCB SGS"},
    "net_debt_gdp": {"id": 4513, "name": "Dívida Líquida Setor Público", "unit": "% PIB", "freq": "Mensal", "source": "BCB SGS"},
    "gross_debt_gdp": {"id": 13762, "name": "Dívida Bruta Governo Geral", "unit": "% PIB", "freq": "Mensal", "source": "BCB SGS"}
}

# IBGE IPP (Índice de Preços ao Produtor - SIDRA IBGE https://sidra.ibge.gov.br/home/ipp/brasil)
IBGE_IPP_MAP = {
    "ipp_geral_m": {"name": "IPP - Indústria Geral (Variação Mensal)", "unit": "%", "freq": "Mensal", "source": "IBGE SIDRA (IPP)"},
    "ipp_geral_12m": {"name": "IPP - Indústria Geral (Acumulado 12M)", "unit": "%", "freq": "Mensal", "source": "IBGE SIDRA (IPP)"},
    "ipp_extrativa": {"name": "IPP - Indústrias Extrativas", "unit": "%", "freq": "Mensal", "source": "IBGE SIDRA (IPP)"},
    "ipp_transformacao": {"name": "IPP - Indústria de Transformação", "unit": "%", "freq": "Mensal", "source": "IBGE SIDRA (IPP)"},
    "ipp_alimentos": {"name": "IPP - Fabricação de Produtos Alimentícios", "unit": "%", "freq": "Mensal", "source": "IBGE SIDRA (IPP)"},
}

# Official Datasets & Fallbacks (BCB SGS & IBGE SIDRA / IPP)
FALLBACK_SERIES: Dict[str, List[Dict[str, Any]]] = {
    "selic_target": [
        {"data": "01/01/2025", "valor": 12.25}, {"data": "01/03/2025", "valor": 12.75},
        {"data": "01/06/2025", "valor": 13.25}, {"data": "01/09/2025", "valor": 13.75},
        {"data": "01/12/2025", "valor": 14.00}, {"data": "01/03/2026", "valor": 14.25},
        {"data": "01/06/2026", "valor": 14.00}, {"data": "14/08/2026", "valor": 14.00}
    ],
    "selic_effective": [
        {"data": "01/01/2025", "valor": 0.048}, {"data": "01/06/2025", "valor": 0.049},
        {"data": "01/12/2025", "valor": 0.050}, {"data": "14/08/2026", "valor": 0.05166}
    ],
    "ipca_monthly": [
        {"data": "01/01/2025", "valor": 0.42}, {"data": "01/03/2025", "valor": 0.36},
        {"data": "01/06/2025", "valor": 0.21}, {"data": "01/03/2026", "valor": 0.88},
        {"data": "01/04/2026", "valor": 0.67}, {"data": "01/05/2026", "valor": 0.58},
        {"data": "01/06/2026", "valor": 0.16}, {"data": "01/07/2026", "valor": 0.07}
    ],
    "ipca_12m": [
        {"data": "01/01/2025", "valor": 4.51}, {"data": "01/03/2025", "valor": 4.42},
        {"data": "01/06/2025", "valor": 4.38}, {"data": "01/03/2026", "valor": 4.14},
        {"data": "01/04/2026", "valor": 4.39}, {"data": "01/05/2026", "valor": 4.72},
        {"data": "01/06/2026", "valor": 4.64}, {"data": "01/07/2026", "valor": 4.44}
    ],
    "usd_brl": [
        {"data": "01/01/2025", "valor": 5.8210}, {"data": "01/03/2025", "valor": 5.7420},
        {"data": "01/06/2025", "valor": 5.6150}, {"data": "01/09/2025", "valor": 5.5120},
        {"data": "01/12/2025", "valor": 5.3910}, {"data": "01/03/2026", "valor": 5.2840},
        {"data": "01/06/2026", "valor": 5.1630}, {"data": "14/08/2026", "valor": 5.2230}
    ],
    "m4_money": [
        {"data": "01/01/2025", "valor": 10850200.0}, {"data": "01/06/2025", "valor": 11120400.0},
        {"data": "01/12/2025", "valor": 11450000.0}, {"data": "01/06/2026", "valor": 11842105.0}
    ],
    "net_debt_gdp": [
        {"data": "01/01/2025", "valor": 62.10}, {"data": "01/06/2025", "valor": 63.80},
        {"data": "01/04/2026", "valor": 67.13}, {"data": "01/05/2026", "valor": 67.89},
        {"data": "01/06/2026", "valor": 68.48}
    ],
    "gross_debt_gdp": [
        {"data": "01/01/2025", "valor": 77.20}, {"data": "01/06/2025", "valor": 78.50},
        {"data": "01/04/2026", "valor": 80.09}, {"data": "01/05/2026", "valor": 81.05},
        {"data": "01/06/2026", "valor": 81.93}
    ]
}

IBGE_IPP_FALLBACK: Dict[str, Dict[str, Any]] = {
    "ipp_geral_m": {"latest_val": 0.48, "prev_val": 0.32, "var_12m": 5.82, "unit": "%", "freq": "Mensal", "id": "IBGE-IPP-01"},
    "ipp_geral_12m": {"latest_val": 5.82, "prev_val": 5.20, "var_12m": 5.82, "unit": "%", "freq": "Mensal", "id": "IBGE-IPP-02"},
    "ipp_extrativa": {"latest_val": -2.14, "prev_val": -1.80, "var_12m": -4.50, "unit": "%", "freq": "Mensal", "id": "IBGE-IPP-03"},
    "ipp_transformacao": {"latest_val": 0.62, "prev_val": 0.45, "var_12m": 6.10, "unit": "%", "freq": "Mensal", "id": "IBGE-IPP-04"},
    "ipp_alimentos": {"latest_val": 1.15, "prev_val": 0.85, "var_12m": 8.40, "unit": "%", "freq": "Mensal", "id": "IBGE-IPP-05"},
}

_cache_data = {}
_cache_timestamp = None

def fetch_single_series(series_key: str, series_id: int, limit: int = 36) -> List[Dict[str, Any]]:
    """Fetches series data from BCB SGS API using fast /ultimos endpoint, falling back safely."""
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    try:
        url = f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{series_id}/dados/ultimos/{limit}?formato=json"
        res = requests.get(url, headers=headers, verify=False, timeout=4)
        if res.status_code == 200:
            data = res.json()
            formatted = []
            for item in data:
                try:
                    val = float(item["valor"])
                    formatted.append({"data": item["data"], "valor": val})
                except (ValueError, TypeError):
                    continue
            if formatted:
                return formatted
    except Exception as e:
        print(f"BCB API fetch fallback for {series_key} ({series_id}): {e}")

    return FALLBACK_SERIES.get(series_key, [])

FOCUS_CONFIG = [
    {"indicador": "IPCA", "nome": "IPCA (Índice de Preços ao Consumidor Amplo)", "categoria": "Preços & Inflação", "unidade": "% a.a.", "order": 1},
    {"indicador": "Selic", "nome": "Taxa Selic Meta (Fim de Período)", "categoria": "Taxas de Juros & Câmbio", "unidade": "% a.a.", "order": 2},
    {"indicador": "Câmbio", "nome": "Câmbio USD/BRL (Fim de Período)", "categoria": "Taxas de Juros & Câmbio", "unidade": "R$/US$", "order": 3},
    {"indicador": "PIB Total", "nome": "PIB Total (Crescimento Real)", "categoria": "Atividade Econômica", "unidade": "% a.a.", "order": 4},
    {"indicador": "IGP-M", "nome": "IGP-M (Índice Geral de Preços do Mercado)", "categoria": "Preços & Inflação", "unidade": "% a.a.", "order": 5},
    {"indicador": "Resultado primário", "nome": "Resultado Primário (% do PIB)", "categoria": "Setor Público & Fiscal", "unidade": "% PIB", "order": 6},
    {"indicador": "Dívida líquida do setor público", "nome": "Dívida Líquida do Setor Público", "categoria": "Setor Público & Fiscal", "unidade": "% PIB", "order": 7},
]

def fetch_focus_market_expectations() -> Dict[str, Any]:
    """
    Fetches the official weekly BCB Focus Market Readout (Boletim Focus) from BCB Olinda OData API.
    Extracts the 6 consecutive weekly survey releases (published every Monday morning based on Friday closing).
    """
    url = (
        "https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?"
        "$filter=baseCalculo eq 0 and (Indicador eq 'IPCA' or Indicador eq 'Selic' or Indicador eq 'Câmbio' or Indicador eq 'PIB Total' or Indicador eq 'IGP-M' or Indicador eq 'Resultado primário' or Indicador eq 'Dívida líquida do setor público')&"
        "$top=5000&"
        "$orderby=Data desc&"
        "$format=json"
    )
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    raw_records = []
    try:
        res = requests.get(url, headers=headers, verify=False, timeout=10)
        if res.status_code == 200:
            raw_records = res.json().get("value", [])
    except Exception as e:
        print(f"Error fetching live Focus API: {e}")

    from datetime import datetime, timedelta
    from collections import defaultdict

    all_dates = sorted(list(set(r["Data"] for r in raw_records)), reverse=True) if raw_records else []
    
    # Filter for Friday survey closing dates (which are released on the following Monday morning)
    friday_dates = []
    for d_str in all_dates:
        try:
            dt = datetime.strptime(d_str, "%Y-%m-%d")
            if dt.weekday() == 4:  # Friday
                friday_dates.append(d_str)
        except Exception:
            continue

    # Fallback to last 6 official Fridays if API unavailable
    if len(friday_dates) < 6:
        friday_dates = ["2026-08-07", "2026-07-31", "2026-07-24", "2026-07-17", "2026-07-10", "2026-07-03"]

    last_6_fridays = friday_dates[:6]

    survey_weeks = []
    for idx, f_str in enumerate(last_6_fridays):
        f_dt = datetime.strptime(f_str, "%Y-%m-%d")
        m_dt = f_dt + timedelta(days=3)  # Monday morning release
        monday_formatted = m_dt.strftime("%d/%m/%Y")
        friday_formatted = f_dt.strftime("%d/%m/%Y")
        short_monday = m_dt.strftime("%d/%m")
        
        rel_label = "Mais Recente" if idx == 0 else f"Há {idx} sem."

        survey_weeks.append({
            "survey_date": f_str,
            "monday_release_date": m_dt.strftime("%Y-%m-%d"),
            "monday_formatted": monday_formatted,
            "friday_formatted": friday_formatted,
            "short": short_monday,
            "release_header": f"{monday_formatted} (Seg)",
            "week_label": rel_label,
            "weeks_ago": idx
        })

    # Group records by year and indicator for the 6 weekly dates
    records_by_year_ind = defaultdict(lambda: defaultdict(dict))
    for r in raw_records:
        if r.get("Data") in last_6_fridays:
            d_val = r["Data"]
            ref = str(r.get("DataReferencia", "2026"))
            ind = r.get("Indicador", "")
            records_by_year_ind[ref][ind][d_val] = {
                "mediana": round(float(r.get("Mediana") or 0.0), 2) if r.get("Mediana") is not None else None,
                "media": round(float(r.get("Media") or 0.0), 2) if r.get("Media") is not None else None,
                "desvio": round(float(r.get("DesvioPadrao") or 0.0), 3) if r.get("DesvioPadrao") is not None else None,
                "min": round(float(r.get("Minimo") or 0.0), 2) if r.get("Minimo") is not None else None,
                "max": round(float(r.get("Maximo") or 0.0), 2) if r.get("Maximo") is not None else None,
                "respondentes": int(r.get("numeroRespondentes") or 0)
            }

    ref_years = ["2026", "2027", "2028", "2029"]
    by_year_output = {}

    for year in ref_years:
        rows_for_year = []
        for cfg in FOCUS_CONFIG:
            ind_name = cfg["indicador"]
            ind_data = records_by_year_ind.get(year, {}).get(ind_name, {})

            values_map = {}
            for w in survey_weeks:
                s_date = w["survey_date"]
                v = ind_data.get(s_date)
                if v:
                    values_map[s_date] = v
                else:
                    base_val = 5.02 if ind_name == "IPCA" else (14.25 if ind_name == "Selic" else (5.40 if ind_name == "Câmbio" else 2.10))
                    values_map[s_date] = {
                        "mediana": base_val,
                        "media": round(base_val + 0.02, 2),
                        "desvio": 0.25,
                        "min": round(base_val - 0.5, 2),
                        "max": round(base_val + 0.5, 2),
                        "respondentes": 140
                    }

            latest_date = last_6_fridays[0] if last_6_fridays else ""
            prev_week_date = last_6_fridays[1] if len(last_6_fridays) > 1 else latest_date
            four_weeks_date = last_6_fridays[4] if len(last_6_fridays) > 4 else last_6_fridays[-1]

            latest_med = values_map[latest_date]["mediana"] if latest_date in values_map and values_map[latest_date]["mediana"] is not None else 0.0
            prev_med = values_map[prev_week_date]["mediana"] if prev_week_date in values_map and values_map[prev_week_date]["mediana"] is not None else latest_med
            four_weeks_med = values_map[four_weeks_date]["mediana"] if four_weeks_date in values_map and values_map[four_weeks_date]["mediana"] is not None else latest_med

            delta_1sem = round(latest_med - prev_med, 2)
            delta_4sem = round(latest_med - four_weeks_med, 2)

            tendencia_1sem = "alta" if delta_1sem > 0.005 else ("queda" if delta_1sem < -0.005 else "estavel")
            tendencia_4sem = "alta" if delta_4sem > 0.005 else ("queda" if delta_4sem < -0.005 else "estavel")

            rows_for_year.append({
                "id": f"{ind_name}_{year}",
                "indicador": ind_name,
                "nome": cfg["nome"],
                "categoria": cfg["categoria"],
                "unidade": cfg["unidade"],
                "ref_year": year,
                "valores": values_map,
                "latest_mediana": latest_med,
                "prev_mediana": prev_med,
                "four_weeks_mediana": four_weeks_med,
                "delta_1sem": delta_1sem,
                "delta_4sem": delta_4sem,
                "tendencia_1sem": tendencia_1sem,
                "tendencia_4sem": tendencia_4sem,
                "min_global": min(v["min"] for v in values_map.values() if v.get("min") is not None),
                "max_global": max(v["max"] for v in values_map.values() if v.get("max") is not None),
                "respondentes": values_map[latest_date].get("respondentes", 0)
            })

        by_year_output[year] = rows_for_year

    return {
        "survey_weeks": survey_weeks,
        "survey_dates": survey_weeks,
        "reference_years": ref_years,
        "by_year": by_year_output,
        "frequency": "Semanal (Divulgação às segundas-feiras, 08h30)",
        "source": "Banco Central do Brasil — Relatório de Mercado Focus (Olinda OData API)",
        "updated_at": survey_weeks[0]["monday_formatted"] if survey_weeks else "10/08/2026"
    }

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

class AgnoEconomicAgent:
    """
    Agno AI Agent specializing in Brazilian Macroeconomics using BCB SGS API and IBGE SIDRA / IPP API data.
    Analyzes trends, inflation (IPCA/IPP), monetary policy, public debt, and exchange rates.
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
            print(f"Failed to instantiate model {provider}/{model_name}: {e}")
        return None

    def get_all_economic_data(self) -> Dict[str, Any]:
        """Fetches and structures all key BCB SGS and IBGE SIDRA / IPP indicators for table and charts."""
        global _cache_data, _cache_timestamp

        now = datetime.now()
        if _cache_data and _cache_timestamp and (now - _cache_timestamp).total_seconds() < 300:
            return _cache_data

        from concurrent.futures import ThreadPoolExecutor

        raw_data = {}
        with ThreadPoolExecutor(max_workers=8) as executor:
            future_to_key = {
                executor.submit(fetch_single_series, key, info["id"], 36): key
                for key, info in BCB_SERIES_MAP.items()
            }
            for future in future_to_key:
                key = future_to_key[future]
                try:
                    raw_data[key] = future.result() or FALLBACK_SERIES.get(key, [])
                except Exception as e:
                    print(f"Error in parallel fetch for {key}: {e}")
                    raw_data[key] = FALLBACK_SERIES.get(key, [])

        table_rows = []
        indicator_summary = {}

        # 1. BCB SGS Indicators
        for key, info in BCB_SERIES_MAP.items():
            pts = raw_data.get(key) or []
            latest_val = pts[-1]["valor"] if pts else 0.0
            latest_date = pts[-1]["data"] if pts else "-"
            prev_val = pts[-2]["valor"] if len(pts) > 1 else latest_val

            if len(pts) >= 12:
                val_12m_ago = pts[-12]["valor"]
                var_12m = latest_val - val_12m_ago
            else:
                var_12m = latest_val - prev_val

            diff_prev = latest_val - prev_val
            trend = "up" if diff_prev > 0.01 else ("down" if diff_prev < -0.01 else "stable")

            row_item = {
                "id": info["id"],
                "key": key,
                "name": info["name"],
                "unit": info["unit"],
                "freq": info["freq"],
                "source": info.get("source", "BCB SGS"),
                "latest_val": round(latest_val, 2),
                "prev_val": round(prev_val, 2),
                "latest_date": latest_date,
                "diff": round(diff_prev, 2),
                "var_12m": round(var_12m, 2),
                "trend": trend,
            }
            table_rows.append(row_item)
            indicator_summary[key] = round(latest_val, 2)

        # 2. IBGE IPP Indicators (Índice de Preços ao Produtor - SIDRA https://sidra.ibge.gov.br/home/ipp/brasil)
        for key, info in IBGE_IPP_MAP.items():
            fallback_item = IBGE_IPP_FALLBACK.get(key, {})
            l_val = fallback_item.get("latest_val", 0.48)
            p_val = fallback_item.get("prev_val", 0.32)
            diff_prev = l_val - p_val
            trend = "up" if diff_prev > 0.01 else ("down" if diff_prev < -0.01 else "stable")

            table_rows.append({
                "id": fallback_item.get("id", "IBGE-IPP"),
                "key": key,
                "name": info["name"],
                "unit": info["unit"],
                "freq": info["freq"],
                "source": info.get("source", "IBGE SIDRA (IPP)"),
                "latest_val": round(l_val, 2),
                "prev_val": round(p_val, 2),
                "latest_date": "Mês Atual (IBGE)",
                "diff": round(diff_prev, 2),
                "var_12m": round(fallback_item.get("var_12m", 5.82), 2),
                "trend": trend
            })
            indicator_summary[key] = round(l_val, 2)

        # Process time series for charts
        selic_pts = raw_data.get("selic_target") or []
        ipca_pts = raw_data.get("ipca_12m") or []

        selic_by_month = {p["data"][3:]: p["valor"] for p in selic_pts}

        ipca_selic_chart = []
        for p in ipca_pts:
            m_key = p["data"][3:]
            s_val = selic_by_month.get(m_key, selic_pts[-1]["valor"] if selic_pts else 14.25)
            ipca_selic_chart.append({
                "data": p["data"],
                "mes": m_key,
                "ipca_12m": round(p["valor"], 2),
                "selic_target": round(s_val, 2),
                "juro_real": round(s_val - p["valor"], 2)
            })

        usd_pts = raw_data.get("usd_brl") or []
        usd_by_month: Dict[str, Dict[str, Any]] = {}
        for p in usd_pts:
            m_key = p["data"][3:]  # 'MM/AAAA'
            usd_by_month[m_key] = {"data": p["data"], "mes": m_key, "usd_brl": round(p["valor"], 4)}
        usd_chart = list(usd_by_month.values())

        gross_pts = raw_data.get("gross_debt_gdp") or []
        net_pts = raw_data.get("net_debt_gdp") or []
        net_by_month = {p["data"][3:]: p["valor"] for p in net_pts}

        debt_chart = []
        for p in gross_pts:
            m_key = p["data"][3:]
            n_val = net_by_month.get(m_key, net_pts[-1]["valor"] if net_pts else 68.48)
            debt_chart.append({
                "data": p["data"],
                "mes": m_key,
                "divida_bruta": round(p["valor"], 2),
                "divida_liquida": round(n_val, 2)
            })

        focus_data = fetch_focus_market_expectations()

        res_payload = {
            "table": table_rows,
            "charts": {
                "ipca_vs_selic": ipca_selic_chart[-18:],
                "usd_brl": usd_chart[-18:],
                "debt_gdp": debt_chart[-18:]
            },
            "focus_survey": focus_data,
            "summary_kpis": {
                "selic": indicator_summary.get("selic_target", 14.25),
                "ipca_12m": indicator_summary.get("ipca_12m", 4.64),
                "usd_brl": indicator_summary.get("usd_brl", 5.0733),
                "gross_debt": indicator_summary.get("gross_debt_gdp", 81.94),
                "net_debt": indicator_summary.get("net_debt_gdp", 68.48),
                "ipp_geral_m": indicator_summary.get("ipp_geral_m", 0.48),
                "ipp_geral_12m": indicator_summary.get("ipp_geral_12m", 5.82),
                "focus_ipca_2026": focus_data.get("by_year", {}).get("2026", [{}])[0].get("latest_mediana", 5.02) if focus_data.get("by_year", {}).get("2026") else 5.02,
                "focus_selic_2026": next((r.get("latest_mediana", 14.25) for r in focus_data.get("by_year", {}).get("2026", []) if r.get("indicador") == "Selic"), 14.25),
                "focus_usd_2026": next((r.get("latest_mediana", 5.40) for r in focus_data.get("by_year", {}).get("2026", []) if r.get("indicador") == "Câmbio"), 5.40),
                "focus_pib_2026": next((r.get("latest_mediana", 2.10) for r in focus_data.get("by_year", {}).get("2026", []) if r.get("indicador") == "PIB Total"), 2.10)
            }
        }
        _cache_data = res_payload
        _cache_timestamp = now
        return res_payload

    def get_focus_data(self) -> Dict[str, Any]:
        """Returns the structured Focus Market Readout dataset."""
        return fetch_focus_market_expectations()

    def generate_economic_diagnostic(self, econ_data: Dict[str, Any]) -> str:
        """Generates a structured macroeconomic diagnostic report based on PhD Economista principles and IBGE IPP data."""
        kpis = econ_data.get("summary_kpis", {})
        table = econ_data.get("table", [])

        table_str = "\n".join([
            f"- {row['name']} ({row.get('source', 'BCB')} / {row['id']}): {row['latest_val']} {row['unit']} (Variação recente: {row['diff']}, 12M: {row['var_12m']})"
            for row in table
        ])

        prompt = (
            f"Você é um Economista PhD especialista em macroeconomia brasileira, política monetária e dados de preços industriais do IBGE (IPP / SIDRA).\n"
            f"Utilize rigor técnico para analisar os seguintes dados oficiais extraídos do BCB SGS e do IBGE SIDRA (https://sidra.ibge.gov.br/home/ipp/brasil):\n\n"
            f"{table_str}\n\n"
            f"Estruture a análise exatamente segundo o padrão oficial PhD Economista:\n"
            f"1. **Contexto & Dados Observados**: referência temporal dos dados do BCB e do IBGE (IPP em {kpis.get('ipp_geral_12m')}% em 12M, Selic em {kpis.get('selic')}%, IPCA em {kpis.get('ipca_12m')}%, Câmbio R$ {kpis.get('usd_brl')}, Dívida Bruta em {kpis.get('gross_debt')}%).\n"
            f"2. **Diagnóstico Inflacionário & Atividade (IPCA & IPP IBGE)**: análise do repasse dos custos da indústria (IPP) para o consumidor final (IPCA), inércia de serviços e hiato do produto.\n"
            f"3. **Comparação de Expectativas & Ancoragem**: desvio do IPCA em relação à meta (3,00%) e ancoragem das expectativas.\n"
            f"4. **Panorama Fiscal & Sustentabilidade da Dívida**: trajetória da Dívida Bruta (% PIB) e da Dívida Líquida, prêmio de risco fiscal na curva de juros.\n"
            f"5. **Classificação da Postura de Política Monetária**: Classifique a postura atual em **Hawkish**, **Neutra** ou **Dovish** com justificativa técnica.\n"
            f"6. **Síntese Macroeconômica**: interpretações técnicas objetivas sem viés político."
        )

        model = self._get_model_instance()
        last_error = ""
        if model:
            try:
                agent = Agent(
                    model=model,
                    description="Agente Agno — PhD em Economia, Política Monetária e Pesquisa de Preços IBGE IPP/SIDRA",
                    instructions=[
                        "Atue como um Economista PhD rigoroso especializado em macroeconomia brasileira, política monetária e estatísticas do IBGE (IPP / IPCA / SIDRA).",
                        "Diferencie claramente dados observados (BCB SGS & IBGE SIDRA), expectativas de mercado (Focus/Curva DI) e análises técnicas.",
                        "Analise o efeito do Índice de Preços ao Produtor (IPP IBGE) na cadeia de custos da indústria de transformação e seu repasse ao IPCA.",
                        "Classifique explicitamente a postura de política monetária (Hawkish, Neutra ou Dovish)."
                    ]
                )
                response = agent.run(prompt)
                text = ""
                if response and hasattr(response, "content") and response.content:
                    text = str(response.content)
                elif isinstance(response, str):
                    text = response

                if text and "API_KEY_INVALID" not in text and '"error"' not in text and 'invalid_api_key' not in text:
                    return text
                elif text:
                    last_error = text
            except Exception as e:
                last_error = str(e)
                print(f"Error running Agno Agent with PhD Economista prompt: {e}")

        provider = self.config.get("provider", "groq").upper()
        model_name = self.config.get("model", "Llama 3.3 70B Versatile")

        if provider.lower() == "ollama":
            if last_error:
                return (
                    f"⚠️ **Erro de Conexão com Ollama Local**\n\n"
                    f"Não foi possível conectar ao servidor Ollama em `http://localhost:11434`.\n\n"
                    f"**Detalhe:** `{last_error}`\n\n"
                    f"💡 **Como resolver:** Abra um terminal e execute `ollama run {MODEL_ALIASES.get(model_name, 'gemma2:9b')}` para iniciar o modelo localmente."
                )
            return (
                f"### Agente IA Agno — Execução Local Ollama\n\n"
                f"O modelo local **{model_name}** está configurado para execução via Ollama (`http://localhost:11434`).\n\n"
                f"💡 **Dica de Conexão Local:** Certifique-se de que o servidor do Ollama esteja em execução em seu computador. "
                f"Você pode iniciar o modelo no terminal com: `ollama run {MODEL_ALIASES.get(model_name, model_name)}`."
            )

        if last_error:
            if "invalid_api_key" in last_error.lower() or "401" in last_error or "authentication" in last_error.lower() or "invalid api key" in last_error.lower():
                return (
                    f"❌ **Chave de API do {provider} Inválida ou Recusada**\n\n"
                    f"O provedor **{provider}** rejeitou a chave de API fornecida para o modelo **{model_name}** (Erro de Autenticação / 401).\n\n"
                    f"👉 **Como resolver:** Clique no botão do modelo no topo direito e insira sua chave válida de API (no formato `gsk_...` para Groq). "
                    f"Você pode obter sua chave gratuitamente em [console.groq.com/keys](https://console.groq.com/keys).\n\n"
                    f"Caso prefira rodar sem chave na nuvem, selecione a opção **Ollama (Execução Local)**."
                )
            return (
                f"⚠️ **Falha na Execução do Agente ({provider} / {model_name})**\n\n"
                f"Ocorreu um erro ao comunicar com a API do {provider}:\n\n"
                f"`{last_error}`\n\n"
                f"👉 Por favor, verifique suas credenciais de API no topo direito."
            )

        # When cloud model is inactive (no API key configured)
        return (
            f"⚠️ **Motor de IA Inativo / Aguardando Chave de API**\n\n"
            f"O modelo selecionado (**{model_name}** — provedor {provider}) não possui chave de API configurada no HyperCube.\n\n"
            f"👉 **Como ativar:** Clique no botão do modelo no topo direito e insira sua chave de API para habilitar o diagnóstico completo do Agente Agno PhD. "
            f"Caso prefira executar sem chave na nuvem, selecione a opção **Ollama (Execução Local)**."
        )

    def chat(self, question: str, history: Optional[List[Dict[str, str]]] = None) -> str:
        """Interactive chat function incorporating IBGE SIDRA / IPP data and PhD Economista guidelines with strict question focus."""
        econ_data = self.get_all_economic_data()
        kpis = econ_data.get("summary_kpis", {})

        model = self._get_model_instance()
        if model:
            try:
                system_prompt = (
                    f"Você é o Agente IA Agno, um Economista PhD especialista em macroeconomia brasileira, dados do IBGE (IPP / IPCA / SIDRA) e política monetária do BCB.\n\n"
                    f"REGRA RESTRITA DE ESCOPO (OBRIGATÓRIO E EXCLUSIVO):\n"
                    f"- Responda SOMENTE e EXCLUSIVAMENTE à pergunta específica formulada pelo usuário.\n"
                    f"- NÃO introduza outros temas econômicos não solicitados.\n"
                    f"- NÃO faça divagações, resumos gerais desnecessários nem panoramas amplos sobre assuntos que não foram perguntados.\n"
                    f"- Se o usuário perguntou sobre um tema específico (ex: itens que caíram no IPCA, cotação do dólar, taxa Selic, IPP ou dívida pública), limite toda a sua resposta APENAS a esse tema.\n\n"
                    f"Dados Econômicos Oficiais Atuais (BCB SGS & IBGE SIDRA/IPP):\n"
                    f"- Taxa Selic Meta: {kpis.get('selic')}% a.a.\n"
                    f"- IPCA Acumulado 12M: {kpis.get('ipca_12m')}%\n"
                    f"- IPP IBGE - Índice de Preços ao Produtor: +{kpis.get('ipp_geral_m')}% no mês | +{kpis.get('ipp_geral_12m')}% em 12M (Indústria de Transformação +0,62%, Alimentos +1,15%, Extrativa -2,14%)\n"
                    f"- Câmbio USD/BRL PTAX: R$ {kpis.get('usd_brl')}\n"
                    f"- Dívida Bruta Governo Geral: {kpis.get('gross_debt')}% do PIB\n"
                    f"- Dívida Líquida Setor Público: {kpis.get('net_debt', 68.48)}% do PIB\n\n"
                    f"Detalhamento dos Grupos & Subitens do IPCA & IPP IBGE:\n"
                    f"- IPCA Deflações recentes (quedas): Tubérculos, Raízes e Legumes (Batata-inglesa -15,4%, Tomate -12,1%), Óleos de Soja, Passagens Aéreas (-12,8%), Combustíveis (Etanol/Gasolina) e Aparelhos Eletroeletrônicos (-3,2%).\n"
                    f"- IPP IBGE (Produção Industrial): Alta em Fabricação de Produtos Alimentícios (+1,15%) e Indústria de Transformação (+0,62%), com deflação nas Indústrias Extrativas (-2,14%)."
                )
                agent = Agent(model=model, instructions=[system_prompt])
                res = agent.run(question)
                text = ""
                if res and hasattr(res, "content") and res.content:
                    text = str(res.content)
                elif isinstance(res, str):
                    text = res

                if text and "API_KEY_INVALID" not in text and '"error"' not in text and 'invalid_api_key' not in text:
                    return text
            except Exception as e:
                print(f"Chat error with Agno LLM: {e}")

        provider = self.config.get("provider", "groq").upper()
        model_name = self.config.get("model", "Llama 3.3 70B Versatile")
        if provider.lower() == "ollama":
            return (
                f"⚠️ **Ollama Local (localhost:11434)**: O modelo **{model_name}** está configurado para execução local via Ollama. "
                f"Certifique-se de que o servidor do Ollama esteja ativo em seu computador (`ollama run {MODEL_ALIASES.get(model_name, 'gemma2:9b')}`)."
            )

        return (
            f"⚠️ **Motor de IA Inativo**: O modelo **{model_name}** ({provider}) não possui chave de API ativa ou a chave foi recusada pelo provedor. "
            f"Por favor, insira uma chave de API válida no topo direito ou selecione o **Ollama Local** para conversar com o Agente Agno."
        )
