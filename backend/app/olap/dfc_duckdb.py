import duckdb
import polars as pl
from typing import Dict, List, Any

class DuckDBDFCAnalytics:
    def __init__(self, df: pl.DataFrame):
        self.conn = duckdb.connect(database=':memory:')
        # Prepare year column if needed
        if "ano" not in df.columns and "data" in df.columns:
            df = df.with_columns(pl.col("data").str.slice(0, 4).cast(pl.Int32).alias("ano"))
        self.conn.register('dfc_quarterly', df)

    def summary_kpis(self) -> Dict[str, float]:
        """Calculates total DFC KPIs for the latest fiscal year or latest quarters."""
        query_latest_year = """
        SELECT 
            SUM(fco_caixa_liquido) AS Total_FCO,
            SUM(fci_caixa_liquido) AS Total_FCI,
            SUM(fcf_caixa_liquido) AS Total_FCF,
            SUM(variacao_liquida_caixa) AS Total_Variacao_Liquida,
            LAST(saldo_final_caixa) AS Saldo_Final_Atual
        FROM dfc_quarterly
        WHERE ano = (SELECT MAX(ano) FROM dfc_quarterly)
        """
        res = self.conn.execute(query_latest_year).fetchone()
        if not res or res[0] is None:
            query_all = """
            SELECT 
                SUM(fco_caixa_liquido) AS Total_FCO,
                SUM(fci_caixa_liquido) AS Total_FCI,
                SUM(fcf_caixa_liquido) AS Total_FCF,
                SUM(variacao_liquida_caixa) AS Total_Variacao_Liquida,
                LAST(saldo_final_caixa) AS Saldo_Final_Atual
            FROM dfc_quarterly
            """
            res = self.conn.execute(query_all).fetchone()

        return {
            "Total_FCO": round(res[0] or 0.0, 2) if res else 0.0,
            "Total_FCI": round(res[1] or 0.0, 2) if res else 0.0,
            "Total_FCF": round(res[2] or 0.0, 2) if res else 0.0,
            "Total_Variacao_Liquida": round(res[3] or 0.0, 2) if res else 0.0,
            "Saldo_Final_Atual": round(res[4] or 0.0, 2) if res else 0.0
        }

    def resultado_por_ano(self) -> List[Dict[str, Any]]:
        """Aggregates Cash Flow performance by calendar year (last 5 years)."""
        query = """
        WITH annual_summary AS (
            SELECT 
                ano,
                SUM(fco_caixa_liquido) AS fco,
                SUM(fci_caixa_liquido) AS fci,
                SUM(fcf_caixa_liquido) AS fcf,
                SUM(variacao_liquida_caixa) AS variacao_liquida,
                LAST(saldo_final_caixa) AS saldo_final
            FROM dfc_quarterly
            GROUP BY ano
        )
        SELECT 
            ano,
            fco,
            fci,
            fcf,
            variacao_liquida,
            saldo_final,
            ROUND(
                CASE 
                    WHEN LAG(variacao_liquida) OVER (ORDER BY ano) IS NULL OR LAG(variacao_liquida) OVER (ORDER BY ano) = 0 THEN 0.0
                    ELSE ((variacao_liquida - LAG(variacao_liquida) OVER (ORDER BY ano)) / ABS(LAG(variacao_liquida) OVER (ORDER BY ano))) * 100.0
                END, 2
            ) AS yoy_growth_pct
        FROM annual_summary
        ORDER BY ano ASC
        """
        res = self.conn.execute(query).df().fillna(0.0)
        records = res.to_dict(orient='records')
        return records[-5:] if len(records) > 5 else records
