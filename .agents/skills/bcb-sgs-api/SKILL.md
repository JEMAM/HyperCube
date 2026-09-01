---
name: bcb-sgs-api
description: Fetch and analyze time series data from Central Bank of Brazil (BCB) SGS API (IPCA, Selic, FX, GDP, interest rates).
---

# Skill: Central Bank of Brazil (BCB) SGS API Analyst

You act as a quantitative economic data analyst specializing in retrieving, processing, and analyzing time series from the Central Bank of Brazil's SGS (Sistema Gerenciador de Séries Temporais) API.

## When to Use This Skill

Trigger whenever the task involves:
- Programmatically fetching historical or current macro indicator series from BCB (IPCA, Selic, USD/BRL FX rate, GDP, Credit, Primary Balance).
- Transforming and plotting official BCB time series data using Python (`requests`, `pandas`, `matplotlib`).
- Comparing macro indicator values across custom date ranges.

## Key BCB SGS Series IDs

| Indicator | SGS Series Code | Frequency | Unit |
|---|---|---|---|
| **Selic Target Rate** | `432` | Daily | % p.a. |
| **Selic Effective Rate** | `11` | Daily | % p.d. |
| **IPCA (Monthly)** | `433` | Monthly | % change |
| **IPCA (12 Months)** | `13522` | Monthly | % change |
| **USD/BRL PTAX (Ask)** | `10813` | Daily | BRL per USD |
| **Broad Money Supply (M4)** | `27810` | Monthly | BRL millions |
| **Net Public Sector Debt (% GDP)** | `4513` | Monthly | % GDP |
| **Gross General Government Debt (% GDP)** | `13762` | Monthly | % GDP |

## Python Retrieval Snippet

```python
import pandas as pd
import requests

def get_bcb_series(series_id: int, start_date: str = None, end_date: str = None) -> pd.DataFrame:
    """
    Fetches time series data from BCB SGS API.
    Dates format: 'DD/MM/YYYY'
    """
    url = f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{series_id}/dados?formato=json"
    params = {}
    if start_date:
        params['dataInicial'] = start_date
    if end_date:
        params['dataFinal'] = end_date
    
    response = requests.get(url, params=params, timeout=15)
    response.raise_for_status()
    
    df = pd.DataFrame(response.json())
    df['data'] = pd.to_datetime(df['data'], format='%d/%m/%Y')
    df['valor'] = pd.to_numeric(df['valor'], errors='coerce')
    df.set_index('data', inplace=True)
    return df
```

## Analytical Workflow

1. Identify requested indicators and resolve their SGS Series codes.
2. Formulate proper start (`dataInicial`) and end (`dataFinal`) parameters in `DD/MM/YYYY` format.
3. Handle missing data, inflation adjustment (deflating nominal series using IPCA series 433), or frequency conversions (monthly to annual).
4. Output structured tables, summary metrics (min, max, mean, recent trend), and plots.

## Limitations & Disclaimers
- The BCB SGS API is a public endpoint. Always check HTTP response status and handle potential timeout issues gracefully.
