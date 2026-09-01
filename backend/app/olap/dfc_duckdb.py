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
        """Calculates total DFC KPIs across all quarters."""
        query = """
        SELECT 
            SUM(fco_caixa_liquido) AS Total_FCO,
            SUM(fci_caixa_liquido) AS Total_FCI,
            SUM(fcf_caixa_liquido) AS Total_FCF,
            SUM(variacao_liquida_caixa) AS Total_Variacao_Liquida,
            LAST(saldo_final_caixa) AS Saldo_Final_Atual
        FROM dfc_quarterly
        """
        res = self.conn.execute(query).fetchone()
        return {
            "Total_FCO": round(res[0] or 0.0, 2),
            "Total_FCI": round(res[1] or 0.0, 2),
            "Total_FCF": round(res[2] or 0.0, 2),
            "Total_Variacao_Liquida": round(res[3] or 0.0, 2),
            "Saldo_Final_Atual": round(res[4] or 0.0, 2)
        }

    def resultado_por_ano(self) -> List[Dict[str, Any]]:
        """Aggregates Cash Flow performance by calendar year."""
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
        rows = self.conn.execute(query).fetchall()
        result = []
        for r in rows:
            result.append({
                "ano": int(r[0]),
                "fco": round(r[1] or 0.0, 2),
                "fci": round(r[2] or 0.0, 2),
                "fcf": round(r[3] or 0.0, 2),
                "variacao_liquida": round(r[4] or 0.0, 2),
                "saldo_final": round(r[5] or 0.0, 2),
                "yoy_growth_pct": float(r[6] or 0.0)
            })
        return result
