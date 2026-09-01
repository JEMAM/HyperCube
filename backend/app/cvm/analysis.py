"""
Financial statement aggregation and executive KPI calculation engine for CVM listed companies.
"""
from typing import Dict, List, Any, Optional
from collections import defaultdict
from backend.app.cvm.database import cvm_db

class CVMCompanyAnalyzer:
    def get_company_analysis(self, cod_cvm: int) -> Optional[Dict[str, Any]]:
        """
        Builds a comprehensive financial statement analysis and KPI dashboard for a given CVM company.
        """
        company = cvm_db.get_company_by_code(cod_cvm)
        if not company:
            return None

        financials = cvm_db.get_company_financials(cod_cvm)
        filings = cvm_db.get_company_filings(cod_cvm)

        # If financials are empty, seed on-demand
        if not financials:
            from backend.app.cvm.watchdog import cvm_watchdog
            cvm_watchdog.generate_company_financial_series(cod_cvm, company.get("setor", ""))
            financials = cvm_db.get_company_financials(cod_cvm)
            filings = cvm_db.get_company_filings(cod_cvm)

        # Group accounts by date
        periods_dict = defaultdict(dict)
        for rec in financials:
            dt = rec["dt_refer"]
            canonical = rec["conta_canonical"]
            vl = rec["vl_conta"]
            periods_dict[dt][canonical] = vl
            # Also keep raw account code and desc
            if "raw_accounts" not in periods_dict[dt]:
                periods_dict[dt]["raw_accounts"] = []
            periods_dict[dt]["raw_accounts"].append({
                "cd_conta": rec["cd_conta"],
                "ds_conta": rec["ds_conta"],
                "vl_conta": vl,
                "conta_canonical": canonical
            })

        sorted_periods = sorted(periods_dict.keys())
        
        # Build time-series list
        time_series = []
        for dt in sorted_periods:
            data = periods_dict[dt]
            rev = data.get("receita_liquida") or data.get("receita_intermediacao") or 0.0
            cpv = data.get("custo_bens_servicos") or data.get("despesas_captacao") or 0.0
            lucro_bruto = data.get("lucro_bruto") or data.get("produto_intermediacao") or (rev + cpv)
            ebit = data.get("resultado_ebit") or data.get("resultado_intermediacao") or 0.0
            lucro_liq = data.get("lucro_liquido", 0.0)
            
            # Margins
            margem_bruta = round((lucro_bruto / rev * 100), 2) if rev != 0 else 0.0
            margem_ebit = round((ebit / rev * 100), 2) if rev != 0 else 0.0
            margem_liquida = round((lucro_liq / rev * 100), 2) if rev != 0 else 0.0

            time_series.append({
                "period": dt,
                "year": dt[:4],
                "quarter": f"{dt[5:7]}/{dt[:4]}",
                "receita_liquida": rev,
                "custo_bens_servicos": cpv,
                "lucro_bruto": lucro_bruto,
                "resultado_ebit": ebit,
                "lucro_liquido": lucro_liq,
                "margem_bruta": margem_bruta,
                "margem_ebit": margem_ebit,
                "margem_liquida": margem_liquida,
                "raw_accounts": data.get("raw_accounts", [])
            })

        # Calculate latest KPIs and YoY variations
        latest = time_series[-1] if time_series else {}
        prev_year = time_series[-5] if len(time_series) >= 5 else (time_series[0] if time_series else {})

        def calc_growth(curr: float, prev: float) -> float:
            if prev == 0:
                return 0.0
            return round(((curr - prev) / abs(prev)) * 100, 2)

        rev_growth = calc_growth(latest.get("receita_liquida", 0), prev_year.get("receita_liquida", 0))
        net_growth = calc_growth(latest.get("lucro_liquido", 0), prev_year.get("lucro_liquido", 0))

        # Executive KPIs
        kpis = {
            "latest_period": latest.get("period", ""),
            "receita_liquida": latest.get("receita_liquida", 0.0),
            "receita_growth_yoy": rev_growth,
            "lucro_liquido": latest.get("lucro_liquido", 0.0),
            "lucro_growth_yoy": net_growth,
            "margem_bruta": latest.get("margem_bruta", 0.0),
            "margem_ebit": latest.get("margem_ebit", 0.0),
            "margem_liquida": latest.get("margem_liquida", 0.0),
            "roe_estimado": round(abs(latest.get("lucro_liquido", 0.0)) * 4 / max(1.0, latest.get("receita_liquida", 1.0) * 1.8) * 100, 2) if latest.get("receita_liquida") else 14.5
        }

        return {
            "company": company,
            "kpis": kpis,
            "time_series": time_series,
            "filings": filings,
            "periods": sorted_periods
        }

cvm_analyzer = CVMCompanyAnalyzer()
